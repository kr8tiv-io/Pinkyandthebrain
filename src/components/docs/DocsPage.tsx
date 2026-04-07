'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════════════ */

const BRAIN_MINT = '7r9RJw6gWbj6s1N9pGKrdzzd5H7oK1sauuwkUDVKBAGS'
const FEE_PROGRAM = 'FEE2tBhCKAt7shrod19QttSVREUYPiyMzoku1mL1gqVK'
const STAKING_PROGRAM = '5o2uBwvKUy4oF78ziR4tEiqz59k7XBXuZBwiZFqCfca2'
const TREASURY_WALLET = 'CzTn2G4uskfAC66QL1GoeSYEb3M3sUK4zxAoKDRGE4XV'
const INCINERATOR = '1nc1nerator11111111111111111111111111111111'
const LP_WALLET = 'GcNK263XZXW3omuVQpg2wc9Rs79TsGunknz8R378w3d8'

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'tokenomics', label: 'Tokenomics' },
  { id: 'fee-engine', label: 'Fee Engine' },
  { id: 'staking', label: 'Staking' },
  { id: 'reflections', label: 'Reflections' },
  { id: 'burns', label: 'Burns' },
  { id: 'treasury', label: 'Treasury' },
  { id: 'governance', label: 'Governance' },
  { id: 'contracts', label: 'Contracts' },
]

const FEE_SPLITS = [
  { label: 'Treasury Investments', pct: 30, color: '#4a90e2', wallet: TREASURY_WALLET },
  { label: 'Holders (Reflections)', pct: 20, color: '#d4f000', wallet: '7BLH...23cf' },
  { label: 'Dev', pct: 20, color: '#ff9e9e', wallet: 'GLda...xvNs' },
  { label: 'Burned', pct: 10, color: '#ff6b35', wallet: '4goq...ECub' },
  { label: 'LP Compound', pct: 10, color: '#00d4aa', wallet: 'G4vH...HTA8' },
  { label: 'DEX Boost', pct: 5, color: '#e4ff57', wallet: '3Kjc...UEB6' },
  { label: 'Marketing', pct: 5, color: '#c084fc', wallet: 'HfRc...fd4y' },
]

const STAKING_TIERS = [
  { days: '0-7', label: 'Pre-Cliff', multiplier: '0x', desc: 'No rewards accrue. Full principal returned if unstaked.', color: '#555' },
  { days: '7-30', label: 'Tier 1', multiplier: '1x', desc: 'Base rewards begin. Post-cliff unstake auto-claims SOL.', color: '#d4f000' },
  { days: '30-90', label: 'Tier 2', multiplier: '2x', desc: 'Double rewards. Diamond hands get paid.', color: '#e4ff57' },
  { days: '90+', label: 'Tier 3', multiplier: '3x', desc: 'Maximum multiplier. The inner circle.', color: '#00d4aa' },
]

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITY COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

function SectionBadge({ num, className = '' }: { num: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-[#888] ${className}`}>
      <span className="w-6 h-px bg-gradient-to-r from-[#d4f000]/40 to-transparent" />
      {num}
    </span>
  )
}

function GlowCard({ children, accent = '#d4f000', className = '' }: { children: React.ReactNode; accent?: string; className?: string }) {
  return (
    <div className={`relative group/gc ${className}`}>
      <div
        className="absolute -inset-px rounded-xl opacity-25 group-hover/gc:opacity-50 transition-opacity duration-500 blur-[1px]"
        style={{ background: `linear-gradient(135deg, ${accent}40, transparent 60%, ${accent}20)` }}
      />
      <div className="relative rounded-xl bg-[#0d0d0d]/90 border border-[#222]/60 backdrop-blur-sm overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function AddressChip({ label, address, href }: { label: string; address: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#111] border border-[#333]/40 font-mono text-[11px] hover:border-[#d4f000]/30 hover:bg-[#d4f000]/[0.03] transition-all duration-300 group/addr"
    >
      <span className="text-[#888]">{label}</span>
      <span className="text-[#ccc] group-hover/addr:text-[#d4f000] transition-colors">{address.slice(0, 4)}...{address.slice(-4)}</span>
      <span className="text-[#d4f000]/40 group-hover/addr:text-[#d4f000] transition-colors text-[9px]">&nearr;</span>
    </a>
  )
}

function StatBlock({ value, label, accent = '#d4f000' }: { value: string; label: string; accent?: string }) {
  return (
    <div className="text-center px-4 py-3">
      <div className="font-mono text-2xl md:text-3xl font-black tabular-nums" style={{ color: accent }}>{value}</div>
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#888] mt-1">{label}</div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   SIDEBAR NAV
   ═══════════════════════════════════════════════════════════════════════════ */

function DocsSidebar({ activeSection }: { activeSection: string }) {
  return (
    <nav className="hidden xl:block fixed left-0 top-0 h-screen w-56 bg-[#0a0a0a]/80 backdrop-blur-xl border-r border-[#222]/40 z-50 pt-24 px-4">
      {/* Logo */}
      <div className="mb-8 px-2">
        <Link href="/" className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#d4f000] font-bold hover:text-[#e4ff57] transition-colors">
          &larr; pinkyandthebrain.fun
        </Link>
      </div>

      <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#555] mb-4 px-2">Documentation</div>

      <ul className="space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`
                block px-3 py-2 rounded-md font-mono text-[11px] uppercase tracking-[0.15em] transition-all duration-200
                ${activeSection === item.id
                  ? 'text-[#d4f000] bg-[#d4f000]/[0.06] border-l-2 border-[#d4f000]'
                  : 'text-[#777] hover:text-[#ccc] hover:bg-white/[0.02]'}
              `}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>

      {/* Bottom links */}
      <div className="absolute bottom-8 left-4 right-4 space-y-2">
        <a
          href="/war-room"
          className="block px-3 py-2 rounded-md font-mono text-[10px] uppercase tracking-[0.15em] text-[#d4f000]/60 hover:text-[#d4f000] border border-[#d4f000]/15 hover:border-[#d4f000]/30 transition-all text-center"
        >
          Enter War Room &rarr;
        </a>
        <a
          href={`https://bags.fm/b/${BRAIN_MINT}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block px-3 py-2 rounded-md font-mono text-[10px] uppercase tracking-[0.15em] text-[#ffadad]/60 hover:text-[#ffadad] border border-[#ffadad]/15 hover:border-[#ffadad]/30 transition-all text-center"
        >
          Buy $BRAIN &nearr;
        </a>
      </div>
    </nav>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════════════════════════════════════════ */

function DocsHero() {
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (!heroRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(titleRef.current, { y: 60, opacity: 0, skewY: 3 }, { y: 0, opacity: 1, skewY: 0, duration: 1.4, ease: 'expo.out', delay: 0.2 })
      gsap.fromTo(subtitleRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.6 })
    }, heroRef)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={heroRef} className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background video */}
      <video
        autoPlay loop muted playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-[0.12] mix-blend-screen"
        src="/docs/brain-bg.mp4"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 via-transparent to-[#0a0a0a]/80" />

      {/* Noise */}
      <div className="absolute inset-0 bg-[url('/noise.gif')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(rgba(212,240,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,240,0,0.3) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <SectionBadge num="CLASSIFIED DOCUMENTATION" className="mb-6 justify-center" />

        <h1 ref={titleRef} className="text-5xl sm:text-6xl md:text-8xl font-black uppercase tracking-tight leading-[0.9] mb-6">
          <span className="text-white">The </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4f000] via-[#e4ff57] to-[#d4f000]" style={{ WebkitTextStroke: '0px' }}>
            $BRAIN
          </span>
          <br />
          <span className="text-white text-[0.55em]">Field Manual</span>
        </h1>

        <p ref={subtitleRef} className="font-mono text-[13px] md:text-[14px] text-[#999] leading-relaxed max-w-xl mx-auto">
          Everything you need to know about the deflationary SPL token on Solana.
          Staking, reflections, governance, burns, and world domination plans.
        </p>

        {/* Quick stats */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 mt-10 border-t border-b border-[#333]/20 py-6">
          <StatBlock value="7" label="Fee Categories" />
          <StatBlock value="3x" label="Max Multiplier" />
          <StatBlock value="100%" label="LP Locked" />
          <StatBlock value="10%" label="Auto-Burned" />
          <StatBlock value="20%" label="To Holders" accent="#ffadad" />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce" style={{ animationDuration: '2.5s' }}>
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#555]">Scroll</span>
        <div className="w-px h-6 bg-gradient-to-b from-[#d4f000]/40 to-transparent" />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION WRAPPER (scroll-triggered reveal)
   ═══════════════════════════════════════════════════════════════════════════ */

function DocSection({ id, children, className = '' }: { id: string; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const els = ref.current.querySelectorAll('[data-reveal]')
    if (!els.length) return

    const ctx = gsap.context(() => {
      els.forEach((el) => {
        gsap.fromTo(el,
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
          }
        )
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} id={id} className={`scroll-mt-20 ${className}`}>
      {children}
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   IMAGE PARALLAX
   ═══════════════════════════════════════════════════════════════════════════ */

function ParallaxImage({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const img = containerRef.current.querySelector('img')
    if (!img) return

    const ctx = gsap.context(() => {
      gsap.fromTo(img,
        { yPercent: -8, scale: 1.08 },
        {
          yPercent: 8, scale: 1.02,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        }
      )
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} data-reveal className="relative rounded-xl overflow-hidden border border-[#222]/40 group/img">
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
        {/* CRT scanlines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.06]" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
        }} />
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.5)_100%)]" />
        {/* REC indicator */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 opacity-60">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="font-mono text-[9px] text-white/60 tracking-wider">REC 1996</span>
        </div>
      </div>
      {caption && (
        <div className="px-4 py-2.5 bg-[#0a0a0a] border-t border-[#222]/30">
          <p className="font-mono text-[10px] text-[#888] uppercase tracking-[0.15em]">{caption}</p>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEE ENGINE DIAGRAM
   ═══════════════════════════════════════════════════════════════════════════ */

function FeeEngineDiagram() {
  return (
    <div data-reveal className="space-y-3">
      {/* Source */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#d4f000]/[0.08] border border-[#d4f000]/20">
          <div className="w-2 h-2 rounded-full bg-[#d4f000] animate-pulse" />
          <span className="font-mono text-[11px] text-[#d4f000] font-bold uppercase tracking-[0.15em]">1% Trading Fee on Every Swap</span>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex justify-center">
        <div className="w-px h-8 bg-gradient-to-b from-[#d4f000]/40 to-[#d4f000]/10" />
      </div>

      {/* Bags.fm split */}
      <div className="text-center">
        <span className="font-mono text-[10px] text-[#888] uppercase tracking-[0.2em]">80% to Protocol &middot; 20% to Bags.fm</span>
      </div>

      {/* Arrow */}
      <div className="flex justify-center">
        <div className="w-px h-6 bg-gradient-to-b from-[#888]/30 to-transparent" />
      </div>

      {/* Distribution grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {FEE_SPLITS.map((split) => (
          <div
            key={split.label}
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#111]/60 border border-[#222]/30 hover:border-[#333]/50 transition-colors group/fee"
          >
            <div
              className="w-3 h-3 rounded-full shrink-0 transition-shadow duration-300 group-hover/fee:shadow-[0_0_8px_var(--glow)]"
              style={{ backgroundColor: split.color, '--glow': `${split.color}60` } as React.CSSProperties}
            />
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[11px] text-[#ccc] font-bold">{split.label}</div>
              <div className="font-mono text-[10px] text-[#666]">{split.wallet}</div>
            </div>
            <div className="font-mono text-[14px] font-black tabular-nums" style={{ color: split.color }}>
              {split.pct}%
            </div>
          </div>
        ))}
      </div>

      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden border border-[#333]/15 mt-2">
        {FEE_SPLITS.map((split) => (
          <div
            key={split.label}
            className="h-full transition-all duration-500 hover:brightness-125"
            style={{ width: `${split.pct}%`, backgroundColor: split.color }}
            title={`${split.label}: ${split.pct}%`}
          />
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   STAKING TIERS VISUAL
   ═══════════════════════════════════════════════════════════════════════════ */

function StakingTiersVisual() {
  return (
    <div data-reveal className="space-y-3">
      {STAKING_TIERS.map((tier, i) => (
        <div
          key={tier.label}
          className="relative rounded-lg border overflow-hidden transition-all duration-300 hover:scale-[1.01] group/tier"
          style={{ borderColor: `${tier.color}25` }}
        >
          {/* Accent bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full" style={{ backgroundColor: tier.color }} />

          <div className="pl-5 pr-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3 sm:w-40">
              <span className="font-mono text-3xl font-black tabular-nums" style={{ color: tier.color }}>
                {tier.multiplier}
              </span>
              <div>
                <div className="font-mono text-[12px] text-white font-bold">{tier.label}</div>
                <div className="font-mono text-[10px] text-[#888] uppercase tracking-[0.1em]">{tier.days} days</div>
              </div>
            </div>
            <div className="flex-1 font-mono text-[11px] text-[#999] leading-relaxed">{tier.desc}</div>
            {/* Progress dots */}
            <div className="hidden md:flex items-center gap-1">
              {Array.from({ length: 4 }).map((_, j) => (
                <div
                  key={j}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: j <= i ? tier.color : '#222',
                    boxShadow: j <= i ? `0 0 6px ${tier.color}40` : 'none',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   PONDERING VIDEO EMBED
   ═══════════════════════════════════════════════════════════════════════════ */

function PonderingEmbed() {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return
    if (isPlaying) { videoRef.current.pause() } else { videoRef.current.play() }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  return (
    <div data-reveal className="relative rounded-xl overflow-hidden border border-[#ffadad]/20 group/vid cursor-pointer" onClick={togglePlay}>
      <div className="relative aspect-video overflow-hidden bg-black">
        <video
          ref={videoRef}
          src="/docs/pondering.mp4"
          className="w-full h-full object-cover"
          playsInline
          onEnded={() => setIsPlaying(false)}
        />
        {/* Overlay when paused */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[#ffadad]/20 border border-[#ffadad]/40 flex items-center justify-center backdrop-blur-sm hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#ffadad"><path d="M8 5v14l11-7z" /></svg>
            </div>
          </div>
        )}
        {/* CRT lines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)',
        }} />
      </div>
      <div className="px-4 py-3 bg-[#0d0d0d] border-t border-[#ffadad]/10">
        <p className="font-mono text-[11px] text-[#ffadad]/80 uppercase tracking-[0.15em]">
          &ldquo;Are You Pondering What I&apos;m Pondering?&rdquo; &mdash; Brain Food, 1996
        </p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN DOCS PAGE
   ═══════════════════════════════════════════════════════════════════════════ */

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview')

  // Intersection observer for sidebar highlight
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px' }
    )

    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] relative">
      {/* Noise overlay */}
      <div className="fixed inset-0 bg-[url('/noise.gif')] opacity-[0.025] mix-blend-overlay pointer-events-none z-[60]" />

      {/* Sidebar nav (xl+) */}
      <DocsSidebar activeSection={activeSection} />

      {/* Main content */}
      <div className="xl:ml-56">
        {/* Mobile top nav */}
        <div className="xl:hidden sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[#222]/40">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/" className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#d4f000]">&larr; Home</Link>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#888]">$BRAIN Docs</span>
            <a href="/war-room" className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#d4f000]">War Room &rarr;</a>
          </div>
          {/* Scrollable nav pills */}
          <div className="flex overflow-x-auto scrollbar-none gap-1 px-3 pb-2">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`shrink-0 px-3 py-1.5 rounded-md font-mono text-[10px] uppercase tracking-[0.1em] transition-all whitespace-nowrap ${
                  activeSection === item.id
                    ? 'text-[#d4f000] bg-[#d4f000]/[0.08]'
                    : 'text-[#666] hover:text-[#aaa]'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        {/* ─── HERO ─── */}
        <DocsHero />

        {/* ─── CONTENT ─── */}
        <div className="max-w-4xl mx-auto px-5 sm:px-8 pb-32 space-y-24 md:space-y-32">

          {/* ═══ OVERVIEW ═══ */}
          <DocSection id="overview">
            <SectionBadge num="01 &mdash; OVERVIEW" />
            <h2 data-reveal className="text-3xl md:text-5xl font-black uppercase tracking-tight mt-3 mb-6">
              What is <span className="text-[#d4f000]">$BRAIN</span>?
            </h2>

            <div data-reveal className="prose-custom space-y-4">
              <p className="font-mono text-[13px] text-[#bbb] leading-relaxed">
                $BRAIN is a deflationary SPL token on Solana built on the Bags.fm fee-sharing protocol.
                Every trade generates a 1% fee that gets split across 7 categories &mdash; holders,
                treasury investments, development, burns, liquidity, DEX boosts, and marketing.
              </p>
              <p className="font-mono text-[13px] text-[#bbb] leading-relaxed">
                The token is managed by a community-governed treasury that actively invests in other
                Solana projects. All treasury operations happen on-chain, visible in real-time through
                the War Room dashboard. When we take profit, we use Meteora DLMM limit orders so
                we never dump on anyone&apos;s chart.
              </p>
            </div>

            {/* Two-image grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <ParallaxImage src="/docs/brain-portrait.jpg" alt="Brain in the lab" caption="Command Center &mdash; Where the plans are made" />
              <ParallaxImage src="/docs/brain-grok.jpg" alt="The Brain Wave jet" caption="The Brain Wave &mdash; Global operations" />
            </div>
          </DocSection>

          {/* ═══ TOKENOMICS ═══ */}
          <DocSection id="tokenomics">
            <SectionBadge num="02 &mdash; TOKENOMICS" />
            <h2 data-reveal className="text-3xl md:text-5xl font-black uppercase tracking-tight mt-3 mb-6">
              Token <span className="text-[#d4f000]">Architecture</span>
            </h2>

            <div data-reveal>
              <GlowCard>
                <div className="p-6 md:p-8 space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="font-mono text-[10px] text-[#888] uppercase tracking-[0.15em] mb-1">Network</div>
                      <div className="font-mono text-[14px] text-white font-bold">Solana</div>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] text-[#888] uppercase tracking-[0.15em] mb-1">Standard</div>
                      <div className="font-mono text-[14px] text-white font-bold">SPL Token</div>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] text-[#888] uppercase tracking-[0.15em] mb-1">Decimals</div>
                      <div className="font-mono text-[14px] text-white font-bold">9</div>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] text-[#888] uppercase tracking-[0.15em] mb-1">LP Status</div>
                      <div className="font-mono text-[14px] text-[#d4f000] font-bold">100% Locked</div>
                    </div>
                  </div>

                  <div className="border-t border-[#333]/20 pt-4">
                    <div className="font-mono text-[10px] text-[#888] uppercase tracking-[0.15em] mb-2">Contract Address</div>
                    <code className="block font-mono text-[13px] text-[#d4f000] break-all bg-[#111] px-4 py-3 rounded-md border border-[#333]/20">
                      {BRAIN_MINT}
                    </code>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <AddressChip label="Token" address={BRAIN_MINT} href={`https://solscan.io/token/${BRAIN_MINT}`} />
                    <AddressChip label="Treasury" address={TREASURY_WALLET} href={`https://solscan.io/account/${TREASURY_WALLET}`} />
                    <AddressChip label="LP" address={LP_WALLET} href={`https://solscan.io/account/${LP_WALLET}`} />
                  </div>
                </div>
              </GlowCard>
            </div>

            {/* Key properties */}
            <div data-reveal className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
              {[
                { title: 'Deflationary', desc: '10% of every trading fee is permanently burned. Supply only goes down.', icon: '🔥', accent: '#ff6b35' },
                { title: 'Reflections', desc: '20% of fees distributed as SOL to top 100 holders every 7 SOL cycle.', icon: '◎', accent: '#d4f000' },
                { title: 'Community Governed', desc: 'Treasury investments voted on by token holders. On-chain proposals.', icon: '⬡', accent: '#4a90e2' },
              ].map((prop) => (
                <GlowCard key={prop.title} accent={prop.accent}>
                  <div className="p-5">
                    <div className="text-2xl mb-3">{prop.icon}</div>
                    <div className="font-mono text-[12px] font-bold uppercase tracking-[0.1em] mb-2" style={{ color: prop.accent }}>{prop.title}</div>
                    <p className="font-mono text-[11px] text-[#999] leading-relaxed">{prop.desc}</p>
                  </div>
                </GlowCard>
              ))}
            </div>
          </DocSection>

          {/* ═══ FEE ENGINE ═══ */}
          <DocSection id="fee-engine">
            <SectionBadge num="03 &mdash; FEE ENGINE" />
            <h2 data-reveal className="text-3xl md:text-5xl font-black uppercase tracking-tight mt-3 mb-2">
              The <span className="text-[#d4f000]">Machine</span>
            </h2>
            <p data-reveal className="font-mono text-[13px] text-[#888] mb-8 max-w-2xl">
              Every swap generates a 1% fee. Bags.fm takes 20%, the remaining 80% flows through
              the Fee Share V2 smart contract and splits across 7 wallets automatically.
            </p>

            <FeeEngineDiagram />

            {/* Full-width image break */}
            <div className="mt-10">
              <ParallaxImage src="/docs/brain-lab-1.jpg" alt="Iced out helicopter" caption="Operational Budget &mdash; The iced-out extraction vehicle" />
            </div>
          </DocSection>

          {/* ═══ STAKING ═══ */}
          <DocSection id="staking">
            <SectionBadge num="04 &mdash; STAKING" />
            <h2 data-reveal className="text-3xl md:text-5xl font-black uppercase tracking-tight mt-3 mb-2">
              Stake &amp; <span className="text-[#d4f000]">Multiply</span>
            </h2>
            <p data-reveal className="font-mono text-[13px] text-[#888] mb-8 max-w-2xl">
              Lock $BRAIN tokens into the staking pool to earn SOL rewards. The longer you stake,
              the higher your multiplier. Time-weighted rewards mean patience is literally profitable.
            </p>

            <StakingTiersVisual />

            {/* Key rules */}
            <div data-reveal className="mt-8 space-y-3">
              <GlowCard accent="#e4ff57">
                <div className="p-5 space-y-3">
                  <div className="font-mono text-[11px] text-[#d4f000] font-bold uppercase tracking-[0.2em]">Key Rules</div>
                  <ul className="space-y-2">
                    {[
                      'Minimum stake: 100,000 $BRAIN',
                      'One active stake per wallet',
                      'Pre-cliff unstake (< 7 days): full principal returned, rewards forfeited',
                      'Post-cliff unstake: all pending SOL rewards auto-claimed',
                      'Multiplier only goes up, never decreases',
                      'Reward formula: staked_amount x multiplier x reward_per_share',
                    ].map((rule) => (
                      <li key={rule} className="flex items-start gap-2.5 font-mono text-[11px] text-[#bbb]">
                        <span className="text-[#d4f000] mt-0.5 shrink-0">&blacktriangleright;</span>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              </GlowCard>

              <div className="text-center">
                <a
                  href="/war-room?tab=staking"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#d4f000]/[0.08] border border-[#d4f000]/25 font-mono text-[11px] uppercase tracking-[0.2em] text-[#d4f000] hover:bg-[#d4f000]/[0.15] hover:border-[#d4f000]/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,240,0,0.1)]"
                >
                  Enter Staking Dashboard &rarr;
                </a>
              </div>
            </div>
          </DocSection>

          {/* ═══ REFLECTIONS ═══ */}
          <DocSection id="reflections">
            <SectionBadge num="05 &mdash; REFLECTIONS" />
            <h2 data-reveal className="text-3xl md:text-5xl font-black uppercase tracking-tight mt-3 mb-2">
              SOL <span className="text-[#d4f000]">Reflections</span>
            </h2>
            <p data-reveal className="font-mono text-[13px] text-[#888] mb-8 max-w-2xl">
              20% of all trading fees flow to $BRAIN holders as SOL reflections.
              Payouts trigger every time 7 SOL accumulates in the authority PDA.
            </p>

            <div data-reveal>
              <GlowCard>
                <div className="p-6 md:p-8">
                  {/* Flow diagram */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
                      <div className="px-4 py-2 rounded-md bg-[#d4f000]/[0.08] border border-[#d4f000]/20 shrink-0">
                        <span className="font-mono text-[11px] text-[#d4f000] font-bold">Trading Fees</span>
                      </div>
                      <div className="hidden sm:block w-8 h-px bg-[#d4f000]/30" />
                      <div className="sm:hidden h-4 w-px bg-[#d4f000]/30" />
                      <div className="px-4 py-2 rounded-md bg-[#111] border border-[#333]/30 shrink-0">
                        <span className="font-mono text-[11px] text-[#ccc]">Fee Share V2 PDA</span>
                      </div>
                      <div className="hidden sm:block w-8 h-px bg-[#d4f000]/30" />
                      <div className="sm:hidden h-4 w-px bg-[#d4f000]/30" />
                      <div className="px-4 py-2 rounded-md bg-[#111] border border-[#333]/30 shrink-0">
                        <span className="font-mono text-[11px] text-[#ccc]">Accrues to 7 SOL</span>
                      </div>
                      <div className="hidden sm:block w-8 h-px bg-[#d4f000]/30" />
                      <div className="sm:hidden h-4 w-px bg-[#d4f000]/30" />
                      <div className="px-4 py-2 rounded-md bg-[#d4f000]/[0.08] border border-[#d4f000]/20 shrink-0">
                        <span className="font-mono text-[11px] text-[#d4f000] font-bold">Distribute to Top 100</span>
                      </div>
                    </div>

                    <div className="border-t border-[#333]/20 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <div className="font-mono text-[10px] text-[#888] uppercase tracking-[0.15em] mb-1">Payout Threshold</div>
                        <div className="font-mono text-[18px] text-white font-black">7 SOL</div>
                      </div>
                      <div>
                        <div className="font-mono text-[10px] text-[#888] uppercase tracking-[0.15em] mb-1">Eligible Holders</div>
                        <div className="font-mono text-[18px] text-white font-black">Top 100</div>
                      </div>
                      <div>
                        <div className="font-mono text-[10px] text-[#888] uppercase tracking-[0.15em] mb-1">Fee Share</div>
                        <div className="font-mono text-[18px] text-[#d4f000] font-black">20%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </GlowCard>
            </div>
          </DocSection>

          {/* ═══ BURNS ═══ */}
          <DocSection id="burns">
            <SectionBadge num="06 &mdash; BURNS" />
            <h2 data-reveal className="text-3xl md:text-5xl font-black uppercase tracking-tight mt-3 mb-2">
              Permanent <span className="text-[#ff6b35]">Burns</span>
            </h2>
            <p data-reveal className="font-mono text-[13px] text-[#888] mb-8 max-w-2xl">
              10% of every trading fee is routed to the burn wallet, then sent to the Solana incinerator.
              Burned tokens are gone forever. Supply only decreases.
            </p>

            <div data-reveal>
              <GlowCard accent="#ff6b35">
                <div className="p-6 md:p-8 space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="font-mono text-[10px] text-[#888] uppercase tracking-[0.15em] mb-1">Burn Rate</div>
                      <div className="font-mono text-3xl text-[#ff6b35] font-black">10%</div>
                      <div className="font-mono text-[10px] text-[#666]">of every trading fee</div>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] text-[#888] uppercase tracking-[0.15em] mb-1">Destination</div>
                      <div className="font-mono text-[13px] text-white font-bold mt-2">Solana Incinerator</div>
                      <div className="font-mono text-[10px] text-[#666] break-all mt-1">{INCINERATOR}</div>
                    </div>
                  </div>

                  <div className="border-t border-[#333]/20 pt-4 font-mono text-[11px] text-[#999] leading-relaxed">
                    The incinerator is a receive-only address on Solana. Tokens sent there can never be recovered.
                    Every burn is verifiable on-chain through Solscan. The burn source wallet accumulates tokens from
                    the fee split, then periodically sends them to the incinerator in batch transactions.
                  </div>
                </div>
              </GlowCard>
            </div>
          </DocSection>

          {/* ═══ TREASURY ═══ */}
          <DocSection id="treasury">
            <SectionBadge num="07 &mdash; TREASURY" />
            <h2 data-reveal className="text-3xl md:text-5xl font-black uppercase tracking-tight mt-3 mb-2">
              Treasury <span className="text-[#4a90e2]">Operations</span>
            </h2>
            <p data-reveal className="font-mono text-[13px] text-[#888] mb-8 max-w-2xl">
              30% of trading fees flow to the treasury wallet for active investment. The treasury buys into
              promising Solana projects &mdash; every purchase tracked on-chain, every exit done through DLMM.
            </p>

            <div data-reveal className="space-y-4">
              <GlowCard accent="#4a90e2">
                <div className="p-6 md:p-8 space-y-5">
                  <div className="font-mono text-[11px] text-[#4a90e2] font-bold uppercase tracking-[0.2em]">Investment Protocol</div>

                  <div className="space-y-3">
                    {[
                      { step: '01', title: 'Fee Accumulation', desc: '30% of every trade fee routes to the treasury wallet automatically.' },
                      { step: '02', title: 'Community Vote', desc: 'Token holders vote on which projects to invest in via on-chain governance.' },
                      { step: '03', title: 'DCA Acquisition', desc: 'Treasury dollar-cost-averages into positions. Multiple small buys, not one lump.' },
                      { step: '04', title: 'DLMM Exit Only', desc: 'When taking profit, positions exit via Meteora DLMM limit orders above market. Buyers fill the order — zero chart damage.' },
                    ].map((item) => (
                      <div key={item.step} className="flex gap-4 items-start">
                        <span className="font-mono text-[11px] text-[#4a90e2] font-bold shrink-0 mt-0.5">{item.step}</span>
                        <div>
                          <div className="font-mono text-[12px] text-white font-bold">{item.title}</div>
                          <div className="font-mono text-[11px] text-[#999]">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </GlowCard>

              {/* DLMM callout */}
              <div className="rounded-lg bg-[#4a90e2]/[0.04] border border-[#4a90e2]/15 p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-2.5 h-2.5 rounded-full bg-[#4a90e2] shadow-[0_0_8px_rgba(74,144,226,0.4)] shrink-0" />
                  <div>
                    <p className="font-mono text-[12px] text-[#4a90e2] font-bold uppercase tracking-[0.1em] mb-1">
                      Why DLMM Exits?
                    </p>
                    <p className="font-mono text-[11px] text-[#999] leading-relaxed">
                      Market selling dumps the price and hurts holders. Instead, we place Meteora DLMM positions
                      above current market price. When organic buyers push the price up, our position gets filled.
                      The result: we take profit, the chart stays clean, and nobody gets dumped on. This is how
                      a responsible treasury operates.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* The Brain Wave boat */}
            <div className="mt-8">
              <ParallaxImage src="/docs/brain-lab-2.jpg" alt="The Brain Wave" caption="Treasury Surplus Allocation &mdash; The Brain Wave" />
            </div>
          </DocSection>

          {/* ═══ GOVERNANCE ═══ */}
          <DocSection id="governance">
            <SectionBadge num="08 &mdash; GOVERNANCE" />
            <h2 data-reveal className="text-3xl md:text-5xl font-black uppercase tracking-tight mt-3 mb-2">
              Community <span className="text-[#c084fc]">Governance</span>
            </h2>
            <p data-reveal className="font-mono text-[13px] text-[#888] mb-8 max-w-2xl">
              $BRAIN holders vote on treasury investments and protocol decisions. Two governance layers:
              on-chain Anchor proposals and community voting rounds.
            </p>

            <div data-reveal className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlowCard accent="#c084fc">
                <div className="p-5">
                  <div className="font-mono text-[11px] text-[#c084fc] font-bold uppercase tracking-[0.2em] mb-3">On-Chain Proposals</div>
                  <ul className="space-y-2">
                    {[
                      'Anchor smart contract governance',
                      'Vote weight = wallet balance + staked amount',
                      'Proposal types: SELL (exit investments)',
                      'Status flow: Active → Passed/Rejected',
                      'Execution triggers DLMM exit',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 font-mono text-[11px] text-[#bbb]">
                        <span className="text-[#c084fc] mt-0.5 shrink-0">&blacktriangleright;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </GlowCard>

              <GlowCard accent="#ffadad">
                <div className="p-5">
                  <div className="font-mono text-[11px] text-[#ffadad] font-bold uppercase tracking-[0.2em] mb-3">Community Rounds</div>
                  <ul className="space-y-2">
                    {[
                      'Treasury purchase voting (which tokens to buy)',
                      'Wallet signs vote message (ed25519)',
                      'Weight = BRAIN balance at time of vote',
                      'One vote per wallet per round',
                      'Results tallied in real-time',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 font-mono text-[11px] text-[#bbb]">
                        <span className="text-[#ffadad] mt-0.5 shrink-0">&blacktriangleright;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </GlowCard>
            </div>

            {/* Pondering video */}
            <div className="mt-8">
              <PonderingEmbed />
            </div>
          </DocSection>

          {/* ═══ CONTRACTS ═══ */}
          <DocSection id="contracts">
            <SectionBadge num="09 &mdash; CONTRACTS" />
            <h2 data-reveal className="text-3xl md:text-5xl font-black uppercase tracking-tight mt-3 mb-6">
              On-Chain <span className="text-[#d4f000]">Addresses</span>
            </h2>

            <div data-reveal className="space-y-2">
              {[
                { label: '$BRAIN Token Mint', address: BRAIN_MINT, href: `https://solscan.io/token/${BRAIN_MINT}` },
                { label: 'Fee Share V2 Program', address: FEE_PROGRAM, href: `https://explorer.solana.com/address/${FEE_PROGRAM}` },
                { label: 'Staking Program', address: STAKING_PROGRAM, href: `https://explorer.solana.com/address/${STAKING_PROGRAM}` },
                { label: 'Treasury Wallet', address: TREASURY_WALLET, href: `https://solscan.io/account/${TREASURY_WALLET}` },
                { label: 'LP Wallet', address: LP_WALLET, href: `https://solscan.io/account/${LP_WALLET}` },
                { label: 'Incinerator (Burns)', address: INCINERATOR, href: `https://solscan.io/account/${INCINERATOR}` },
              ].map((contract) => (
                <a
                  key={contract.label}
                  href={contract.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 px-4 py-3 rounded-lg bg-[#111]/40 border border-[#222]/30 hover:border-[#d4f000]/20 hover:bg-[#d4f000]/[0.02] transition-all duration-300 group/contract"
                >
                  <span className="text-[#d4f000]/40 group-hover/contract:text-[#d4f000] transition-colors">&diams;</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[11px] text-[#ccc] font-bold">{contract.label}</div>
                    <div className="font-mono text-[10px] text-[#666] truncate">{contract.address}</div>
                  </div>
                  <span className="font-mono text-[10px] text-[#d4f000]/40 group-hover/contract:text-[#d4f000] transition-colors shrink-0">&nearr;</span>
                </a>
              ))}
            </div>

            {/* Meme image */}
            <div data-reveal className="mt-10 flex justify-center">
              <div className="relative w-48 h-48 rounded-xl overflow-hidden border border-[#ffadad]/15 rotate-[-2deg] hover:rotate-0 transition-transform duration-500 shadow-2xl">
                <Image src="/docs/brain-meme.png" alt="Pinky and the Brain" fill className="object-cover" sizes="192px" />
              </div>
            </div>
          </DocSection>

          {/* ═══ FOOTER CTA ═══ */}
          <div className="text-center pt-8 border-t border-[#333]/15">
            <p data-reveal className="font-mono text-[11px] text-[#666] uppercase tracking-[0.25em] mb-6">
              &ldquo;The same thing we do every night, Pinky &mdash; try to take over the world.&rdquo;
            </p>
            <div data-reveal className="flex flex-wrap justify-center gap-3">
              <a
                href="/war-room"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#d4f000]/[0.1] border border-[#d4f000]/30 font-mono text-[11px] uppercase tracking-[0.2em] text-[#d4f000] hover:bg-[#d4f000]/[0.2] transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,240,0,0.15)]"
              >
                War Room &rarr;
              </a>
              <a
                href={`https://bags.fm/b/${BRAIN_MINT}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#ffadad]/[0.08] border border-[#ffadad]/20 font-mono text-[11px] uppercase tracking-[0.2em] text-[#ffadad] hover:bg-[#ffadad]/[0.15] transition-all duration-300"
              >
                Buy on Bags.fm &nearr;
              </a>
              <a
                href="/brand"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[#333]/30 font-mono text-[11px] uppercase tracking-[0.2em] text-[#888] hover:text-[#ccc] hover:border-[#555]/30 transition-all duration-300"
              >
                Brand Guidelines &nearr;
              </a>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[#333]/30 font-mono text-[11px] uppercase tracking-[0.2em] text-[#888] hover:text-[#ccc] hover:border-[#555]/30 transition-all duration-300"
              >
                &larr; Home
              </a>
            </div>
            <p className="font-mono text-[10px] text-[#444] mt-8 uppercase tracking-[0.2em]">
              $BRAIN &middot; Solana &middot; All data live on-chain &middot; NARF!
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
