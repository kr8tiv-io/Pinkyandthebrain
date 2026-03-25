// src/lib/api/burns.ts
// Server-side only — do NOT import in client components
// Composite burns module: aggregates all BRAIN burn transactions and computes burn statistics
// Primary: Solscan (paginated token transfers) + Helius (token supply)
// Fallback: Helius-only (supply data, computed burns from known initial supply)

import { getAllTokenTransfers } from './solscan'
import { getTokenSupply } from './helius'
import { BRAIN_TOKEN_MINT, BURN_SOURCE, BURN_DESTINATION } from '@/lib/constants'

// Known initial supply — used for fallback burn calculation when Solscan is unavailable
const INITIAL_SUPPLY = 1_000_000_000

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BurnTransaction {
  txHash: string
  timestamp: number
  amount: number // human-readable (divided by token decimals)
}

export interface BurnSummary {
  totalBurned: number       // total $BRAIN burned, human-readable
  totalSupply: number       // current total supply, human-readable
  burnedPct: number         // % of original supply burned
  transactions: BurnTransaction[]
}

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * Fetches burn statistics. Primary: Solscan for individual transactions.
 * Fallback: computes totalBurned from initial supply minus current supply (Helius).
 */
export async function getBurnSummary(): Promise<BurnSummary> {
  // Always fetch current supply via Helius (reliable)
  const supplyData = await getTokenSupply(BRAIN_TOKEN_MINT)
  const currentSupply = supplyData.uiAmount

  // Try Solscan for individual burn transactions
  try {
    const burnTransfers = await getAllTokenTransfers(BRAIN_TOKEN_MINT, {
      from: BURN_SOURCE,
      to: BURN_DESTINATION,
    })

    const transactions: BurnTransaction[] = burnTransfers.map((transfer) => {
      const decimals = transfer.token_decimals
      const humanAmount = transfer.amount / Math.pow(10, decimals)
      return {
        txHash: transfer.trans_id,
        timestamp: transfer.block_time,
        amount: humanAmount,
      }
    })

    transactions.sort((a, b) => b.timestamp - a.timestamp)

    const totalBurned = transactions.reduce((sum, tx) => sum + tx.amount, 0)
    const originalSupply = totalBurned + currentSupply
    const burnedPct = originalSupply > 0 ? (totalBurned / originalSupply) * 100 : 0

    return { totalBurned, totalSupply: currentSupply, burnedPct, transactions }
  } catch (err) {
    console.warn('[burns] Solscan unavailable, using supply-based calculation:', err)

    // Fallback: compute from known initial supply
    const totalBurned = Math.max(0, INITIAL_SUPPLY - currentSupply)
    const burnedPct = INITIAL_SUPPLY > 0 ? (totalBurned / INITIAL_SUPPLY) * 100 : 0

    return {
      totalBurned,
      totalSupply: currentSupply,
      burnedPct,
      transactions: [],
    }
  }
}
