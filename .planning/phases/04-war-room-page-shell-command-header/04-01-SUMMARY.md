---
phase: 04-war-room-page-shell-command-header
plan: 01
subsystem: ui
tags: [nextjs, react-query, gsap, tailwind, dashboard, price-display]

# Dependency graph
requires:
  - phase: 03-nextjs-api-routes-react-query-setup
    provides: usePrice hook returning PriceResponse (priceUsd, priceSol, priceChange24h, marketCap?, volume24h?)
  - phase: 02-api-layer
    provides: /api/price route handler fetching Birdeye price data
provides:
  - War Room page shell at /war-room (Server Component, ready for Phase 5+ sections)
  - CommandHeader component with live $BRAIN price display (Client Component)
  - HeroMenu War Room nav item (first position, href=/war-room)
  - WarRoom landing page section ENTER WAR ROOM CTA button
affects: [05, 06, 07, 08, 09, 10, 11, 12]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Server Component page shell + Client Component leaf (page.tsx imports CommandHeader)
    - usePrice hook as single data source for connection status, prices, change color
    - Unicode redaction blocks (████) for loading state — no shimmer/skeleton
    - CLASSIFIED badge for always-undefined Birdeye fields (marketCap, volume24h)
    - GSAP entrance with gsap.context().revert() cleanup in Client Component

key-files:
  created:
    - src/components/dashboard/CommandHeader.tsx
  modified:
    - src/app/war-room/page.tsx
    - src/components/HeroMenu.tsx
    - src/components/WarRoom.tsx

key-decisions:
  - "CommandHeader is 'use client' leaf; page.tsx is Server Component — canonical Next.js 16 split"
  - "marketCap and volume24h always show CLASSIFIED badge (Birdeye limitation — fields are always undefined)"
  - "Connection status derived from usePrice hook state: isError=OFFLINE, isLoading=CONNECTING..., data=LIVE"
  - "Loading state uses unicode full-block characters (U+2588) matching classified/redaction aesthetic"
  - "GSAP entrance animation added to CommandHeader: fromTo y:-20 opacity:0 => y:0 opacity:1 over 0.8s"

patterns-established:
  - "Dashboard components live in src/components/dashboard/ subdirectory"
  - "War Room page has no max-width constraint on CommandHeader (full viewport command bar)"
  - "Section-level noise overlay (mix-blend-screen) supplements global layout.tsx noise-overlay"

requirements-completed: [R1, R10]

# Metrics
duration: 15min
completed: 2026-03-25
---

# Phase 4 Plan 01: War Room Page Shell & CommandHeader Summary

**War Room page shell at /war-room with live $BRAIN price CommandHeader using React Query, CLASSIFIED badges for Birdeye-limited fields, and landing page navigation via HeroMenu + WarRoom section CTA**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-25T08:11:38Z
- **Completed:** 2026-03-25T08:26:00Z
- **Tasks:** 2 (Task 3 is human-verify checkpoint)
- **Files modified:** 4

## Accomplishments
- Created CommandHeader.tsx as 'use client' component consuming usePrice hook with live $BRAIN price data
- Upgraded war-room/page.tsx from stub to full Server Component shell with ambient glow background and section slots
- Added War Room as first item in HeroMenu pill navigation (href=/war-room, external: false)
- Added "ENTER WAR ROOM" Link CTA button to landing page WarRoom section below terminal window

## Task Commits

Each task was committed atomically:

1. **Task 1: Create CommandHeader and upgrade War Room page shell** - `7173cef` (feat)
2. **Task 2: Wire navigation from landing page to War Room** - `65e5642` (feat)

_Task 3 is a checkpoint:human-verify — awaiting visual confirmation._

## Files Created/Modified
- `src/components/dashboard/CommandHeader.tsx` - 'use client' component with live price display, redaction loading, CLASSIFIED badges, GSAP entrance
- `src/app/war-room/page.tsx` - Server Component shell with ambient glow background, imports CommandHeader, section slots for Phase 5+
- `src/components/HeroMenu.tsx` - Added war_room as first menuItem with dashboard/layout SVG icon
- `src/components/WarRoom.tsx` - Added Link import + "ENTER WAR ROOM" CTA button after terminal window

## Decisions Made
- CommandHeader is a `'use client'` leaf; page.tsx is a Server Component — canonical Next.js 16 pattern
- marketCap and volume24h always show CLASSIFIED badge since Birdeye never returns these fields
- Connection status derived from usePrice hook state (no separate API call)
- Loading state uses unicode full-block characters (████) not shimmer/skeleton — matches classified aesthetic
- GSAP entrance animation: `gsap.fromTo` y:-20 opacity:0 to y:0 opacity:1 over 0.8s with gsap.context cleanup

## Deviations from Plan

**1. [Rule 2 - Missing Critical] Added missing Link import to WarRoom.tsx**
- **Found during:** Task 2 (Wire navigation)
- **Issue:** Plan specified adding a `<Link>` component to WarRoom.tsx and said "verify first if already imported" — it was NOT imported despite the plan assuming it might be
- **Fix:** Added `import Link from "next/link"` to WarRoom.tsx
- **Files modified:** src/components/WarRoom.tsx
- **Verification:** Build passes with no import errors
- **Committed in:** 65e5642 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 2 - missing import)
**Impact on plan:** Essential for Task 2 CTA button to compile. No scope creep.

## Issues Encountered
- None — Birdeye API 401/429 errors appeared in build output are runtime-only (static generation hitting rate limits), not build errors. Build succeeded cleanly.

## User Setup Required
None - no external service configuration required for this plan. API keys already configured.

## Next Phase Readiness
- /war-room page shell ready to receive Phase 5+ section components (TreasuryIntel, BurnOperations, FeeDistribution, etc.)
- CommandHeader provides full-width command bar at top of every War Room phase
- Both navigation entry points working (HeroMenu pill + WarRoom section CTA)
- Awaiting Task 3 human visual verification before marking plan complete

---
*Phase: 04-war-room-page-shell-command-header*
*Completed: 2026-03-25*
