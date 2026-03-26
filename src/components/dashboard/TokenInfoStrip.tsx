'use client'

import { BRAIN_TOKEN_MINT, TREASURY_WALLET, BURN_DESTINATION } from '@/lib/constants'

const LINKS = [
  { label: 'DEXSCREENER', href: `https://dexscreener.com/solana/${BRAIN_TOKEN_MINT}`, accent: false },
  { label: 'SOLSCAN', href: `https://solscan.io/token/${BRAIN_TOKEN_MINT}`, accent: false },
  { label: 'TREASURY', href: `https://solscan.io/account/${TREASURY_WALLET}`, accent: true },
  { label: 'INCINERATOR', href: `https://solscan.io/account/${BURN_DESTINATION}`, accent: false },
  { label: 'BAGS.FM', href: `https://bags.fm/b/${BRAIN_TOKEN_MINT}`, accent: false },
]

const TICKER_ITEMS = [
  { text: '$BRAIN', color: 'text-[#d4f000]/80' },
  { text: 'DEFLATIONARY SPL TOKEN', color: 'text-[#999]' },
  { text: 'NARF!', color: 'text-[#ffadad]/70' },
  { text: 'SOL REFLECTIONS TO TOP 100', color: 'text-[#999]' },
  { text: '$BRAIN', color: 'text-[#d4f000]/80' },
  { text: '10% BURNED · 20% HOLDERS · 30% INVESTMENTS', color: 'text-[#999]' },
  { text: 'POIT!', color: 'text-[#ffadad]/70' },
  { text: '100% LP LOCKED', color: 'text-[#999]' },
  { text: 'ON-CHAIN TRANSPARENCY', color: 'text-[#999]' },
  { text: 'COMMUNITY GOVERNED', color: 'text-[#999]' },
  { text: 'THE SAME THING WE DO EVERY NIGHT', color: 'text-[#bbb]' },
  { text: '$BRAIN', color: 'text-[#d4f000]/80' },
  { text: 'TRY TO TAKE OVER THE WORLD', color: 'text-[#ffadad]/65' },
]

export default function TokenInfoStrip() {
  return (
    <div className="w-full bg-[#0a0a0a] border-b border-[#333]/30 relative">
      {/* Top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4f000]/[0.30] to-transparent" />
      {/* Quick links row */}
      <div className="flex items-center gap-1 px-5 lg:px-8 py-2.5 overflow-x-auto wr-scroll">
        <div className="flex items-center gap-2 mr-3">
          <div className="w-0.5 h-3 bg-[#d4f000]/60" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#bbb] font-bold whitespace-nowrap">
            QUICK INTEL
          </span>
        </div>
        <div className="w-px h-3 bg-[#333]/40 mr-1" />
        {LINKS.map(({ label, href, accent }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`font-mono text-[11px] transition-all px-2.5 py-1 whitespace-nowrap rounded-sm wr-link-scale wr-link-hover ${
              accent
                ? 'text-[#d4f000] hover:text-[#d4f000] hover:bg-[#d4f000]/[0.08] border border-[#d4f000]/35 hover:border-[#d4f000]/50 hover:shadow-[0_0_12px_rgba(212,240,0,0.2)]'
                : 'text-[#bbb] hover:text-[#d4f000] hover:bg-[#d4f000]/[0.05]'
            }`}
          >
            {label} <span className="text-[11px] opacity-70">↗</span>
          </a>
        ))}
        <div className="w-px h-3 bg-[#333]/30 ml-1" />
        <div className="flex items-center gap-1.5 px-2 py-1 whitespace-nowrap">
          <div className="w-1 h-1 bg-[#d4f000]/70 rounded-full" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#999] font-bold">SOLANA MAINNET</span>
        </div>
      </div>

      {/* Ticker tape with gradient fade edges */}
      <div className="border-t border-[#333]/20 overflow-hidden py-1.5 relative">
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
        <div className="ticker-track">
          {/* Duplicate full set for seamless scroll */}
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className={`font-mono text-[10px] uppercase tracking-[0.3em] mx-6 whitespace-nowrap ${item.color}`}>
              <span className="text-[#d4f000]/40 mr-2 wr-ticker-diamond">◆</span>
              {item.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
