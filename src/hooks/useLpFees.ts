'use client'

import { useQuery } from '@tanstack/react-query'
import type { LpFeeResponse } from '@/lib/api/types'

export function useLpFees() {
  return useQuery<LpFeeResponse, Error>({
    queryKey: ['lp-fees'],
    queryFn: async () => {
      const res = await fetch('/api/lp-fees')
      if (!res.ok) throw new Error('LP fees fetch failed')
      return res.json() as Promise<LpFeeResponse>
    },
    staleTime: 300_000,
    refetchInterval: 300_000,
  })
}
