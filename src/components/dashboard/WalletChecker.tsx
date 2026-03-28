'use client'

import { useRef, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useQuery } from '@tanstack/react-query'
import gsap from 'gsap'

interface WalletCheckResponse {
  address: string
  rank: number | null
  balance: number
  isEligible: boolean
  totalHolders: number
  estimatedSharePct: number
  estimatedShareSol: number
}

function useWalletCheck(address: string | null) {
  return useQuery<WalletCheckResponse, Error>({
    queryKey: ['wallet-check', address],
    queryFn: async () => {
      const res = await fetch(`/api/wallet-check?address=${address}`)
      if (!res.ok) throw new Error('Wallet check failed')
      return res.json() as Promise<WalletCheckResponse>
    },
    enabled: !!address,
    staleTime: 60_000,
  })
}

function formatNumber(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export default function WalletChecker({
  solPriceUsd,
  payoutThresholdSol,
}: {
  solPriceUsd: number
  payoutThresholdSol: number
}) {
  const { publicKey, connected } = useWallet()
  const address = publicKey?.toBase58() ?? null
  const { data, isLoading, isError } = useWalletCheck(address)
  const cardRef = useRef<HTMLDivElement>(null)

  // Entrance animation
  useEffect(() => {
    if (!cardRef.current || !data) return
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 12, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' }
    )
  }, [data])

  return (
    <div className="px-5 lg:px-8 py-6 border-t border-[#333]/15">
      <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#e0e0e0] font-bold mb-5 flex items-center gap-3 wr-sub-header">
        <span className="text-[#d4f000]/70 text-[12px] wr-sub-diamond">◆</span>
        <span>WALLET ELIGIBILITY CHECK</span>
        <div className="flex-1 h-px bg-gradient-to-r from-[#d4f000]/30 to-transparent" />
        <span className="text-[#bbb]">TOP 100</span>
      </div>

      {!connected ? (
        <div className="flex flex-col items-center gap-4 py-6 bg-[#0d0d0d] border border-[#333]/15 rounded-sm">
          <div className="font-mono text-[12px] text-[#bbb] tracking-wider uppercase mb-2">
            Connect wallet to check eligibility
          </div>
          <WalletMultiButton className="!bg-[#d4f000] !text-black !font-mono !font-bold !text-[12px] !uppercase !tracking-wider !rounded-sm !px-6 !py-3 hover:!bg-[#e4ff57] !transition-colors" />
        </div>
      ) : isLoading ? (
        <div className="wr-skeleton h-32 w-full rounded-sm" />
      ) : isError ? (
        <div className="py-6 text-center font-mono text-[12px] text-[#ff9e9e] tracking-wider">
          UNABLE TO CHECK WALLET
        </div>
      ) : data ? (
        <div
          ref={cardRef}
          className={`relative p-[1px] rounded-sm overflow-hidden ${
            data.isEligible ? 'shadow-[0_0_30px_rgba(212,240,0,0.08)]' : ''
          }`}
        >
          {/* Glow border for eligible */}
          {data.isEligible && (
            <div className="absolute inset-0 bg-gradient-to-r from-[#d4f000]/20 via-[#e4ff57]/10 to-[#d4f000]/20 rounded-sm" />
          )}
          <div className="relative bg-[#0d0d0d] p-5 rounded-sm">
            {/* Status badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    data.isEligible ? 'bg-[#d4f000]' : 'bg-[#555]'
                  }`}
                  style={data.isEligible ? { boxShadow: '0 0 8px rgba(212,240,0,0.5)' } : {}}
                />
                <span className={`font-mono text-[13px] font-black uppercase tracking-wider ${
                  data.isEligible ? 'text-[#d4f000]' : 'text-[#bbb]'
                }`}>
                  {data.isEligible ? 'ELIGIBLE FOR REFLECTIONS' : 'NOT IN TOP 100'}
                </span>
              </div>
              {data.rank !== null && (
                <span className="font-mono text-[12px] text-[#d4f000] font-bold bg-[#d4f000]/[0.06] px-2.5 py-1 rounded-sm border border-[#d4f000]/15">
                  RANK #{data.rank}
                </span>
              )}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#bbb] mb-1">Balance</div>
                <div className="font-mono text-sm font-black text-white tabular-nums">
                  {formatNumber(data.balance)} BRAIN
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#bbb] mb-1">Share</div>
                <div className="font-mono text-sm font-black text-white tabular-nums">
                  {data.estimatedSharePct.toFixed(4)}%
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#bbb] mb-1">Est. Per Payout</div>
                <div className="font-mono text-sm font-black tabular-nums text-[#d4f000]">
                  {data.estimatedShareSol.toFixed(4)} SOL
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#bbb] mb-1">Est. USD</div>
                <div className="font-mono text-sm font-black tabular-nums text-[#d4f000]">
                  ${(data.estimatedShareSol * solPriceUsd).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
