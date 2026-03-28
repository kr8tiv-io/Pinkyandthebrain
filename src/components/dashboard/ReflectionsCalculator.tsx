'use client'

import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'

function formatSol(n: number): string {
  if (n < 0.0001) return n.toExponential(2)
  if (n < 1) return n.toFixed(6)
  return n.toFixed(4)
}

function formatUsd(n: number): string {
  if (n < 0.01) return `$${n.toFixed(6)}`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`
  return `$${n.toFixed(2)}`
}

export default function ReflectionsCalculator({
  currentAccruedSol,
  lastPayoutTimestamp,
  solPriceUsd,
  holdersSharePct,
  totalSupply,
  isLoading,
}: {
  currentAccruedSol: number
  lastPayoutTimestamp: number | null
  solPriceUsd: number
  holdersSharePct: number
  totalSupply: number
  isLoading: boolean
}) {
  const [inputAmount, setInputAmount] = useState('')
  const resultsRef = useRef<HTMLDivElement>(null)

  const amount = parseFloat(inputAmount) || 0

  // Compute fee velocity
  const now = Math.floor(Date.now() / 1000)
  const timeSincePayout = lastPayoutTimestamp ? now - lastPayoutTimestamp : 0
  const dailyAccrual = timeSincePayout > 0 ? (currentAccruedSol / timeSincePayout) * 86400 : 0
  const holdersDailyReflection = dailyAccrual * (holdersSharePct / 100)

  // User's share
  const userShare = totalSupply > 0 ? amount / totalSupply : 0
  const userDailySol = holdersDailyReflection * userShare
  const userWeeklySol = userDailySol * 7
  const userMonthlySol = userDailySol * 30

  // Animate results on change
  useEffect(() => {
    if (!resultsRef.current || amount === 0) return
    gsap.fromTo(
      resultsRef.current.querySelectorAll('[data-calc-result]'),
      { opacity: 0.5, y: 4 },
      { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', stagger: 0.05 }
    )
  }, [amount])

  if (isLoading) return null

  return (
    <div className="px-5 lg:px-8 py-6 border-t border-[#333]/15">
      <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#e0e0e0] font-bold mb-5 flex items-center gap-3 wr-sub-header">
        <span className="text-[#d4f000]/70 text-[12px] wr-sub-diamond">◆</span>
        <span>REFLECTIONS CALCULATOR</span>
        <div className="flex-1 h-px bg-gradient-to-r from-[#d4f000]/30 to-transparent" />
        <span className="text-[#bbb]">ESTIMATE</span>
      </div>

      {/* Input */}
      <div className="mb-5">
        <label className="block font-mono text-[11px] uppercase tracking-[0.2em] text-[#bbb] mb-2">
          Enter BRAIN Amount
        </label>
        <div className="relative">
          <input
            type="number"
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            placeholder="e.g. 1,000,000"
            className="w-full bg-[#111] border border-[#333]/30 focus:border-[#d4f000]/50 rounded-sm px-4 py-3 font-mono text-white text-lg tabular-nums outline-none transition-colors duration-200 placeholder:text-[#555]"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[12px] text-[#d4f000]/60 font-bold">
            $BRAIN
          </span>
        </div>
      </div>

      {/* Results */}
      <div ref={resultsRef} className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: 'Daily', sol: userDailySol },
          { label: 'Weekly', sol: userWeeklySol },
          { label: 'Monthly', sol: userMonthlySol },
        ].map((period) => (
          <div
            key={period.label}
            data-calc-result
            className="bg-[#0d0d0d] border border-[#333]/15 rounded-sm p-4 transition-colors hover:border-[#d4f000]/15"
          >
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#bbb] mb-2 font-bold">
              {period.label}
            </div>
            <div className="font-mono text-lg font-black text-white tabular-nums">
              {amount > 0 ? (
                <>
                  {formatSol(period.sol)} <span className="text-[#d4f000]/80 text-[13px]">SOL</span>
                </>
              ) : (
                <span className="text-[#555]">—</span>
              )}
            </div>
            {amount > 0 && solPriceUsd > 0 && (
              <div className="font-mono text-[12px] text-[#bbb] mt-1 tabular-nums">
                {formatUsd(period.sol * solPriceUsd)}
              </div>
            )}
          </div>
        ))}
      </div>

      {amount > 0 && (
        <div className="mt-3 font-mono text-[10px] text-[#555] tracking-wider">
          * Estimates based on current fee accrual rate. Actual reflections depend on trading volume and holder rank.
        </div>
      )}
    </div>
  )
}
