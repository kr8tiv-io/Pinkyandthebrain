import { NextResponse } from 'next/server'
import {
  getLpFeeInflows,
  getReflectionDistributions,
  getLpWalletBalance,
  getFeeDistribution,
} from '@/lib/api/reflections'
import { getTokenPrice } from '@/lib/api/birdeye'
import { SOL_MINT, PAYOUT_THRESHOLD_SOL } from '@/lib/constants'
import type { ReflectionsDashboardResponse } from '@/lib/api/types'

export const revalidate = 300

export async function GET() {
  // Fetch each source independently so one failure doesn't kill all data
  const [feeData, reflectionData, accruedSol, solPrice] = await Promise.all([
    getLpFeeInflows().catch((e) => {
      console.warn('[reflections] Solscan inflows failed:', e?.message)
      return { totalFeeSol: 0, inflows: [] as Array<{ txHash: string; timestamp: number; amountSol: number; fromAddress: string }> }
    }),
    getReflectionDistributions().catch((e) => {
      console.warn('[reflections] Solscan distributions failed:', e?.message)
      return { totalDistributedSol: 0, distributions: [] as Array<{ txHash: string; timestamp: number; amountSol: number; toAddress: string }> }
    }),
    getLpWalletBalance().catch((e) => {
      console.warn('[reflections] RPC balance failed:', e?.message)
      return 0
    }),
    getTokenPrice(SOL_MINT).catch((e) => {
      console.warn('[reflections] Birdeye price failed:', e?.message)
      return { value: 0 }
    }),
  ])

  const solPriceUsd = solPrice.value ?? 0
  const totalFeeSol = feeData.totalFeeSol
  const feeBreakdown = getFeeDistribution(totalFeeSol)

  // Estimate trading volume from fees (1% creator fee)
  const estimatedVolumeSol = totalFeeSol / 0.01

  // Last payout timestamp from most recent distribution
  const lastPayoutTimestamp =
    reflectionData.distributions.length > 0
      ? reflectionData.distributions[0].timestamp
      : null

  // Estimate next payout based on accrual rate
  let nextPayoutEstimate: number | null = null
  if (lastPayoutTimestamp && accruedSol > 0 && accruedSol < PAYOUT_THRESHOLD_SOL) {
    const now = Math.floor(Date.now() / 1000)
    const timeSinceLastPayout = now - lastPayoutTimestamp
    if (timeSinceLastPayout > 0) {
      const accrualRate = accruedSol / timeSinceLastPayout
      const remaining = PAYOUT_THRESHOLD_SOL - accruedSol
      const secondsToThreshold = remaining / accrualRate
      nextPayoutEstimate = now + Math.floor(secondsToThreshold)
    }
  }

  const data: ReflectionsDashboardResponse = {
    totalFeesLifetimeSol: totalFeeSol,
    totalReflectedSol: reflectionData.totalDistributedSol,
    currentAccruedSol: accruedSol,
    payoutThresholdSol: PAYOUT_THRESHOLD_SOL,
    estimatedVolumeSol,
    solPriceUsd,
    lastPayoutTimestamp,
    nextPayoutEstimate,
    feeBreakdown,
    distributions: reflectionData.distributions.slice(0, 50),
  }

  return NextResponse.json(data)
}
