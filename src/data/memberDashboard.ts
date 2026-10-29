import { get } from '@/lib/api'

export type PackFamily = 'VENDEUR' | 'CONSOMMATEUR' | 'PERSONNEL' | 'MARCHAND'

export interface MemberPack {
  id: string
  family: PackFamily
  code: string
  name: string
  price_xof: number
  status: 'active' | 'pending_payment'
  discount_bps: number | null
  quota_per_period: string
  quota_used: string
  quota_available: string
  quota_reserved: string
  quota_consumed: string
  period: { number: number; cycles: number; starts_at: string; ends_at: string; next_credit_at: string } | null
}

export interface LedgerEntry {
  id: string
  date: string
  label: string
  direction: 'credit' | 'debit'
  quantity: string
  state: 'posted' | 'reserved'
}

export interface OperationInProgress {
  id: string
  reference: string
  kind: 'merchant_payment' | 'exchange_request'
  label: string
  quantity: string
  status: string
  step: number
  steps: { label: string; description: string }[]
  created_at: string
}

export interface MemberNotification {
  id: string
  title: string
  detail: string
  date: string
  tone: 'success' | 'info' | 'warning'
}

export interface MemberDocument {
  id: string
  label: string
  date: string
  size: string
}

export interface MemberDashboardData {
  profile: {
    name: string
    pernum: string
    member_number: string | null
    email: string
    phone: string
    city: string
    kind: 'natural' | 'legal'
    member_since: string | null
  }
  membership: { status: 'active' | 'pending_payment'; activated_at: string | null }
  balance: { available: string; reserved: string; total_credited: string; total_spent: string }
  packs: MemberPack[]
  monthly_activity: { month: string; credit: number; debit: number }[]
  operations_in_progress: OperationInProgress[]
  ledger: LedgerEntry[]
  notifications: MemberNotification[]
  documents: MemberDocument[]
}

interface ApiDashboard {
  profile: { name: string; member_number: string | null; pernum: string | null; email: string; phone: string | null; city: string | null; person_type: string | null; status: string }
  membership: { status: string; paid: boolean; member_since: string | null } | null
  yem: { balance: string; reserved: string; total_credited: string; total_spent: string }
  active_packs: {
    id: string
    family: PackFamily
    code: string
    name: string
    price_xof: number
    quota_per_period: string | null
    discount_bps: number | null
    available: string | null
    reserved: string | null
    consumed: string | null
    period: MemberPack['period']
    activated_at: string | null
    expires_at: string | null
  }[]
  recent_movements: { id: string; date: string; label: string; type: string; direction: 'credit' | 'debit' | 'neutral'; quantity: string; user_pack_id: string }[]
  monthly_activity: { month: string; credit: string; debit: string }[]
  operations: { type: 'exchange' | 'merchant_payment'; id: string; reference: string; kind: string; status: string; quantity: string; label: string | null; created_at: string }[]
  payments_awaiting_action: { id: string; reference: string; status: string }[]
}

const MERCHANT_STEPS: OperationInProgress['steps'] = [
  { label: 'Intention créée', description: 'YEM réservés sur votre pack' },
  { label: 'Transfert effectué', description: 'Vous envoyez les YEM au marchand' },
  { label: 'Confirmation du marchand', description: 'En attente de sa réception' },
  { label: 'Paiement finalisé', description: 'Quota consommé' },
]

const EXCHANGE_STEPS: OperationInProgress['steps'] = [
  { label: 'Demande créée', description: 'YEM réservés sur votre pack' },
  { label: 'YEM envoyés', description: 'Vous transférez les YEM à la CECT' },
  { label: 'Réception contrôlée', description: 'Un validateur confirme la réception' },
  { label: 'Versement', description: 'Le montant est versé en FCFA' },
]

function stepOf(status: string): number {
  if (status === 'reserved' || status === 'awaiting_transfer') return 1
  if (status === 'declared_sent') return 2
  return 3
}

function addQuantity(a: string, b: string): string {
  return String(Number.parseFloat(a) + Number.parseFloat(b))
}

const monthFormatter = new Intl.DateTimeFormat('fr-FR', { month: 'short' })

function monthLabel(key: string): string {
  const [year = '1970', month = '1'] = key.split('-')
  return monthFormatter.format(new Date(Number(year), Number(month) - 1, 1)).replace('.', '')
}

export async function fetchMemberDashboard(): Promise<MemberDashboardData> {
  const now = new Date()
  const api = await get<ApiDashboard>('/me/dashboard')

  const packs: MemberPack[] = api.active_packs.map((pack) => {
    const reserved  = pack.reserved  ?? '0'
    const consumed  = pack.consumed  ?? '0'
    const available = pack.available ?? '0'
    return {
      id: pack.id,
      family: pack.family,
      code: pack.code,
      name: pack.name,
      price_xof: pack.price_xof,
      status: 'active',
      discount_bps: pack.discount_bps,
      quota_per_period: pack.quota_per_period ?? '0',
      quota_used: addQuantity(reserved, consumed),
      quota_available: available,
      quota_reserved:  reserved,
      quota_consumed:  consumed,
      period: pack.period,
    }
  })

  const operations: OperationInProgress[] = api.operations.map((operation) => ({
    id: operation.id,
    reference: operation.reference,
    kind: operation.type === 'exchange' ? 'exchange_request' : 'merchant_payment',
    label:
      operation.type === 'merchant_payment'
        ? operation.label
          ? `Paiement à ${operation.label}`
          : 'Paiement à un marchand'
        : operation.kind === 'merchant_redemption'
          ? 'Rééchange de YEM vers la CECT'
          : 'Vente de YEM à la CECT',
    quantity: operation.quantity,
    status: operation.status,
    step: stepOf(operation.status),
    steps: operation.type === 'exchange' ? EXCHANGE_STEPS : MERCHANT_STEPS,
    created_at: operation.created_at,
  }))

  const notifications: MemberNotification[] = api.payments_awaiting_action.map((payment) => ({
    id: `pay-${payment.id}`,
    title: 'Paiement en attente',
    detail: `Votre paiement ${payment.reference} attend une action ou une validation.`,
    date: now.toISOString(),
    tone: 'warning',
  }))

  return {
    profile: {
      name: api.profile.name,
      pernum: api.profile.pernum ?? api.profile.member_number ?? '',
      member_number: api.profile.member_number,
      email: api.profile.email,
      phone: api.profile.phone ?? '—',
      city: api.profile.city ?? '—',
      kind: api.profile.person_type === 'legal' ? 'legal' : 'natural',
      member_since: api.membership?.member_since ?? null,
    },
    membership: { status: api.membership?.status === 'active' ? 'active' : 'pending_payment', activated_at: api.membership?.member_since ?? null },
    balance: { available: api.yem.balance, reserved: api.yem.reserved, total_credited: api.yem.total_credited, total_spent: api.yem.total_spent },
    packs,
    monthly_activity: api.monthly_activity.map((month) => ({ month: monthLabel(month.month), credit: Number.parseFloat(month.credit), debit: Number.parseFloat(month.debit) })),
    operations_in_progress: operations,
    ledger: api.recent_movements.map<LedgerEntry>((movement) => ({
      id: movement.id,
      date: movement.date,
      label: movement.label,
      direction: movement.direction === 'credit' ? 'credit' : 'debit',
      quantity: movement.quantity,
      state: movement.type === 'reserve' ? 'reserved' : 'posted',
    })),
    notifications,
    documents: [],
  }
}
