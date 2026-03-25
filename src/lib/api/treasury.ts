// src/lib/api/treasury.ts
// Server-side only — do NOT import in client components
// Composite treasury module: SOL balance + SPL holdings, current prices, gain/loss computation
// Combines helius, birdeye, and solscan foundational wrappers

import { getSolBalance, getTokenAccountsByOwner } from './helius'
import { getMultiTokenPrices, getPriceAtTimestamp } from './birdeye'
import { getAccountTransfers } from './solscan'
import { TREASURY_WALLET, SOL_MINT } from '@/lib/constants'
import { HOLDINGS_BY_MINT } from '@/lib/investments.config'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HoldingValuation {
  mint: string
  symbol: string
  name: string
  description?: string
  xAccount?: string
  bagsLink?: string
  uiAmount: number
  currentPriceUsd: number
  currentPriceSol: number
  currentValueUsd: number
  currentValueSol: number
  purchaseDate?: number
  purchasePriceUsd?: number
  costBasisUsd?: number
  gainLossUsd?: number
  gainLossPct?: number
  category: string
}

export interface TreasuryResponse {
  solBalance: number
  solPriceUsd: number
  holdings: HoldingValuation[]
  totalValueUsd: number
  totalValueSol: number
}

// ─── Private helpers ──────────────────────────────────────────────────────────

/**
 * Enriches a single token holding with metadata, historical price, and gain/loss.
 * Wraps in try/catch so historical lookup failures don't break the whole response.
 */
async function enrichHolding(
  mint: string,
  uiAmount: number,
  currentPriceUsd: number,
  solPriceUsd: number
): Promise<HoldingValuation> {
  const metadata = HOLDINGS_BY_MINT[mint]
  const currentValueUsd = uiAmount * currentPriceUsd
  const currentPriceSol = solPriceUsd > 0 ? currentPriceUsd / solPriceUsd : 0
  const currentValueSol = uiAmount * currentPriceSol

  // Base holding without historical data
  const base: HoldingValuation = {
    mint,
    symbol: metadata?.symbol ?? mint.slice(0, 6) + '…',
    name: metadata?.name ?? mint,
    description: metadata?.description,
    xAccount: metadata?.xAccount,
    bagsLink: metadata?.bagsLink,
    uiAmount,
    currentPriceUsd,
    currentPriceSol,
    currentValueUsd,
    currentValueSol,
    category: metadata?.category ?? 'unknown',
  }

  // Attempt to enrich with purchase date and historical price
  try {
    // Get first inbound transfer to find purchase date — page 50 to get oldest available
    const inboundTransfers = await getAccountTransfers(TREASURY_WALLET, {
      token: mint,
      flow: 'in',
      page_size: 50,
    })

    if (inboundTransfers.length > 0) {
      // Last item in ascending order is the oldest = purchase date
      const oldest = inboundTransfers[inboundTransfers.length - 1]
      const purchaseDate = oldest.block_time

      // Fetch historical price at purchase date
      const purchasePriceUsd = await getPriceAtTimestamp(mint, purchaseDate)

      if (purchasePriceUsd !== null) {
        const costBasisUsd = uiAmount * purchasePriceUsd
        const gainLossUsd = currentValueUsd - costBasisUsd
        const gainLossPct = costBasisUsd > 0 ? (gainLossUsd / costBasisUsd) * 100 : undefined

        return {
          ...base,
          purchaseDate,
          purchasePriceUsd,
          costBasisUsd,
          gainLossUsd,
          gainLossPct,
        }
      }

      // Historical price unavailable — still record purchase date
      return { ...base, purchaseDate }
    }
  } catch {
    // Historical enrichment failed — return base holding with current data only
  }

  return base
}

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * Fetches full treasury valuation: SOL balance, all SPL token holdings with
 * current prices (batch fetched), and per-holding gain/loss vs purchase price.
 *
 * Uses Promise.all for all parallel-safe operations:
 *   - SOL balance, token accounts, and SOL price fetched in parallel
 *   - All per-holding historical enrichments run in parallel
 *
 * Handles missing prices gracefully — illiquid tokens default to 0 price.
 */
export async function getTreasuryValuations(): Promise<TreasuryResponse> {
  // Step 1: Fetch SOL balance, token accounts, and SOL price in parallel
  const [solBalance, tokenAccounts, solPriceMap] = await Promise.all([
    getSolBalance(TREASURY_WALLET),
    getTokenAccountsByOwner(TREASURY_WALLET),
    // SOL price via multi_price with just SOL mint
    getMultiTokenPrices([SOL_MINT]),
  ])

  const solPriceUsd = solPriceMap[SOL_MINT]?.value ?? 0

  // Step 2: Filter to non-zero token accounts (ignore dust)
  const nonZeroAccounts = tokenAccounts.filter(acct => acct.uiAmount > 0)

  // Step 3: Batch-fetch current prices for all non-zero mints in ONE call
  const mintList = nonZeroAccounts.map(acct => acct.mint)
  const prices = mintList.length > 0 ? await getMultiTokenPrices(mintList) : {}

  // Step 4: Enrich each holding in parallel — historical lookups run concurrently
  const holdings = await Promise.all(
    nonZeroAccounts.map(acct => {
      const currentPriceUsd = prices[acct.mint]?.value ?? 0
      return enrichHolding(acct.mint, acct.uiAmount, currentPriceUsd, solPriceUsd)
    })
  )

  // Step 5: Compute portfolio totals
  const solValueUsd = solBalance * solPriceUsd
  const holdingsValueUsd = holdings.reduce((sum, h) => sum + h.currentValueUsd, 0)
  const totalValueUsd = solValueUsd + holdingsValueUsd

  const totalValueSol = solPriceUsd > 0 ? totalValueUsd / solPriceUsd : 0

  return {
    solBalance,
    solPriceUsd,
    holdings,
    totalValueUsd,
    totalValueSol,
  }
}
