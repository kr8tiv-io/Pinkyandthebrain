# Phase 4: War Room Page Shell & Command Header - Research

**Researched:** 2026-03-25
**Domain:** Next.js 16 App Router page shell, React Query live data display, classified/dark-ops UI
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| R1 | Command Header: live $BRAIN price (USD + SOL), 24h change %, market cap, total volume, LIVE pulsing indicator | usePrice hook (Phase 3) returns PriceResponse; component is pure Client Component; animate-pulse CSS class already in globals.css |
| R10 | Visual Consistency: match dark bg, monospace fonts, classified doc style; redaction loading states; pulsing REC indicators; copy-to-clipboard; Solscan links in new tab; mobile responsive | WarRoom.tsx aesthetic fully documented; color tokens, font vars, noise overlay, CSS keyframes all in globals.css; JetBrains Mono + Inter already loaded in layout.tsx |
</phase_requirements>

---

## Summary

Phase 4 converts the existing war-room stub (`src/app/war-room/page.tsx`) into a full page shell with navigation entry point and a live CommandHeader. All infrastructure needed is already built: the `usePrice` hook (Phase 3) fetches `PriceResponse` data from `/api/price`, the `QueryProvider` wraps the entire app in `layout.tsx`, and the visual design language is locked in `WarRoom.tsx` + `globals.css`.

The page shell itself should be a Server Component (no `'use client'` directive), since it has no interactive state — it simply composes server-rendered layout with one or more Client Components. `CommandHeader.tsx` must be a Client Component (`'use client'`) because it calls `usePrice()` which uses React Query's `useQuery` hook. This is the canonical Next.js 16 pattern: Server Component page imports a Client Component leaf.

Navigation from the landing page needs one link added to `HeroMenu.tsx` (the pill menu already renders top-right on desktop) and optionally a CTA in the existing `WarRoom` section or `Footer`. The `WarRoom.tsx` section on the landing page is the natural entry point — it already contains "The War Room" heading and a "CONNECTED TO HELIUS RPC" status line, making a "ENTER WAR ROOM" button the obvious addition there.

**Primary recommendation:** Page shell = Server Component wrapper. CommandHeader = `'use client'` leaf consuming `usePrice()`. Add nav link in `HeroMenu.tsx` (new item) + a CTA button inside `WarRoom.tsx` (landing page section). Match `WarRoom.tsx` aesthetic exactly for CommandHeader panels.

---

## Standard Stack

### Core (all already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.1 | App Router page + routing | Already in project; file-system routing gives `/war-room` for free |
| React | 19.2.4 | UI rendering | Project requirement |
| @tanstack/react-query | ^5.95.2 | Live data via `usePrice()` | Already configured with `QueryProvider` in `layout.tsx` |
| Tailwind CSS | ^4 | Styling | Already configured; use inline classes matching existing components |
| GSAP | ^3.14.2 | Entrance animations | Already used in `WarRoom.tsx`, `Hero.tsx`, `HeroMenu.tsx` |

### Supporting (already installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/link | built-in | Client-side nav from landing page | Adding War Room nav item to HeroMenu + WarRoom section CTA |
| date-fns | ^4.1.0 | Date formatting | Not needed in Phase 4 — note for future phases |

### No New Installs Required
All packages for Phase 4 are already installed. No `npm install` needed.

---

## Architecture Patterns

### Recommended File Structure for Phase 4
```
src/
├── app/
│   └── war-room/
│       └── page.tsx           # UPGRADE: Server Component shell (was stub)
├── components/
│   ├── dashboard/
│   │   └── CommandHeader.tsx  # NEW: 'use client' — live price display
│   ├── HeroMenu.tsx           # MODIFY: add War Room nav item
│   └── WarRoom.tsx            # MODIFY: add "ENTER WAR ROOM" CTA button
```

### Pattern 1: Server Component Page Shell
**What:** `page.tsx` has no `'use client'` directive. It renders layout/structure and imports Client Components as leaves.
**When to use:** Any time a page has no direct interactive state — delegate interactivity to child components.
**Example:**
```tsx
// Source: node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md
// src/app/war-room/page.tsx  (NO 'use client')
import type { Metadata } from 'next'
import CommandHeader from '@/components/dashboard/CommandHeader'

export const metadata: Metadata = {
  title: 'War Room | $BRAIN Token',
  description: 'Live treasury analytics and portfolio tracking for the $BRAIN token fund.',
}

export default function WarRoomPage() {
  return (
    <main className="relative w-full min-h-screen bg-[#0d0d0d] text-[#cccccc] overflow-x-hidden">
      {/* Noise overlay already injected globally by layout.tsx */}
      <CommandHeader />
      {/* Future phase sections slot in here */}
    </main>
  )
}
```

### Pattern 2: Client Component Data Leaf
**What:** `CommandHeader.tsx` has `'use client'` at the top, calls `usePrice()`, renders live data.
**When to use:** Any component that needs React Query hooks, useState, or useEffect.
**Example:**
```tsx
// Source: src/hooks/usePrice.ts + WarRoom.tsx aesthetic
'use client'

import { usePrice } from '@/hooks/usePrice'

export default function CommandHeader() {
  const { data, isLoading, isError } = usePrice()

  return (
    <header className="...">
      {isLoading ? (
        <span className="font-mono text-[#d4f000]">█████ ██████</span>
      ) : (
        <span className="font-mono tabular-nums text-white">
          ${data?.priceUsd.toFixed(6)}
        </span>
      )}
    </header>
  )
}
```

### Pattern 3: Navigation Link Addition in HeroMenu.tsx
**What:** Add a new item to the `menuItems` array with `href: '/war-room'`, `external: false`.
**When to use:** Internal navigation — use `next/link` (not `<a>`).
**Key detail:** `HeroMenu.tsx` already uses `Link` from `next/link`. The existing pattern handles internal vs external automatically with the `external` boolean.
```tsx
// Existing pattern in HeroMenu.tsx — just add new entry:
{
  id: "war_room",
  label: "War Room",
  href: "/war-room",
  external: false,
  icon: (<svg>...</svg>), // Use a terminal/command icon
},
```

### Pattern 4: Redaction Loading State
**What:** Show `█████` blocks (Unicode full block character U+2588) while `isLoading` is true. Match the classified aesthetic.
**When to use:** Any time React Query data is pending.
**Implementation:**
```tsx
// Redaction pattern — matches PROJECT.md visual requirements
const redact = (value: string | number | undefined, loading: boolean) =>
  loading ? '█████' : String(value ?? '—')
```

### Anti-Patterns to Avoid
- **Adding `'use client'` to `page.tsx`:** Makes the whole page a Client Component and ships unnecessary JS. Keep page.tsx as Server Component.
- **Calling `usePrice()` in `page.tsx`:** Will throw — hooks cannot be called in Server Components.
- **Hardcoding prices:** Never hardcode or mock price data — always pipe from `usePrice()` even in loading states.
- **Using raw `<a>` for `/war-room` link:** Use `next/link`'s `<Link>` for client-side transitions and prefetching.
- **Importing `constants.ts` HELIUS_RPC_URL in client components:** That constant uses `process.env` which is server-only. Only import wallet addresses and CHART_COLORS client-side.

---

## PriceResponse Field Reality Check

The `usePrice` hook returns `PriceResponse` from `/api/price`. The actual route handler (verified in `src/app/api/price/route.ts`) sets these values:

| Field | Type | Reliable? | Notes |
|-------|------|-----------|-------|
| `priceUsd` | number | YES | From Birdeye `getMultiTokenPrices` |
| `priceSol` | number | YES | Computed: `brainUsd / solUsd` |
| `priceChange24h` | number | YES | From Birdeye `priceChange24h` field |
| `marketCap` | number \| undefined | **NO** | Always `undefined` — Birdeye limitation |
| `volume24h` | number \| undefined | **NO** | Always `undefined` — Birdeye limitation |

**Critical:** `marketCap` and `volume24h` are ALWAYS `undefined` in the current implementation. The CommandHeader MUST handle this gracefully. Use "CLASSIFIED" or "N/A" as fallback text for these two fields — do NOT show $0 or 0.

---

## Visual System (Verified from Source Files)

### Color Tokens (from `src/lib/constants.ts` + `globals.css`)
```
Background:   #0d0d0d   (page bg — use this for War Room, NOT #1a1a1a)
Surface:      #1a1a1a   (card/panel bg — CSS var --background)
Accent:       #d4f000   (primary yellow-green — live indicators, highlights)
Muted:        #cccccc   (body text, secondary labels)
Pink:         #ff9e9e   (#ffadad in globals.css brand-pink — warnings, escape attempts)
Border:       #333      (subtle dividers)
Terminal:     #00ff00   (terminal text in WarRoom.tsx)
```

### Typography (from `layout.tsx` + `globals.css`)
```
Inter:         --font-inter     → body, headings (font-sans in Tailwind)
JetBrains Mono: --font-jetbrains-mono → data, numbers, labels (font-mono in Tailwind)
```

### CSS Classes Already Available
- `.noise-overlay` — injected globally in `layout.tsx`, no need to add again
- `.flicker` — grain-flicker keyframe animation (3s loop)
- `.glass-panel` — backdrop-blur + border
- `.page-enter` — fadeInUp on mount
- `animate-pulse` — Tailwind, used for LIVE indicator in WarRoom.tsx
- `.ticker-track` — scrolling ticker (not needed in Phase 4)

### Panel Aesthetic (from `WarRoom.tsx` reference)
```tsx
// Large data panel — use this exact pattern for CommandHeader price cells:
<div className="bg-black/40 backdrop-blur-xl p-8 border-2 border-[#333] border-l-[12px] border-l-[#d4f000] relative overflow-hidden shadow-2xl">
  <div className="font-mono text-sm text-[#cccccc] uppercase tracking-widest mb-2 font-bold">
    LABEL
  </div>
  <div className="text-6xl md:text-8xl font-black text-white tracking-tighter tabular-nums">
    VALUE
  </div>
</div>
```

### LIVE Pulsing Indicator Pattern (from `WarRoom.tsx` line 119)
```tsx
// Existing site pattern for live indicators:
<div className="text-[#d4f000] font-bold animate-pulse text-lg tracking-tight">
  ● CONNECTED TO HELIUS RPC
</div>

// Adapt for CommandHeader:
<div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest">
  <span className="w-2 h-2 rounded-full bg-[#d4f000] animate-pulse shadow-[0_0_6px_#d4f000]" />
  <span className="text-[#d4f000]">LIVE</span>
</div>
```

### Background Blur Orbs (from `WarRoom.tsx` — use same pattern in War Room page)
```tsx
<div className="absolute inset-0 z-0 pointer-events-none">
  <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] max-w-3xl max-h-3xl bg-[#d4f000] rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-pulse" />
  <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] max-w-2xl max-h-2xl bg-[#ff9e9e] rounded-full mix-blend-screen filter blur-[150px] opacity-10" />
  <div className="absolute inset-0 bg-[url('/noise.gif')] opacity-[0.04] mix-blend-screen" />
</div>
```
Note: The global `.noise-overlay` already covers the viewport — the inline noise overlay in individual sections is a subtle additional layer with `mix-blend-screen` which creates depth. Keep both.

---

## CommandHeader Layout Design

Based on PROJECT.md requirements (R1) and WarRoom.tsx aesthetic, the CommandHeader should display:

```
┌─────────────────────────────────────────────────────────────────────┐
│  WAR ROOM — $BRAIN INTELLIGENCE DASHBOARD    ● LIVE                 │
├──────────────┬──────────────┬──────────────┬──────────────┬─────────┤
│  PRICE (USD) │  PRICE (SOL) │  24H CHANGE  │  MARKET CAP  │  VOL    │
│  $0.000042   │  0.0000003◎  │  +12.4%      │  CLASSIFIED  │  CLASS. │
└──────────────┴──────────────┴──────────────┴──────────────┴─────────┘
```

Grid layout: `grid-cols-2 md:grid-cols-5` — two columns on mobile, five on desktop.

24h change color logic:
- Positive: `text-[#d4f000]` (accent green)
- Negative: `text-[#ff9e9e]` (pink/red)
- Zero/loading: `text-[#cccccc]` (muted)

---

## Navigation Integration Points

### Point 1: HeroMenu.tsx — Top-right pill menu
The `menuItems` array in `HeroMenu.tsx` drives the pill navigation. Add War Room as the FIRST item (most important action):
```tsx
{
  id: "war_room",
  label: "War Room",
  href: "/war-room",
  external: false,
  icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  ),
},
```
Internal links use `next/link`'s `<Link>` component — the existing `HeroMenu.tsx` already handles this with `external: false` (no `target="_blank"`).

### Point 2: WarRoom.tsx section — Landing page CTA
The existing `WarRoom.tsx` section is the thematic entry point. Add a button beneath the terminal window:
```tsx
// Add after terminalRef div, inside the relative z-10 container:
<div className="mt-8 flex justify-center">
  <Link href="/war-room"
    className="font-mono text-sm uppercase tracking-widest border-2 border-[#d4f000] text-[#d4f000] px-8 py-3 hover:bg-[#d4f000] hover:text-black transition-all duration-300 font-bold">
    ▶ ENTER WAR ROOM
  </Link>
</div>
```

### Point 3: Footer (optional, low priority)
Footer already has placeholder links. Can replace one `href="#"` with `/war-room`. This is lowest priority — Phase 4 focus is HeroMenu + WarRoom section CTA.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Live price polling | Custom `setInterval` fetch | `usePrice()` from `src/hooks/usePrice.ts` | Already built with React Query, handles staleTime/refetchInterval/error states |
| Loading skeletons | Custom CSS shimmer | Unicode `█████` blocks (U+2588) | Matches classified/redaction aesthetic per PROJECT.md — simpler and on-brand |
| Navigation state | Custom router logic | `next/link` `<Link>` component | Built-in prefetching, client-side transitions, no flash |
| Connection status | Separate API call | Derive from `usePrice()` result | `isError` = disconnected, `isLoading` = connecting, `data` = connected |
| Number formatting | `Intl.NumberFormat` wrapper | Inline: `value.toFixed(6)` / `value.toLocaleString()` | Enough for Phase 4; don't over-engineer |

**Key insight:** The entire data pipeline (API route + React Query hook + types) was built in Phases 2-3. Phase 4 is purely presentation — wire `usePrice()` into a visually-styled component.

---

## Common Pitfalls

### Pitfall 1: `'use client'` on page.tsx
**What goes wrong:** Makes the entire page a Client Component — ships React Query overhead unnecessarily, breaks Server Component benefits.
**Why it happens:** Instinct to add `'use client'` when a page "does stuff."
**How to avoid:** Keep `page.tsx` as Server Component. Only `CommandHeader.tsx` needs `'use client'` because it calls `usePrice()`.
**Warning signs:** If you see `'use client'` at the top of `war-room/page.tsx`, remove it.

### Pitfall 2: Showing $0 for undefined marketCap/volume24h
**What goes wrong:** `data?.marketCap` is `undefined` always (Birdeye limitation). Rendering `$${data?.marketCap}` shows "$undefined" or after `|| 0` shows "$0" — misleads users.
**Why it happens:** Forgetting the Birdeye limitation documented in STATE.md.
**How to avoid:** Use explicit null check: `data?.marketCap != null ? formatUsd(data.marketCap) : 'CLASSIFIED'`
**Warning signs:** Any render path that shows "$0" for market cap.

### Pitfall 3: Importing server-side constants in client components
**What goes wrong:** `constants.ts` exports `HELIUS_RPC_URL` which uses `process.env.HELIUS_API_KEY`. Importing in a `'use client'` component exposes this pattern client-side (though Next.js would strip it, it's an architecture violation).
**Why it happens:** Convenience imports.
**How to avoid:** In client components, only import `BRAIN_TOKEN_MINT`, wallet address constants, and `CHART_COLORS` — never `HELIUS_RPC_URL`, `BIRDEYE_BASE_URL`, or `SOLSCAN_API_BASE`.

### Pitfall 4: GSAP in Client Components Without gsap.context cleanup
**What goes wrong:** Memory leaks and animation state not cleaned up on unmount.
**Why it happens:** Forgetting the `return () => ctx.revert()` pattern.
**How to avoid:** Always use:
```tsx
useEffect(() => {
  const ctx = gsap.context(() => { /* animations */ }, containerRef)
  return () => ctx.revert()
}, [])
```
This exact pattern is used in `WarRoom.tsx`, `HeroMenu.tsx`, `Hero.tsx` — follow it.

### Pitfall 5: Missing `tabular-nums` on price display
**What goes wrong:** Number digits shift width as prices update (e.g., 0.000042 → 0.000039), causing layout jitter.
**Why it happens:** Default font rendering uses proportional digit widths.
**How to avoid:** Add `tabular-nums` Tailwind class on all price/number spans. Already used in `WarRoom.tsx` line 128.

### Pitfall 6: War Room page inherits global layout noise-overlay
**What goes wrong:** Assumption that the war-room page needs its own noise overlay. The `.noise-overlay` div in `layout.tsx` is `position: fixed` with `z-index: 9999` — it covers all pages globally.
**Why it happens:** Copy-pasting from `WarRoom.tsx` which has its own subtle inline noise layer.
**How to avoid:** Do NOT add another `noise-overlay` div in `war-room/page.tsx`. The global one is already present. The section-level noise in WarRoom.tsx is a separate subtle layer with `mix-blend-screen` — that pattern is fine to replicate in individual sections.

---

## Code Examples

### Complete CommandHeader Skeleton
```tsx
// Source: Derived from src/hooks/usePrice.ts + WarRoom.tsx aesthetic + PriceResponse type
'use client'

import { usePrice } from '@/hooks/usePrice'

function formatUsd(n: number): string {
  if (n < 0.01) return `$${n.toFixed(6)}`
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatSol(n: number): string {
  return `${n.toFixed(8)} ◎`
}

function formatChange(n: number): string {
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
}

export default function CommandHeader() {
  const { data, isLoading, isError } = usePrice()

  const connectionStatus = isError
    ? { label: 'OFFLINE', color: 'text-[#ff9e9e]' }
    : isLoading
    ? { label: 'CONNECTING...', color: 'text-[#cccccc]' }
    : { label: 'LIVE', color: 'text-[#d4f000]' }

  const changeColor =
    isLoading || !data ? 'text-[#cccccc]' :
    data.priceChange24h > 0 ? 'text-[#d4f000]' : 'text-[#ff9e9e]'

  return (
    <header className="relative w-full border-b border-[#333] bg-[#0d0d0d]">
      {/* Top bar: title + live indicator */}
      <div className="flex justify-between items-center px-6 lg:px-12 py-4 border-b border-[#333]/50">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#cccccc] font-bold">
          WAR ROOM — $BRAIN INTELLIGENCE DASHBOARD
        </div>
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest">
          <span className={`w-2 h-2 rounded-full ${isError ? 'bg-[#ff9e9e]' : 'bg-[#d4f000] animate-pulse shadow-[0_0_6px_#d4f000]'}`} />
          <span className={connectionStatus.color}>{connectionStatus.label}</span>
        </div>
      </div>

      {/* Data grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-[#333]/50">
        {/* PRICE USD */}
        <div className="px-6 py-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#cccccc] mb-1 font-bold">Price (USD)</div>
          <div className="font-mono text-2xl font-black text-white tabular-nums">
            {isLoading ? <span className="text-[#d4f000]">██████</span> : formatUsd(data?.priceUsd ?? 0)}
          </div>
        </div>

        {/* PRICE SOL */}
        <div className="px-6 py-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#cccccc] mb-1 font-bold">Price (SOL)</div>
          <div className="font-mono text-2xl font-black text-white tabular-nums">
            {isLoading ? <span className="text-[#d4f000]">████████</span> : formatSol(data?.priceSol ?? 0)}
          </div>
        </div>

        {/* 24H CHANGE */}
        <div className="px-6 py-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#cccccc] mb-1 font-bold">24H Change</div>
          <div className={`font-mono text-2xl font-black tabular-nums ${changeColor}`}>
            {isLoading ? <span className="text-[#cccccc]">█████</span> : formatChange(data?.priceChange24h ?? 0)}
          </div>
        </div>

        {/* MARKET CAP — always undefined from Birdeye */}
        <div className="px-6 py-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#cccccc] mb-1 font-bold">Market Cap</div>
          <div className="font-mono text-2xl font-black text-white tabular-nums">
            {isLoading ? <span className="text-[#d4f000]">████████</span>
              : data?.marketCap != null ? formatUsd(data.marketCap)
              : <span className="text-xs text-[#333] border border-[#333] px-2 py-0.5">CLASSIFIED</span>}
          </div>
        </div>

        {/* VOLUME 24H — always undefined from Birdeye */}
        <div className="px-6 py-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#cccccc] mb-1 font-bold">Volume 24H</div>
          <div className="font-mono text-2xl font-black text-white tabular-nums">
            {isLoading ? <span className="text-[#d4f000]">████████</span>
              : data?.volume24h != null ? formatUsd(data.volume24h)
              : <span className="text-xs text-[#333] border border-[#333] px-2 py-0.5">CLASSIFIED</span>}
          </div>
        </div>
      </div>
    </header>
  )
}
```

### War Room page.tsx Upgrade
```tsx
// Source: Next.js 16 App Router convention — Server Component by default
// src/app/war-room/page.tsx
import type { Metadata } from 'next'
import CommandHeader from '@/components/dashboard/CommandHeader'

export const metadata: Metadata = {
  title: 'War Room | $BRAIN Token',
  description: 'Live treasury analytics and portfolio tracking for the $BRAIN token fund.',
}

export default function WarRoomPage() {
  return (
    <main className="relative w-full min-h-screen bg-[#0d0d0d] text-[#cccccc] overflow-x-hidden">
      {/* Ambient glow background — same pattern as WarRoom.tsx section */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[60vw] h-[40vw] max-w-4xl bg-[#d4f000] rounded-full mix-blend-screen filter blur-[160px] opacity-[0.06]" />
        <div className="absolute bottom-0 right-1/4 w-[40vw] h-[30vw] max-w-3xl bg-[#ff9e9e] rounded-full mix-blend-screen filter blur-[160px] opacity-[0.05]" />
        <div className="absolute inset-0 bg-[url('/noise.gif')] opacity-[0.03] mix-blend-screen pointer-events-none" />
      </div>

      <div className="relative z-10">
        <CommandHeader />
        {/* Phase 5+ sections slot in here as: <TreasuryIntel />, <BurnOperations />, etc. */}
      </div>
    </main>
  )
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router `/pages/war-room.tsx` | App Router `app/war-room/page.tsx` | Next.js 13+ (project uses 16) | Server Components by default; layouts preserved on navigation |
| `getServerSideProps` for data | React Query + client hooks | Next.js 13+ with React Query | Client-side polling works better for live price data |
| `onError` callback in React Query | `result.isError / result.error` | React Query v5 (project uses 5.95.2) | Breaking change — verified in STATE.md decisions |

**Deprecated/outdated:**
- `useQuery` `onError` option: Removed in React Query v5. Use `isError/error` from result object. Already noted in STATE.md.
- `next/router` `useRouter()` for navigation: Replaced by `next/navigation` `useRouter()` in App Router. However, Phase 4 doesn't need router hook — just `next/link`.

---

## Open Questions

1. **War Room page layout: full-width header or max-width container?**
   - What we know: `WarRoom.tsx` uses `max-w-6xl mx-auto px-6 lg:px-12` for content. The `globals.css` root layout uses full-width.
   - What's unclear: Should CommandHeader span full viewport width or be constrained?
   - Recommendation: Full viewport width for CommandHeader (command bar aesthetic), then inner content uses `max-w-7xl` container. This matches the terminal/dashboard pattern.

2. **Back navigation: does War Room need a "Back to Home" link?**
   - What we know: No existing back-nav pattern exists in the site. HeroMenu is only on the landing page (it's inside `Hero.tsx` which is only on the home page).
   - What's unclear: Whether users need a nav back to landing.
   - Recommendation: Add a minimal top-left "← HOME" link in the War Room page shell, styled as `font-mono text-xs text-[#cccccc] hover:text-[#d4f000]`. This is low-cost and user-friendly.

3. **GSAP entrance animation scope for Phase 4**
   - What we know: GSAP is used in WarRoom.tsx, HeroMenu.tsx, Hero.tsx with ScrollTrigger.
   - What's unclear: Whether Phase 4 should add entrance animations to CommandHeader or defer to Phase 12 (Responsive Design & Animation).
   - Recommendation: Add a simple `gsap.fromTo` fade-in on CommandHeader mount (no ScrollTrigger needed — it's above the fold). Follow the `gsap.context()` pattern exactly. Keep it minimal: fade + slight Y translation over 0.8s.

---

## Sources

### Primary (HIGH confidence)
- `src/hooks/usePrice.ts` — exact hook signature and React Query config
- `src/lib/api/types.ts` — PriceResponse type with marketCap/volume24h as optional
- `src/app/api/price/route.ts` — confirmed marketCap and volume24h always set to `undefined`
- `src/components/WarRoom.tsx` — visual patterns, GSAP patterns, color classes, panel structure
- `src/app/globals.css` — available CSS classes, keyframes, CSS variables
- `src/components/HeroMenu.tsx` — navigation pattern, menuItems structure, Link usage
- `src/app/layout.tsx` — QueryProvider wraps app, fonts loaded, noise-overlay global
- `src/lib/constants.ts` — CHART_COLORS, server-only constants (HELIUS_RPC_URL etc.)
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` — Server/Client Component split guidance for Next.js 16
- `node_modules/next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md` — Link component for internal navigation
- `package.json` — exact library versions

### Secondary (MEDIUM confidence)
- `.planning/STATE.md` — React Query v5 breaking changes (onError removed), confirmed project decisions
- `.planning/PROJECT.md` — Visual requirements, file structure spec, section designs
- `.planning/REQUIREMENTS.md` — R1 and R10 full definitions

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified in package.json, no new installs needed
- Architecture: HIGH — Server/Client Component split verified in Next.js 16 docs; pattern confirmed in existing codebase
- Visual patterns: HIGH — extracted directly from WarRoom.tsx, globals.css, constants.ts source files
- PriceResponse data shape: HIGH — confirmed by reading both types.ts and price route.ts; marketCap/volume24h confirmed undefined
- Navigation integration: HIGH — HeroMenu.tsx structure fully read; menuItems array pattern clear
- GSAP patterns: HIGH — verified from 3 existing components using identical pattern

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (stable — all findings from local source files, not external APIs)
