// src/lib/api/treasury.ts
// Server-side only — do NOT import in client components
// Composite treasury module: SOL balance + SPL holdings, current prices, gain/loss computation
// Combines helius, jupiter (free prices), birdeye (optional historical), and solscan (optional transfers)

import { getSolBalance, getTokenAccountsByOwner } from './helius'
import { getJupiterPrices } from './jupiter'
import { getPriceAtTimestamp } from './birdeye'
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
 * Wraps Solscan and Birdeye historical calls in try/catch so failures don't break the response.
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
    // Get first inbound transfer to find purchase date (requires Solscan)
    const inboundTransfers = await getAccountTransfers(TREASURY_WALLET, {
      token: mint,
      flow: 'in',
      page_size: 50,
    })

    if (inboundTransfers.length > 0) {
      const oldest = inboundTransfers[inboundTransfers.length - 1]
      const purchaseDate = oldest.block_time

      // Fetch historical price at purchase date (requires Birdeye OHLCV)
      try {
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
      } catch {
        // Birdeye historical price unavailable — continue with purchase date only
      }

      return { ...base, purchaseDate }
    }
  } catch {
    // Solscan unavailable — return base holding with current data only
  }

  return base
}

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * Fetches full treasury valuation: SOL balance, all SPL token holdings with
 * current prices (via Jupiter, free), and per-holding gain/loss vs purchase price.
 */
export async function getTreasuryValuations(): Promise<TreasuryResponse> {
  // Step 1: Fetch SOL balance, token accounts, and SOL price in parallel
  const [solBalance, tokenAccounts, solPrices] = await Promise.all([
    getSolBalance(TREASURY_WALLET),
    getTokenAccountsByOwner(TREASURY_WALLET),
    getJupiterPrices([SOL_MINT]),
  ])

  const solPriceUsd = solPrices[SOL_MINT] ?? 0

  // Step 2: Filter to non-zero token accounts (ignore dust)
  const nonZeroAccounts = tokenAccounts.filter(acct => acct.uiAmount > 0)

  // Step 3: Batch-fetch current prices for all non-zero mints via Jupiter (free)
  const mintList = nonZeroAccounts.map(acct => acct.mint)
  const prices = mintList.length > 0 ? await getJupiterPrices(mintList) : {}

  // Step 4: Enrich each holding in parallel — historical lookups run concurrently
  const holdings = await Promise.all(
    nonZeroAccounts.map(acct => {
      const currentPriceUsd = prices[acct.mint] ?? 0
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
