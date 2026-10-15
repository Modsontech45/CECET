import { useQuery } from '@tanstack/react-query'
import { get } from '@/lib/api'
import { formatBps } from '@/lib/format'
import type { PackFamily, PackPlan } from './types'

export function usePublicPacks() {
  return useQuery({ queryKey: ['public-packs'], queryFn: () => get<PackPlan[]>('/packs'), staleTime: 5 * 60_000 })
}

export function formulasLabel(plans: PackPlan[] | undefined, family: PackFamily): string {
  const codes = (plans ?? []).filter((plan) => plan.family === family).map((plan) => plan.code)
  if (codes.length < 2) return ''
  return `${codes[0]}-${codes[codes.length - 1]}`
}

export function discountRange(plans: PackPlan[] | undefined): string | null {
  const rates = (plans ?? []).map((plan) => plan.current_version?.rules.discount_bps).filter((rate): rate is number => typeof rate === 'number' && rate > 0)
  if (rates.length === 0) return null
  const low = Math.min(...rates)
  const high = Math.max(...rates)
  return low === high ? formatBps(low) : `${formatBps(low).replace(/\s?%$/, '')} a ${formatBps(high)}`
}
