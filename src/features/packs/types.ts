import { formatBps, formatXof, formatYem } from '@/lib/format'
import type { PaymentAttempt } from '@/features/payments/types'

export type PackFamily = 'VENDEUR' | 'CONSOMMATEUR' | 'PERSONNEL' | 'MARCHAND'

export interface PackVersion {
  id: string
  price_xof: number
  period: { unit: string; every: number; cycles: number | null } | null
  quota_per_period: string | null
  total_quota: string | null
  cumulative: boolean | null
  eligible_person_types: string[]
  rules: { discount_bps?: number; min_topup_xof?: number; reference_value_xof?: number }
}

export interface PackPlan {
  id: string
  family: PackFamily
  code: string
  name: string
  description: string | null
  current_version: PackVersion | null
  eligible: boolean | null
  payment_quote: { net_amount: number; fee_amount: number; total_amount: number } | null
}

export interface UserPack {
  id: string
  status: 'pending_payment' | 'active' | 'expired' | 'canceled' | string
  family: PackFamily
  plan: { id: string; code: string; name: string }
  price_xof: number
  balance: { available: string; reserved: string; consumed: string } | null
  activated_at: string | null
  expires_at: string | null
}

export interface SubscribeResult {
  user_pack: UserPack
  payment: PaymentAttempt | null
}

export const FAMILIES: ReadonlyArray<{ family: PackFamily; title: string; summary: string }> = [
  { family: 'CONSOMMATEUR', title: 'Consommateur', summary: 'Un quota de YEM credite chaque mois pour payer chez les marchands du reseau.' },
  { family: 'PERSONNEL', title: 'Personnel', summary: 'Un solde que vous rechargez a la demande, avec une remise sur chaque rechargement.' },
  { family: 'VENDEUR', title: 'Vendeur', summary: 'Vendez vos YEM a la CECT et recevez le montant en FCFA sur votre moyen de reception.' },
  { family: 'MARCHAND', title: 'Marchand', summary: 'Pour les personnes morales : encaissez des YEM aupres de vos clients et faites-les racheter par la CECT.' },
]

const UNIT_LABELS: Record<string, [string, string]> = {
  day: ['jour', 'jours'],
  week: ['semaine', 'semaines'],
  month: ['mois', 'mois'],
  year: ['an', 'ans'],
}

export function termLabel(version: PackVersion): string | null {
  const period = version.period
  if (!period?.cycles) return null
  const [singular, plural] = UNIT_LABELS[period.unit] ?? [period.unit, period.unit]
  const total = period.cycles * period.every
  return `${total} ${total > 1 ? plural : singular}`
}

export function periodLabel(version: PackVersion): string {
  const period = version.period
  if (!period) return 'a la demande'
  const [singular, plural] = UNIT_LABELS[period.unit] ?? [period.unit, period.unit]
  return period.every > 1 ? `tous les ${period.every} ${plural}` : `par ${singular}`
}

export function packFacts(version: PackVersion): { label: string; value: string }[] {
  const facts: { label: string; value: string }[] = [{ label: 'Prix', value: version.price_xof === 0 ? 'Gratuit' : formatXof(version.price_xof) }]
  if (version.quota_per_period) facts.push({ label: 'Quota', value: `${formatYem(version.quota_per_period)} ${periodLabel(version)}` })
  const term = termLabel(version)
  if (term) facts.push({ label: 'Duree', value: term })
  if (version.total_quota) facts.push({ label: 'Quota total', value: formatYem(version.total_quota) })
  if (version.rules.discount_bps) facts.push({ label: 'Remise', value: formatBps(version.rules.discount_bps) })
  if (version.rules.min_topup_xof) facts.push({ label: 'Rechargement minimum', value: formatXof(version.rules.min_topup_xof) })
  return facts
}
