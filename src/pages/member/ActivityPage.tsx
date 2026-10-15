import { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useInfiniteQuery } from '@tanstack/react-query'
import {
  ArrowDownLeft, ArrowUpRight, Loader2,
  RefreshCw, Sparkles, TrendingDown, TrendingUp,
} from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { getRaw } from '@/lib/api'
import { formatDateMedium, formatYem } from '@/lib/format'
import { useMemberDashboard } from '@/data/useMemberDashboard'
import type { MemberDashboardData } from '@/data/memberDashboard'

/* ── types ──────────────────────────────────────────────── */

interface LedgerRow {
  id: string
  user_pack_id: string
  type: 'credit' | 'reserve' | 'release' | 'consume' | 'expire' | 'adjust'
  available_delta: string
  consumed_delta: string
  reason: string | null
  created_at: string
}
interface LedgerPage { data: LedgerRow[]; next_cursor: string | null }

/* ── meta ────────────────────────────────────────────────── */

const TYPE_META: Record<LedgerRow['type'], {
  label: string; icon: typeof TrendingUp
  color: string; bg: string; statusLabel: string; statusColor: string; statusBg: string; sign: '+' | '−' | ''
}> = {
  credit:  { label: 'Crédit de quota',      icon: ArrowDownLeft, color: 'var(--tone-success-fg)', bg: 'var(--tone-success-bg)', statusLabel: 'Comptabilisé', statusColor: 'var(--tone-success-fg)', statusBg: 'var(--tone-success-bg)', sign: '+' },
  release: { label: 'Réservation libérée',  icon: ArrowDownLeft, color: 'var(--tone-success-fg)', bg: 'var(--tone-success-bg)', statusLabel: 'Comptabilisé', statusColor: 'var(--tone-success-fg)', statusBg: 'var(--tone-success-bg)', sign: '+' },
  reserve: { label: 'Réservation',          icon: ArrowUpRight,  color: 'var(--tone-warning-fg)', bg: 'var(--tone-warning-bg)', statusLabel: 'En attente',   statusColor: 'var(--tone-warning-fg)', statusBg: 'var(--tone-warning-bg)', sign: '−' },
  consume: { label: 'Achat confirmé',       icon: ArrowUpRight,  color: 'var(--color-text-muted)',bg: 'var(--chart-track)',     statusLabel: 'Comptabilisé', statusColor: 'var(--tone-success-fg)', statusBg: 'var(--tone-success-bg)', sign: '−' },
  expire:  { label: 'Quota expiré',         icon: TrendingDown,  color: 'var(--tone-danger-fg)',  bg: 'var(--tone-danger-bg)', statusLabel: 'Expiré',       statusColor: 'var(--tone-danger-fg)',  statusBg: 'var(--tone-danger-bg)',  sign: '−' },
  adjust:  { label: 'Ajustement',           icon: Sparkles,      color: 'var(--tone-info-fg)',    bg: 'var(--tone-info-bg)',   statusLabel: 'Ajusté',       statusColor: 'var(--tone-info-fg)',    statusBg: 'var(--tone-info-bg)',    sign: ''  },
}

function magnitude(row: LedgerRow) {
  const delta = Number.parseFloat(row.type === 'consume' ? row.consumed_delta : row.available_delta)
  if (!Number.isFinite(delta) || delta === 0) return { value: '0', sign: '' as const }
  const sign = TYPE_META[row.type].sign !== '' ? TYPE_META[row.type].sign : (delta > 0 ? '+' : '−') as '+' | '−'
  return { value: String(Math.abs(delta)), sign }
}

/* ── summary stat ────────────────────────────────────────── */

function SummaryCard({ label, value, icon: Icon, positive }: { label: string; value: string; icon: typeof TrendingUp; positive: boolean }) {
  return (
    <div className={`flex flex-col rounded-[18px] px-5 py-4 ${positive ? 'bg-[var(--tone-success-bg)]' : 'bg-[var(--chart-track)]'}`}>
      <div className="flex items-center gap-2">
        <Icon size={13} className={positive ? 'text-[var(--tone-success-fg)]' : 'text-[var(--color-text-muted)]'} aria-hidden />
        <p className={`text-[10px] font-black uppercase tracking-widest ${positive ? 'text-[var(--tone-success-fg)]' : 'text-[var(--color-text-muted)]'}`}>{label}</p>
      </div>
      <p className={`mt-2 text-[26px] font-black leading-none [font-variant-numeric:tabular-nums] ${positive ? 'text-[var(--tone-success-fg)]' : 'text-[var(--color-text)]'}`}>{value}</p>
    </div>
  )
}

/* ── bar chart ───────────────────────────────────────────── */

function MonthlyBars({ data }: { data: MemberDashboardData['monthly_activity'] }) {
  const max = Math.max(...data.flatMap((m) => [m.credit, m.debit]), 1)
  const totalCredit = data.reduce((s, m) => s + m.credit, 0)
  const totalDebit  = data.reduce((s, m) => s + m.debit, 0)

  return (
    <div className="rounded-[22px] border border-[var(--color-border)] bg-[var(--dash-card)] p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[15px] font-black text-[var(--color-text)]">Six derniers mois</h2>
          <p className="mt-0.5 text-[11px] font-bold text-[var(--color-text-muted)]">YEM crédités et dépensés par mois</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:w-72">
          <SummaryCard label="Crédités" value={formatYem(String(totalCredit))} icon={TrendingUp} positive />
          <SummaryCard label="Dépensés" value={formatYem(String(totalDebit))} icon={TrendingDown} positive={false} />
        </div>
      </div>

      {totalCredit === 0 && totalDebit === 0 ? (
        <EmptyState title="Pas encore d'activité" description="Vos crédits et dépenses apparaîtront ici." />
      ) : (
        <>
          <div
            className="flex h-52 items-end gap-3 sm:gap-5"
            role="img"
            aria-label={data.map((m) => `${m.month}: ${m.credit} crédités, ${m.debit} dépensés`).join('; ')}
          >
            {data.map((month) => (
              <div key={month.month} className="flex h-full flex-1 flex-col justify-end gap-1.5">
                <div className="flex flex-1 items-end justify-center gap-1">
                  <div className="w-full max-w-[20px] rounded-t-lg" style={{ height: `${(month.credit / max) * 100}%`, minHeight: month.credit > 0 ? 6 : 0, background: 'var(--chart-1)' }} title={`${month.credit} YEM crédités`} />
                  <div className="w-full max-w-[20px] rounded-t-lg" style={{ height: `${(month.debit / max) * 100}%`,  minHeight: month.debit  > 0 ? 6 : 0, background: 'var(--chart-2)' }} title={`${month.debit} YEM dépensés`} />
                </div>
                <p className="text-center text-[11px] font-black capitalize text-[var(--color-text-muted)]">{month.month}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-5">
            <span className="inline-flex items-center gap-2 text-[11px] font-black text-[var(--tone-success-fg)]"><span className="h-3 w-3 rounded-sm bg-[var(--chart-1)]" aria-hidden /> Crédités</span>
            <span className="inline-flex items-center gap-2 text-[11px] font-black text-[var(--tone-warning-fg)]"><span className="h-3 w-3 rounded-sm bg-[var(--chart-2)]" aria-hidden /> Dépensés</span>
          </div>
        </>
      )}
    </div>
  )
}

/* ── pill filter ─────────────────────────────────────────── */

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-[34px] rounded-xl px-4 text-[12px] font-black transition-all"
      style={active
        ? { background: 'var(--forest-900)', color: 'var(--lime)' }
        : { background: 'var(--chart-track)', color: 'var(--color-text-muted)' }}
    >
      {label}
    </button>
  )
}

/* ── page ────────────────────────────────────────────────── */

const TYPE_FILTERS = [
  { value: 'all',     label: 'Tout' },
  { value: 'credit',  label: 'Crédits' },
  { value: 'consume', label: 'Achats' },
  { value: 'reserve', label: 'Réservations' },
]

export default function ActivityPage() {
  const dashboard = useMemberDashboard()
  const [packId, setPackId] = useState('')
  const [type, setType]     = useState('all')

  const ledger = useInfiniteQuery({
    queryKey: ['ledger', packId],
    queryFn: ({ pageParam }) => getRaw<LedgerPage>('/me/quota-ledger', { per_page: 25, ...(packId ? { user_pack_id: packId } : {}), ...(pageParam ? { cursor: pageParam } : {}) }),
    initialPageParam: '',
    getNextPageParam: (last) => last.next_cursor ?? undefined,
    staleTime: 0,
  })

  const packs     = dashboard.data?.packs ?? []
  const packNames = useMemo(() => new Map(packs.map((p) => [p.id, p.name])), [packs])
  const rows      = (ledger.data?.pages.flatMap((p) => p.data) ?? []).filter((r) => type === 'all' || r.type === type)

  return (
    <>
      <Helmet><title>Activité — CECT Togo</title></Helmet>

      <PageHeader title="Activité" description="Les crédits, achats et réservations de vos packs." />

      <div className="space-y-6">
        {/* chart */}
        {dashboard.data
          ? <MonthlyBars data={dashboard.data.monthly_activity} />
          : <div className="h-60 animate-pulse rounded-[22px] bg-[var(--chart-track)]" />}

        {/* table card */}
        <div className="overflow-hidden rounded-[22px] border border-[var(--color-border)] bg-[var(--dash-card)]">
          {/* card header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border)] px-6 py-5">
            <div>
              <h2 className="text-[15px] font-black text-[var(--color-text)]">Historique des mouvements</h2>
              <p className="mt-0.5 text-[11px] font-bold text-[var(--color-text-muted)]">Toutes vos transactions de quota YEM</p>
            </div>
            {packs.length > 1 && (
              <select
                value={packId}
                onChange={(e) => setPackId(e.target.value)}
                aria-label="Filtrer par pack"
                className="min-h-[36px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-[12px] font-black text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="">Tous les packs</option>
                {packs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            )}
          </div>

          {/* type filters */}
          <div className="flex flex-wrap gap-2 border-b border-[var(--color-border)] px-6 py-3">
            {TYPE_FILTERS.map((f) => <Pill key={f.value} label={f.label} active={type === f.value} onClick={() => setType(f.value)} />)}
          </div>

          {/* column headers */}
          <div className="hidden grid-cols-[2fr_1fr_120px_110px] gap-4 border-b border-[var(--color-border)] px-6 py-3 sm:grid">
            {['Mouvement', 'Pack', 'Date', 'Montant'].map((h, i) => (
              <p key={h} className={`text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ${i === 3 ? 'text-right' : ''}`}>{h}</p>
            ))}
          </div>

          {/* skeleton */}
          {ledger.isPending && (
            <div className="space-y-px p-4">
              {[1,2,3,4,5].map((i) => <div key={i} className="h-[60px] animate-pulse rounded-xl bg-[var(--chart-track)]" />)}
            </div>
          )}

          {/* error */}
          {ledger.isError && (
            <div className="flex flex-col items-center gap-3 py-12">
              <p className="text-sm font-black text-[var(--color-text)]">Impossible de charger les mouvements.</p>
              <button type="button" onClick={() => void ledger.refetch()} className="inline-flex items-center gap-2 rounded-xl bg-[var(--chart-track)] px-4 py-2 text-[12px] font-black">
                <RefreshCw size={13} aria-hidden /> Réessayer
              </button>
            </div>
          )}

          {/* empty */}
          {ledger.data && rows.length === 0 && (
            <EmptyState title="Aucun mouvement" description="Aucun mouvement ne correspond à ces filtres." />
          )}

          {/* rows */}
          {ledger.data && rows.length > 0 && (
            <ul className="divide-y divide-[var(--color-border)]">
              {rows.map((row) => {
                const meta = TYPE_META[row.type]
                const Icon = meta.icon
                const { value, sign } = magnitude(row)
                const label = row.reason && row.type === 'credit' ? row.reason : meta.label
                const packName = packNames.get(row.user_pack_id) ?? 'Pack'
                const isPositive = sign === '+'

                return (
                  <li key={row.id} className="grid grid-cols-1 gap-3 px-6 py-4 transition-colors hover:bg-[var(--chart-track)]/40 sm:grid-cols-[2fr_1fr_120px_110px] sm:items-center sm:gap-4">
                    {/* description */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: meta.bg, color: meta.color }}>
                        <Icon size={15} aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-extrabold text-[var(--color-text)]">{label}</p>
                        <p className="mt-0.5 text-[11px] font-bold text-[var(--color-text-muted)] sm:hidden">{packName} · {formatDateMedium(row.created_at)}</p>
                      </div>
                    </div>

                    {/* pack — desktop */}
                    <p className="hidden truncate text-[12px] font-bold text-[var(--color-text-muted)] sm:block">{packName}</p>

                    {/* date — desktop + status */}
                    <div className="hidden sm:block">
                      <p className="text-[12px] font-bold text-[var(--color-text-muted)]">{formatDateMedium(row.created_at)}</p>
                      <span className="mt-1 inline-block rounded-lg px-2 py-0.5 text-[10px] font-black" style={{ background: meta.statusBg, color: meta.statusColor }}>
                        {meta.statusLabel}
                      </span>
                    </div>

                    {/* amount */}
                    <p
                      className="text-[14px] font-black [font-variant-numeric:tabular-nums] sm:text-right"
                      style={{ color: isPositive ? 'var(--tone-success-fg)' : 'var(--color-text)' }}
                    >
                      {sign}{formatYem(value)}
                    </p>
                  </li>
                )
              })}
            </ul>
          )}

          {/* load more */}
          {ledger.hasNextPage && (
            <div className="border-t border-[var(--color-border)] p-5 text-center">
              <button
                type="button"
                onClick={() => void ledger.fetchNextPage()}
                disabled={ledger.isFetchingNextPage}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-6 py-2.5 text-[12px] font-black text-[var(--color-text)] hover:bg-[var(--chart-track)] disabled:opacity-50"
              >
                {ledger.isFetchingNextPage && <Loader2 size={13} className="animate-spin" aria-hidden />}
                {ledger.isFetchingNextPage ? 'Chargement…' : 'Afficher plus'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
