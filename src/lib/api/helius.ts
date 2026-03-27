// src/lib/api/helius.ts
// Server-side only — do NOT import in client components
// Helius JSON-RPC wrapper for SOL balance, token accounts, and token supply
// Source: https://www.helius.dev/docs/api-reference/rpc/http/

import { HELIUS_RPC_URL } from '@/lib/constants'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TokenAccount {
  mint: string
  uiAmount: number
  amount: string // raw string, preserves full precision
  decimals: number
}

// Internal raw shape from Helius JSON-RPC getTokenAccountsByOwner with jsonParsed encoding
interface RawTokenAccountInfo {
  mint: string
  owner: string
  tokenAmount: {
    amount: string
    decimals: number
    uiAmount: number | null
  }
}

interface RawTokenAccount {
  account: {
    data: {
      parsed: {
        info: RawTokenAccountInfo
      }
    }
  }
  pubkey: string
}

// ─── Private RPC helper ────────────────────────────────────────────────────────

async function rpc<T>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch(HELIUS_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    next: { revalidate: 60 }, // Next.js fetch cache — 60 second TTL
  })
  if (!res.ok) {
    throw new Error(`Helius RPC ${method} failed: ${res.status} ${res.statusText}`)
  }
  const json = (await res.json()) as { result?: T; error?: { message: string } }
  if (json.error) {
    throw new Error(`Helius RPC error in ${method}: ${json.error.message}`)
  }
  return json.result as T
}

// ─── Exports ──────────────────────────────────────────────────────────────────

/**
 * Returns the SOL balance of a wallet in SOL (not lamports).
 */
export async function getSolBalance(wallet: string): Promise<number> {
  const result = await rpc<{ value: number }>('getBalance', [wallet])
  return result.value / 1_000_000_000
}

/**
 * Returns all SPL token accounts owned by a wallet address.
 * Uses the Token Program ID and jsonParsed encoding for human-readable amounts.
 */
export async function getTokenAccountsByOwner(owner: string): Promise<TokenAccount[]> {
  const result = await rpc<{ value: RawTokenAccount[] }>('getTokenAccountsByOwner', [
    owner,
    { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
    { encoding: 'jsonParsed' },
  ])
  return result.value.map((acct) => {
    const info = acct.account.data.parsed.info
    return {
      mint: info.mint,
      uiAmount: info.tokenAmount.uiAmount ?? 0,
      amount: info.tokenAmount.amount,
      decimals: info.tokenAmount.decimals,
    }
  })
}

/**
 * Returns the current token supply for a mint address.
 * amount: raw string (full precision), decimals: number, uiAmount: human-readable number.
 */
export async function getTokenSupply(
  mint: string
): Promise<{ amount: string; decimals: number; uiAmount: number }> {
  const result = await rpc<{
    value: { amount: string; decimals: number; uiAmount: number | null }
  }>('getTokenSupply', [mint])
  return {
    amount: result.value.amount,
    decimals: result.value.decimals,
    uiAmount: result.value.uiAmount ?? 0,
  }
}

/**
 * Returns a specific token balance for an owner+mint pair.
 * Queries getTokenAccountsByOwner filtered by mint, returns uiAmount (0 if not found).
 */
export async function getTokenBalanceForMint(
  owner: string,
  mint: string
): Promise<{ uiAmount: number; amount: string; decimals: number }> {
  const result = await rpc<{ value: RawTokenAccount[] }>('getTokenAccountsByOwner', [
    owner,
    { mint },
    { encoding: 'jsonParsed' },
  ])
  if (result.value.length === 0) {
    return { uiAmount: 0, amount: '0', decimals: 0 }
  }
  const info = result.value[0].account.data.parsed.info
  return {
    uiAmount: info.tokenAmount.uiAmount ?? 0,
    amount: info.tokenAmount.amount,
    decimals: info.tokenAmount.decimals,
  }
}

/**
 * Returns the 20 largest token accounts for a given mint address.
 * Standard Solana RPC method — works on all tiers including free.
 */
export async function getTokenLargestAccounts(
  mint: string
): Promise<{ address: string; amount: string; decimals: number; uiAmount: number }[]> {
  const result = await rpc<{
    value: { address: string; amount: string; decimals: number; uiAmount: number | null }[]
  }>('getTokenLargestAccounts', [mint])
  return result.value.map((acct) => ({
    address: acct.address,
    amount: acct.amount,
    decimals: acct.decimals,
    uiAmount: acct.uiAmount ?? 0,
  }))
}

/**
 * Resolves wallet owners for a batch of token account addresses.
 * Calls getMultipleAccounts with jsonParsed encoding and extracts the owner field.
 */
export async function resolveTokenAccountOwners(
  tokenAccounts: string[]
): Promise<Record<string, string>> {
  if (tokenAccounts.length === 0) return {}

  const result = await rpc<{
    value: (null | {
      data: { parsed: { info: { owner: string } } }
    })[]
  }>('getMultipleAccounts', [tokenAccounts, { encoding: 'jsonParsed' }])

  const owners: Record<string, string> = {}
  result.value.forEach((acct, i) => {
    if (acct?.data?.parsed?.info?.owner) {
      owners[tokenAccounts[i]] = acct.data.parsed.info.owner
    }
  })
  return owners
}

/**
 * Fetches token holders using Helius DAS getTokenAccounts method.
 * Returns paginated results with owner wallet addresses.
 */
export async function getTokenHoldersDAS(
  mint: string,
  page: number = 1,
  limit: number = 100
): Promise<{
  holders: { address: string; owner: string; amount: number; decimals: number }[]
  total: number
}> {
  // Helius DAS methods use params as a direct object, not an array
  const res = await fetch(HELIUS_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'das-holders',
      method: 'getTokenAccounts',
      params: { page, limit, mint },
    }),
    next: { revalidate: 300 },
  })
  if (!res.ok) {
    throw new Error(`Helius DAS getTokenAccounts failed: ${res.status}`)
  }
  const json = (await res.json()) as {
    result?: {
      total: number
      token_accounts: {
        address: string
        mint: string
        owner: string
        amount: number
        delegated_amount: number
        frozen: boolean
      }[]
    }
    error?: { message: string }
  }
  if (json.error) {
    throw new Error(`Helius DAS error: ${json.error.message}`)
  }
  const result = json.result

  return {
    total: result?.total ?? 0,
    holders: (result?.token_accounts ?? []).map((acct) => ({
      address: acct.address,
      owner: acct.owner,
      amount: acct.amount,
      decimals: 9,
    })),
  }
}
