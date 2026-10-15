import { useState, useEffect, useRef, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  PieChart, Pie,
} from 'recharts'
import {
  LogOut, LayoutDashboard, Package, Coins, Store, User,
  ArrowUpRight, ArrowDownLeft, TrendingUp, TrendingDown,
  CreditCard, CheckCircle2, Clock, AlertTriangle, ChevronRight,
  Wallet, BadgeCheck, XCircle, RefreshCw, Pencil, Save, X,
  List, FileText, Bell, Receipt, Download, BarChart2, ScanLine,
} from 'lucide-react'
import { useAuth } from '@/app/AuthContext'
import { getDashboard } from '@/services/memberService'
import { api, extractApiError } from '@/lib/api'
import { useCountUp } from '@/hooks/useCountUp'

// ── helpers ───────────────────────────────────────────────────────────────────

function fmt(n: string | number) {
  return Number(n).toLocaleString('fr-FR')
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtShortDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

// ── navigation ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'dashboard',    label: 'Accueil',       mobileLabel: 'Accueil',   icon: LayoutDashboard },
  { id: 'packs',        label: 'Mes packs',     mobileLabel: 'Packs',     icon: Package },
  { id: 'yem',          label: 'YEM',           mobileLabel: 'YEM',       icon: Coins },
  { id: 'transactions', label: 'Transactions',  mobileLabel: 'Transact.', icon: List },
  { id: 'pay',          label: 'Payer',         mobileLabel: 'Payer',     icon: Store },
  { id: 'documents',    label: 'Documents',     mobileLabel: 'Docs',      icon: FileText },
  { id: 'profile',      label: 'Profil',        mobileLabel: 'Profil',    icon: User },
] as const
type TabId = typeof TABS[number]['id']

const TAB_LABELS: Record<TabId, string> = {
  dashboard:    'Tableau de bord',
  packs:        'Mes packs',
  yem:          'YEM',
  transactions: 'Transactions',
  pay:          'Payer un marchand',
  documents:    'Documents',
  profile:      'Mon profil',
}

// ── tab content transition ────────────────────────────────────────────────────

const tabVariants = {
  initial: { opacity: 0, y: 10 },
  enter:   { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.12, ease: 'easeIn' } },
}

// ── StatusBadge ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    active:                     { label: 'Actif',                   color: 'var(--color-success)', bg: 'var(--color-success)1a', icon: CheckCircle2 },
    pending_email_verification: { label: 'E-mail non vérifié',      color: '#d97706', bg: '#fdf1e1', icon: Clock },
    pending_payment:            { label: 'Adhésion non payée',      color: '#d97706', bg: '#fdf1e1', icon: Clock },
    pending_activation:         { label: "En attente d'activation", color: '#d97706', bg: '#fdf1e1', icon: Clock },
    suspended:                  { label: 'Suspendu',                color: 'var(--color-danger)',   bg: 'var(--color-danger)1a', icon: XCircle },
  }
  const s = map[status] ?? { label: status, color: 'var(--color-text-muted)', bg: 'var(--color-border)', icon: AlertTriangle }
  const Icon = s.icon
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ color: s.color, background: s.bg }}>
      <Icon size={11} aria-hidden /> {s.label}
    </span>
  )
}

// ── KpiCard ───────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: React.ReactNode; sub?: string; icon: React.ElementType; color: string
}) {
  return (
    <div className="rounded-2xl border p-3.5 sm:p-4 flex gap-3 items-start" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18`, color }}>
        <Icon size={16} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide leading-tight" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
        <div className="text-base sm:text-lg font-extrabold leading-tight tabular-nums mt-0.5" style={{ color: 'var(--color-text)' }}>{value}</div>
        {sub && <p className="text-[10px] sm:text-xs mt-0.5 leading-tight" style={{ color: 'var(--color-text-muted)' }}>{sub}</p>}
      </div>
    </div>
  )
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

function MovementTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl border px-3 py-2 text-xs shadow-lg" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
      <p className="font-semibold mb-0.5 max-w-[160px] truncate">{d.label}</p>
      <p style={{ color: d.direction === 'credit' ? 'var(--color-success)' : 'var(--color-danger)' }}>
        {d.direction === 'credit' ? '+' : '−'}{fmt(d.quantity)} YEM
      </p>
      <p style={{ color: 'var(--color-text-muted)' }}>{d.date}</p>
    </div>
  )
}

// ── Tab: Tableau de bord ──────────────────────────────────────────────────────

type DashData = NonNullable<ReturnType<typeof useGetDashboard>['data']>

function TabDashboard({ dash, onTab }: { dash: DashData | undefined; onTab: (t: TabId) => void }) {
  const yemBal = Math.round(parseFloat(dash?.yem.balance ?? '0'))
  const { count: yemCount, ref: yemRef } = useCountUp(yemBal, 1200)

  const movements      = dash?.recent_movements ?? []
  const pendingPayments = dash?.payments_awaiting_action ?? []

  const barData = [...movements].reverse().map((m) => ({
    date:      fmtShortDate(m.date),
    label:     m.label,
    direction: m.direction,
    quantity:  parseFloat(m.quantity),
    value:     m.direction === 'credit' ? parseFloat(m.quantity) : -parseFloat(m.quantity),
  }))

  const yemSpent    = parseFloat(dash?.yem.total_spent  ?? '0')
  const yemReserved = parseFloat(dash?.yem.reserved     ?? '0')
  const yemAvail    = Math.max(0, parseFloat(dash?.yem.balance ?? '0'))
  const donutData   = [
    { name: 'Disponible', value: yemAvail,    color: 'var(--color-primary)' },
    { name: 'Réservé',    value: yemReserved, color: '#d97706' },
    { name: 'Dépensé',    value: yemSpent,    color: '#e5e7eb' },
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-5">
      {/* KPIs — 2×2 on mobile, 4-col on lg */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* YEM balance — spans full row on xs, single col from sm */}
        <div className="col-span-2 sm:col-span-1 rounded-2xl border p-3.5 sm:p-4 flex gap-3 items-center"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'var(--color-primary)18', color: 'var(--color-primary)' }}>
            <Coins size={16} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Solde YEM</p>
            <p ref={yemRef as React.RefObject<HTMLParagraphElement>}
              className="text-xl sm:text-2xl font-extrabold tabular-nums" style={{ color: 'var(--color-text)' }}>
              {yemCount}
            </p>
            {yemReserved > 0 && (
              <p className="text-[10px] sm:text-xs" style={{ color: 'var(--color-text-muted)' }}>{fmt(yemReserved)} réservés</p>
            )}
          </div>
        </div>

        <KpiCard label="Adhésion" value={<StatusBadge status={dash?.membership?.status ?? 'pending_payment'} />}
          sub={dash?.membership?.member_since ? `Depuis ${fmtDate(dash.membership.member_since)}` : undefined}
          icon={BadgeCheck} color="#2563eb" />
        <KpiCard label="Packs actifs" value={`${dash?.active_packs.length ?? 0}`}
          sub={dash?.active_packs[0]?.name ?? 'Aucun pack'} icon={Package} color="#7c3aed" />
        <KpiCard label="En attente" value={`${pendingPayments.length}`}
          sub={pendingPayments.length ? 'Action requise' : 'Aucun'} icon={pendingPayments.length ? AlertTriangle : CheckCircle2}
          color={pendingPayments.length ? '#d97706' : 'var(--color-success)'} />
      </div>

      {/* Pending payments alert */}
      {pendingPayments.length > 0 && (
        <div className="rounded-xl border p-3.5 flex gap-3" style={{ borderColor: '#d97706', background: '#fdf1e1' }}>
          <AlertTriangle size={17} className="shrink-0 mt-0.5" style={{ color: '#d97706' }} aria-hidden />
          <div>
            <p className="text-sm font-semibold" style={{ color: '#92400e' }}>Paiement(s) en attente de validation</p>
            <p className="text-xs mt-0.5" style={{ color: '#92400e' }}>La CECT vérifie votre règlement. Vous serez notifié par e-mail.</p>
          </div>
        </div>
      )}

      {/* Charts */}
      {movements.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Bar chart */}
          <div className="lg:col-span-2 rounded-2xl border p-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--color-text-muted)' }}>
              Mouvements récents
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={barData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<MovementTooltip />} cursor={{ fill: 'var(--color-border)' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.direction === 'credit' ? 'var(--color-success)' : 'var(--color-danger)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Donut — fully responsive */}
          <div className="rounded-2xl border p-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
              Répartition YEM
            </p>
            <div className="flex items-center gap-4">
              <div className="shrink-0" style={{ width: 110, height: 110 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius="42%" outerRadius="62%" dataKey="value" paddingAngle={3}>
                      {donutData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: any) => [`${fmt(v)} YEM`, '']}
                      contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, fontSize: 11 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {donutData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="h-2 w-2 rounded-full shrink-0" style={{ background: d.color }} />
                      <span className="truncate" style={{ color: 'var(--color-text-muted)' }}>{d.name}</span>
                    </div>
                    <span className="font-semibold tabular-nums shrink-0" style={{ color: 'var(--color-text)' }}>{fmt(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>Notifications</p>
        <div className="space-y-2">
          {(dash?.membership?.status === 'pending_payment' || dash?.membership?.status === 'pending_activation') && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl border" style={{ borderColor: '#d97706', background: '#fdf1e1' }}>
              <Bell size={15} className="shrink-0 mt-0.5" style={{ color: '#d97706' }} aria-hidden />
              <div>
                <p className="text-sm font-semibold" style={{ color: '#92400e' }}>Adhésion en attente</p>
                <p className="text-xs mt-0.5" style={{ color: '#92400e' }}>Votre paiement d'adhésion est en cours de vérification par la CECT.</p>
              </div>
            </div>
          )}
          {(dash?.active_packs ?? []).length === 0 && dash?.membership?.status === 'active' && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
              <Bell size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} aria-hidden />
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Aucun pack actif</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Souscrivez à un pack pour accéder aux fonctionnalités YEM.</p>
              </div>
            </div>
          )}
          {(dash?.payments_awaiting_action ?? []).length === 0 && (dash?.active_packs ?? []).length > 0 && dash?.membership?.status === 'active' && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
              <CheckCircle2 size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--color-success)' }} aria-hidden />
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Aucune notification en attente.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>Actions rapides</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {[
            { label: 'Mes packs',    icon: Package,       tab: 'packs'    as TabId, color: '#7c3aed' },
            { label: 'Payer',        icon: Store,         tab: 'pay'      as TabId, color: '#2563eb' },
            { label: 'Vendre YEM',   icon: TrendingUp,    tab: 'yem'      as TabId, color: 'var(--color-primary)' },
            { label: 'Mon profil',   icon: User,          tab: 'profile'  as TabId, color: '#0891b2' },
          ].map(({ label, icon: Icon, tab, color }) => (
            <button key={tab} onClick={() => onTab(tab)}
              className="flex flex-col items-center gap-2 p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm font-semibold transition-all active:scale-95 hover:border-[var(--color-primary)]"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, color }}>
                <Icon size={17} aria-hidden />
              </div>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Movements list */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>Derniers mouvements</p>
        {movements.length === 0 ? (
          <p className="text-sm py-8 text-center" style={{ color: 'var(--color-text-muted)' }}>Aucun mouvement pour le moment.</p>
        ) : (
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            {movements.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3 px-4 py-3"
                style={{ background: 'var(--color-surface)', borderBottom: i < movements.length - 1 ? '1px solid var(--color-border)' : undefined }}>
                <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
                  style={m.direction === 'credit'
                    ? { background: 'var(--color-success)18', color: 'var(--color-success)' }
                    : { background: 'var(--color-danger)18',  color: 'var(--color-danger)' }}>
                  {m.direction === 'credit' ? <ArrowDownLeft size={14} aria-hidden /> : <ArrowUpRight size={14} aria-hidden />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{m.label}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{fmtDate(m.date)}</p>
                </div>
                <p className="text-sm font-bold tabular-nums shrink-0"
                  style={{ color: m.direction === 'credit' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {m.direction === 'credit' ? '+' : '−'}{fmt(m.quantity)} YEM
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Tab: Packs ────────────────────────────────────────────────────────────────

function TabPacks({ dash }: { dash: DashData | undefined }) {
  const packs = dash?.active_packs ?? []
  const FAMILY_COLOR: Record<string, string> = {
    VENDEUR: '#2563eb', CONSOMMATEUR: '#7c3aed', PERSONNEL: 'var(--color-primary)', MARCHAND: '#db2777',
  }
  return (
    <div className="space-y-4">
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
        {packs.length} pack{packs.length !== 1 ? 's' : ''} actif{packs.length !== 1 ? 's' : ''}
      </p>

      {packs.length === 0 ? (
        <div className="rounded-2xl border p-10 text-center" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
          <Package size={40} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} aria-hidden />
          <p className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Aucun pack actif</p>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Souscrivez à un pack pour accéder aux fonctionnalités YEM.</p>
        </div>
      ) : packs.map((pack) => {
        const color    = FAMILY_COLOR[pack.family] ?? 'var(--color-primary)'
        const available = pack.available      !== null ? Math.round(parseFloat(String(pack.available))) : null
        const quota     = pack.quota_per_period !== null ? Math.round(parseFloat(String(pack.quota_per_period))) : null
        const pct       = quota && available !== null ? Math.min(100, Math.round((available / quota) * 100)) : null
        const discount  = pack.discount_bps ? Math.round(pack.discount_bps / 100) : null
        return (
          <div key={pack.id} className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            <div className="px-4 sm:px-5 py-4 flex items-start justify-between gap-3"
              style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color }}>{pack.family}</span>
                <h3 className="font-bold text-base mt-0.5" style={{ color: 'var(--color-text)' }}>{pack.name}</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {pack.code} · {pack.price_xof.toLocaleString('fr-FR')} FCFA
                </p>
              </div>
              <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: `${color}18`, color }}>Actif</span>
            </div>
            <div className="px-4 sm:px-5 py-4 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4" style={{ background: 'var(--color-surface)' }}>
              {available !== null && <div><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Disponible</p><p className="font-bold tabular-nums text-sm" style={{ color: 'var(--color-text)' }}>{fmt(available)} YEM</p></div>}
              {quota     !== null && <div><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Quota / période</p><p className="font-bold tabular-nums text-sm" style={{ color: 'var(--color-text)' }}>{fmt(quota)} YEM</p></div>}
              {discount  !== null && <div><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Remise</p><p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>{discount} %</p></div>}
              {(pack as any).total_credited !== undefined && <div><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Acquis</p><p className="font-bold tabular-nums text-sm" style={{ color: 'var(--color-text)' }}>{fmt(parseFloat(String((pack as any).total_credited)))} YEM</p></div>}
              {(pack as any).total_spent    !== undefined && <div><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Consommé</p><p className="font-bold tabular-nums text-sm" style={{ color: 'var(--color-text)' }}>{fmt(parseFloat(String((pack as any).total_spent)))} YEM</p></div>}
              {pack.activated_at  && <div><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Activé le</p><p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>{fmtDate(pack.activated_at)}</p></div>}
              {pack.expires_at    && <div><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Expire le</p><p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>{fmtDate(pack.expires_at)}</p></div>}
            </div>
            {pct !== null && (
              <div className="px-4 sm:px-5 pb-4" style={{ background: 'var(--color-surface)' }}>
                <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                  <span>Quota utilisé</span><span>{pct} %</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: 'var(--color-border)' }}>
                  <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            )}
          </div>
        )
      })}

      <div className="rounded-xl border p-4 flex items-start gap-3" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        <TrendingUp size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} aria-hidden />
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Vous pouvez détenir jusqu'à 2 packs structurés actifs simultanément. Contactez la CECT pour en souscrire un nouveau.
        </p>
      </div>
    </div>
  )
}

// ── Tab: YEM ──────────────────────────────────────────────────────────────────

function TabYem({ dash }: { dash: DashData | undefined }) {
  const yem = dash?.yem
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border p-4 sm:p-5" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--color-text-muted)' }}>Résumé YEM</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Disponible',    value: yem?.balance          ?? '0', icon: Wallet,      color: 'var(--color-primary)' },
            { label: 'Réservé',       value: yem?.reserved         ?? '0', icon: Clock,       color: '#d97706' },
            { label: 'Total crédité', value: yem?.total_credited   ?? '0', icon: TrendingDown,color: 'var(--color-success)' },
            { label: 'Total dépensé', value: yem?.total_spent      ?? '0', icon: TrendingUp,  color: 'var(--color-danger)' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="text-center p-3 rounded-xl" style={{ background: `${color}08` }}>
              <div className="h-8 w-8 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ background: `${color}18`, color }}>
                <Icon size={14} aria-hidden />
              </div>
              <p className="text-base sm:text-lg font-extrabold tabular-nums" style={{ color: 'var(--color-text)' }}>{fmt(parseFloat(value))}</p>
              <p className="text-[10px] sm:text-xs mt-0.5 leading-tight" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-muted)' }}>Taux en vigueur</p>
        <div className="flex gap-4 sm:gap-6 text-sm flex-wrap">
          <div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Achat YEM</p>
            <p className="font-bold" style={{ color: 'var(--color-primary)' }}>500 FCFA / YEM</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Vente YEM</p>
            <p className="font-bold" style={{ color: '#2563eb' }}>650 FCFA / YEM</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Cession YEM</p>
            <p className="font-bold" style={{ color: '#7c3aed' }}>610 FCFA / YEM</p>
          </div>
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
          Le YEM n'a pas cours légal au Togo. Cours indicatif.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: 'Vendre mes YEM', sub: 'Envoyer des YEM à la CECT contre des FCFA', icon: TrendingUp, color: 'var(--color-primary)', msg: 'Fonctionnalité disponible avec un pack Vendeur actif.' },
          { label: 'Acheter des YEM', sub: 'Recharger via T-Money, Flooz, virement…', icon: CreditCard, color: '#2563eb', msg: 'Pour acheter des YEM, contactez la CECT ou rechargez depuis votre pack Personnel.' },
        ].map(({ label, sub, icon: Icon, color, msg }) => (
          <button key={label}
            className="flex items-center gap-3 p-4 rounded-2xl border text-left transition-all active:scale-95 hover:border-[var(--color-primary)]"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            onClick={() => alert(msg)}>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15`, color }}>
              <Icon size={18} aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{label}</p>
              <p className="text-xs mt-0.5 leading-tight" style={{ color: 'var(--color-text-muted)' }}>{sub}</p>
            </div>
            <ChevronRight size={15} className="shrink-0" style={{ color: 'var(--color-text-muted)' }} aria-hidden />
          </button>
        ))}
      </div>
    </div>
  )
}

// ── QR Scanner ────────────────────────────────────────────────────────────────

function QrScanner({ onResult, onClose }: { onResult: (code: string) => void; onClose: () => void }) {
  const videoRef  = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef    = useRef<number>(0)
  const [camErr, setCamErr] = useState<string | null>(null)

  const scan = useCallback(() => {
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scan)
      return
    }
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    import('jsqr').then(({ default: jsQR }) => {
      const result = jsQR(imageData.data, canvas.width, canvas.height, { inversionAttempts: 'dontInvert' })
      if (result?.data) {
        stopStream()
        onResult(result.data)
      } else {
        rafRef.current = requestAnimationFrame(scan)
      }
    })
  }, [onResult])

  function stopStream() {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
  }

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
          rafRef.current = requestAnimationFrame(scan)
        }
      })
      .catch(() => setCamErr("Accès à la caméra refusé. Autorisez la caméra dans les paramètres de votre navigateur."))
    return () => stopStream()
  }, [scan])

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(0,0,0,0.92)' }}>
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <p className="text-white font-semibold text-sm">Scanner le QR marchand</p>
        <button onClick={() => { stopStream(); onClose() }}
          className="h-8 w-8 flex items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors"
          aria-label="Fermer le scanner">
          <X size={16} aria-hidden />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-4">
        {camErr ? (
          <div className="text-center max-w-xs">
            <p className="text-white/80 text-sm">{camErr}</p>
            <button onClick={() => { stopStream(); onClose() }}
              className="mt-4 px-4 py-2 rounded-xl bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition-colors">
              Fermer
            </button>
          </div>
        ) : (
          <>
            {/* Viewfinder */}
            <div className="relative w-full max-w-xs aspect-square rounded-2xl overflow-hidden border-2 border-white/30">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted aria-hidden />
              <canvas ref={canvasRef} className="hidden" aria-hidden />
              {/* Corner guides */}
              {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
                <div key={i} className={`absolute ${pos} w-8 h-8`}
                  style={{
                    borderTop:    i < 2 ? '3px solid #09855B' : undefined,
                    borderBottom: i >= 2 ? '3px solid #09855B' : undefined,
                    borderLeft:   i % 2 === 0 ? '3px solid #09855B' : undefined,
                    borderRight:  i % 2 === 1 ? '3px solid #09855B' : undefined,
                  }} />
              ))}
              {/* Scan line animation */}
              <div className="absolute inset-x-0 h-0.5 animate-bounce" style={{ top: '50%', background: '#09855B', opacity: 0.8 }} />
            </div>
            <p className="text-white/60 text-xs text-center">Pointez la caméra vers le QR code du marchand</p>
          </>
        )}
      </div>
    </div>
  )
}

// ── Tab: Payer ────────────────────────────────────────────────────────────────

function TabPay({ dash }: { dash: DashData | undefined }) {
  const [code, setCode] = useState('')
  const [merchantInfo, setMerchantInfo] = useState<{ name: string; outlet?: string; pernum: string } | null>(null)
  const [checking, setChecking] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)

  const inputCls = 'w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow'

  async function lookupMerchant(overrideCode?: string) {
    const target = (overrideCode ?? code).trim()
    if (!target) return
    setChecking(true); setErr(null); setMerchantInfo(null)
    try {
      const res = await api.get<{ data: { merchant: { name: string; outlet_label?: string }; pernum: string } }>(
        `/merchant-payments/qr/${target}`
      )
      setMerchantInfo({ name: res.data.data.merchant.name, outlet: res.data.data.merchant.outlet_label, pernum: res.data.data.pernum })
    } catch (e: any) {
      const msg = e?.response?.data?.code
      if (msg === 'MERCHANT_QR_INVALID') setErr('QR ou code marchand invalide.')
      else if (msg === 'MERCHANT_UNAVAILABLE') setErr('Ce marchand ne peut pas recevoir de paiement pour le moment.')
      else setErr('Impossible de vérifier ce code. Réessayez.')
    } finally {
      setChecking(false)
    }
  }

  function handleScanResult(scanned: string) {
    setScanning(false)
    setCode(scanned)
    lookupMerchant(scanned)
  }

  const hasPack = (dash?.active_packs ?? []).some(p => ['CONSOMMATEUR', 'PERSONNEL'].includes(p.family))

  return (
    <>
      {scanning && <QrScanner onResult={handleScanResult} onClose={() => setScanning(false)} />}

      <div className="space-y-4">
      <div className="rounded-2xl border p-4 sm:p-5 space-y-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div>
          <p className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Code marchand</p>
          <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
            Saisissez le code affiché par le marchand ou scannez son QR.
          </p>
          <div className="flex gap-2">
            <input value={code} onChange={(e) => setCode(e.target.value)} className={inputCls}
              placeholder="ex. MARC-ABCD-1234" onKeyDown={(e) => e.key === 'Enter' && lookupMerchant()} />
            <button onClick={() => setScanning(true)}
              className="shrink-0 px-3 py-3 rounded-xl border transition-colors active:scale-95"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-primary)' }}
              title="Scanner le QR" aria-label="Scanner le QR marchand">
              <ScanLine size={18} aria-hidden />
            </button>
            <button onClick={() => lookupMerchant()} disabled={!code.trim() || checking}
              className="shrink-0 px-4 py-3 rounded-xl text-white text-sm font-bold transition-opacity disabled:opacity-50 active:scale-95"
              style={{ background: 'var(--color-primary)' }}>
              {checking ? <RefreshCw size={16} className="animate-spin" aria-hidden /> : 'Vérifier'}
            </button>
          </div>
          {err && <p className="mt-2 text-xs" style={{ color: 'var(--color-danger)' }}>{err}</p>}
        </div>

        {merchantInfo && (
          <div className="rounded-xl p-4" style={{ background: 'var(--color-primary)08', border: '1px solid var(--color-primary)30' }}>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 1 }} aria-hidden />
              <div>
                <p className="font-bold" style={{ color: 'var(--color-text)' }}>{merchantInfo.name}</p>
                {merchantInfo.outlet && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{merchantInfo.outlet}</p>}
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Pernum : <strong>{merchantInfo.pernum}</strong></p>
              </div>
            </div>
            <button disabled={!hasPack}
              className="mt-3 w-full py-3 rounded-xl text-white text-sm font-bold transition-opacity disabled:opacity-40 active:scale-95"
              style={{ background: 'var(--color-primary)' }}
              onClick={() => alert('Sélectionnez le pack à débiter et la quantité de YEM.')}>
              {hasPack ? 'Continuer le paiement' : 'Pack Consommateur/Personnel requis'}
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>Comment ça marche</p>
        {[
          'Saisissez le code ou scannez le QR du marchand.',
          'Vérifiez le nom du marchand affiché par la plateforme.',
          'Choisissez votre pack et la quantité de YEM.',
          'Transférez les YEM au Pernum du marchand.',
          "Déclarez l'envoi — le marchand confirme la réception.",
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-3 py-1.5">
            <span className="h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
              style={{ background: 'var(--color-primary)18', color: 'var(--color-primary)' }}>{i + 1}</span>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{step}</p>
          </div>
        ))}
      </div>
    </div>
    </>
  )
}

// ── Tab: Profil ───────────────────────────────────────────────────────────────

const profileSchema = z.object({
  first_name: z.string().min(1, 'Prénom requis'),
  last_name:  z.string().min(1, 'Nom requis'),
  phone:      z.string().min(8, 'Numéro invalide'),
  city:       z.string().min(1, 'Ville requise'),
})
type ProfileForm = z.infer<typeof profileSchema>

function TabProfile({ dash, onRefresh }: { dash: DashData | undefined; onRefresh: () => void }) {
  const profile    = dash?.profile
  const membership = dash?.membership
  const [editing, setEditing]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveOk, setSaveOk]       = useState(false)
  const qc = useQueryClient()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: profile?.name?.split(' ')[0] ?? '',
      last_name:  profile?.name?.split(' ').slice(1).join(' ') ?? '',
      phone:      profile?.phone ?? '',
      city:       profile?.city ?? '',
    },
  })

  function startEdit() {
    reset({ first_name: profile?.name?.split(' ')[0] ?? '', last_name: profile?.name?.split(' ').slice(1).join(' ') ?? '', phone: profile?.phone ?? '', city: profile?.city ?? '' })
    setSaveError(null); setSaveOk(false); setEditing(true)
  }

  async function onSubmit(data: ProfileForm) {
    setSaving(true); setSaveError(null)
    try {
      await api.put('/me', data)
      setSaveOk(true); setEditing(false)
      qc.invalidateQueries({ queryKey: ['me', 'dashboard'] })
      onRefresh()
    } catch (e) {
      setSaveError(extractApiError(e).message)
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow'

  const INFO_ROWS = [
    { label: 'Nom complet', value: profile?.name },
    { label: 'Pernum',      value: profile?.pernum },
    ...(profile?.person_type === 'legal' ? [{ label: 'Pernum Business', value: (profile as any)?.pernum_business }] : []),
    { label: 'N° membre',   value: profile?.member_number },
    { label: 'Type',        value: profile?.person_type === 'natural' ? 'Personne physique' : 'Personne morale' },
    { label: 'E-mail',      value: profile?.email },
    { label: 'Téléphone',   value: profile?.phone },
    { label: 'Ville',       value: profile?.city },
    { label: 'Statut',      value: <StatusBadge status={profile?.status ?? 'active'} /> },
  ]

  return (
    <div className="space-y-4 max-w-lg">
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
        <div className="px-4 sm:px-5 py-4 flex items-center justify-between"
          style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Informations personnelles</p>
          {!editing && (
            <button onClick={startEdit}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] active:scale-95"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
              <Pencil size={12} aria-hidden /> Modifier
            </button>
          )}
        </div>

        {saveOk && !editing && (
          <div className="px-4 sm:px-5 py-2.5 flex items-center gap-2 text-sm"
            style={{ background: 'var(--color-success)12', borderBottom: '1px solid var(--color-border)' }}>
            <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} aria-hidden />
            <span style={{ color: 'var(--color-success)' }}>Profil mis à jour.</span>
          </div>
        )}

        {editing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-5 space-y-4" style={{ background: 'var(--color-surface)' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Prénom</label>
                <input {...register('first_name')} className={inputCls} />
                {errors.first_name && <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Nom</label>
                <input {...register('last_name')} className={inputCls} />
                {errors.last_name && <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.last_name.message}</p>}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Téléphone</label>
              <input {...register('phone')} className={inputCls} placeholder="+228 90 00 00 00" />
              {errors.phone && <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Ville</label>
              <input {...register('city')} className={inputCls} placeholder="Lomé" />
              {errors.city && <p className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{errors.city.message}</p>}
            </div>
            {saveError && (
              <p className="text-sm rounded-xl px-4 py-3" style={{ color: 'var(--color-danger)', background: 'var(--color-danger)12', border: '1px solid var(--color-danger)30' }}>
                {saveError}
              </p>
            )}
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setEditing(false)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors active:scale-95"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                <X size={14} aria-hidden /> Annuler
              </button>
              <button type="submit" disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50 active:scale-95"
                style={{ background: 'var(--color-primary)' }}>
                {saving ? <RefreshCw size={14} className="animate-spin" aria-hidden /> : <Save size={14} aria-hidden />}
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </form>
        ) : (
          <div className="divide-y" style={{ background: 'var(--color-surface)' }}>
            {INFO_ROWS.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between gap-4 text-sm px-4 sm:px-5 py-3">
                <span className="shrink-0" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                <span className="font-medium text-right min-w-0 break-all" style={{ color: 'var(--color-text)' }}>{value ?? '—'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
        <div className="px-4 sm:px-5 py-4" style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Adhésion</p>
        </div>
        <div className="divide-y" style={{ background: 'var(--color-surface)' }}>
          {[
            { label: 'Statut',        value: membership ? <StatusBadge status={membership.status} /> : '—' },
            { label: 'Membre depuis', value: membership?.member_since ? fmtDate(membership.member_since) : '—' },
            { label: 'Cotisation',    value: membership?.paid === 'true' || membership?.paid === '1' ? 'Payée' : 'Non réglée' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between gap-4 text-sm px-4 sm:px-5 py-3">
              <span className="shrink-0" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
              <span className="font-medium text-right" style={{ color: 'var(--color-text)' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Tab: Transactions ─────────────────────────────────────────────────────────

function TabTransactions({ dash }: { dash: DashData | undefined }) {
  const movements = dash?.recent_movements ?? []

  const STATUS_MAP: Record<string, { label: string; color: string }> = {
    completed: { label: 'Complété',         color: 'var(--color-success)' },
    pending:   { label: 'En attente',       color: '#d97706' },
    verifying: { label: 'En vérification',  color: '#2563eb' },
    cancelled: { label: 'Annulé',           color: 'var(--color-danger)' },
    disputed:  { label: 'Litige',           color: 'var(--color-danger)' },
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
        Historique des transactions
      </p>

      {movements.length === 0 ? (
        <div className="rounded-2xl border p-10 text-center" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
          <List size={40} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} aria-hidden />
          <p className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Aucune transaction</p>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Vos opérations YEM apparaîtront ici.</p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
          <div className="hidden sm:grid grid-cols-[1fr_120px_100px_80px] gap-3 px-4 py-2.5 text-xs font-bold uppercase tracking-widest"
            style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
            <span>Opération</span>
            <span>Date</span>
            <span className="text-right">Quantité</span>
            <span className="text-right">Statut</span>
          </div>
          {movements.map((m, i) => {
            const st = STATUS_MAP[(m as any).status ?? 'completed'] ?? STATUS_MAP.completed
            return (
              <div key={m.id}
                className="flex sm:grid sm:grid-cols-[1fr_120px_100px_80px] items-center gap-3 px-4 py-3"
                style={{ background: 'var(--color-surface)', borderBottom: i < movements.length - 1 ? '1px solid var(--color-border)' : undefined }}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
                    style={m.direction === 'credit'
                      ? { background: 'var(--color-success)18', color: 'var(--color-success)' }
                      : { background: 'var(--color-danger)18',  color: 'var(--color-danger)' }}>
                    {m.direction === 'credit' ? <ArrowDownLeft size={13} aria-hidden /> : <ArrowUpRight size={13} aria-hidden />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{m.label}</p>
                    <p className="text-xs sm:hidden" style={{ color: 'var(--color-text-muted)' }}>{fmtDate(m.date)}</p>
                  </div>
                </div>
                <p className="hidden sm:block text-xs" style={{ color: 'var(--color-text-muted)' }}>{fmtDate(m.date)}</p>
                <p className="hidden sm:block text-sm font-bold tabular-nums text-right"
                  style={{ color: m.direction === 'credit' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {m.direction === 'credit' ? '+' : '−'}{fmt(m.quantity)} YEM
                </p>
                <div className="hidden sm:flex justify-end">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ color: st.color, background: `${st.color}18` }}>
                    {st.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
        L'historique complet est disponible sur demande auprès de la CECT.
      </p>
    </div>
  )
}

// ── Tab: Documents ────────────────────────────────────────────────────────────

function TabDocuments() {
  const DOCS = [
    { label: "Fiche d'adhésion",     desc: "Votre bulletin d'adhésion signé",       icon: FileText,  status: 'available' },
    { label: 'Reçu de cotisation',   desc: "Preuve de paiement de l'adhésion",      icon: Receipt,   status: 'pending' },
    { label: 'Relevé de compte YEM', desc: 'Historique de vos mouvements YEM',      icon: List,      status: 'pending' },
    { label: 'Rapport personnel',    desc: 'Résumé de votre activité dans la CECT', icon: BarChart2, status: 'pending' },
  ]

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
        Mes documents
      </p>

      <div className="space-y-2">
        {DOCS.map(({ label, desc, icon: Icon, status }) => (
          <div key={label}
            className="flex items-center gap-3 p-4 rounded-2xl border"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--color-primary)12', color: 'var(--color-primary)' }}>
              <Icon size={18} aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
            </div>
            {status === 'available' ? (
              <button
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity active:scale-95"
                style={{ background: 'var(--color-primary)' }}
                onClick={() => alert('Téléchargement disponible prochainement.')}>
                <Download size={13} aria-hidden /> Télécharger
              </button>
            ) : (
              <span className="shrink-0 text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{ background: '#fdf1e1', color: '#d97706' }}>
                Bientôt
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Pour demander un document spécifique, contactez la CECT à{' '}
          <a href="mailto:contact@cecttogo.org" className="underline" style={{ color: 'var(--color-primary)' }}>
            contact@cecttogo.org
          </a>
        </p>
      </div>
    </div>
  )
}

// ── hook ──────────────────────────────────────────────────────────────────────

function useGetDashboard(enabled: boolean) {
  return useQuery({ queryKey: ['me', 'dashboard'], queryFn: getDashboard, enabled })
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MemberAreaPage() {
  const { user, loading: authLoading, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')

  const { data: dash, isLoading, refetch } = useGetDashboard(!!user)

  useEffect(() => {
    if (!authLoading && !user) navigate('/connexion')
  }, [authLoading, user, navigate])

  if (authLoading) return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--color-bg)' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Chargement de votre session…</p>
      </div>
    </div>
  )

  if (!user) return null

  const initials = user.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()

  async function handleLogout() { await logout(); navigate('/') }

  return (
    <>
      <Helmet><title>Espace membre — CECT Togo</title></Helmet>

      {/* ── Topbar ── */}
      <header className="sticky top-0 z-40 h-14 px-4 sm:px-6 flex items-center justify-between gap-2"
        style={{ background: 'var(--color-primary)', color: '#fff' }}>
        {/* Left: logo + title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-7 w-7 rounded-md bg-white overflow-hidden p-0.5 shrink-0">
            <img src="/logos/CECT_logo_transparent.png" alt="CECT" className="w-full h-full object-contain" />
          </div>
          {/* Desktop label */}
          <div className="hidden sm:block leading-tight">
            <strong className="text-sm font-bold">Espace membre</strong>
            <span className="block text-xs opacity-70">CECT Togo</span>
          </div>
          {/* Mobile: active tab title */}
          <span className="sm:hidden text-sm font-bold truncate">{TAB_LABELS[activeTab]}</span>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button onClick={() => refetch()}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/15 transition-colors" title="Actualiser">
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} aria-hidden />
          </button>
          {/* Avatar + name on desktop */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold bg-white/20 shrink-0">{initials}</div>
            <span className="text-sm font-semibold max-w-[120px] truncate">{user.name}</span>
          </div>
          <a href="/" className="hidden sm:block text-xs font-semibold text-white/75 hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
            ← Site public
          </a>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-semibold border border-white/25 bg-white/10 hover:bg-white/20 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors">
            <LogOut size={13} aria-hidden />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </header>

      <div className="flex" style={{ minHeight: 'calc(100dvh - 56px)', background: 'var(--color-bg)' }}>

        {/* ── Sidebar (desktop only) ── */}
        <aside className="hidden md:flex flex-col w-56 shrink-0 border-r pt-4 pb-6 px-3 gap-0.5 sticky top-14 self-start h-[calc(100dvh-56px)]"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', overflowY: 'auto' }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-colors"
              style={activeTab === id
                ? { background: 'var(--color-primary)', color: '#fff' }
                : { color: 'var(--color-text-muted)', background: 'transparent' }}>
              <Icon size={16} aria-hidden />{label}
            </button>
          ))}

          {/* Avatar card at bottom of sidebar */}
          <div className="mt-auto pt-4 px-1">
            <div className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white" style={{ background: 'var(--color-primary)' }}>{initials}</div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>{user.name}</p>
                <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Membre</p>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 p-4 sm:p-6" style={{ paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' }}>
          {/* Desktop page title */}
          <h1 className="hidden md:block text-lg font-bold mb-5" style={{ color: 'var(--color-text)' }}>
            {TAB_LABELS[activeTab]}
          </h1>

          {isLoading ? (
            <div className="flex items-center gap-2 py-12" style={{ color: 'var(--color-text-muted)' }}>
              <RefreshCw size={16} className="animate-spin" aria-hidden />
              <span className="text-sm">Chargement de votre espace…</span>
            </div>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={activeTab} variants={tabVariants} initial="initial" animate="enter" exit="exit">
                {activeTab === 'dashboard'    && <TabDashboard    dash={dash} onTab={setActiveTab} />}
                {activeTab === 'packs'        && <TabPacks        dash={dash} />}
                {activeTab === 'yem'          && <TabYem          dash={dash} />}
                {activeTab === 'transactions' && <TabTransactions dash={dash} />}
                {activeTab === 'pay'          && <TabPay          dash={dash} />}
                {activeTab === 'documents'    && <TabDocuments />}
                {activeTab === 'profile'      && <TabProfile      dash={dash} onRefresh={refetch} />}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* ── Bottom nav (mobile only) ── */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden z-40 border-t"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}>
        <div className="flex">
          {TABS.map(({ id, mobileLabel, icon: Icon }) => {
            const active = activeTab === id
            return (
              <button key={id} onClick={() => setActiveTab(id)}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors"
                style={{ color: active ? 'var(--color-primary)' : 'var(--color-text-muted)', minHeight: 56 }}>
                <div className="relative flex items-center justify-center">
                  <Icon size={active ? 20 : 18} aria-hidden style={{ transition: 'all 0.15s ease' }} />
                  {/* active dot */}
                  {active && (
                    <motion.span layoutId="nav-dot"
                      className="absolute -bottom-1 h-1 w-1 rounded-full"
                      style={{ background: 'var(--color-primary)' }}
                    />
                  )}
                </div>
                <span className="text-[9px] sm:text-[10px] font-semibold leading-none"
                  style={{ color: active ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                  {mobileLabel}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
