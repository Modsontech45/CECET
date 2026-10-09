import { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Download, Printer, RefreshCw } from 'lucide-react'
import { animate } from 'animejs'
import { useQuery } from '@tanstack/react-query'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  PieChart, Pie,
} from 'recharts'
import { getReportSummary } from '@/services/memberService'

// ── helpers ───────────────────────────────────────────────────────────────────

function fmtXof(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA'
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function calcPct(value: number, total: number) {
  if (!total) return 0
  return Math.round((value / total) * 1000) / 10
}

// ── period presets ────────────────────────────────────────────────────────────

type Preset = '30j' | '90j' | 'ytd' | 'all'
const PRESETS: { id: Preset; label: string }[] = [
  { id: '30j', label: '30 jours' },
  { id: '90j', label: '90 jours' },
  { id: 'ytd', label: 'Cette année' },
  { id: 'all', label: 'Tout' },
]

function presetToDates(p: Preset): { from?: string; to?: string } {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const today = iso(now)
  if (p === '30j') { const d = new Date(now); d.setDate(d.getDate() - 30); return { from: iso(d), to: today } }
  if (p === '90j') { const d = new Date(now); d.setDate(d.getDate() - 90); return { from: iso(d), to: today } }
  if (p === 'ytd') { return { from: `${now.getFullYear()}-01-01`, to: today } }
  return {}
}

// ── color palette ─────────────────────────────────────────────────────────────

const PALETTE = ['#2563eb', '#7c3aed', '#db2777', '#16a34a', '#d97706', '#0891b2', '#dc2626', '#0f766e']

// ── custom tooltips ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border px-3 py-2 text-xs shadow-lg"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
      {label && <p className="font-semibold mb-1 max-w-[160px] truncate">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? p.fill }}>{fmtXof(p.value)}</p>
      ))}
    </div>
  )
}

function DonutTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="rounded-xl border px-3 py-2 text-xs shadow-lg"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
      <p className="font-semibold mb-0.5 max-w-[160px] truncate">{d.name}</p>
      <p style={{ color: d.payload.fill }}>{fmtXof(d.value)}</p>
      <p style={{ color: 'var(--color-text-muted)' }}>{d.payload.pct} %</p>
    </div>
  )
}

// ── animated progress bars ────────────────────────────────────────────────────

function AnimatedBar({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) {
  const barRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = barRef.current
    if (!el) return
    el.style.width = '0%'
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      obs.disconnect()
      animate(el, { width: `${pct}%`, duration: 1100, delay, ease: 'outExpo' })
    }, { threshold: 0.2 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [pct, delay])
  return (
    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
      <div ref={barRef} className="h-full rounded-full" style={{ width: 0, background: color }} />
    </div>
  )
}

// ── shared card styles ────────────────────────────────────────────────────────

const cardCls   = 'rounded-2xl border p-5'
const cardStyle = { background: 'var(--color-surface)', borderColor: 'var(--color-border)' }
const headCls   = 'text-xs font-bold uppercase tracking-wide mb-4'
const headStyle = { color: 'var(--color-text-muted)' }

// ── page ──────────────────────────────────────────────────────────────────────

export default function FinancePage() {
  const [preset, setPreset] = useState<Preset>('ytd')
  const dates = presetToDates(preset)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'reports', 'summary', preset],
    queryFn: () => getReportSummary(dates),
  })

  const kpis       = data?.kpis
  const period     = data?.period
  const rawSrc     = data?.by_source   ?? []
  const rawMethod  = data?.by_method   ?? []
  const rawTop     = data?.top_members ?? []

  // Normalise + compute real percentages client-side (API sends pct_bps=0)
  const totalSrc    = rawSrc.reduce((s: number, x: any) => s + (x.amount_xof ?? x.value_xof ?? 0), 0)
  const totalMethod = rawMethod.reduce((s: number, x: any) => s + (x.amount_xof ?? x.total_xof ?? 0), 0)
  const totalTop    = rawTop.reduce((s: number, x: any) => s + (x.total_xof ?? x.amount_xof ?? 0), 0)

  const bySrc = rawSrc.map((s: any, i: number) => ({
    label:  s.label ?? s.source ?? `Source ${i + 1}`,
    amount: s.amount_xof ?? s.value_xof ?? 0,
    pct:    calcPct(s.amount_xof ?? s.value_xof ?? 0, totalSrc),
    fill:   PALETTE[i % PALETTE.length],
  }))

  const byMethod = rawMethod.map((m: any, i: number) => ({
    label:  m.label ?? m.method ?? `Méthode ${i + 1}`,
    count:  m.count ?? m.nb ?? 0,
    amount: m.amount_xof ?? m.total_xof ?? 0,
    pct:    calcPct(m.amount_xof ?? m.total_xof ?? 0, totalMethod),
    fill:   PALETTE[i % PALETTE.length],
  }))

  const topMembers = rawTop.map((m: any, i: number) => ({
    name:     m.name ?? `${m.first_name ?? ''} ${m.last_name ?? ''}`.trim(),
    pernum:   m.pernum ?? m.member_number ?? '—',
    type:     m.person_type === 'legal' || m.type === 'Morale' ? 'Morale' : 'Physique',
    payments: m.payments_count ?? m.payments ?? m.nb ?? 0,
    amount:   m.total_xof ?? m.amount_xof ?? 0,
    pct:      calcPct(m.total_xof ?? m.amount_xof ?? 0, totalTop),
    rank:     m.rank ?? i + 1,
    fill:     PALETTE[i % PALETTE.length],
  }))

  const rejectRate = kpis ? (kpis.rejection_rate_bps / 100).toFixed(1) : '—'

  const KPI_CARDS = kpis ? [
    { label: 'Total collecté',      value: fmtXof(kpis.total_collected_xof), sub: 'Sur la période sélectionnée',                                                color: '#7c3aed' },
    { label: 'Paiements confirmés', value: String(kpis.confirmed_payments),  sub: kpis.average_payment_xof ? `Panier moyen : ${fmtXof(kpis.average_payment_xof)}` : 'Aucun paiement', color: '#2563eb' },
    { label: 'Nouveaux adhérents',  value: String(kpis.new_members),         sub: `${kpis.new_members} adhésion(s) payée(s) sur ${kpis.registrations}`,         color: '#16a34a' },
    { label: 'Taux de rejet',       value: `${rejectRate} %`,                sub: `${kpis.manual_rejections} rejet(s) · ${kpis.manual_validations} validation(s)`, color: '#dc2626' },
    { label: 'En attente (actuel)', value: fmtXof(kpis.pending_amount_xof), sub: `${kpis.pending_payments} paiement(s)`,                                        color: '#d97706' },
    { label: 'YEM en circulation',  value: Math.round(parseFloat(kpis.yem_in_circulation)).toLocaleString('fr-FR'), sub: 'Soldes disponibles',                   color: '#0891b2' },
  ] : []

  return (
    <>
      <Helmet><title>Finance & Rapports — Admin CECT</title></Helmet>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--color-primary)' }}>Finance & Rapports</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {period
              ? <>Période : <strong>{fmtDate(period.from)}</strong> au <strong>{fmtDate(period.to)}</strong> · Seuls les paiements <em>confirmés</em> sont comptés.</>
              : 'Chargement…'
            }
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => refetch()}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} aria-hidden /> Actualiser
          </button>
          <button className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
            <Download size={13} aria-hidden /> Export CSV
          </button>
          <button className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg text-white"
            style={{ background: 'var(--color-primary)' }} onClick={() => window.print()}>
            <Printer size={13} aria-hidden /> Imprimer
          </button>
        </div>
      </div>

      {/* Period presets */}
      <div className="flex gap-2 flex-wrap mb-6">
        {PRESETS.map(p => (
          <button key={p.id} onClick={() => setPreset(p.id)}
            className="text-xs font-bold px-4 py-2 rounded-full border transition-colors"
            style={preset === p.id
              ? { background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' }
              : { background: 'var(--color-surface)', color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }
            }>
            {p.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {isError && (
        <div className="rounded-xl border p-4 mb-6 text-sm"
          style={{ borderColor: 'var(--color-danger)', background: 'var(--color-danger)0d', color: 'var(--color-danger)' }}>
          Impossible de charger les données financières. Vérifiez la connexion au serveur.
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && !data && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={cardCls} style={cardStyle}>
              <div className="h-3 w-24 rounded-md mb-3 animate-pulse" style={{ background: 'var(--color-border)' }} />
              <div className="h-6 w-32 rounded-md mb-2 animate-pulse" style={{ background: 'var(--color-border)' }} />
              <div className="h-2.5 w-40 rounded-md animate-pulse"   style={{ background: 'var(--color-border)' }} />
            </div>
          ))}
        </div>
      )}

      {/* KPIs */}
      {KPI_CARDS.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-8">
          {KPI_CARDS.map(({ label, value, sub, color }) => (
            <div key={label} className={cardCls} style={{ ...cardStyle, borderTopWidth: 3, borderTopColor: color }}>
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
              <p className="text-xl font-extrabold leading-tight mb-1" style={{ color: 'var(--color-text)' }}>{value}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Charts row ── */}
      {(bySrc.length > 0 || byMethod.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

          {/* Donut — Revenue by source */}
          {bySrc.length > 0 && (
            <div className={cardCls} style={cardStyle}>
              <h2 className={headCls} style={headStyle}>Revenus par source</h2>
              <div className="flex items-center gap-4">
                {/* Donut */}
                <div className="shrink-0" style={{ width: 150, height: 150 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={bySrc} dataKey="amount" nameKey="label"
                        cx="50%" cy="50%" innerRadius="38%" outerRadius="60%" paddingAngle={2}>
                        {bySrc.map((s, i) => <Cell key={i} fill={s.fill} stroke="none" />)}
                      </Pie>
                      <Tooltip content={<DonutTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="flex-1 space-y-2 min-w-0">
                  {bySrc.map((s, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between text-xs gap-2 mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="h-2 w-2 rounded-full shrink-0" style={{ background: s.fill }} />
                          <span className="truncate" style={{ color: 'var(--color-text)' }}>{s.label}</span>
                        </div>
                        <span className="font-bold shrink-0" style={{ color: 'var(--color-text)' }}>{s.pct} %</span>
                      </div>
                      <AnimatedBar pct={s.pct} color={s.fill} delay={i * 80} />
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{fmtXof(s.amount)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bar chart — Payment methods */}
          {byMethod.length > 0 && (
            <div className={cardCls} style={cardStyle}>
              <h2 className={headCls} style={headStyle}>Modes de paiement</h2>
              {/* Bar chart */}
              <ResponsiveContainer width="100%" height={byMethod.length > 3 ? 180 : 130}>
                <BarChart data={byMethod} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="label"
                    tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                    axisLine={false} tickLine={false} width={110} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-border)' }} />
                  <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                    {byMethod.map((m, i) => <Cell key={i} fill={m.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {/* Table below chart */}
              <table className="w-full text-xs mt-4">
                <thead>
                  <tr>
                    {['Mode', 'Paiements', 'Total', 'Part'].map(h => (
                      <th key={h} className="pb-1.5 text-left font-bold" style={{ color: 'var(--color-text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {byMethod.map((m, i) => (
                    <tr key={i} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                      <td className="py-1.5 font-semibold" style={{ color: 'var(--color-text)' }}>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: m.fill }} />
                          {m.label}
                        </span>
                      </td>
                      <td className="py-1.5 text-right" style={{ color: 'var(--color-text-muted)' }}>{m.count}</td>
                      <td className="py-1.5 font-semibold text-right" style={{ color: 'var(--color-text)' }}>{fmtXof(m.amount)}</td>
                      <td className="py-1.5 text-right" style={{ color: 'var(--color-text-muted)' }}>{m.pct} %</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Top members — horizontal bar chart + table ── */}
      {topMembers.length > 0 && (
        <div className={`${cardCls} mb-6`} style={cardStyle}>
          <h2 className={headCls} style={headStyle}>Top membres par montant payé</h2>

          {/* Horizontal bar chart */}
          <ResponsiveContainer width="100%" height={Math.max(120, topMembers.length * 44)}>
            <BarChart data={topMembers} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name"
                tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                axisLine={false} tickLine={false} width={140} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-border)' }} />
              <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                {topMembers.map((m, i) => <Cell key={i} fill={m.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Detail table */}
          <div className="overflow-x-auto mt-4 border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
            <table className="w-full text-sm" style={{ minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['#', 'Membre', 'Type', 'Paiements', 'Total', 'Part'].map(h => (
                    <th key={h} className="pb-2 pt-1 text-left text-xs font-bold" style={{ color: 'var(--color-text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topMembers.map((m, i) => (
                  <tr key={i} className="border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
                    <td className="py-2.5 pr-2">
                      <span className="h-5 w-5 rounded-full inline-flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: m.fill }}>{m.rank}</span>
                    </td>
                    <td className="py-2.5">
                      <p className="font-semibold" style={{ color: 'var(--color-text)' }}>{m.name}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{m.pernum}</p>
                    </td>
                    <td className="py-2.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>{m.type}</td>
                    <td className="py-2.5 text-center" style={{ color: 'var(--color-text-muted)' }}>{m.payments}</td>
                    <td className="py-2.5 font-bold" style={{ color: 'var(--color-text)' }}>{fmtXof(m.amount)}</td>
                    <td className="py-2.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>{m.pct} %</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && KPI_CARDS.length === 0 && (
        <div className="rounded-2xl border p-12 text-center" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Aucune donnée financière pour cette période.</p>
        </div>
      )}
    </>
  )
}
