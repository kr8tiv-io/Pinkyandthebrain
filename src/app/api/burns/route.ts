import { NextResponse } from 'next/server'
import { getBurnSummary } from '@/lib/api/burns'

export const revalidate = 300

export async function GET() {
  try {
    const data = await getBurnSummary()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[burns API]', err)
    return NextResponse.json(
      { error: 'Burns data fetch failed' },
      { status: 500 }
    )
  }
}
