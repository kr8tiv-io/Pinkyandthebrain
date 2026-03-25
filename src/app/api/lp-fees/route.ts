import { NextResponse } from 'next/server'
import { getLpFeeInflows, getFeeDistribution } from '@/lib/api/reflections'
import type { LpFeeResponse } from '@/lib/api/types'

export const revalidate = 300

export async function GET() {
  try {
    const { totalFeeSol, inflows: rawInflows } = await getLpFeeInflows()
    const distribution = getFeeDistribution(totalFeeSol)

    const inflows = rawInflows.map(({ txHash, timestamp, amountSol }) => ({
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
    console.warn('[lp-fees API] Solscan unavailable, returning empty data:', err)

    // Fallback: return empty inflows with zero distribution
    const data: LpFeeResponse = {
      totalFeeSol: 0,
      inflows: [],
      distribution: getFeeDistribution(0),
    }

    return NextResponse.json(data)
  }
}
