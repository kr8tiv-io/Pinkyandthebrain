---
phase: 06-burn-operations-section
type: research
confidence: HIGH
---

# Phase 6 Research: Burn Operations Section

## Requirements
- **R3**: Total $BRAIN burned from G4vH7...→1nc1nerator. % of supply burned. % burned + LP locked. Burn transactions table (date, amount, tx hash + Solscan link). "INCINERATED" visual treatment.
- **R10**: Match existing classified/dark ops aesthetic exactly.

## Pre-Built Infrastructure (100% complete)

### API Layer
- `src/lib/api/burns.ts` — `getBurnSummary()` returns `{ totalBurned, totalSupply, burnedPct, transactions[] }`
- Each transaction: `{ txHash, timestamp, amount }` (human-readable amounts, sorted newest first)
- burnedPct = totalBurned / (totalBurned + currentSupply) * 100

### API Route
- `src/app/api/burns/route.ts` — GET `/api/burns`, revalidate=300

### React Query Hook
- `src/hooks/useBurns.ts` — `useBurns()` returns `UseQueryResult<BurnSummaryResponse>`
- staleTime=300s, refetchInterval=300s

### Types
- `src/lib/api/types.ts` — `BurnSummaryResponse` matches BurnSummary interface exactly

### Constants
- BURN_SOURCE: `G4vH7anfjEt7WXyT3eAzie3NZRE7ywdgKgcqLVkaHTA8`
- BURN_DESTINATION: `1nc1nerator11111111111111111111111111111111`
- BRAIN_TOKEN_MINT: `7r9RJw6gWbj6s1N9pGKrdzzd5H7oK1sauuwkUDVKBAGS`

## What Needs Building

### BurnOperations.tsx (single new file)
Client component in `src/components/dashboard/` consuming `useBurns()`.

#### Sub-components:
1. **Section header** — "BURN OPERATIONS — INCINERATED" + classification badge
2. **Summary bar** — 3-cell grid: Total Burned, % Supply Burned, % Burned + LP Locked
3. **Burn transactions table** — date, amount, tx hash (truncated) with Solscan links
4. **"INCINERATED" visual treatment** — red/orange glow accent instead of green

### Wire into page.tsx
Add `<BurnOperations />` below `<TreasuryIntel />` in war-room/page.tsx.

## Design Patterns (from TreasuryIntel.tsx)

| Pattern | Implementation |
|---------|---------------|
| Directive | `'use client'` |
| Data hook | `const { data, isLoading, isError } = useBurns()` |
| Section wrapper | `<section className="w-full border-b border-[#333] bg-[#0d0d0d]">` |
| Section header | flex justify-between, font-mono text-xs uppercase tracking-[0.3em] |
| Summary cells | grid divide-x divide-[#333]/50, px-6 py-5, text-2xl font-black tabular-nums |
| Loading state | `████████` in accent color |
| Error state | `—` in #ff9e9e |
| Labels | font-mono text-[10px] uppercase tracking-widest text-[#666] |
| Links | font-mono text-[10px] text-[#d4f000] hover:underline, target="_blank" |
| Date formatting | `date-fns` `format(fromUnixTime(ts), 'yyyy-MM-dd HH:mm')` |
| Number formatting | `.toLocaleString()` for amounts |

## Key Considerations

1. **"% burned + LP locked"** — R3 requires this composite metric. LP locked percentage is not available from the burn API. Options:
   - Hardcode LP locked % as a constant (simplest, LP lock doesn't change)
   - Display as separate line items if LP data unavailable
   - **Recommendation:** Add `LP_LOCKED_PCT` constant to constants.ts (LP locks are static events)

2. **INCINERATED visual treatment** — Use warm red/orange (#ff6b35 or #ff4500) for burn-specific accent instead of the green #d4f000. Keep the dark ops aesthetic but with "fire" tones for this section specifically.

3. **Table pagination** — Burns may have 20+ transactions. Show all in a scrollable table (overflow-y-auto, max-h) or paginate client-side. Recommendation: scrollable with max-height.

4. **Transaction amount formatting** — Large burn amounts (millions) should use compact notation or full comma-separated display.

## Complexity Assessment
- **Effort:** Low-Medium (single component, all data pre-built)
- **Risk:** Low (straightforward UI rendering)
- **Plans needed:** 1 (build + wire in single plan)
