import { NextResponse } from 'next/server'
import { getMultiTokenPrices } from '@/lib/api/birdeye'
import { BRAIN_TOKEN_MINT, SOL_MINT } from '@/lib/constants'
import type { PriceResponse } from '@/lib/api/types'

export const revalidate = 60

export async function GET() {
  try {
    const prices = await getMultiTokenPrices([BRAIN_TOKEN_MINT, SOL_MINT])
    const brain = prices[BRAIN_TOKEN_MINT]
    const sol = prices[SOL_MINT]

    const data: PriceResponse = {
      priceUsd: brain?.value ?? 0,
      priceSol: sol?.value > 0 ? (brain?.value ?? 0) / sol.value : 0,
      priceChange24h: brain?.priceChange24h ?? 0,
      marketCap: undefined,
      volume24h: undefined,
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
