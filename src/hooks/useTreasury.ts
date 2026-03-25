'use client'

import { useQuery } from '@tanstack/react-query'
import type { TreasuryResponse } from '@/lib/api/types'

export function useTreasury() {
  return useQuery<TreasuryResponse, Error>({
    queryKey: ['treasury'],
    queryFn: async () => {
      const res = await fetch('/api/treasury')
      if (!res.ok) throw new Error('Treasury fetch failed')
      return res.json() as Promise<TreasuryResponse>
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}
