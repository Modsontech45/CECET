import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Download, FileSpreadsheet, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'

// ── helpers ───────────────────────────────────────────────────────────────────

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}
function startOfYearIso() {
  return `${new Date().getFullYear()}-01-01`
}

async function downloadCsv(type: string, params: Record<string, string> = {}) {
  const res = await api.get(`/admin/exports/${type}`, {
    responseType: 'blob',
    params,
  })
  const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `cect_${type}_${todayIso()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function openPrintReport(from: string, to: string) {
  const params = new URLSearchParams({ from, to }).toString()
  window.open(`/api/v1/admin/reports/summary/print?${params}`, '_blank')
}

// ── types ─────────────────────────────────────────────────────────────────────

type ExportState = 'idle' | 'loading' | 'done' | 'error'

// ── ExportCard ────────────────────────────────────────────────────────────────

function ExportCard({
  icon: Icon, title, desc, format, color, colorBg,
  onDownload,
  showDates = false,
}: {
  icon: React.ElementType
  title: string
  desc: string
  format: string
  color: string
  colorBg: string
  onDownload: (from: string, to: string) => Promise<void>
  showDates?: boolean
}) {
  const [state, setState] = useState<ExportState>('idle')
  const [from,  setFrom]  = useState(startOfYearIso())
  const [to,    setTo]    = useState(todayIso())
  const [errMsg, setErrMsg] = useState('')

  async function handle() {
    setState('loading')
    setErrMsg('')
    try {
      await onDownload(from, to)
      setState('done')
      setTimeout(() => setState('idle'), 3000)
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? 'Erreur lors du téléchargement.'
      setErrMsg(msg)
      setState('error')
    }
  }

  const inputCls = 'rounded-lg border px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow'
  const inputStyle = { borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl border"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: colorBg, color }}>
          <Icon size={20} aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold mb-0.5" style={{ color: 'var(--color-text)' }}>{title}</h2>
          <p className="text-sm leading-snug" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
        </div>
      </div>

      {/* Date pickers for period-scoped exports */}
      {showDates && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Du</span>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className={inputCls} style={inputStyle} />
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>au</span>
          <input type="date" value={to}   onChange={e => setTo(e.target.value)}   className={inputCls} style={inputStyle} />
        </div>
      )}

      {/* Feedback */}
      {state === 'error' && (
        <div className="flex items-start gap-2 text-xs rounded-lg px-3 py-2"
          style={{ background: 'var(--color-danger)0d', color: 'var(--color-danger)', border: '1px solid var(--color-danger)30' }}>
          <AlertCircle size={13} className="shrink-0 mt-0.5" aria-hidden />
          {errMsg}
        </div>
      )}
      {state === 'done' && (
        <div className="flex items-center gap-2 text-xs rounded-lg px-3 py-2"
          style={{ background: 'var(--color-success)12', color: 'var(--color-success)', border: '1px solid var(--color-success)30' }}>
          <CheckCircle2 size={13} aria-hidden /> Téléchargement réussi.
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: colorBg, color }}>{format}</span>
        <button onClick={handle} disabled={state === 'loading'}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-opacity disabled:opacity-60 active:scale-95"
          style={{ background: color }}>
          {state === 'loading'
            ? <><Loader2 size={13} className="animate-spin" aria-hidden /> Génération…</>
            : <><Download size={13} aria-hidden /> Télécharger</>
          }
        </button>
      </div>
    </div>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function ExportPage() {
  return (
    <>
      <Helmet><title>Export — Admin CECT</title></Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold" style={{ color: 'var(--color-primary)' }}>Export Excel / CSV</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Téléchargez les données de la plateforme en format tableur ou PDF.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Membres */}
        <ExportCard
          icon={FileSpreadsheet}
          title="Liste des membres"
          desc="Nom, Pernum, type, téléphone, email, statut adhésion, packs actifs, YEM."
          format="Excel / CSV"
          color="var(--brand-green-600)"
          colorBg="color-mix(in srgb, var(--brand-green-600) 10%, transparent)"
          onDownload={() => downloadCsv('members')}
        />

        {/* Paiements */}
        <ExportCard
          icon={FileSpreadsheet}
          title="Paiements confirmés"
          desc="Tous les paiements validés avec date, membre, type, montant, mode de paiement."
          format="Excel / CSV"
          color="#7c3aed"
          colorBg="#f2ecfe"
          showDates
          onDownload={(from, to) => downloadCsv('payments', { from, to })}
        />

        {/* Rapport PDF */}
        <ExportCard
          icon={FileText}
          title="Rapport de la période"
          desc="KPIs, répartition des revenus, top membres, activité YEM. Version imprimable."
          format="PDF"
          color="#dc2626"
          colorBg="#fdeaea"
          showDates
          onDownload={(from, to) => { openPrintReport(from, to); return Promise.resolve() }}
        />

        {/* Souscriptions */}
        <ExportCard
          icon={FileSpreadsheet}
          title="Souscriptions actives"
          desc="Tous les packs actifs avec dates de début, de fin, quotas et YEM disponibles."
          format="Excel / CSV"
          color="#0891b2"
          colorBg="#e0f5fa"
          onDownload={() => downloadCsv('subscriptions')}
        />

      </div>
    </>
  )
}
