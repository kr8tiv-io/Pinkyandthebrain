'use client'

import { useQuery } from '@tanstack/react-query'
import type { BurnSummaryResponse } from '@/lib/api/types'

export function useBurns() {
  return useQuery<BurnSummaryResponse, Error>({
    queryKey: ['burns'],
    queryFn: async () => {
      const res = await fetch('/api/burns')
      if (!res.ok) throw new Error('Burns fetch failed')
      return res.json() as Promise<BurnSummaryResponse>
    },
    staleTime: 300_000,
    refetchInterval: 300_000,
  })
}
