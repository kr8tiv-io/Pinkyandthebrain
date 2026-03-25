'use client'

import { format, fromUnixTime } from 'date-fns'
import { useBurns } from '@/hooks/useBurns'

// ─── Constants ────────────────────────────────────────────────────────────────

const LP_LOCKED_PCT = 100 // LP is 100% locked — static fact, not API-derived

// ─── Utility formatters ──────────────────────────────────────────────────────

function formatBurnAmount(n: number): string {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatPct(n: number): string {
  return `${n.toFixed(2)}%`
}

// ─── BurnSummaryBar ──────────────────────────────────────────────────────────

function BurnSummaryBar({
  totalBurned,
  burnedPct,
  isLoading,
  isError,
}: {
  totalBurned: number
  burnedPct: number
  isLoading: boolean
  isError: boolean
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#333]/50 border-b border-[#333]/50">
      {/* TOTAL INCINERATED */}
      <div className="px-6 py-5">
        <div className="font-mono text-[10px] uppercase tracking-widest text-[#cccccc] mb-1 font-bold">
          TOTAL INCINERATED
        </div>
        <div className="font-mono text-2xl font-black tabular-nums">
          {isLoading ? (
            <span className="text-[#ff6b35]">████████</span>
          ) : isError ? (
            <span className="text-[#ff9e9e]">&mdash;</span>
          ) : (
            <span className="text-[#ff6b35]">{formatBurnAmount(totalBurned)}</span>
          )}
        </div>
      </div>

      {/* % SUPPLY BURNED */}
      <div className="px-6 py-5">
        <div className="font-mono text-[10px] uppercase tracking-widest text-[#cccccc] mb-1 font-bold">
          % SUPPLY BURNED
        </div>
        <div className="font-mono text-2xl font-black tabular-nums">
          {isLoading ? (
            <span className="text-[#ff6b35]">████████</span>
          ) : isError ? (
            <span className="text-[#ff9e9e]">&mdash;</span>
          ) : (
            <span className="text-[#ff6b35]">{formatPct(burnedPct)}</span>
          )}
        </div>
      </div>

      {/* % BURNED + LP LOCKED */}
      <div className="px-6 py-5">
        <div className="font-mono text-[10px] uppercase tracking-widest text-[#cccccc] mb-1 font-bold">
          % BURNED + LP LOCKED
        </div>
        <div className="font-mono text-2xl font-black tabular-nums">
          {isLoading ? (
            <span className="text-[#ff6b35]">████████</span>
          ) : isError ? (
            <span className="text-[#ff9e9e]">&mdash;</span>
          ) : (
            <span className="text-[#ff6b35]">
              {formatPct(burnedPct)} burned, {LP_LOCKED_PCT}% locked
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── BurnTransactionsTable ───────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-[#333]/30">
      <td className="py-2 pr-6">
        <span className="text-[#ff6b35]">████████████</span>
      </td>
      <td className="py-2 pr-6">
        <span className="text-[#ff6b35]">██████████</span>
      </td>
      <td className="py-2">
        <span className="text-[#ff6b35]">████████…██████</span>
      </td>
    </tr>
  )
}

function BurnTransactionsTable({
  transactions,
  isLoading,
  isError,
}: {
  transactions: Array<{ txHash: string; timestamp: number; amount: number }>
  isLoading: boolean
  isError: boolean
}) {
  return (
    <div className="px-6 lg:px-12 py-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#cccccc] font-bold mb-4">
        BURN TRANSACTIONS
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        <table className="w-full font-mono text-[10px]">
          <thead>
            <tr className="border-b border-[#333]/50">
              <th className="text-left uppercase tracking-widest text-[#666] pb-2 pr-6">
                DATE
              </th>
              <th className="text-left uppercase tracking-widest text-[#666] pb-2 pr-6">
                AMOUNT
              </th>
              <th className="text-left uppercase tracking-widest text-[#666] pb-2">
                TX HASH
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : isError ? (
              <tr>
                <td colSpan={3} className="py-6 text-center">
                  <span className="text-[#ff9e9e] tracking-widest">&mdash;</span>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-6 text-center">
                  <span className="text-[#666] tracking-widest">
                    NO BURN TRANSACTIONS RECORDED
                  </span>
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.txHash} className="border-b border-[#333]/30">
                  <td className="py-2 pr-6 text-[#cccccc]">
                    {format(fromUnixTime(tx.timestamp), 'yyyy-MM-dd HH:mm')}
                  </td>
                  <td className="py-2 pr-6 text-[#ff6b35] font-black tabular-nums">
                    {formatBurnAmount(tx.amount)}
                  </td>
                  <td className="py-2">
                    <a
                      href={`https://solscan.io/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#ff6b35] hover:underline"
                    >
                      {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-6)} ↗
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Main BurnOperations Component ───────────────────────────────────────────

export default function BurnOperations() {
  const { data, isLoading, isError } = useBurns()

  return (
    <section className="w-full border-b border-[#333] bg-[#0d0d0d] border-t-2 border-t-[#ff6b35] relative overflow-hidden">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#ff6b35]/[0.06] to-transparent pointer-events-none" />

      {/* Section header */}
      <div className="relative flex justify-between items-center px-6 lg:px-12 py-4 border-b border-[#333]/50">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#cccccc] font-bold">
          BURN OPERATIONS
        </div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-[#ff6b35] border border-[#ff6b35] px-2 py-0.5 animate-pulse">
          INCINERATED
        </div>
      </div>

      {/* Summary bar */}
      <div className="relative">
        <BurnSummaryBar
          totalBurned={data?.totalBurned ?? 0}
          burnedPct={data?.burnedPct ?? 0}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      {/* Transactions table */}
      <div className="relative">
        <BurnTransactionsTable
          transactions={data?.transactions ?? []}
          isLoading={isLoading}
          isError={isError}
        />
      </div>
    </section>
  )
}
