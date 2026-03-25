import { NextResponse } from 'next/server'
import { getTop100Holders } from '@/lib/api/solscan'
import { getTokenLargestAccounts } from '@/lib/api/helius'
import { BRAIN_TOKEN_MINT } from '@/lib/constants'

export const revalidate = 300 // 5-minute cache

export async function GET() {
  // Try Solscan first (full 100 holders)
  try {
    const holders = await getTop100Holders(BRAIN_TOKEN_MINT)
    return NextResponse.json(holders)
  } catch (err) {
    console.warn('[hall-of-fame API] Solscan unavailable, falling back to Helius:', err)
  }

  // Fallback: Helius getTokenLargestAccounts (top 20)
  try {
    const accounts = await getTokenLargestAccounts(BRAIN_TOKEN_MINT)
    const holders = accounts.map((acct, i) => ({
      address: acct.address,
      amount: Number(acct.amount),
      decimals: acct.decimals,
      owner: acct.address,
      rank: i + 1,
    }))
    return NextResponse.json(holders)
  } catch (err) {
    console.error('[hall-of-fame API] All sources failed:', err)
    return NextResponse.json(
      { error: 'Holder data fetch failed' },
      { status: 500 }
    )
  }
}
