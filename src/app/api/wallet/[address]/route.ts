import { NextResponse, type NextRequest } from 'next/server'
import { getAllAccountTransfers } from '@/lib/api/solscan'
import { getTokenAccountsByOwner } from '@/lib/api/helius'
import { getJupiterPrices } from '@/lib/api/jupiter'
import { BRAIN_TOKEN_MINT } from '@/lib/constants'
import type { WalletActivityResponse } from '@/lib/api/types'

export const revalidate = 300

const LAMPORTS = 1_000_000_000

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params

  // Try Solscan for full transaction history
  try {
    const [inTransfers, outTransfers] = await Promise.all([
      getAllAccountTransfers(address, { flow: 'in' }),
      getAllAccountTransfers(address, { flow: 'out' }),
    ])

    const transactions = [
      ...inTransfers.map((t) => ({
        txHash: t.trans_id,
        timestamp: t.block_time,
        amount: t.amount / LAMPORTS,
        flow: 'in' as const,
      })),
      ...outTransfers.map((t) => ({
        txHash: t.trans_id,
        timestamp: t.block_time,
        amount: t.amount / LAMPORTS,
        flow: 'out' as const,
      })),
    ].sort((a, b) => b.timestamp - a.timestamp)

    const totalIn = inTransfers.reduce((sum, t) => sum + t.amount / LAMPORTS, 0)
    const totalOut = outTransfers.reduce((sum, t) => sum + t.amount / LAMPORTS, 0)

    const data: WalletActivityResponse = {
      totalIn,
      totalOut,
      netBalance: totalIn - totalOut,
      transactions,
    }

    return NextResponse.json(data)
  } catch (err) {
    console.warn(`[wallet API] Solscan unavailable for ${address}, falling back to Helius:`, err)
  }

  // Fallback: Helius token accounts (current balance only, no tx history)
  try {
    const tokenAccounts = await getTokenAccountsByOwner(address)
    const brainAccount = tokenAccounts.find((a) => a.mint === BRAIN_TOKEN_MINT)
    const netBalance = brainAccount?.uiAmount ?? 0

    const data: WalletActivityResponse = {
      totalIn: 0,
      totalOut: 0,
      netBalance,
      transactions: [],
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error(`[wallet API] All sources failed for ${address}:`, err)
    return NextResponse.json(
      { error: 'Wallet data fetch failed' },
      { status: 500 }
    )
  }
}
