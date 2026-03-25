import { BRAIN_TOKEN_MINT, SOL_MINT } from './constants'

export interface TreasuryHolding {
  mint: string
  symbol: string
  name: string
  purpose: string
  targetAllocation?: number
  category: 'liquidity' | 'investment' | 'reserve' | 'team'
}

export const TREASURY_HOLDINGS: TreasuryHolding[] = [
  {
    mint: SOL_MINT,
    symbol: 'SOL',
    name: 'Solana',
    purpose: 'Primary reserve asset for operations and liquidity',
    category: 'reserve',
  },
  {
    mint: BRAIN_TOKEN_MINT,
    symbol: 'BRAIN',
    name: 'Brain Token',
    purpose: 'Native project token — deflationary with SOL reflections',
    category: 'liquidity',
  },
]

export const HOLDINGS_BY_MINT = Object.fromEntries(
  TREASURY_HOLDINGS.map(h => [h.mint, h])
) as Record<string, TreasuryHolding>
