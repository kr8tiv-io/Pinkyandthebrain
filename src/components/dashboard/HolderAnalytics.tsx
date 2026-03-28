'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { useQuery } from '@tanstack/react-query'

interface HolderItem {
  rank: number
  address: string
  owner: string
  amount: number
  decimals: number
}

interface HoldersApiResponse {
  total: number
  items: HolderItem[]
}

function useHolders() {
  return useQuery<HoldersApiResponse, Error>({
    queryKey: ['holders'],
    queryFn: async () => {
      const res = await fetch('/api/holders')
      if (!res.ok) throw new Error('Holders fetch failed')
      return res.json() as Promise<HoldersApiResponse>
    },
    staleTime: 300_000,
    refetchInterval: 300_000,
  })
}

interface Tier {
  label: string
  color: string
  glow: string
  count: number
  totalAmount: number
  pct: number
}

function buildTiers(items: HolderItem[]): Tier[] {
  const sorted = [...items].sort((a, b) => b.amount - a.amount)
  const grandTotal = sorted.reduce((s, h) => s + h.amount, 0)
  if (grandTotal === 0) return []

  const groups = [
    { label: 'Top 10', range: [0, 10], color: '#d4f000', glow: 'rgba(212,240,0,0.3)' },
    { label: '11–25', range: [10, 25], color: '#e4ff57', glow: 'rgba(228,255,87,0.25)' },
    { label: '26–50', range: [25, 50], color: '#4a90e2', glow: 'rgba(74,144,226,0.25)' },
    { label: '51–100', range: [50, 100], color: '#c084fc', glow: 'rgba(192,132,252,0.25)' },
  ]

  return groups.map(g => {
    const slice = sorted.slice(g.range[0], Math.min(g.range[1], sorted.length))
    const totalAmount = slice.reduce((s, h) => s + h.amount, 0)
    return {
      label: g.label,
      color: g.color,
      glow: g.glow,
      count: slice.length,
      totalAmount,
      pct: (totalAmount / grandTotal) * 100,
    }
  }).filter(t => t.count > 0)
}

export default function HolderAnalytics() {
  const { data, isLoading, isError } = useHolders()
  const ringRef = useRef<SVGSVGElement>(null)

  const items = data?.items ?? []
  const tiers = buildTiers(items)
  const totalHolders = data?.total ?? items.length

  // Animate ring on mount
  useEffect(() => {
    if (!ringRef.current || tiers.length === 0) return
    const arcs = ringRef.current.querySelectorAll<SVGCircleElement>('[data-tier-arc]')
    if (!arcs.length) return
    const ctx = gsap.context(() => {
      arcs.forEach(el => {
        const len = el.getAttribute('data-dash-len') ?? '0'
        gsap.set(el, { attr: { 'stroke-dashoffset': len } })
      })
      gsap.to(arcs, {
        attr: { 'stroke-dashoffset': 0 },
        duration: 1.5,
        ease: 'power3.out',
        stagger: 0.1,
        delay: 0.2,
      })
    }, ringRef)
    return () => ctx.revert()
  }, [tiers])

  if (isLoading) {
    return (
      <div className="px-5 lg:px-8 py-6 border-t border-[#444]/20">
        <div className="wr-skeleton h-48 w-full" />
      </div>
    )
  }

  if (isError || tiers.length === 0) return null

  // SVG donut
  const size = 180
  const cx = size / 2
  const cy = size / 2
  const radius = 65
  const strokeWidth = 16
  const circumference = 2 * Math.PI * radius

  let accumulated = 0
  const arcs = tiers.map((tier) => {
    const dashLen = (tier.pct / 100) * circumference
    const gap = circumference - dashLen
    const rotation = (accumulated / 100) * 360 - 90
    accumulated += tier.pct
    return { ...tier, dashLen, gap, rotation }
  })

  // Whale concentration = top 10 %
  const whaleConcentration = tiers.length > 0 ? tiers[0].pct : 0

  return (
    <div className="px-5 lg:px-8 py-6 border-t border-[#444]/20">
      <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#e0e0e0] font-bold mb-5 flex items-center gap-3 wr-sub-header">
        <span className="text-[#d4f000]/70 text-[12px] wr-sub-diamond">◆</span>
        <span>HOLDER ANALYTICS</span>
        <div className="flex-1 h-px bg-gradient-to-r from-[#888]/50 to-transparent" />
        <span className="text-[#bbb]">{totalHolders} HOLDERS</span>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Donut */}
        <div className="relative flex-shrink-0">
          <svg ref={ringRef} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#1a1a1a" strokeWidth={strokeWidth} />
            {arcs.map((arc) => (
              <circle
                key={arc.label}
                data-tier-arc
                data-dash-len={arc.dashLen}
                cx={cx} cy={cy} r={radius}
                fill="none"
                stroke={arc.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${arc.dashLen} ${arc.gap}`}
                strokeDashoffset={arc.dashLen}
                strokeLinecap="round"
                transform={`rotate(${arc.rotation} ${cx} ${cy})`}
                style={{ filter: `drop-shadow(0 0 4px ${arc.glow})` }}
              />
            ))}
          </svg>
          {/* Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-2xl font-black text-[#d4f000] tabular-nums">
              {whaleConcentration.toFixed(0)}%
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#bbb]">Top 10</span>
          </div>
        </div>

        {/* Tier breakdown */}
        <div className="flex-1 space-y-3 w-full">
          {tiers.map((tier) => (
            <div key={tier.label} className="flex items-center gap-3">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: tier.color, boxShadow: `0 0 6px ${tier.glow}` }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-mono text-[12px] text-[#ccc] font-bold">{tier.label}</span>
                  <span className="font-mono text-[12px] font-black tabular-nums" style={{ color: tier.color }}>
                    {tier.pct.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${tier.pct}%`,
                      backgroundColor: tier.color,
                      boxShadow: `0 0 8px ${tier.glow}`,
                    }}
                  />
                </div>
              </div>
              <span className="font-mono text-[11px] text-[#bbb] tabular-nums shrink-0">
                {tier.count} wallets
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
