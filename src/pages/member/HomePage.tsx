import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertTriangle, ArrowDownLeft, ArrowRight, ArrowUpRight,
  Boxes, Calendar, Coins, ScanLine,
  TrendingDown, TrendingUp, type LucideIcon,
} from 'lucide-react'
import { AreaChart, type AreaPoint } from '@/components/dashboard/AreaChart'
import { EmptyState } from '@/components/ui/EmptyState'
import { MemberCard } from '@/components/ui/MemberCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { btnLime, btnOnDark, btnOutline } from '@/components/ui/buttons'
import { useMemberDashboard } from '@/data/useMemberDashboard'
import type { MemberDashboardData, MemberPack } from '@/data/memberDashboard'
import { daysUntil, formatDateMedium, formatYem } from '@/lib/format'

/* ── Stat card (top row, Fintrack-style) ─────────────────── */

function StatCard({
  label, value, sub, icon: Icon, tone, index,
}: {
  label: string; value: string; sub: string
  icon: LucideIcon; tone: 'primary' | 'success' | 'muted'; index: number
}) {
  const palette = {
    primary: { bg: 'var(--forest-900)', label: 'rgba(255,255,255,0.5)', value: 'var(--lime)', sub: 'rgba(255,255,255,0.4)', icon: 'var(--lime)', iconBg: 'rgba(180,241,5,0.12)' },
    success:  { bg: 'var(--dash-card)',  label: 'var(--color-text-muted)', value: 'var(--tone-success-fg)', sub: 'var(--color-text-muted)', icon: 'var(--tone-success-fg)', iconBg: 'var(--tone-success-bg)' },
    muted:    { bg: 'var(--dash-card)',  label: 'var(--color-text-muted)', value: 'var(--color-text)',       sub: 'var(--color-text-muted)', icon: 'var(--color-text-muted)', iconBg: 'var(--chart-track)' },
  }[tone]

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col justify-between overflow-hidden rounded-[22px] border border-[var(--color-border)] p-6"
      style={{ background: palette.bg }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-black uppercase tracking-[0.14em]" style={{ color: palette.label }}>{label}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: palette.iconBg }}>
          <Icon size={16} style={{ color: palette.icon }} aria-hidden />
        </span>
      </div>
      <div className="mt-4">
        <p className="text-[36px] font-black leading-none tracking-tight [font-variant-numeric:tabular-nums]" style={{ color: palette.value }}>
          {value}
        </p>
        <p className="mt-2 text-[11px] font-bold" style={{ color: palette.sub }}>{sub}</p>
      </div>
    </motion.article>
  )
}

/* ── Balance hero ────────────────────────────────────────── */

function Balance({ data }: { data: MemberDashboardData }) {
  const families = new Set(data.packs.map((p) => p.family))
  const canPay = families.has('CONSOMMATEUR') || families.has('PERSONNEL')

  return (
    <section
      aria-labelledby="balance-hero"
      className="relative flex flex-col justify-between overflow-hidden rounded-[24px] p-7 text-white"
      style={{ background: 'linear-gradient(135deg, #051c12 0%, #0b2d1e 60%, #072218 100%)' }}
    >
      <span aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full" style={{ background: 'radial-gradient(circle, rgba(180,241,5,0.12) 0%, transparent 70%)' }} />
      <span aria-hidden className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full" style={{ background: 'radial-gradient(circle, rgba(52,199,149,0.1) 0%, transparent 70%)' }} />

      <div className="relative">
        <p id="balance-hero" className="text-[11px] font-black uppercase tracking-[0.15em] text-white/40">Solde disponible</p>
        <p className="mt-3 text-[60px] font-black leading-none tracking-tight text-[var(--lime)] [font-variant-numeric:tabular-nums]">
          {formatYem(data.balance.available)}
        </p>
        <p className="mt-2 text-sm font-bold text-white/40">Montant immédiatement utilisable</p>
      </div>

      <div className="relative mt-8 flex flex-wrap gap-2">
        <Link to={canPay ? '/espace/payer' : '/espace/packs'} className={`${btnLime} flex-1 justify-center sm:flex-none`}>
          <ScanLine size={16} aria-hidden />
          {canPay ? 'Payer un marchand' : 'Choisir un pack'}
        </Link>
        <Link to={families.has('VENDEUR') ? '/espace/vendre' : '/espace/packs'} className={`${btnOnDark} flex-1 justify-center sm:flex-none`}>
          <Coins size={16} aria-hidden />
          Vendre mes YEM
        </Link>
      </div>
    </section>
  )
}

/* ── Pack card ───────────────────────────────────────────── */

const FAMILY_META: Record<string, { label: string; gradient: string; accent: string; track: string }> = {
  CONSOMMATEUR: { label: 'Consommateur', gradient: 'from-[#0b6b45] to-[#34c795]', accent: '#0b6b45',  track: 'rgba(11,107,69,0.10)' },
  VENDEUR:      { label: 'Vendeur',       gradient: 'from-[#7c3aed] to-[#a78bfa]', accent: '#7c3aed',  track: 'rgba(124,58,237,0.10)' },
  PERSONNEL:    { label: 'Personnel',     gradient: 'from-[#0e7490] to-[#38bdf8]', accent: '#0e7490',  track: 'rgba(14,116,144,0.10)' },
  MARCHAND:     { label: 'Marchand',      gradient: 'from-[#b45309] to-[#fbbf24]', accent: '#b45309',  track: 'rgba(180,83,9,0.10)' },
}

function PackCard({ pack, index }: { pack: MemberPack; index: number }) {
  const total = Number.parseFloat(pack.quota_per_period)
  const used = Number.parseFloat(pack.quota_used)
  const available = Math.max(total - used, 0)
  const pct = total > 0 ? Math.round(Math.min(used / total, 1) * 100) : 0
  const meta = FAMILY_META[pack.family] ?? FAMILY_META.CONSOMMATEUR

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className="relative flex h-full flex-col overflow-hidden rounded-[22px] border border-[var(--color-border)] bg-[var(--dash-card)]"
    >
      {/* gradient strip */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${meta.gradient}`} aria-hidden />

      <div className="flex flex-1 flex-col gap-5 p-5">
        {/* header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: meta.accent }}>{meta.label}</p>
            <h3 className="mt-1 text-[15px] font-black tracking-tight text-[var(--color-text)]">{pack.name}</h3>
          </div>
          <span className="rounded-xl px-2.5 py-1 text-[11px] font-black" style={{ background: meta.track, color: meta.accent }}>
            {pct}% utilisé
          </span>
        </div>

        {/* quota number */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Quota disponible</p>
          <p className="mt-1.5 text-[32px] font-black leading-none tracking-tight text-[var(--color-text)] [font-variant-numeric:tabular-nums]">
            {formatYem(String(available))}
          </p>
        </div>

        {/* progress */}
        <div>
          <div className="h-2.5 overflow-hidden rounded-full bg-[var(--chart-track)]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
            <div className={`h-full rounded-full bg-gradient-to-r ${meta.gradient} transition-all duration-700`} style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1.5 text-right text-[11px] font-black text-[var(--color-text-muted)]">
            {pct}% de {formatYem(pack.quota_per_period)}
          </p>
        </div>

        {/* crédité / réservé / dépensé */}
        <dl className="grid grid-cols-3 gap-2">
          {[
            { label: 'Crédité',  value: pack.quota_per_period, lime: true },
            { label: 'Réservé',  value: pack.quota_reserved,   lime: false },
            { label: 'Dépensé',  value: pack.quota_consumed,   lime: false },
          ].map(({ label, value, lime }) => (
            <div key={label} className="flex flex-col rounded-xl px-2.5 py-2.5" style={{ background: meta.track }}>
              <dt className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">{label}</dt>
              <dd className={`mt-1 text-[12px] font-black leading-tight [font-variant-numeric:tabular-nums] ${lime ? '' : ''}`} style={{ color: lime ? meta.accent : 'var(--color-text)' }}>
                {formatYem(value)}
              </dd>
            </div>
          ))}
        </dl>

        {/* next credit */}
        {pack.period && (
          <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: meta.track }}>
            <Calendar size={12} style={{ color: meta.accent }} aria-hidden />
            <p className="text-[11px] font-bold text-[var(--color-text-muted)]">
              Prochain crédit <strong className="text-[var(--color-text)]">dans {daysUntil(pack.period.next_credit_at)}j</strong>
              <span className="opacity-60"> · {formatDateMedium(pack.period.next_credit_at)}</span>
            </p>
          </div>
        )}

        <Link to="/espace/packs" className="mt-auto inline-flex items-center gap-1.5 text-[12px] font-black transition-all hover:gap-3" style={{ color: meta.accent }}>
          Gérer ce pack <ArrowRight size={13} aria-hidden />
        </Link>
      </div>
    </motion.article>
  )
}

/* ── Todo ────────────────────────────────────────────────── */

function Todo({ data }: { data: MemberDashboardData }) {
  const awaiting = data.notifications.filter((n) => n.id.startsWith('pay-'))
  const ops = data.operations_in_progress.slice(0, 3)
  if (awaiting.length === 0 && ops.length === 0) return null

  return (
    <div className="rounded-[20px] border border-[var(--tone-warning-fg)]/20 bg-[var(--tone-warning-bg)] p-5">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle size={13} className="shrink-0 text-[var(--tone-warning-fg)]" aria-hidden />
        <p className="text-[11px] font-black uppercase tracking-widest text-[var(--tone-warning-fg)]">Actions requises</p>
      </div>
      <ul className="space-y-2">
        {[...awaiting, ...ops].slice(0, 4).map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3">
            <p className="text-sm font-extrabold text-[var(--color-text)]">
              {'title' in item ? item.title : item.label}
            </p>
            <Link
              to={'kind' in item && item.kind === 'merchant_payment' ? '/espace/payer' : '/espace/packs'}
              className="shrink-0 inline-flex items-center gap-1 rounded-xl bg-[var(--tone-warning-fg)] px-3 py-1 text-[11px] font-black text-white"
            >
              Voir <ArrowRight size={11} aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ── Recent movements ────────────────────────────────────── */

function Movements({ data }: { data: MemberDashboardData }) {
  const entries = data.ledger.slice(0, 6)
  return (
    <div className="rounded-[22px] border border-[var(--color-border)] bg-[var(--dash-card)] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)]">
        <div>
          <h2 className="text-[15px] font-black text-[var(--color-text)]">Historique des transactions</h2>
          <p className="mt-0.5 text-[11px] font-bold text-[var(--color-text-muted)]">Vos derniers mouvements de quota YEM</p>
        </div>
        <Link to="/espace/activite" className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--chart-track)] px-4 py-2 text-[11px] font-black text-[var(--color-text)] hover:bg-[var(--color-border)]">
          Voir tout <ArrowRight size={12} aria-hidden />
        </Link>
      </div>

      {entries.length === 0 ? (
        <EmptyState title="Aucun mouvement" description="Vos crédits de quota, achats et réservations apparaîtront ici." />
      ) : (
        <>
          {/* column headers */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-[var(--color-border)] px-6 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Mouvement</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Date</p>
            <p className="text-right text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Montant</p>
          </div>

          <ul className="divide-y divide-[var(--color-border)]">
            {entries.map((entry) => {
              const isCredit = entry.direction === 'credit'
              return (
                <li key={entry.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-6 py-4 transition-colors hover:bg-[var(--chart-track)]/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isCredit ? 'bg-[var(--tone-success-bg)] text-[var(--tone-success-fg)]' : 'bg-[var(--chart-track)] text-[var(--color-text-muted)]'}`}>
                      {isCredit ? <ArrowDownLeft size={15} aria-hidden /> : <ArrowUpRight size={15} aria-hidden />}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-extrabold text-[var(--color-text)]">{entry.label}</p>
                      {entry.state === 'reserved' && <StatusBadge label="Réservé" tone="warning" />}
                    </div>
                  </div>
                  <p className="text-[12px] font-bold text-[var(--color-text-muted)] whitespace-nowrap">{formatDateMedium(entry.date)}</p>
                  <p className={`text-[14px] font-black text-right [font-variant-numeric:tabular-nums] whitespace-nowrap ${isCredit ? 'text-[var(--tone-success-fg)]' : 'text-[var(--color-text)]'}`}>
                    {isCredit ? '+' : '−'}{formatYem(entry.quantity)}
                  </p>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}

/* ── Activity chart ──────────────────────────────────────── */

function ActivityChart({ data }: { data: MemberDashboardData }) {
  const creditPoints: AreaPoint[] = data.monthly_activity.map((r) => ({ label: r.month, value: r.credit }))
  const debitPoints: AreaPoint[] = data.monthly_activity.map((r) => ({ label: r.month, value: r.debit }))
  const hasData = data.monthly_activity.some((r) => r.credit > 0 || r.debit > 0)
  if (!hasData) return null

  return (
    <div className="rounded-[22px] border border-[var(--color-border)] bg-[var(--dash-card)] p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[15px] font-black text-[var(--color-text)]">Flux de trésorerie</h2>
          <p className="mt-0.5 text-[11px] font-bold text-[var(--color-text-muted)]">YEM crédités et dépensés — 6 derniers mois</p>
        </div>
        <div className="flex gap-4">
          <span className="inline-flex items-center gap-2 text-[11px] font-black text-[var(--tone-success-fg)]">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--chart-1)]" aria-hidden /> Crédités
          </span>
          <span className="inline-flex items-center gap-2 text-[11px] font-black text-[var(--tone-warning-fg)]">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--chart-2)]" aria-hidden /> Dépensés
          </span>
        </div>
      </div>
      <div className="space-y-6">
        <AreaChart data={creditPoints} ariaLabel="YEM crédités" height={140} color="var(--chart-1)" formatValue={(v) => formatYem(String(v))} />
        <AreaChart data={debitPoints} ariaLabel="YEM dépensés" height={140} color="var(--chart-2)" formatValue={(v) => formatYem(String(v))} />
      </div>
    </div>
  )
}

/* ── Page ────────────────────────────────────────────────── */

export default function HomePage() {
  const query = useMemberDashboard()
  const data = query.data
  const firstName = data?.profile.name.split(' ')[0] ?? ''

  return (
    <>
      <Helmet><title>Accueil — CECT Togo</title></Helmet>

      <PageHeader
        title={`Bonjour${firstName ? `, ${firstName}` : ''}`}
        description="Votre tableau de bord financier"
      />

      {query.isPending && (
        <div className="space-y-6" aria-busy>
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-[22px] bg-[var(--chart-track)]" />)}
          </div>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
            <div className="h-64 animate-pulse rounded-[22px] bg-[var(--chart-track)]" />
            <div className="h-64 animate-pulse rounded-[22px] bg-[var(--chart-track)]" />
          </div>
        </div>
      )}

      {query.isError && (
        <p role="alert" className="rounded-[18px] border border-[var(--color-border)] bg-[var(--dash-card)] p-6 text-sm font-bold">
          Impossible de charger votre espace.{' '}
          <button type="button" onClick={() => void query.refetch()} className="font-black text-[var(--color-primary)] underline">Réessayer</button>
        </p>
      )}

      {data && (
        <div className="space-y-6">
          {/* ── Top stat cards ── */}
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard index={0} label="Crédité" value={formatYem(data.balance.total_credited)} sub="Total crédité sur vos packs" icon={ArrowDownLeft} tone="primary" />
            <StatCard index={1} label="Réservé" value={formatYem(data.balance.reserved)} sub="YEM en attente de confirmation" icon={TrendingUp} tone="success" />
            <StatCard index={2} label="Dépensé" value={formatYem(data.balance.total_spent)} sub="Total dépensé sur le réseau" icon={TrendingDown} tone="muted" />
          </div>

          {/* ── Hero row ── */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
            <MemberCard name={data.profile.name} pernum={data.profile.pernum} memberNumber={data.profile.member_number} memberSince={data.profile.member_since} active={data.membership.status === 'active'} />
            <Balance data={data} />
          </div>

          {/* ── Pending actions ── */}
          <Todo data={data} />

          {/* ── Pack cards ── */}
          {data.packs.length > 0 ? (
            <section aria-label="Mes packs actifs">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[13px] font-black uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Mes packs actifs</h2>
                <Link to="/espace/packs" className="text-[12px] font-black text-[var(--color-primary)] hover:underline">Gérer →</Link>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.packs.map((pack, i) => (
                  <li key={pack.id}><PackCard pack={pack} index={i} /></li>
                ))}
              </ul>
            </section>
          ) : (
            <div className="rounded-[22px] border border-[var(--color-border)] bg-[var(--dash-card)] p-8">
              <EmptyState title="Aucun pack actif" description="Un pack vous donne un quota de YEM à utiliser chez les marchands." action={<Link to="/espace/packs" className={btnOutline}><Boxes size={17} aria-hidden />Découvrir les packs</Link>} />
            </div>
          )}

          {/* ── Transactions ── */}
          <Movements data={data} />

          {/* ── Chart ── */}
          <ActivityChart data={data} />
        </div>
      )}
    </>
  )
}
