import type { Metadata } from 'next'
import { Suspense } from 'react'
import WarRoomShell from '@/components/dashboard/WarRoomShell'

export const metadata: Metadata = {
  title: 'War Room | Pinky and The Brain $BRAIN Fund',
  description: 'Live treasury analytics, portfolio P&L tracking, and on-chain intelligence for the $BRAIN deflationary Solana token fund.',
  openGraph: {
    title: 'War Room | $BRAIN Fund Intelligence Dashboard',
    description: 'Live treasury analytics, portfolio P&L tracking, and on-chain intelligence for the $BRAIN deflationary Solana token fund.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

function WarRoomLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="font-mono text-[12px] uppercase tracking-[0.3em] text-[#d4f000]/60 animate-pulse">
        INITIALIZING WAR ROOM...
      </div>
    </div>
  )
}

export default function WarRoomPage() {
  return (
    <Suspense fallback={<WarRoomLoading />}>
      <WarRoomShell />
    </Suspense>
  )
}
