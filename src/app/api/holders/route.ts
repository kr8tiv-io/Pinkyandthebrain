import { NextResponse } from 'next/server'
import { getTokenHoldersDAS, getTokenLargestAccounts, resolveTokenAccountOwners } from '@/lib/api/helius'
import { BRAIN_TOKEN_MINT } from '@/lib/constants'

export const revalidate = 300

export async function GET() {
  // Primary: Helius DAS getTokenAccounts (returns owner wallets, paginated)
  try {
    const [page1, page2] = await Promise.all([
      getTokenHoldersDAS(BRAIN_TOKEN_MINT, 1, 100),
      getTokenHoldersDAS(BRAIN_TOKEN_MINT, 2, 100),
    ])

    const allHolders = [...page1.holders, ...page2.holders]
    // Sort by amount descending, take top 100
    allHolders.sort((a, b) => b.amount - a.amount)
    const top100 = allHolders.slice(0, 100)

    return NextResponse.json({
      total: page1.total,
      items: top100.map((h, i) => ({
        rank: i + 1,
        address: h.address,
        owner: h.owner,
        amount: h.amount,
        decimals: h.decimals,
      })),
    })
  } catch (err) {
    console.warn('[holders API] Helius DAS unavailable, falling back:', err)
  }

  // Fallback: getTokenLargestAccounts (top 20) + resolve owners
  try {
    const accounts = await getTokenLargestAccounts(BRAIN_TOKEN_MINT)
    const owners = await resolveTokenAccountOwners(accounts.map(a => a.address))

    const holders = accounts.map((acct, i) => ({
      rank: i + 1,
      address: acct.address,
      owner: owners[acct.address] ?? acct.address,
      amount: Number(acct.amount),
      decimals: acct.decimals,
    }))

    return NextResponse.json({
      total: holders.length,
      items: holders,
    })
  } catch (err) {
    console.error('[holders API] All sources failed:', err)
    return NextResponse.json(
      { error: 'Holder data fetch failed' },
      { status: 500 }
    )
  }
}
