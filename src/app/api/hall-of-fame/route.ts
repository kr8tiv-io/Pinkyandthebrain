import { NextResponse } from 'next/server'
import { getTop100Holders } from '@/lib/api/solscan'
import { BRAIN_TOKEN_MINT } from '@/lib/constants'

export const revalidate = 300 // 5-minute cache

export async function GET() {
  try {
    const holders = await getTop100Holders(BRAIN_TOKEN_MINT)
    return NextResponse.json(holders)
  } catch (err) {
    console.error('[hall-of-fame API]', err)
    return NextResponse.json(
      { error: 'Holder data fetch failed' },
      { status: 500 }
    )
  }
}
