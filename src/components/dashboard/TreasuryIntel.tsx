'use client'

import { useState } from 'react'
import { format, fromUnixTime } from 'date-fns'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { TooltipContentProps, TooltipValueType } from 'recharts'
import { useTreasury } from '@/hooks/useTreasury'
import { TREASURY_HOLDINGS } from '@/lib/investments.config'
import type { TreasuryResponse } from '@/lib/api/types'

// ─── Utility formatters ───────────────────────────────────────────────────────

function formatUsd(n: number): string {
  if (n < 0.01) return `$${n.toFixed(6)}`
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatSol(n: number): string {
  return `${n.toFixed(4)} \u25ce`
}

function formatGainLoss(pct: number | undefined): { text: string; colorClass: string } {
  if (pct === undefined) return { text: '—', colorClass: 'text-[#cccccc]' }
  const sign = pct >= 0 ? '+' : ''
  return { text: `${sign}${pct.toFixed(2)}%`, colorClass: pct >= 0 ? 'text-[#d4f000]' : 'text-[#ff9e9e]' }
}

// ─── Chart utilities ──────────────────────────────────────────────────────────

interface ChartPoint { label: string; valueUsd: number }

function buildChartData(holdings: TreasuryResponse['holdings']): ChartPoint[] {
  const withDates = holdings
    .filter(h => h.purchaseDate && h.costBasisUsd !== undefined)
    .sort((a, b) => (a.purchaseDate ?? 0) - (b.purchaseDate ?? 0))

  if (withDates.length === 0) return []

  let cumulative = 0
  const points: ChartPoint[] = withDates.map(h => {
    cumulative += h.costBasisUsd ?? 0
    return { label: format(fromUnixTime(h.purchaseDate!), 'MMM dd'), valueUsd: cumulative }
  })

  const totalCurrent = holdings.reduce((s, h) => s + h.currentValueUsd, 0)
  points.push({ label: 'NOW', valueUsd: totalCurrent })
  return points
}

// ─── Custom Chart Tooltip ─────────────────────────────────────────────────────

function CustomChartTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null
  const rawValue = (payload[0] as { value?: TooltipValueType }).value
  const numericValue = typeof rawValue === 'number' ? rawValue : 0
  return (
    <div className="bg-[#0d0d0d] border border-[#d4f000] px-3 py-2 font-mono text-xs">
      <div className="text-[#cccccc] mb-1">{label}</div>
      <div className="text-[#d4f000] font-black">{formatUsd(numericValue)}</div>
    </div>
  )
}

// ─── Treasury Value Chart ─────────────────────────────────────────────────────

function TreasuryValueChart({
  holdings,
  isLoading,
}: {
  holdings: TreasuryResponse['holdings']
  isLoading: boolean
}) {
  const chartData = buildChartData(holdings)

  return (
    <div className="px-6 lg:px-12 py-6 border-t border-[#333]/50">
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#cccccc] font-bold mb-4">
        TREASURY VALUE OVER TIME
      </div>
      {isLoading ? (
        <div className="h-[200px] flex items-center justify-center">
          <span className="text-[#d4f000] font-mono">████████████████████████</span>
        </div>
      ) : chartData.length < 2 ? (
        <div className="h-[200px] flex items-center justify-center">
          <span className="text-[#666] font-mono text-xs tracking-widest">INSUFFICIENT DATA FOR CHART</span>
        </div>
      ) : (
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="treasuryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4f000" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#d4f000" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="label"
                tick={{ fill: '#cccccc', fontSize: 10, fontFamily: 'monospace' }}
                axisLine={{ stroke: '#333' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#cccccc', fontSize: 10, fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                width={50}
              />
              <Tooltip content={(props) => <CustomChartTooltip {...(props as TooltipContentProps)} />} />
              <Area
                type="monotone"
                dataKey="valueUsd"
                stroke="#d4f000"
                strokeWidth={2}
                fill="url(#treasuryGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

// ─── Loading Card ─────────────────────────────────────────────────────────────

function LoadingCard() {
  return (
    <div className="bg-black/40 border border-[#333] p-6 font-mono">
      <div className="flex justify-between items-start mb-4">
        <div className="text-[#d4f000] font-black text-sm uppercase tracking-wider">
          ████████
        </div>
        <span className="text-[#d4f000] text-xs">████</span>
      </div>
      <div className="text-[10px] text-[#666] mb-3">
        <span className="text-[#d4f000]">████████…██████</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[10px]">
        {(['AMOUNT', 'CURRENT VALUE (USD)', 'CURRENT VALUE (SOL)', 'PURCHASE DATE', 'PURCHASE PRICE (USD)', '~PRICE (SOL) AT PURCHASE'] as const).map((label) => (
          <div key={label}>
            <div className="uppercase tracking-widest text-[#666] mb-0.5">{label}</div>
            <div className="text-[#d4f000]">████████</div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-[#333]/50 flex gap-4">
        <span className="text-[#d4f000] text-[10px]">████████ ↗</span>
        <span className="text-[#d4f000] text-[10px]">██████ ↗</span>
      </div>
    </div>
  )
}

// ─── Classified Card ──────────────────────────────────────────────────────────

function ClassifiedCard({ mint }: { mint: string }) {
  return (
    <div className="bg-black/40 border border-[#333] p-6 font-mono relative overflow-hidden">
      <div className="font-mono text-[10px] uppercase tracking-widest text-[#cccccc] mb-2 font-bold">
        HOLDING #{mint.slice(0, 8)}
      </div>
      <div className="text-2xl font-black text-[#333] tracking-widest select-none flicker mb-3">
        ████████████████████
      </div>
      <div className="font-mono text-xs text-[#666] border border-[#333] px-2 py-0.5 tracking-widest inline-block mb-3">
        CLASSIFIED
      </div>
      <div className="block mt-2">
        <a
          href={`https://solscan.io/token/${mint}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[10px] text-[#d4f000] hover:underline"
        >
          SOLSCAN ↗
        </a>
      </div>
    </div>
  )
}

// ─── Holding Card ─────────────────────────────────────────────────────────────

type HoldingData = TreasuryResponse['holdings'][number]

function HoldingCard({
  holding,
  solPriceUsd,
}: {
  holding: HoldingData
  solPriceUsd: number
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(holding.mint)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const gainLoss = formatGainLoss(holding.gainLossPct)
  const purchasePriceSol =
    holding.purchasePriceUsd !== undefined && solPriceUsd > 0
      ? holding.purchasePriceUsd / solPriceUsd
      : undefined
  const purchaseDateStr = holding.purchaseDate
    ? format(fromUnixTime(holding.purchaseDate), 'yyyy-MM-dd')
    : 'UNKNOWN'

  return (
    <div className="bg-black/40 border border-[#333] border-l-[4px] border-l-[#d4f000] p-6 font-mono">
      {/* Header row: token name + gain/loss badge */}
      <div className="flex justify-between items-start mb-3">
        <div className="text-[#d4f000] font-black text-sm uppercase tracking-wider">
          {holding.name}
          {holding.symbol && holding.symbol !== holding.name && (
            <span className="ml-2 text-[#666] font-normal text-[10px]">${holding.symbol}</span>
          )}
        </div>
        <span className={`text-xs font-black tabular-nums ${gainLoss.colorClass}`}>
          {gainLoss.text}
        </span>
      </div>

      {/* Contract address with copy */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] text-[#666] uppercase tracking-widest">CONTRACT</span>
        <button
          onClick={handleCopy}
          className="font-mono text-[10px] text-[#666] hover:text-[#d4f000] transition-colors"
          title="Copy full address"
        >
          {copied
            ? 'COPIED'
            : `${holding.mint.slice(0, 8)}…${holding.mint.slice(-6)}`}
        </button>
      </div>

      {/* Data grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[10px] mb-4">
        <div>
          <div className="uppercase tracking-widest text-[#666] mb-0.5">AMOUNT</div>
          <div className="text-white tabular-nums font-black">
            {holding.uiAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
          </div>
        </div>
        <div>
          <div className="uppercase tracking-widest text-[#666] mb-0.5">CURRENT VALUE (USD)</div>
          <div className="text-white tabular-nums font-black">{formatUsd(holding.currentValueUsd)}</div>
        </div>
        <div>
          <div className="uppercase tracking-widest text-[#666] mb-0.5">CURRENT VALUE (SOL)</div>
          <div className="text-white tabular-nums font-black">{formatSol(holding.currentValueSol)}</div>
        </div>
        <div>
          <div className="uppercase tracking-widest text-[#666] mb-0.5">PURCHASE DATE</div>
          <div className="text-white tabular-nums font-black">{purchaseDateStr}</div>
        </div>
        <div>
          <div className="uppercase tracking-widest text-[#666] mb-0.5">PURCHASE PRICE (USD)</div>
          <div className="text-white tabular-nums font-black">
            {holding.purchasePriceUsd !== undefined ? formatUsd(holding.purchasePriceUsd) : '—'}
          </div>
        </div>
        <div>
          <div className="uppercase tracking-widest text-[#666] mb-0.5">~PRICE (SOL) AT PURCHASE</div>
          <div className="text-[#cccccc] tabular-nums">
            {purchasePriceSol !== undefined ? formatSol(purchasePriceSol) : '—'}
          </div>
        </div>
      </div>

      {/* Description */}
      {holding.description && (
        <div className="text-[#666] text-[10px] italic mb-3 border-t border-[#333]/50 pt-3">
          {holding.description}
        </div>
      )}

      {/* External links */}
      <div className="flex flex-wrap gap-4 pt-2 border-t border-[#333]/50">
        <a
          href={`https://solscan.io/token/${holding.mint}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[10px] text-[#d4f000] hover:underline"
        >
          SOLSCAN ↗
        </a>
        {holding.bagsLink && (
          <a
            href={holding.bagsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] text-[#d4f000] hover:underline"
          >
            BAGS.FM ↗
          </a>
        )}
        {holding.xAccount && (
          <a
            href={holding.xAccount}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] text-[#d4f000] hover:underline"
          >
            𝕏
          </a>
        )}
      </div>
    </div>
  )
}

// ─── Divested Assets Section ──────────────────────────────────────────────────

function DivestedSection() {
  const soldTokens = TREASURY_HOLDINGS.filter(h => h.soldDate !== undefined)

  return (
    <div className="border-t border-[#333] px-6 lg:px-12 py-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#cccccc] font-bold mb-4">
        DIVESTED ASSETS
      </div>
      {soldTokens.length === 0 ? (
        <div className="text-center py-4">
          <span className="text-[#666] font-mono text-xs tracking-widest">
            NO DIVESTED POSITIONS RECORDED
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-[10px]">
            <thead>
              <tr className="border-b border-[#333]/50">
                <th className="text-left uppercase tracking-widest text-[#666] pb-2 pr-6">TOKEN</th>
                <th className="text-left uppercase tracking-widest text-[#666] pb-2 pr-6">SOLD DATE</th>
                <th className="text-left uppercase tracking-widest text-[#666] pb-2 pr-6">AMOUNT</th>
                <th className="text-left uppercase tracking-widest text-[#666] pb-2">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {soldTokens.map(h => (
                <tr key={h.mint} className="border-b border-[#333]/30">
                  <td className="py-2 pr-6 text-white font-black uppercase">{h.symbol}</td>
                  <td className="py-2 pr-6 text-[#cccccc]">
                    {h.soldDate ? format(fromUnixTime(h.soldDate), 'yyyy-MM-dd') : '—'}
                  </td>
                  <td className="py-2 pr-6 text-[#cccccc]">
                    {h.soldAmount !== undefined
                      ? h.soldAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })
                      : '—'}
                  </td>
                  <td className="py-2">
                    <span className="border border-[#333] px-2 py-0.5 text-[10px] tracking-widest text-[#ff9e9e]">
                      DIVESTED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Main TreasuryIntel Component ─────────────────────────────────────────────

export default function TreasuryIntel() {
  const { data, isLoading, isError } = useTreasury()

  return (
    <section className="w-full border-b border-[#333] bg-[#0d0d0d]">
      {/* Section header */}
      <div className="flex justify-between items-center px-6 lg:px-12 py-4 border-b border-[#333]/50">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#cccccc] font-bold">
          TREASURY INTEL &mdash; CLASSIFIED
        </div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-[#d4f000]">
          TS/SCI
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#333]/50 border-b border-[#333]/50">
        {/* TOTAL VALUE (USD) */}
        <div className="px-6 py-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#cccccc] mb-1 font-bold">
            TOTAL VALUE (USD)
          </div>
          <div className="font-mono text-2xl font-black text-white tabular-nums">
            {isLoading ? (
              <span className="text-[#d4f000]">████████</span>
            ) : isError ? (
              <span className="text-[#ff9e9e]">—</span>
            ) : (
              formatUsd(data?.totalValueUsd ?? 0)
            )}
          </div>
        </div>

        {/* SOL BALANCE */}
        <div className="px-6 py-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#cccccc] mb-1 font-bold">
            SOL BALANCE
          </div>
          <div className="font-mono text-2xl font-black text-white tabular-nums">
            {isLoading ? (
              <span className="text-[#d4f000]">████████</span>
            ) : isError ? (
              <span className="text-[#ff9e9e]">—</span>
            ) : (
              formatSol(data?.solBalance ?? 0)
            )}
          </div>
        </div>

        {/* PORTFOLIO VALUE (SOL) */}
        <div className="px-6 py-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#cccccc] mb-1 font-bold">
            PORTFOLIO VALUE (SOL)
          </div>
          <div className="font-mono text-2xl font-black text-white tabular-nums">
            {isLoading ? (
              <span className="text-[#d4f000]">████████</span>
            ) : isError ? (
              <span className="text-[#ff9e9e]">—</span>
            ) : (
              formatSol(data?.totalValueSol ?? 0)
            )}
          </div>
        </div>

        {/* ACTIVE HOLDINGS */}
        <div className="px-6 py-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#cccccc] mb-1 font-bold">
            ACTIVE HOLDINGS
          </div>
          <div className="font-mono text-2xl font-black text-white tabular-nums">
            {isLoading ? (
              <span className="text-[#d4f000]">████████</span>
            ) : isError ? (
              <span className="text-[#ff9e9e]">—</span>
            ) : (
              data?.holdings.length ?? 0
            )}
          </div>
        </div>
      </div>

      {/* Holdings grid */}
      <div className="px-6 lg:px-12 py-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#cccccc] font-bold mb-4">
          ACTIVE POSITIONS
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <LoadingCard key={i} />)
            : (data?.holdings ?? []).map(h =>
                h.category === 'unknown' ? (
                  <ClassifiedCard key={h.mint} mint={h.mint} />
                ) : (
                  <HoldingCard key={h.mint} holding={h} solPriceUsd={data?.solPriceUsd ?? 0} />
                )
              )}
        </div>
      </div>

      {/* Treasury value chart */}
      <TreasuryValueChart holdings={data?.holdings ?? []} isLoading={isLoading} />

      {/* Divested assets */}
      <DivestedSection />
    </section>
  )
}
