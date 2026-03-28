import { NextRequest, NextResponse } from 'next/server'
import { getTokenHoldersDAS } from '@/lib/api/helius'
import { BRAIN_TOKEN_MINT, PAYOUT_THRESHOLD_SOL } from '@/lib/constants'

export const revalidate = 60

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address')
  if (!address) {
    return NextResponse.json({ error: 'Missing address parameter' }, { status: 400 })
  }

  try {
    // Fetch top holders (2 pages)
    const [page1, page2] = await Promise.all([
      getTokenHoldersDAS(BRAIN_TOKEN_MINT, 1, 100),
      getTokenHoldersDAS(BRAIN_TOKEN_MINT, 2, 100),
    ])

    const allHolders = [...page1.holders, ...page2.holders]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 100)

    // Find user's position
    const userIndex = allHolders.findIndex(h => h.owner === address)
    const userHolder = userIndex >= 0 ? allHolders[userIndex] : null

    // If not in top 100, check if they hold any BRAIN at all
    let balance = 0
    if (userHolder) {
      balance = userHolder.amount / Math.pow(10, userHolder.decimals)
    }

    // Calculate share of top 100
    const top100Total = allHolders.reduce((s, h) => s + h.amount, 0)
    const userAmount = userHolder?.amount ?? 0
    const sharePct = top100Total > 0 ? (userAmount / top100Total) * 100 : 0

    // Holders get 20% of fee claims
    const holdersReflectionSol = PAYOUT_THRESHOLD_SOL * 0.20
    const estimatedShareSol = holdersReflectionSol * (sharePct / 100)

    return NextResponse.json({
      address,
      rank: userIndex >= 0 ? userIndex + 1 : null,
      balance,
      isEligible: userIndex >= 0,
      totalHolders: page1.holders.length + page2.holders.length,
      estimatedSharePct: sharePct,
      estimatedShareSol,
    })
  } catch (err) {
    console.warn('[wallet-check] Failed:', err)
    return NextResponse.json({ error: 'Wallet check failed' }, { status: 500 })
  }
}
