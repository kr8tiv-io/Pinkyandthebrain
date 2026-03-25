import { NextResponse } from 'next/server'
import { getDexScreenerToken, getJupiterPrices } from '@/lib/api/jupiter'
import { BRAIN_TOKEN_MINT, SOL_MINT } from '@/lib/constants'
import type { PriceResponse } from '@/lib/api/types'

export const revalidate = 60

export async function GET() {
  try {
    // DexScreener: enriched data for BRAIN (price, 24h change, mcap, volume)
    const [brainData, solPrices] = await Promise.all([
      getDexScreenerToken(BRAIN_TOKEN_MINT),
      getJupiterPrices([SOL_MINT]),
    ])

    const brainUsd = brainData?.priceUsd ?? 0
    const solUsd = solPrices[SOL_MINT] ?? 0

    const data: PriceResponse = {
      priceUsd: brainUsd,
      priceSol: solUsd > 0 ? brainUsd / solUsd : 0,
      priceChange24h: brainData?.priceChange24h ?? 0,
      marketCap: brainData?.marketCap,
      volume24h: brainData?.volume24h,
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[price API]', err)
    return NextResponse.json(
      { error: 'Price fetch failed' },
      { status: 500 }
    )
  }
}
