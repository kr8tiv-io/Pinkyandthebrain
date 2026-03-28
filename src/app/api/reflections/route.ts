import { NextResponse } from 'next/server'
import {
  getFeeShareData,
  getClaimHistory,
  getFeeDistribution,
} from '@/lib/api/reflections'
import { getTokenPrice } from '@/lib/api/birdeye'
import { SOL_MINT, PAYOUT_THRESHOLD_SOL } from '@/lib/constants'
import type { ReflectionsDashboardResponse } from '@/lib/api/types'

export const revalidate = 120

export async function GET() {
  // Fetch each source independently so one failure doesn't kill all data
  const [feeShareData, claimEvents, solPrice] = await Promise.all([
    getFeeShareData().catch((e) => {
      console.warn('[reflections] PDA read failed:', e?.message)
      return { totalAccumulatedSol: 0, totalClaimedSol: 0, currentUnclaimedSol: 0 }
    }),
    getClaimHistory().catch((e) => {
      console.warn('[reflections] Claim history failed:', e?.message)
      return [] as Array<{ txHash: string; timestamp: number; amountSol: number; toAddress: string }>
    }),
    getTokenPrice(SOL_MINT).catch((e) => {
      console.warn('[reflections] Birdeye price failed:', e?.message)
      return { value: 0 }
    }),
  ])

  const solPriceUsd = solPrice.value ?? 0
  const totalFeeSol = feeShareData.totalAccumulatedSol
  const feeBreakdown = getFeeDistribution(totalFeeSol)

  // Reflections = 20% of total claimed (claimer 0 gets 20% for holder distributions)
  const totalReflectedSol = feeShareData.totalClaimedSol * 0.20

  // Estimate trading volume from fees
  // bags.fm charges 1% total fee; Meteora takes 20% of that (0.20% of volume)
  // PDA receives remaining 80% (0.80% of volume), so volume = fees / 0.008
  const estimatedVolumeSol = totalFeeSol > 0 ? totalFeeSol / 0.008 : 0

  // Last claim timestamp from most recent event
  const lastPayoutTimestamp =
    claimEvents.length > 0 ? claimEvents[0].timestamp : null

  // Estimate next payout based on accrual toward threshold
  let nextPayoutEstimate: number | null = null
  const accruedSol = feeShareData.currentUnclaimedSol
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
    totalReflectedSol,
    currentAccruedSol: accruedSol,
    payoutThresholdSol: PAYOUT_THRESHOLD_SOL,
    estimatedVolumeSol,
    solPriceUsd,
    lastPayoutTimestamp,
    nextPayoutEstimate,
    feeBreakdown,
    distributions: claimEvents.slice(0, 50),
  }

  return NextResponse.json(data)
}
