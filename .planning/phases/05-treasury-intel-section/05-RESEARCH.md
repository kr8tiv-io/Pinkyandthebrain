# Phase 5: Treasury Intel Section - Research

**Researched:** 2026-03-25
**Domain:** React component authoring, Recharts 3.x, Next.js 16 / React 19, project-specific classified aesthetic
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| R2 | SOL balance + all SPL tokens with name, contract, amount, current value (SOL/USD), purchase date, purchase price (SOL), USD at purchase, gain/loss %, Bags.fm link, X account, description. "CLASSIFIED" cards for unknowns. Treasury value over time chart. Sold tokens tracking. | `useTreasury` hook + `TreasuryResponse` type already provides all data fields. `HoldingValuation` in treasury.ts has every required field. `TREASURY_HOLDINGS` in investments.config.ts supplies metadata. Recharts 3.x is installed for the chart. |
| R10 | Match existing site aesthetic exactly: dark bg, monospace/terminal fonts, classified doc style. Redaction loading states. Pulsing REC indicators. Copy-to-clipboard wallets. Solscan links in new tab. Mobile responsive. | CommandHeader.tsx is the canonical aesthetic reference. CSS design tokens verified: #0d0d0d bg, #d4f000 primary, #ff9e9e accent, #cccccc text, font-mono, border-[#333], pixel blocks (██) for loading. |
</phase_requirements>

---

## Summary

Phase 5 builds `TreasuryIntel.tsx`, the first major data section of the War Room dashboard, slotting directly beneath `CommandHeader` in `src/app/war-room/page.tsx`. All data infrastructure is already complete — the `/api/treasury` route, `getTreasuryValuations()` composite function, `useTreasury` React Query hook, and `TreasuryResponse` type are all production-ready from Phases 2–3. Phase 5 is **purely a UI composition task**.

The component must render: (1) a SOL balance + total value summary bar, (2) individual token holding cards with per-token gain/loss, metadata, and external links, (3) "CLASSIFIED" redacted cards for tokens not in `investments.config.ts`, (4) a "Treasury Value Over Time" chart using Recharts 3.x `AreaChart`, and (5) a sold tokens section using the `soldDate`/`soldAmount` fields from `TreasuryHolding`. All loading states must use the established redaction pattern (`████████`), and all values must format as per `CommandHeader` conventions.

The project uses Recharts `^3.8.0` (3.x installed). Recharts 3.0 introduced breaking changes to `Tooltip` (use `TooltipContentProps` not `TooltipProps`), removed `CategoricalChartState`, and enabled `accessibilityLayer` by default. Custom tooltip components must match project aesthetic. The chart requires `'use client'` and `ResponsiveContainer` wrapper. No new dependencies are needed for this phase — everything is already installed.

**Primary recommendation:** Build TreasuryIntel as a single `'use client'` component in `src/components/dashboard/TreasuryIntel.tsx`, wire it into `war-room/page.tsx`, and compose from three sub-sections (Summary Bar, Holdings Grid, Value Chart) using the exact patterns from CommandHeader.tsx.

---

## Standard Stack

### Core (already installed — no new installs needed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| recharts | ^3.8.0 (3.x) | Treasury value over time chart | Locked project decision; already installed |
| @tanstack/react-query | ^5.95.2 | `useTreasury()` hook for data fetching | Locked project decision; hook already built |
| date-fns | ^4.1.0 | Format `purchaseDate` Unix timestamps | Already installed; established in project |
| gsap | ^3.14.2 | Entrance animation (optional, matches CommandHeader) | Already installed; CommandHeader uses it |
| Next.js | 16.2.1 | Component framework, 'use client' boundary | Project framework |
| TypeScript | ^5 | Type-safe access to `TreasuryResponse` / `HoldingValuation` | Project standard |

### No New Dependencies Required
All required libraries are installed. Do not add any new packages for this phase.

**Installation:** None required.

---

## Architecture Patterns

### Component Location
```
src/
├── components/
│   └── dashboard/
│       ├── CommandHeader.tsx        # Existing — aesthetic reference
│       └── TreasuryIntel.tsx        # NEW — Phase 5 deliverable
├── app/
│   └── war-room/
│       └── page.tsx                 # Add <TreasuryIntel /> below <CommandHeader />
└── lib/
    ├── api/
    │   └── treasury.ts              # Already built — getTreasuryValuations()
    ├── api/types.ts                 # TreasuryResponse type — already built
    ├── investments.config.ts        # TreasuryHolding metadata — already built
    └── constants.ts                 # CHART_COLORS — already built
```

### Pattern 1: 'use client' Leaf Component with useTreasury Hook

The canonical Next.js 16 split from `STATE.md`: `page.tsx` stays a Server Component, `TreasuryIntel` is a `'use client'` leaf. This matches exactly how `CommandHeader` is structured.

```typescript
// src/components/dashboard/TreasuryIntel.tsx
'use client'

import { useTreasury } from '@/hooks/useTreasury'
import type { TreasuryResponse } from '@/lib/api/types'

export default function TreasuryIntel() {
  const { data, isLoading, isError } = useTreasury()
  // ...
}
```

**wire into page.tsx:**
```typescript
// src/app/war-room/page.tsx
import TreasuryIntel from '@/components/dashboard/TreasuryIntel'

export default function WarRoomPage() {
  return (
    <main className="relative w-full min-h-screen bg-[#0d0d0d] text-[#cccccc] overflow-x-hidden">
      {/* ambient glow bg (existing) */}
      <div className="relative z-10">
        <CommandHeader />
        <TreasuryIntel />
        {/* Phase 6+ sections follow */}
      </div>
    </main>
  )
}
```

### Pattern 2: Redaction Loading State (Established Project Pattern)

The project's loading state is pixel-block redaction, not spinner-based. Mirror CommandHeader exactly:

```typescript
// Loading state — pixel blocks
{isLoading ? (
  <span className="text-[#d4f000]">████████</span>
) : (
  formatUsd(data?.totalValueUsd ?? 0)
)}
```

### Pattern 3: Token Holding Card — Known vs CLASSIFIED

For known tokens (mint found in `HOLDINGS_BY_MINT`), render full card. For unknown tokens (`category === 'unknown'`), render a redacted CLASSIFIED card:

```typescript
// Known token card
function HoldingCard({ holding }: { holding: HoldingValuation }) {
  const isKnown = holding.category !== 'unknown'
  if (!isKnown) return <ClassifiedCard mint={holding.mint} />
  return (
    <div className="bg-black/40 border border-[#333] border-l-[4px] border-l-[#d4f000] p-6 font-mono">
      {/* token content */}
    </div>
  )
}

// CLASSIFIED card for unknown tokens
function ClassifiedCard({ mint }: { mint: string }) {
  return (
    <div className="bg-black/40 border border-[#333] p-6 font-mono relative overflow-hidden">
      <div className="font-mono text-[10px] uppercase tracking-widest text-[#cccccc] mb-2 font-bold">
        HOLDING #{mint.slice(0, 8)}
      </div>
      <div className="text-2xl font-black text-[#333] tracking-widest select-none flicker">
        ████████████████████
      </div>
      <div className="mt-2 text-xs text-[#666] border border-[#333] px-2 py-0.5 tracking-widest inline-block">
        CLASSIFIED
      </div>
    </div>
  )
}
```

The `.flicker` class is already defined in `globals.css` — use it for CLASSIFIED cards.

### Pattern 4: Recharts 3.x AreaChart for Treasury Value Over Time

Recharts 3.8.0 is installed. Key API facts for this project:

```typescript
// Source: recharts 3.0 migration guide + official docs
'use client'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { TooltipProps } from 'recharts'

// Custom tooltip must use TooltipProps (not the old TooltipContentProps pattern for content)
// In Recharts 3.x, accessibilityLayer is true by default
// ResponsiveContainer: provide explicit height, not percentage height in a flex parent

interface ChartDataPoint {
  timestamp: number
  valueUsd: number
  label: string  // formatted date for XAxis
}

function TreasuryValueChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
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
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="valueUsd"
          stroke="#d4f000"
          strokeWidth={2}
          fill="url(#treasuryGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
```

**Important Recharts 3.x change:** The project's chart data will be generated from `data.holdings` current snapshot — there is no historical time-series endpoint. The chart must be constructed from either: (a) snapshot data with purchase dates as data points, or (b) a static "current value" single point. See Open Questions section.

### Pattern 5: Number Formatting (Established Project Pattern)

From `CommandHeader.tsx` — copy these exact formatters:

```typescript
function formatUsd(n: number): string {
  if (n < 0.01) return `$${n.toFixed(6)}`
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatSol(n: number): string {
  return `${n.toFixed(8)} \u25ce`  // ◎ symbol
}

// Gain/loss — color coded
function formatGainLoss(pct: number | undefined): { text: string; color: string } {
  if (pct === undefined) return { text: 'N/A', color: 'text-[#cccccc]' }
  const sign = pct >= 0 ? '+' : ''
  return {
    text: `${sign}${pct.toFixed(2)}%`,
    color: pct >= 0 ? 'text-[#d4f000]' : 'text-[#ff9e9e]',
  }
}
```

### Pattern 6: Purchase Date Formatting with date-fns

```typescript
import { format, fromUnixTime } from 'date-fns'

// purchaseDate is a Unix timestamp (seconds)
const dateStr = holding.purchaseDate
  ? format(fromUnixTime(holding.purchaseDate), 'yyyy-MM-dd')
  : 'UNKNOWN'
```

### Pattern 7: Copy-to-Clipboard for Contract Addresses (R10)

R10 requires copy-to-clipboard for wallet/contract addresses. Use `navigator.clipboard` with a copied state indicator:

```typescript
const [copied, setCopied] = useState(false)

async function handleCopy(text: string) {
  await navigator.clipboard.writeText(text)
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
}

// Render
<button
  onClick={() => handleCopy(holding.mint)}
  className="font-mono text-[10px] text-[#666] hover:text-[#d4f000] transition-colors"
>
  {copied ? 'COPIED' : holding.mint.slice(0, 8) + '…' + holding.mint.slice(-6)}
</button>
```

### Pattern 8: Solscan Links (R10)

```typescript
// Token account on Solscan — open in new tab
<a
  href={`https://solscan.io/token/${holding.mint}`}
  target="_blank"
  rel="noopener noreferrer"
  className="font-mono text-[10px] text-[#d4f000] hover:underline"
>
  SOLSCAN ↗
</a>

// Bags.fm link (from investments.config.ts field)
{holding.bagsLink && (
  <a href={holding.bagsLink} target="_blank" rel="noopener noreferrer">
    BAGS.FM ↗
  </a>
)}
```

### Pattern 9: Section Header (Classified Doc Aesthetic)

Match the section heading convention from `WarRoom.tsx` and `CommandHeader.tsx`:

```typescript
// Section header with classification marker
<div className="border-b border-[#333] px-6 lg:px-12 py-4 flex justify-between items-center">
  <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#cccccc] font-bold">
    TREASURY INTEL — CLASSIFIED
  </div>
  <div className="font-mono text-xs uppercase tracking-widest text-[#d4f000]">
    {/* Optional: section-level live indicator */}
  </div>
</div>
```

### Pattern 10: Sold Tokens Section

`TreasuryHolding` in `investments.config.ts` has `soldDate?: number` and `soldAmount?: number`. When `soldDate` is set, the token is a sold position. Filter from `TREASURY_HOLDINGS`:

```typescript
import { TREASURY_HOLDINGS } from '@/lib/investments.config'

// Sold tokens are in config but NOT in the live API response (already disposed)
const soldTokens = TREASURY_HOLDINGS.filter(h => h.soldDate !== undefined)
```

These should render as a separate "DIVESTED ASSETS" subsection with greyed styling and `SOLD` badge.

### Anti-Patterns to Avoid

- **Do NOT import treasury API directly in client component:** `getTreasuryValuations` is server-side only. Always use `useTreasury()` hook which calls the `/api/treasury` route.
- **Do NOT use `onError` on React Query:** Project decision from STATE.md — React Query v5 has no `onError` callback. Use `result.isError` / `result.error` only.
- **Do NOT use `TooltipProps` as custom component type in Recharts 3.x incorrectly:** In Recharts 3.x, custom tooltip content receives `TooltipProps<ValueType, NameType>` — verify the actual props passed vs declared type.
- **Do NOT use percentage height on `ResponsiveContainer` inside flex containers:** Causes 0-height render. Use explicit pixel height (e.g., `height={200}`).
- **Do NOT hardcode token metadata:** All token names, descriptions, links come from `investments.config.ts` / the API response. Never hardcode project names in JSX.
- **Do NOT use `any` types:** All `useTreasury` data is typed as `TreasuryResponse`. Use the exported type, destructure from `data`.
- **Do NOT create a new date-fns import pattern:** `fromUnixTime(n)` converts Unix seconds; `new Date(n * 1000)` is the alternative but date-fns is already installed and established.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Time-series chart | Custom SVG chart | `recharts` AreaChart | Recharts 3.x already installed, handles responsive sizing, tooltips, gradients |
| Data fetching + caching | useState + useEffect + fetch | `useTreasury()` (already built) | React Query hook already written in Phase 3 |
| Date formatting | Custom date string logic | `date-fns` `format(fromUnixTime(n), ...)` | Already installed; handles Unix timestamp → readable date |
| Copy-to-clipboard | Custom clipboard API wrapper | Direct `navigator.clipboard.writeText` | Simple enough without a library; project doesn't have a clipboard utility |
| Number formatting | Custom locale logic | `n.toLocaleString()` (same as CommandHeader) | Already established pattern in CommandHeader.tsx |
| Loading skeletons | CSS skeleton library | Inline `████` redaction text | Established project pattern — do NOT introduce a skeleton library |

**Key insight:** Phase 5 is UI composition only. All data, types, API, and hooks are pre-built. The only new work is rendering.

---

## Common Pitfalls

### Pitfall 1: Recharts `ResponsiveContainer` Zero-Height in Flex Parent
**What goes wrong:** Chart renders as 0px height / invisible when `ResponsiveContainer` is inside a flex container without an explicit height.
**Why it happens:** Recharts uses `ResizeObserver` to measure the parent; flex containers with percentage heights don't report a numeric height until fully painted.
**How to avoid:** Always wrap `ResponsiveContainer` in a `div` with an explicit pixel height: `<div style={{ height: 200 }}>` or use `h-[200px]` Tailwind class.
**Warning signs:** Chart renders but is invisible; no error in console; `ResponsiveContainer` logs width/height 0 warning.

### Pitfall 2: Chart Data Source — No Historical Time-Series API
**What goes wrong:** The treasury API returns a single snapshot (current holdings). There is no endpoint returning historical treasury values over time.
**Why it happens:** `getTreasuryValuations()` queries current Solana state — it does not store or query historical data.
**How to avoid:** Build the chart data from the current holdings using `purchaseDate` + `costBasisUsd` as the "entry point" and current value as endpoint. This gives an N-point approximation showing when each position was opened. Alternatively, render a single-bar or simple "Cost Basis vs Current Value" comparison chart instead of a time-series — this is honest and accurate.
**Warning signs:** Any attempt to fetch `/api/treasury/history` — that endpoint does not exist.

### Pitfall 3: Server-Side Import in Client Component
**What goes wrong:** Importing `getTreasuryValuations` or anything from `src/lib/api/treasury.ts` directly into `TreasuryIntel.tsx` causes a build error because the module uses `process.env` server keys.
**Why it happens:** `treasury.ts` has `// Server-side only` comment and uses API keys that are not exposed to the client.
**How to avoid:** Always use `useTreasury()` hook — it calls `/api/treasury` via fetch. Never import `lib/api/` modules into client components.
**Warning signs:** Build error mentioning environment variables or `process.env` in browser context.

### Pitfall 4: Recharts 3.x Custom Tooltip Type Mismatch
**What goes wrong:** Custom `<Tooltip content={<CustomTooltip />} />` component throws TypeScript errors if using Recharts 2.x type signatures.
**Why it happens:** Recharts 3.0 updated Tooltip type definitions. The `label` prop is now `undefined | string | number` (not just `string`). The `payload` entries also have updated types.
**How to avoid:** Type custom tooltip as `TooltipProps<number, string>` from recharts. Handle `undefined` label explicitly.
**Warning signs:** TypeScript error: "Type 'string' is not assignable to type 'string | number | undefined'".

### Pitfall 5: `purchasePriceSol` Missing from API Response
**What goes wrong:** R2 requires "purchase price (SOL)" but `HoldingValuation` only has `purchasePriceUsd` (not `purchasePriceSol`).
**Why it happens:** The `enrichHolding` function in `treasury.ts` computes USD purchase price from Birdeye historical data but does not store the SOL equivalent.
**How to avoid:** Derive `purchasePriceSol` in the UI: `purchasePriceSol = purchasePriceUsd / solPriceUsd`. Both `purchasePriceUsd` and `solPriceUsd` are available in the response.
**Warning signs:** Trying to access `holding.purchasePriceSol` — that field does not exist in `TreasuryResponse`.

### Pitfall 6: Investments Config Has Only 2 Entries
**What goes wrong:** `investments.config.ts` currently only has `SOL` and `BRAIN` in `TREASURY_HOLDINGS`. Most token holdings will show as `category: 'unknown'` → rendered as CLASSIFIED cards.
**Why it happens:** The config is a stub — only two tokens are configured. As the treasury grows, more entries need to be added to `TREASURY_HOLDINGS`.
**How to avoid:** This is expected behavior — CLASSIFIED cards are the designed fallback. The component correctly handles `category === 'unknown'`. Document that adding tokens to `investments.config.ts` is how the team "declassifies" holdings.
**Warning signs:** All token cards showing CLASSIFIED — this is correct until the config is populated.

### Pitfall 7: `useTreasury` staleTime=60s May Cause "Stale on Mount" Perception
**What goes wrong:** On first load, if the QueryClient was recently initialized, the treasury query may show stale data briefly.
**Why it happens:** Global `staleTime: 60_000` in `query-client.tsx`. The treasury hook also sets `staleTime: 60_000` — consistent but means data is potentially up to 60s old.
**How to avoid:** This is by design per `STATE.md` (R11 performance requirement). Show the redaction loading state (`isLoading`) properly — it will only trigger on the very first fetch. Accept that data may be 60s stale per spec.

---

## Code Examples

### Full TreasuryIntel Component Skeleton

```typescript
// src/components/dashboard/TreasuryIntel.tsx
'use client'

import { useState } from 'react'
import { format, fromUnixTime } from 'date-fns'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useTreasury } from '@/hooks/useTreasury'
import { TREASURY_HOLDINGS } from '@/lib/investments.config'

function formatUsd(n: number): string {
  if (n < 0.01) return `$${n.toFixed(6)}`
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatSol(n: number): string {
  return `${n.toFixed(4)} \u25ce`
}

export default function TreasuryIntel() {
  const { data, isLoading, isError } = useTreasury()

  return (
    <section className="w-full border-b border-[#333]">
      {/* Section header */}
      <div className="px-6 lg:px-12 py-4 border-b border-[#333]/50 flex justify-between items-center">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-[#cccccc] font-bold">
          TREASURY INTEL
        </div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-[#666]">
          CLASSIFICATION: TS/SCI
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#333]/50 border-b border-[#333]/50">
        <div className="px-6 py-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#cccccc] mb-1 font-bold">
            Total Value (USD)
          </div>
          <div className="font-mono text-2xl font-black text-white tabular-nums">
            {isLoading ? <span className="text-[#d4f000]">████████</span> : formatUsd(data?.totalValueUsd ?? 0)}
          </div>
        </div>
        {/* SOL Balance, Total Value SOL, Holdings count cells follow same pattern */}
      </div>

      {/* Holdings grid */}
      <div className="px-6 lg:px-12 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <LoadingCard key={i} />)
            : data?.holdings.map(h => <HoldingCard key={h.mint} holding={h} solPriceUsd={data.solPriceUsd} />)
          }
        </div>
      </div>

      {/* Treasury value chart */}
      <TreasuryValueChart holdings={data?.holdings ?? []} isLoading={isLoading} />

      {/* Sold / divested section */}
      <DivestedSection />
    </section>
  )
}
```

### Gain/Loss Color Utility

```typescript
// Used in HoldingCard for gain/loss display
function gainLossDisplay(pct: number | undefined): { text: string; colorClass: string } {
  if (pct === undefined) return { text: '—', colorClass: 'text-[#cccccc]' }
  const sign = pct >= 0 ? '+' : ''
  return {
    text: `${sign}${pct.toFixed(2)}%`,
    colorClass: pct >= 0 ? 'text-[#d4f000]' : 'text-[#ff9e9e]',
  }
}
```

### Chart Data Construction from Holdings

Since there is no historical API, construct approximate chart data from purchase points:

```typescript
interface ChartPoint { label: string; valueUsd: number }

function buildChartData(holdings: TreasuryResponse['holdings']): ChartPoint[] {
  // Sort by purchase date (oldest first)
  const withDates = holdings
    .filter(h => h.purchaseDate && h.costBasisUsd !== undefined)
    .sort((a, b) => (a.purchaseDate ?? 0) - (b.purchaseDate ?? 0))

  if (withDates.length === 0) return []

  // Build cumulative value over acquisition history
  let cumulative = 0
  const points: ChartPoint[] = withDates.map(h => {
    cumulative += h.costBasisUsd ?? 0
    return {
      label: format(fromUnixTime(h.purchaseDate!), 'MMM dd'),
      valueUsd: cumulative,
    }
  })

  // Add current value as final point
  const totalCurrent = holdings.reduce((s, h) => s + h.currentValueUsd, 0)
  points.push({ label: 'NOW', valueUsd: totalCurrent })

  return points
}
```

### Recharts Custom Tooltip (Aesthetic Match)

```typescript
import type { TooltipProps } from 'recharts'

function CustomChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0d0d0d] border border-[#d4f000] px-3 py-2 font-mono text-xs">
      <div className="text-[#cccccc] mb-1">{label}</div>
      <div className="text-[#d4f000] font-black">
        {formatUsd(payload[0].value ?? 0)}
      </div>
    </div>
  )
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Recharts 2.x `TooltipProps` type | Recharts 3.x same `TooltipProps` but `label` is `string \| number \| undefined` | Recharts 3.0 | Custom tooltips must handle `undefined` label |
| `CategoricalChartState` for internal state | Hooks like `useActiveTooltipLabel` | Recharts 3.0 | Cannot use `Customized` component to access internal state |
| React Query `onError` callback | `result.isError` + `result.error` properties | React Query v5 | Already handled in project — no onError callbacks |
| Recharts `animateNewValues` on Area | Removed | Recharts 3.0 | Do not use this prop |
| Multiple YAxis order by render order | Multiple YAxis alphabetical by `yAxisId` | Recharts 3.0 | Not relevant for single-axis treasury chart |

**Deprecated/outdated:**
- `animateNewValues` prop on `<Area>`: removed in Recharts 3.0 — do not use
- `CategoricalChartState` type import: removed in Recharts 3.0 — do not use

---

## Open Questions

1. **Treasury Value Over Time Chart Data**
   - What we know: The API returns a snapshot (no time-series). Holdings have `purchaseDate` + `costBasisUsd`.
   - What's unclear: Whether user wants a true time-series chart or a cost-basis vs current-value comparison view.
   - Recommendation: Build a cumulative acquisition curve (purchase dates as X-axis, cumulative cost basis as line, final point = current value). This gives a meaningful "portfolio growth" view using available data. If the visual doesn't satisfy requirements, the task note should flag it.

2. **`purchasePriceSol` field in R2**
   - What we know: `HoldingValuation` only has `purchasePriceUsd`, not `purchasePriceSol`. SOL price at time of purchase is not stored.
   - What's unclear: R2 requires "purchase price (SOL)". The API has purchase price in USD and current SOL price.
   - Recommendation: Derive approximate purchase price in SOL as `purchasePriceUsd / solPriceUsd` (using current SOL price). This is an approximation. Label it clearly in the UI as "~purchase price (SOL)" or just omit the SOL denomination for purchase price and show USD only. The planner should decide which approach.

3. **Sold Tokens Data Completeness**
   - What we know: `investments.config.ts` has `soldDate?: number` and `soldAmount?: number` fields. Currently only 2 tokens are in the config, neither sold.
   - What's unclear: Whether there are any sold positions to display yet.
   - Recommendation: Render the "DIVESTED ASSETS" section only if `soldTokens.length > 0`. If empty, either hide the section or show "NO DIVESTED POSITIONS RECORDED" in classified style.

---

## Sources

### Primary (HIGH confidence)
- Project source files (read directly): `treasury.ts`, `types.ts`, `useTreasury.ts`, `investments.config.ts`, `constants.ts`, `CommandHeader.tsx`, `war-room/page.tsx`, `globals.css`, `package.json`
- `STATE.md` — all architectural decisions verified from project decision log
- `recharts/AGENTS.md` in node_modules — confirms recharts is present in project

### Secondary (MEDIUM confidence)
- [recharts/recharts - 3.0 migration guide](https://github.com/recharts/recharts/wiki/3.0-migration-guide) — verified breaking changes for Tooltip, AreaChart, ResponsiveContainer
- [WebSearch: Recharts 3.x AreaChart API 2025] — confirmed ResponsiveContainer zero-height pitfall; multiple sources agree

### Tertiary (LOW confidence)
- None — all critical claims are verified against project source or official migration docs

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries read directly from package.json (recharts ^3.8.0 confirmed installed)
- Architecture: HIGH — CommandHeader.tsx is direct aesthetic reference; war-room/page.tsx shows exact slot location; all data types from actual source files
- Recharts API: MEDIUM — verified against official 3.0 migration guide; exact prop names cross-checked
- Pitfalls: HIGH — server-side import pitfall confirmed from project comments; Recharts ResponsiveContainer pitfall verified from multiple sources; `purchasePriceSol` gap confirmed from reading actual `HoldingValuation` interface

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (recharts API stable; project deps stable)
