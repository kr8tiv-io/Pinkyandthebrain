import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'War Room | $BRAIN Token',
  description: 'Live treasury analytics and portfolio tracking for the $BRAIN token fund.',
}

export default function WarRoomPage() {
  return (
    <main className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase mb-4">
          War <span className="text-[#d4f000]">Room</span>
        </h1>
        <p className="font-mono text-[#cccccc] text-sm tracking-widest uppercase">
          Dashboard under construction
        </p>
        <div className="mt-6 font-mono text-xs text-[#d4f000] animate-pulse">
          Phase 2 incoming...
        </div>
      </div>
    </main>
  )
}
