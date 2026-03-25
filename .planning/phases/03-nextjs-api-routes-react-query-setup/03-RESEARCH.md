# Phase 3: Next.js API Routes & React Query Setup - Research

**Researched:** 2026-03-25
**Domain:** Next.js 16 Route Handlers + TanStack Query v5 hooks
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| R1 | Command Header: live $BRAIN price (USD + SOL), 24h change %, market cap, volume, LIVE pulsing indicator | `/api/price/route.ts` calls `getTokenPrice(BRAIN_TOKEN_MINT)` + `getTokenPrice(SOL_MINT)` from birdeye.ts; `useQuery` hook with 60s refetchInterval |
| R2 | Treasury Intel: SOL balance, SPL holdings with values, purchase data, gain/loss, metadata | `/api/treasury/route.ts` ALREADY UPGRADED in Phase 2 calling `getTreasuryValuations()`; hook with 60s staleTime |
| R3 | Burn Operations: total burned, % of supply, transaction table | `/api/burns/route.ts` calls `getBurnSummary()` from burns.ts; hook with 300s refetchInterval |
| R4 | Fee Distribution Ledger: 10/20/30/10/5/5/20 split from LP fee wallet | LP fees route feeds `getFeeDistribution()` pure function; hook consumes lp-fees endpoint |
| R5 | Reflections Terminal: total SOL distributed, top 100 holders | `/api/holders/route.ts` ALREADY EXISTS as hall-of-fame; reflections data from lp-fees or dedicated endpoint |
| R6 | Marketing Ops: in/out/balance + transaction log for marketing wallet | `/api/wallet/[address]/route.ts` with dynamic address param; hook passes MARKETING_WALLET |
| R7 | Dev Discretionary: in/out/balance + transaction log for dev wallet | Same `/api/wallet/[address]/route.ts`; hook passes DEV_WALLET |
| R8 | LP Fees: total fees earned, inflows over time | `/api/lp-fees/route.ts` calls `getLpFeeInflows()` + `getFeeDistribution()` from reflections.ts |
| R9 | API Security: all calls via Next.js API routes, zero client-side keys | All routes server-side only; `process.env` (no NEXT_PUBLIC_) confirmed in lib/api/ wrappers |
| R11 | Performance: page loads with live prices within 3s; 60s price refresh, 5min tx history refresh | Route `revalidate` constants; React Query `staleTime` + `refetchInterval` per query key |
</phase_requirements>

---

## Summary

Phase 2 is fully complete. All `lib/api/` wrappers exist (`helius.ts`, `birdeye.ts`, `solscan.ts`, `treasury.ts`, `burns.ts`, `reflections.ts`, `types.ts`). The treasury route and hall-of-fame route are already upgraded. The `QueryProvider` is already wired into the root layout.

Phase 3's job is to: (1) create the remaining 4 new API routes (price, burns, holders, wallet/[address], lp-fees), (2) create React Query hook files that consume them, and (3) make the QueryProvider default options match per-data-type refresh requirements. The treasury route already exists and works. The hall-of-fame route already exists as `/api/hall-of-fame/` but Phase 3 may add `/api/holders/` as the canonical name per the roadmap.

The critical architectural finding is that Next.js 16 with an empty `next.config.ts` uses the **previous caching model** (not Cache Components). Route Handlers in this version are NOT cached by default — they run dynamically on each request unless `export const revalidate = N` is set. The `next: { revalidate: N }` option on individual `fetch()` calls inside lib/api/ functions controls server-side ISR caching. Route-level `export const revalidate` provides a ceiling, not a floor — the lowest value wins.

**Primary recommendation:** Create thin route files (15-line proxies only, per Phase 2 decision) + a `src/hooks/` directory with one `useQuery` hook per data domain, typed against `types.ts` response shapes.

---

## Standard Stack

### Core (Already Installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.1 | Route Handler framework | Project standard; App Router only |
| @tanstack/react-query | 5.95.2 | Client data fetching + caching | Project decision; installed in Phase 1 |
| TypeScript | ~5.x | Strict typing | Project standard, strict mode enabled |

### Supporting (Already Installed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/react-query-devtools | 5.95.2 | Dev-only query inspector | Already in QueryProvider; no new work needed |
| next/server | (bundled) | NextResponse, NextRequest types | Use for typed route handler params |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| useQuery per domain | Single useQuery with combined endpoint | Granular refresh intervals are impossible with combined; use per-domain hooks |
| refetchInterval | Server Sent Events / WebSocket | SSE not needed for 60s refresh; adds complexity with no benefit for this use case |
| Response.json() | NextResponse.json() | Both work in Next.js 16; `Response.json()` is Web API standard and slightly preferred per docs |

**Installation:** All packages already installed. No new dependencies needed for Phase 3.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/api/
│   ├── price/route.ts           # NEW — GET $BRAIN + SOL prices
│   ├── treasury/route.ts        # EXISTS — already upgraded in Phase 2
│   ├── burns/route.ts           # NEW — GET burn summary
│   ├── holders/route.ts         # NEW — GET top 100 holders (canonical name)
│   ├── wallet/[address]/route.ts # NEW — GET wallet in/out/balance (dynamic)
│   ├── lp-fees/route.ts         # NEW — GET LP fee inflows + distribution
│   └── hall-of-fame/route.ts    # EXISTS — keep for backward compatibility (or deduplicate)
├── hooks/                       # NEW directory — React Query hooks
│   ├── usePrice.ts
│   ├── useTreasury.ts
│   ├── useBurns.ts
│   ├── useHolders.ts
│   ├── useWallet.ts
│   └── useLpFees.ts
└── providers/
    └── query-client.tsx         # EXISTS — already set up with useState pattern
```

### Pattern 1: Thin Route Handler (15-line proxy)

**What:** Route file calls the lib/api/ composite function, wraps in try/catch, returns JSON. Zero business logic in the route file.
**When to use:** All routes in this phase follow this pattern — established in Phase 2.

```typescript
// Source: src/app/api/treasury/route.ts (existing upgraded route — the canonical example)
import { NextResponse } from 'next/server'
import { getTreasuryValuations } from '@/lib/api/treasury'

export const revalidate = 60

export async function GET() {
  try {
    const data = await getTreasuryValuations()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[treasury API]', err)
    return NextResponse.json(
      { error: 'Treasury data fetch failed' },
      { status: 500 }
    )
  }
}
```

### Pattern 2: Dynamic Route Segment — `params` is a Promise in Next.js 16

**What:** In Next.js 15+/16, `params` in route handler context is a `Promise<{...}>`, not a plain object. Must use `await params`.
**When to use:** `/app/api/wallet/[address]/route.ts`

```typescript
// Source: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAllAccountTransfers } from '@/lib/api/solscan'

export const revalidate = 300

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params   // ← MUST await params in Next.js 15+/16
  try {
    const [inTransfers, outTransfers] = await Promise.all([
      getAllAccountTransfers(address, { flow: 'in' }),
      getAllAccountTransfers(address, { flow: 'out' }),
    ])
    // ... aggregate and return
    return NextResponse.json(data)
  } catch (err) {
    console.error('[wallet API]', err)
    return NextResponse.json({ error: 'Wallet fetch failed' }, { status: 500 })
  }
}
```

### Pattern 3: React Query v5 useQuery Hook

**What:** TanStack Query v5 changed the API — `useQuery` takes a single options object. No separate `onError` callback. Error is on the result object. `queryKey` must be an array.
**When to use:** All client-side data hooks in `src/hooks/`.

```typescript
// Source: @tanstack/react-query v5 — verified from package.json version 5.95.2
// v5 breaking changes: single options object, no onError callback, error via result.error
import { useQuery } from '@tanstack/react-query'
import type { PriceResponse } from '@/lib/api/types'

export function usePrice() {
  return useQuery<PriceResponse>({
    queryKey: ['price'],
    queryFn: async () => {
      const res = await fetch('/api/price')
      if (!res.ok) throw new Error('Price fetch failed')
      return res.json() as Promise<PriceResponse>
    },
    staleTime: 30 * 1000,          // 30s — show stale data for up to 30s
    refetchInterval: 60 * 1000,    // 60s — re-fetch in background
  })
}
```

### Pattern 4: Per-wallet Hook with Dynamic URL

**What:** The wallet/[address] route takes an address path param. Hooks pass wallet address constants at the call site.
**When to use:** `useWallet(MARKETING_WALLET)`, `useWallet(DEV_WALLET)`, `useWallet(LP_WALLET)`.

```typescript
import { useQuery } from '@tanstack/react-query'
import type { WalletActivityResponse } from '@/lib/api/types'

export function useWallet(address: string) {
  return useQuery<WalletActivityResponse>({
    queryKey: ['wallet', address],         // address in key = separate cache per wallet
    queryFn: async () => {
      const res = await fetch(`/api/wallet/${address}`)
      if (!res.ok) throw new Error(`Wallet fetch failed for ${address}`)
      return res.json() as Promise<WalletActivityResponse>
    },
    staleTime: 5 * 60 * 1000,     // 5 min — tx history is slower-changing
    refetchInterval: 5 * 60 * 1000,
  })
}
```

### Pattern 5: Price Route — Birdeye returns both tokens in one batch call

**What:** `getMultiTokenPrices([BRAIN_TOKEN_MINT, SOL_MINT])` fetches both in one HTTP request. The price route combines them into the `PriceResponse` shape.
**When to use:** `/api/price/route.ts` only.

```typescript
// Source: src/lib/api/birdeye.ts — getMultiTokenPrices already written
import { NextResponse } from 'next/server'
import { getMultiTokenPrices } from '@/lib/api/birdeye'
import { BRAIN_TOKEN_MINT, SOL_MINT } from '@/lib/constants'
import type { PriceResponse } from '@/lib/api/types'

export const revalidate = 60

export async function GET() {
  try {
    const prices = await getMultiTokenPrices([BRAIN_TOKEN_MINT, SOL_MINT])
    const brain = prices[BRAIN_TOKEN_MINT]
    const sol = prices[SOL_MINT]

    const data: PriceResponse = {
      priceUsd: brain?.value ?? 0,
      priceSol: sol?.value > 0 ? (brain?.value ?? 0) / sol.value : 0,
      priceChange24h: brain?.priceChange24h ?? 0,
      marketCap: undefined,    // Birdeye /defi/price does not return marketCap
      volume24h: undefined,    // Birdeye /defi/price does not return volume24h
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[price API]', err)
    return NextResponse.json({ error: 'Price fetch failed' }, { status: 500 })
  }
}
```

### Pattern 6: LP Fees Route — combine inflows + distribution

**What:** `/api/lp-fees/route.ts` calls both `getLpFeeInflows()` and `getFeeDistribution()`, combines into `LpFeeResponse` shape from types.ts.
**When to use:** `/api/lp-fees/route.ts` only.

```typescript
// Source: src/lib/api/reflections.ts — getLpFeeInflows and getFeeDistribution written
import { NextResponse } from 'next/server'
import { getLpFeeInflows, getFeeDistribution } from '@/lib/api/reflections'
import type { LpFeeResponse } from '@/lib/api/types'

export const revalidate = 300

export async function GET() {
  try {
    const { totalFeeSol, inflows } = await getLpFeeInflows()
    const distribution = getFeeDistribution(totalFeeSol)

    const data: LpFeeResponse = {
      totalFeeSol,
      inflows,
      distribution,
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[lp-fees API]', err)
    return NextResponse.json({ error: 'LP fees fetch failed' }, { status: 500 })
  }
}
```

### Pattern 7: Holders Route (canonical `/api/holders/`)

**What:** The hall-of-fame route already exists at `/api/hall-of-fame/`. Phase 3 adds `/api/holders/` as the canonical name for war room use. Both can coexist or hall-of-fame can be kept only for the landing page.
**When to use:** Create `/api/holders/route.ts` which calls `getTop100Holders(BRAIN_TOKEN_MINT)`.

### Anti-Patterns to Avoid

- **Importing lib/api/ in client components:** `birdeye.ts`, `solscan.ts`, `helius.ts` use `process.env` variables without `NEXT_PUBLIC_`. Importing them client-side will expose API keys or throw ReferenceErrors. Always proxy through API routes.
- **`export const revalidate = 60 * 10`:** The revalidate value must be statically analyzable. Use `export const revalidate = 600` not `60 * 10` (from Next.js 16 docs).
- **Not awaiting `params` in dynamic routes:** In Next.js 15+/16, `params` is a Promise. Not awaiting it causes a TypeScript error and runtime failure.
- **Using `onError` callback in React Query v5:** Removed in v5. Use `result.error` from `useQuery` return value or `throwOnError: true` + error boundaries.
- **Using `cacheComponents: true` or `use cache` directive:** `next.config.ts` is empty — this project uses the previous caching model. Do NOT add `cacheComponents` flag.
- **Setting `refetchOnWindowFocus: true`:** Already disabled globally in QueryProvider. Don't override without good reason — dashboard data doesn't need per-focus refetch.
- **Using `cache: 'force-cache'` without `next.revalidate`:** Forces indefinite caching. The individual fetch calls in lib/api/ already set `next: { revalidate: 60 }` or `300` — route-level `export const revalidate` must be set to the same or lower value to be effective.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Client-side fetch with loading state | Manual useState + useEffect + fetch | `useQuery` from @tanstack/react-query | Race conditions, duplicate requests, no deduplication, no stale-while-revalidate |
| Per-wallet hook that duplicates logic | Separate `useMarketingWallet`, `useDevWallet`, `useLpWallet` hooks | Single `useWallet(address: string)` with address in queryKey | queryKey includes address, so cache is correctly separated; hooks are identical except the address |
| Polling with setInterval | setInterval + setState | `refetchInterval` option in useQuery | setInterval doesn't clean up on unmount, doesn't respect window focus, doesn't coordinate with cache |
| Error state management | try/catch + useState for error | `result.isError`, `result.error` from useQuery | React Query tracks error state across retries, handles retry logic automatically |
| Request deduplication | Manual ref/semaphore | React Query automatic deduplication | Multiple components calling same hook = one request, not N requests |

**Key insight:** React Query's queryKey-based deduplication means the Command Header and Treasury section can both call `usePrice()` — only one HTTP request fires.

---

## Common Pitfalls

### Pitfall 1: `params` is a Promise in Next.js 15+/16

**What goes wrong:** `const { address } = params` (without await) — TypeScript error + runtime TypeError.
**Why it happens:** Next.js 15 changed `params` from a plain object to a Promise. AGENTS.md warned: "This is NOT the Next.js you know."
**How to avoid:** Always `const { address } = await params` in dynamic route handlers.
**Warning signs:** TypeScript error "Property 'address' does not exist on type 'Promise<...>'"

### Pitfall 2: Route Handlers Are NOT Cached by Default in Next.js 15+/16

**What goes wrong:** Route returns fresh data every request even though you think the server is caching.
**Why it happens:** Next.js 15 changed GET handler default from static to dynamic (from the version history in route.md). Route Handlers run per-request unless opt-in.
**How to avoid:** Add `export const revalidate = N` to every route file. The lib/api/ `fetch()` calls use `next: { revalidate: N }` for sub-request ISR caching — but the route itself also needs the segment config set.
**Warning signs:** No visible stale-while-revalidate behavior; every page hit triggers full API chain.

### Pitfall 3: `revalidate` Must Be a Literal Number

**What goes wrong:** `export const revalidate = 60 * 5` causes a Next.js build warning and the value is ignored.
**Why it happens:** Next.js static analysis cannot evaluate expressions. It requires a literal number.
**How to avoid:** Write `export const revalidate = 300` not `60 * 5`.
**Warning signs:** Build warning "The `revalidate` export must be a static literal".

### Pitfall 4: Type Mismatch Between Route Response and Hook Expectation

**What goes wrong:** Route returns `BurnSummary` (from burns.ts), hook expects `BurnSummaryResponse` (from types.ts). Different field names cause silent undefined.
**Why it happens:** Phase 2 created both internal types (in composite modules) and shared API types (in types.ts). They are not always identical.
**How to avoid:** Routes must cast/conform output to the types.ts interface. Hooks must import from `@/lib/api/types`, not from composite modules. Check that `BurnSummary` from burns.ts and `BurnSummaryResponse` from types.ts have identical shapes — they do in the current code.
**Warning signs:** TypeScript type errors when assigning `BurnSummary` to `BurnSummaryResponse`.

### Pitfall 5: `marketCap` and `volume24h` Missing from Birdeye `/defi/price`

**What goes wrong:** `PriceResponse` in types.ts has `marketCap?` and `volume24h?` fields, but `getTokenPrice()` and `getMultiTokenPrices()` from birdeye.ts do NOT return these fields — the Birdeye `/defi/price` endpoint does not include them.
**Why it happens:** Types were defined for the desired UI data shape, not the exact API response.
**How to avoid:** Set `marketCap: undefined` and `volume24h: undefined` in the price route until Birdeye's market data endpoint is added. The `?` optional markers in types.ts handle this correctly. Do NOT attempt to get marketCap from the Birdeye price endpoint.
**Warning signs:** Undefined values displayed as "NaN" or "$NaN" in Command Header.

### Pitfall 6: WalletActivityResponse Shape vs getAllAccountTransfers Return Type

**What goes wrong:** `getAllAccountTransfers` returns `Transfer[]` (from solscan.ts). `WalletActivityResponse` expects `{ totalIn, totalOut, netBalance, transactions }`. The aggregation logic must be in the route handler.
**Why it happens:** The wallet route needs to compute totals from raw transfers — this is route-level aggregation, not a lib/api/ composite function.
**How to avoid:** The wallet route handler aggregates the raw transfer arrays into the `WalletActivityResponse` shape. Note: `Transfer.amount` is in lamports (for SOL) — divide by `1_000_000_000` to get SOL. Use `transfer.flow === 'in'` to separate directions.
**Warning signs:** `totalIn` showing absurdly large numbers (forgetting lamport conversion).

### Pitfall 7: `getReflectionDistributions` vs LP Fees for R5 vs R8

**What goes wrong:** R5 (Reflections Terminal) and R8 (LP Fees) both source data from the LP wallet. `getReflectionDistributions` returns outbound transfers (distributions to holders). `getLpFeeInflows` returns inbound transfers (fees earned).
**Why it happens:** The reflections.ts module serves two requirements with separate functions.
**How to avoid:** The `/api/lp-fees/route.ts` calls `getLpFeeInflows()` + `getFeeDistribution()` for R8. R5 (Reflections Terminal) is a Phase 8 concern — the `/api/holders/route.ts` only handles holder data in Phase 3. The `getReflectionDistributions()` function can be called in Phase 8 from a dedicated reflections route if needed.

---

## Code Examples

Verified patterns from official sources and existing Phase 2 code:

### Complete Burns Route (new route, 15-line proxy pattern)

```typescript
// Source: Pattern from existing treasury route + burns.ts composite function
// File: src/app/api/burns/route.ts
import { NextResponse } from 'next/server'
import { getBurnSummary } from '@/lib/api/burns'

export const revalidate = 300

export async function GET() {
  try {
    const data = await getBurnSummary()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[burns API]', err)
    return NextResponse.json(
      { error: 'Burns fetch failed' },
      { status: 500 }
    )
  }
}
```

### Complete Holders Route

```typescript
// Source: Pattern from existing hall-of-fame route + solscan.ts getTop100Holders
// File: src/app/api/holders/route.ts
import { NextResponse } from 'next/server'
import { getTop100Holders } from '@/lib/api/solscan'
import { BRAIN_TOKEN_MINT } from '@/lib/constants'

export const revalidate = 300

export async function GET() {
  try {
    const holders = await getTop100Holders(BRAIN_TOKEN_MINT)
    return NextResponse.json(holders)
  } catch (err) {
    console.error('[holders API]', err)
    return NextResponse.json(
      { error: 'Holder data fetch failed' },
      { status: 500 }
    )
  }
}
```

### Complete Wallet Dynamic Route

```typescript
// Source: Next.js route.md — params is a Promise in Next.js 15+/16
// File: src/app/api/wallet/[address]/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAllAccountTransfers } from '@/lib/api/solscan'
import type { WalletActivityResponse } from '@/lib/api/types'

export const revalidate = 300

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params  // MUST await in Next.js 15+/16
  try {
    const [inTransfers, outTransfers] = await Promise.all([
      getAllAccountTransfers(address, { flow: 'in' }),
      getAllAccountTransfers(address, { flow: 'out' }),
    ])

    // Convert lamports to SOL (1 SOL = 1_000_000_000 lamports)
    const LAMPORTS = 1_000_000_000

    const transactions = [
      ...inTransfers.map(t => ({
        txHash: t.trans_id,
        timestamp: t.block_time,
        amount: t.amount / LAMPORTS,
        flow: 'in' as const,
      })),
      ...outTransfers.map(t => ({
        txHash: t.trans_id,
        timestamp: t.block_time,
        amount: t.amount / LAMPORTS,
        flow: 'out' as const,
      })),
    ].sort((a, b) => b.timestamp - a.timestamp)

    const totalIn = inTransfers.reduce((s, t) => s + t.amount / LAMPORTS, 0)
    const totalOut = outTransfers.reduce((s, t) => s + t.amount / LAMPORTS, 0)

    const data: WalletActivityResponse = {
      totalIn,
      totalOut,
      netBalance: totalIn - totalOut,
      transactions,
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error(`[wallet API] ${address}`, err)
    return NextResponse.json({ error: 'Wallet fetch failed' }, { status: 500 })
  }
}
```

### useQuery Hook (v5 pattern) — useBurns example

```typescript
// Source: @tanstack/react-query v5.95.2 — single-options-object API
// File: src/hooks/useBurns.ts
'use client'
import { useQuery } from '@tanstack/react-query'
import type { BurnSummaryResponse } from '@/lib/api/types'

export function useBurns() {
  return useQuery<BurnSummaryResponse, Error>({
    queryKey: ['burns'],
    queryFn: async () => {
      const res = await fetch('/api/burns')
      if (!res.ok) throw new Error(`Burns API ${res.status}`)
      return res.json() as Promise<BurnSummaryResponse>
    },
    staleTime: 5 * 60 * 1000,      // 5 min stale — burn data rarely changes
    refetchInterval: 5 * 60 * 1000, // 5 min background refetch
  })
}
```

### QueryProvider — Current State (no changes needed)

```typescript
// Source: src/providers/query-client.tsx — ALREADY CORRECT
// QueryClient global defaults: staleTime: 60s, refetchOnWindowFocus: false
// Per-query overrides take precedence over global defaults
// Per React Query v5 docs: staleTime in global defaults is a floor, not a ceiling
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `params` is plain object in route handlers | `params` is `Promise<{...}>` — must `await params` | Next.js 15.0.0-RC | Any dynamic route that doesn't await params will fail |
| GET Route Handlers cached by default | GET Route Handlers NOT cached by default | Next.js 15.0.0-RC | Must add `export const revalidate = N` to every route |
| `useQuery(key, fn, options)` — 3 args | `useQuery({ queryKey, queryFn, ...options })` — 1 object | React Query v5 | No 3-arg form accepted; TypeScript will catch if using old pattern |
| `onError` callback in useQuery | No `onError` in v5 — use `result.error` or `throwOnError` | React Query v5 | Error handling must be changed if you were using callbacks |
| `cache: 'no-store'` vs `next.revalidate` | Same — `no-store` bypasses ISR; `next: { revalidate: N }` enables ISR | Current | The lib/api/ wrappers use `next: { revalidate }` which is correct for server caching |

**Deprecated/outdated:**
- `NextResponse.json()` is still valid (backward compat) but `Response.json()` is the Web API standard and preferred in Next.js 16 docs
- `useQuery(queryKey, queryFn, options)` 3-argument form: removed in React Query v5; use single-object form

---

## Open Questions

1. **Does `/api/holders/` duplicate `/api/hall-of-fame/`?**
   - What we know: Both call `getTop100Holders(BRAIN_TOKEN_MINT)` with `revalidate = 300`
   - What's unclear: Should Phase 3 create `/api/holders/` as a separate file, or should it be the same file?
   - Recommendation: Create `/api/holders/route.ts` as the canonical name for war room. Keep `/api/hall-of-fame/route.ts` for the landing page component that already uses that URL. They are identical implementations.

2. **Does `PriceResponse.marketCap` need a different Birdeye endpoint?**
   - What we know: `getMultiTokenPrices` and `getTokenPrice` do NOT return market cap or volume from Birdeye `/defi/price`. The `PriceResponse` type has `marketCap?` and `volume24h?` as optional fields.
   - What's unclear: Whether Birdeye's `token_overview` or `market_overview` endpoints return these — not researched (would require Birdeye plan upgrade or different endpoint).
   - Recommendation: Return `undefined` for `marketCap` and `volume24h` in Phase 3. Phase 4 CommandHeader component can show "N/A" or hide those fields when undefined. Do NOT add a second Birdeye API call just for market cap.

3. **QueryProvider `staleTime` global default vs per-hook overrides**
   - What we know: QueryProvider sets `staleTime: 60 * 1000` globally. Per-query `staleTime` overrides the global default.
   - What's unclear: Whether any hooks need a LOWER staleTime than 60s (would require global default change).
   - Recommendation: Price hook uses `staleTime: 30 * 1000` (30s) to ensure prices feel live. All other hooks use 300s (5 min) since they're transaction history. No change needed to QueryProvider.

---

## Route-by-Route Build Summary

| Route File | Status | lib/api/ Call | revalidate | types.ts Type |
|------------|--------|---------------|------------|---------------|
| `/api/treasury/route.ts` | EXISTS (Phase 2) | `getTreasuryValuations()` | 60 | `TreasuryResponse` |
| `/api/hall-of-fame/route.ts` | EXISTS (Phase 2) | `getTop100Holders()` | 300 | `HolderResponse[]` |
| `/api/price/route.ts` | NEW | `getMultiTokenPrices([BRAIN, SOL])` | 60 | `PriceResponse` |
| `/api/burns/route.ts` | NEW | `getBurnSummary()` | 300 | `BurnSummaryResponse` |
| `/api/holders/route.ts` | NEW (canonical) | `getTop100Holders()` | 300 | `HolderResponse[]` |
| `/api/wallet/[address]/route.ts` | NEW (dynamic) | `getAllAccountTransfers()` ×2 | 300 | `WalletActivityResponse` |
| `/api/lp-fees/route.ts` | NEW | `getLpFeeInflows()` + `getFeeDistribution()` | 300 | `LpFeeResponse` |

## Hook-by-Route Build Summary

| Hook File | Route Called | refetchInterval | Consumers |
|-----------|-------------|-----------------|-----------|
| `usePrice.ts` | `/api/price` | 60s | R1 CommandHeader |
| `useTreasury.ts` | `/api/treasury` | 60s | R2 TreasuryIntel |
| `useBurns.ts` | `/api/burns` | 300s | R3 BurnOperations |
| `useHolders.ts` | `/api/holders` | 300s | R5 ReflectionsTerminal |
| `useWallet.ts` | `/api/wallet/[address]` | 300s | R6 MarketingOps, R7 DevDiscretionary, R8 LpFees |
| `useLpFees.ts` | `/api/lp-fees` | 300s | R4 FeeDistribution, R8 LpFees |

---

## Sources

### Primary (HIGH confidence)

- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md` — Route Handler API reference, params-as-Promise change, caching defaults
- `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` — Route Handler caching defaults for Next.js 15+/16
- `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md` — Previous caching model (the one this project uses), `revalidate` literal requirement
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/fetch.md` — `next: { revalidate }` option semantics
- `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/cacheComponents.md` — Confirmed `cacheComponents` flag is opt-in; not enabled in this project
- `src/lib/api/types.ts` — Canonical API contract for all route responses
- `src/lib/api/treasury.ts`, `burns.ts`, `reflections.ts` — Composite functions Phase 3 routes will call
- `src/app/api/treasury/route.ts`, `src/app/api/hall-of-fame/route.ts` — Existing canonical route patterns
- `src/providers/query-client.tsx` — Existing QueryProvider with global defaults
- `@tanstack/react-query` v5.95.2 — Verified from package.json; single-object useQuery API

### Secondary (MEDIUM confidence)

- `node_modules/@tanstack/react-query/build/legacy/index.d.ts` — Exported symbols confirm v5 API shape (`queryOptions`, `useQuery`, etc.)

### Tertiary (LOW confidence)

- None — all critical findings verified from source files or bundled docs.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified from package.json; versions confirmed
- Architecture: HIGH — patterns derived from existing working code + official Next.js docs
- Pitfalls: HIGH — params-as-Promise verified from bundled Next.js docs changelog; revalidate literal requirement verified from docs

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (stable libraries; Next.js 16 on a known version)
