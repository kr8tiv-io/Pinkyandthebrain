// src/lib/api/solscan.ts
// Server-side only — do NOT import in client components
// Solscan Pro v2 wrapper for account transfers, token transfers, and token holders
// Source: https://pro-api.solscan.io/pro-api-docs/v2.0

import { SOLSCAN_API_BASE } from '@/lib/constants'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Transfer {
  trans_id: string
  block_time: number      // Unix timestamp
  time: string            // Human-readable datetime string
  activity_type: string
  from_address: string
  to_address: string
  token_address: string
  token_decimals: number
  amount: number
  flow: 'in' | 'out'
}

export interface TokenTransfer {
  trans_id: string
  block_time: number
  from_address: string
  to_address: string
  token_address: string
  token_decimals: number
  amount: number
}

export interface Holder {
  address: string
  amount: number
  decimals: number
  owner: string
  rank: number
}

// ─── Private helpers ──────────────────────────────────────────────────────────

function solscanHeaders(): Record<string, string> {
  return {
    token: process.env.SOLSCAN_API_KEY!,
  }
}

// ─── Account Transfer exports ─────────────────────────────────────────────────

/**
 * Returns transfers for a wallet address, with optional filters.
 * Uses /account/transfer endpoint — keyed on wallet address.
 * Cache: 300 seconds.
 */
export async function getAccountTransfers(
  address: string,
  options: {
    flow?: 'in' | 'out'
    token?: string
    from?: string
    to?: string
    page?: number
    page_size?: number
    from_time?: number
    to_time?: number
  } = {}
): Promise<Transfer[]> {
  const params = new URLSearchParams({ address })

  // Only append defined options — skip undefined values
  const { flow, token, from, to, page, page_size, from_time, to_time } = options
  if (flow !== undefined) params.set('flow', flow)
  if (token !== undefined) params.set('token', token)
  if (from !== undefined) params.set('from', from)
  if (to !== undefined) params.set('to', to)
  if (page !== undefined) params.set('page', String(page))
  if (from_time !== undefined) params.set('from_time', String(from_time))
  if (to_time !== undefined) params.set('to_time', String(to_time))

  // Default page_size to 50 if not specified
  params.set('page_size', String(page_size ?? 50))

  const res = await fetch(`${SOLSCAN_API_BASE}/account/transfer?${params.toString()}`, {
    headers: solscanHeaders(),
    next: { revalidate: 300 },
  })
  if (!res.ok) {
    throw new Error(`Solscan getAccountTransfers failed: ${res.status} ${res.statusText}`)
  }
  const json = (await res.json()) as { success: boolean; data?: Transfer[] }
  return json.data ?? []
}

// Options type for account transfer pagination (excludes page — managed internally)
type AccountTransferOptions = {
  flow?: 'in' | 'out'
  token?: string
  from?: string
  to?: string
  page_size?: number
  from_time?: number
  to_time?: number
}

/**
 * Pagination helper that fetches ALL account transfers across multiple pages.
 * Continues fetching until a page is shorter than page_size or empty.
 * Safety limit: max 10 pages to prevent infinite loops.
 */
export async function getAllAccountTransfers(
  address: string,
  options: AccountTransferOptions = {}
): Promise<Transfer[]> {
  const pageSize = options.page_size ?? 50
  const allTransfers: Transfer[] = []
  const MAX_PAGES = 10

  for (let page = 1; page <= MAX_PAGES; page++) {
    const transfers = await getAccountTransfers(address, {
      ...options,
      page,
      page_size: pageSize,
    })

    allTransfers.push(...transfers)

    // Stop if we got a shorter page (last page) or empty result
    if (transfers.length < pageSize) break
  }

  return allTransfers
}

// ─── Token Transfer exports ───────────────────────────────────────────────────

/**
 * Returns SPL token transfers for a token mint address, with optional filters.
 * Uses /token/transfer endpoint — keyed on token mint address.
 * Use from/to filters for burn detection (BURN_SOURCE → BURN_DESTINATION).
 * Cache: 300 seconds.
 */
export async function getTokenTransfers(
  tokenMint: string,
  options: {
    from?: string
    to?: string
    page?: number
    page_size?: number
    from_time?: number
    to_time?: number
  } = {}
): Promise<TokenTransfer[]> {
  const params = new URLSearchParams({ address: tokenMint })

  const { from, to, page, page_size, from_time, to_time } = options
  if (from !== undefined) params.set('from', from)
  if (to !== undefined) params.set('to', to)
  if (page !== undefined) params.set('page', String(page))
  if (from_time !== undefined) params.set('from_time', String(from_time))
  if (to_time !== undefined) params.set('to_time', String(to_time))

  params.set('page_size', String(page_size ?? 50))

  const res = await fetch(`${SOLSCAN_API_BASE}/token/transfer?${params.toString()}`, {
    headers: solscanHeaders(),
    next: { revalidate: 300 },
  })
  if (!res.ok) {
    throw new Error(`Solscan getTokenTransfers failed: ${res.status} ${res.statusText}`)
  }
  const json = (await res.json()) as { success: boolean; data?: TokenTransfer[] }
  return json.data ?? []
}

// Options type for token transfer pagination (excludes page — managed internally)
type TokenTransferOptions = {
  from?: string
  to?: string
  page_size?: number
  from_time?: number
  to_time?: number
}

/**
 * Pagination helper that fetches ALL token transfers across multiple pages.
 * Same pattern as getAllAccountTransfers with max 10 pages safety limit.
 */
export async function getAllTokenTransfers(
  tokenMint: string,
  options: TokenTransferOptions = {}
): Promise<TokenTransfer[]> {
  const pageSize = options.page_size ?? 50
  const allTransfers: TokenTransfer[] = []
  const MAX_PAGES = 10

  for (let page = 1; page <= MAX_PAGES; page++) {
    const transfers = await getTokenTransfers(tokenMint, {
      ...options,
      page,
      page_size: pageSize,
    })

    allTransfers.push(...transfers)

    if (transfers.length < pageSize) break
  }

  return allTransfers
}

// ─── Token Holders exports ────────────────────────────────────────────────────

/**
 * Returns token holder data for a mint address.
 * CRITICAL: page_size ONLY accepts 10, 20, 30, or 40 — other values cause a 400 error.
 * Cache: 300 seconds.
 */
export async function getTokenHolders(
  tokenMint: string,
  page = 1,
  page_size: 10 | 20 | 30 | 40 = 40
): Promise<{ total: number; items: Holder[] }> {
  const params = new URLSearchParams({
    address: tokenMint,
    page: String(page),
    page_size: String(page_size),
  })

  const res = await fetch(`${SOLSCAN_API_BASE}/token/holders?${params.toString()}`, {
    headers: solscanHeaders(),
    next: { revalidate: 300 },
  })
  if (!res.ok) {
    throw new Error(`Solscan getTokenHolders failed: ${res.status} ${res.statusText}`)
  }
  const json = (await res.json()) as {
    success: boolean
    data?: { total?: number; items?: Holder[] }
  }
  return {
    total: json.data?.total ?? 0,
    items: json.data?.items ?? [],
  }
}

/**
 * Fetches up to 100 top holders by fetching pages 1, 2, 3 in parallel (40 items each).
 * Returns sorted by rank, capped at 100 items.
 */
export async function getTop100Holders(tokenMint: string): Promise<Holder[]> {
  // Fetch 3 pages of 40 in parallel = up to 120 items
  const [page1, page2, page3] = await Promise.all([
    getTokenHolders(tokenMint, 1, 40),
    getTokenHolders(tokenMint, 2, 40),
    getTokenHolders(tokenMint, 3, 40),
  ])

  const allHolders = [...page1.items, ...page2.items, ...page3.items]

  // Sort by rank ascending and cap at 100
  return allHolders.sort((a, b) => a.rank - b.rank).slice(0, 100)
}
