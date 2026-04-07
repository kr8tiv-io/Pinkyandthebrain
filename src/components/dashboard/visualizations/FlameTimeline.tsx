'use client'

import { useRef, useEffect, useState } from 'react'
import { format, fromUnixTime } from 'date-fns'
import gsap from 'gsap'

/**
 * FlameTimeline — Compact left-aligned vertical transaction list
 * Tight rows, thin left accent line, small status dots, all data visible.
 */

interface TimelineEvent {
  txHash: string
  timestamp: number
  amountSol: number
  toAddress?: string
}

interface FlameTimelineProps {
  events: TimelineEvent[]
  maxVisible?: number
  isLoading?: boolean
  accentColor?: string
}

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`
}

function shortenTx(hash: string): string {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`
}

export default function FlameTimeline({
  events,
  maxVisible = 12,
  isLoading = false,
  accentColor = '#d4f000',
}: FlameTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? events : events.slice(0, maxVisible)

  const maxAmount = events.length > 0 ? Math.max(...events.map(e => e.amountSol)) : 1

  // Stagger entrance
  useEffect(() => {
    if (!containerRef.current || isLoading) return
    const rows = containerRef.current.querySelectorAll('[data-timeline-row]')
    if (!rows.length) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        rows,
        { opacity: 0, x: -8 },
        {
          opacity: 1, x: 0,
          duration: 0.35,
          ease: 'power2.out',
          stagger: 0.04,
          delay: 0.1,
        }
      )
    }, containerRef)
    return () => ctx.revert()
  }, [visible.length, isLoading])

  if (isLoading) {
    return (
      <div className="space-y-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="wr-skeleton h-8 w-full rounded-sm" />
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="py-6 text-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#555]">NO EVENTS RECORDED</span>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Table header */}
      <div className="grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_auto_auto_auto] gap-x-3 px-2 pb-1.5 border-b border-[#333]/25">
        <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#555] w-2" />
        <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#555]">AMOUNT</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#555] text-right">DATE</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#555] text-right hidden sm:block">TO</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#555] text-right">TX</span>
      </div>

      {/* Rows */}
      <div className="relative">
        {/* Left accent line */}
        <div
          className="absolute left-[5px] top-0 bottom-0 w-[1.5px] rounded-full"
          style={{
            background: `linear-gradient(to bottom, ${accentColor}50, ${accentColor}15, transparent)`,
          }}
        />

        {visible.map((event, i) => {
          const intensity = event.amountSol / maxAmount

          return (
            <div
              key={`${event.txHash}-${i}`}
              data-timeline-row
              className="grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_auto_auto_auto] gap-x-3 items-center px-2 py-1.5 hover:bg-white/[0.015] transition-colors duration-150 border-b border-[#333]/8 group/row"
            >
              {/* Dot indicator */}
              <div className="relative flex items-center justify-center w-2.5">
                <div
                  className="w-[7px] h-[7px] rounded-full border transition-all duration-200"
                  style={{
                    borderColor: accentColor,
                    backgroundColor: `color-mix(in srgb, ${accentColor} ${Math.round(15 + intensity * 50)}%, transparent)`,
                    boxShadow: intensity > 0.6 ? `0 0 4px ${accentColor}40` : 'none',
                  }}
                />
              </div>

              {/* Amount + bar */}
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="font-mono text-[12px] font-bold tabular-nums shrink-0"
                  style={{ color: accentColor }}
                >
                  {event.amountSol.toFixed(4)}
                </span>
                <span className="font-mono text-[10px] text-[#666] shrink-0">SOL</span>
                {/* Inline intensity bar */}
                <div className="flex-1 h-[3px] bg-[#1a1a1a] rounded-full overflow-hidden max-w-[80px] hidden md:block">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.max(intensity * 100, 4)}%`,
                      backgroundColor: accentColor,
                      opacity: 0.4 + intensity * 0.4,
                    }}
                  />
                </div>
              </div>

              {/* Date */}
              <span className="font-mono text-[10px] text-[#888] tabular-nums whitespace-nowrap text-right">
                {format(fromUnixTime(event.timestamp), 'MMM d \'\'yy')}
              </span>

              {/* Address */}
              {event.toAddress && (
                <a
                  href={`https://solscan.io/account/${event.toAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] text-[#666] hover:text-[#bbb] transition-colors tabular-nums text-right hidden sm:block"
                >
                  {shortenAddress(event.toAddress)}
                </a>
              )}

              {/* Tx link */}
              <a
                href={`https://solscan.io/tx/${event.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] tabular-nums text-right transition-colors"
                style={{ color: `color-mix(in srgb, ${accentColor} 50%, #888)` }}
              >
                <span className="hidden sm:inline">{shortenTx(event.txHash)}</span>
                <span className="sm:hidden" style={{ color: `color-mix(in srgb, ${accentColor} 60%, #ccc)` }}>&#x2197;</span>
              </a>
            </div>
          )
        })}
      </div>

      {/* Show more */}
      {events.length > maxVisible && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-2 w-full font-mono text-[10px] uppercase tracking-[0.18em] py-1.5 transition-colors duration-200 border-t border-[#333]/15"
          style={{ color: `color-mix(in srgb, ${accentColor} 60%, #999)` }}
        >
          {showAll ? '\u25B2 COLLAPSE' : `\u25BC SHOW ALL (${events.length})`}
        </button>
      )}
    </div>
  )
}
