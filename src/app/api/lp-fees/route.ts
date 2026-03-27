import { NextResponse } from 'next/server'
import { getFeeShareData, getClaimHistory, getFeeDistribution } from '@/lib/api/reflections'
import type { LpFeeResponse } from '@/lib/api/types'

export const revalidate = 300

export async function GET() {
  try {
    const [feeData, claimEvents] = await Promise.all([
      getFeeShareData(),
      getClaimHistory(),
    ])

    const totalFeeSol = feeData.totalAccumulatedSol
    const distribution = getFeeDistribution(totalFeeSol)

    const inflows = claimEvents.map(({ txHash, timestamp, amountSol }) => ({
      txHash,
      timestamp,
      amountSol,
    }))

    const data: LpFeeResponse = {
      totalFeeSol,
      inflows,
      distribution,
    }

    return NextResponse.json(data)
  } catch (err) {
    console.warn('[lp-fees API] Fee data fetch failed:', err)

    const data: LpFeeResponse = {
      totalFeeSol: 0,
      inflows: [],
      distribution: getFeeDistribution(0),
    }

    return NextResponse.json(data)
  }
}
