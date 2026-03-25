import { NextResponse } from 'next/server'
import { getTreasuryValuations } from '@/lib/api/treasury'

export const revalidate = 60

export async function GET() {
  try {
    const data = await getTreasuryValuations()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[treasury API]', err)
    return NextResponse.json(
      { error: 'Treasury data fetch failed' },
      { status: 500 }
    )
  }
}
