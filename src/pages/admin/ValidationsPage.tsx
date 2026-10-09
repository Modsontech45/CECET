import { Helmet } from 'react-helmet-async'
import { CircleCheck, CircleX, Clock, Construction } from 'lucide-react'

const MOCK_VALIDATIONS = [
  { id: 1, membre: 'Koffi Mensah', pernum: 'CECT-U-0001', type: 'Adhésion', montant: '25 000 FCFA', date: '2026-10-07', statut: 'en_attente' },
  { id: 2, membre: 'AL-IMANE SARL', pernum: '1001292934', type: 'Pack Vendeur P4', montant: '600 000 FCFA', date: '2026-10-06', statut: 'en_attente' },
  { id: 3, membre: 'Yendoukoa NAKORE', pernum: '1001043953', type: 'Rechargement Perso', montant: '5 000 FCFA', date: '2026-09-28', statut: 'valide' },
  { id: 4, membre: 'Bouraima ADAM LANSI', pernum: '1001096436', type: 'Pack Consommateur C1', montant: '255 000 FCFA', date: '2026-09-20', statut: 'valide' },
  { id: 5, membre: 'mm AMODOU', pernum: '123456', type: 'Adhésion', montant: '25 000 FCFA', date: '2026-10-01', statut: 'rejete' },
]

const STATUT_CONFIG = {
  en_attente: { label: 'En attente', bg: '#fdf1e1', color: '#d97706', icon: Clock },
  valide:     { label: 'Validé',     bg: '#eaf6ee', color: '#1c7a43', icon: CircleCheck },
  rejete:     { label: 'Rejeté',     bg: '#fceceb', color: '#c23b32', icon: CircleX },
}

export default function ValidationsPage() {
  const pending = MOCK_VALIDATIONS.filter(v => v.statut === 'en_attente')
  const done    = MOCK_VALIDATIONS.filter(v => v.statut !== 'en_attente')

  return (
    <>
      <Helmet><title>Validations — Admin CECT</title></Helmet>

      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--color-primary)' }}>Validations</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Confirmer les arrivées de YEM sur le Pernum CECT et valider les adhésions.
          </p>
        </div>
        {pending.length > 0 && (
          <span
            className="text-sm font-bold px-3 py-1.5 rounded-full"
            style={{ background: '#fdf1e1', color: '#d97706' }}
          >
            {pending.length} en attente
          </span>
        )}
      </div>

      {/* Phase notice */}
      <div
        className="flex items-center gap-3 p-4 rounded-xl border mb-6"
        style={{ background: 'color-mix(in srgb, var(--brand-gold-500) 8%, transparent)', borderColor: 'color-mix(in srgb, var(--brand-gold-600) 35%, transparent)' }}
      >
        <Construction size={16} className="shrink-0" style={{ color: 'var(--brand-gold-700)' }} aria-hidden />
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          <span className="font-semibold" style={{ color: 'var(--brand-gold-700)' }}>Données de démonstration — </span>
          Les validations réelles viendront de l'API Laravel lors de la prochaine phase.
        </p>
      </div>

      {/* Pending */}
      <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--color-text-muted)' }}>
        En attente ({pending.length})
      </h2>
      <ValidationTable rows={pending} actionable />

      {/* History */}
      <h2 className="text-sm font-bold uppercase tracking-wide mb-3 mt-8" style={{ color: 'var(--color-text-muted)' }}>
        Historique récent
      </h2>
      <ValidationTable rows={done} />
    </>
  )
}

function ValidationTable({ rows, actionable = false }: { rows: typeof MOCK_VALIDATIONS; actionable?: boolean }) {
  if (rows.length === 0) {
    return (
      <div
        className="text-center py-10 text-sm rounded-2xl border"
        style={{ color: 'var(--color-text-muted)', background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        Aucune demande.
      </div>
    )
  }

  return (
    <div className="rounded-2xl border overflow-hidden mb-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: 560 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              {['Membre', 'Type de demande', 'Montant', 'Date', 'Statut', actionable ? 'Action' : ''].filter(Boolean).map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(v => {
              const cfg = STATUT_CONFIG[v.statut as keyof typeof STATUT_CONFIG]
              const Icon = cfg.icon
              return (
                <tr key={v.id} className="border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
                  <td className="px-4 py-3">
                    <p className="font-semibold" style={{ color: 'var(--color-text)' }}>{v.membre}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{v.pernum}</p>
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text)' }}>{v.type}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: 'var(--color-text)' }}>{v.montant}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>{v.date}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>
                      <Icon size={11} aria-hidden /> {cfg.label}
                    </span>
                  </td>
                  {actionable && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg text-white"
                          style={{ background: 'var(--color-primary)' }}
                        >
                          <CircleCheck size={12} aria-hidden /> Valider
                        </button>
                        <button
                          className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg"
                          style={{ background: '#fceceb', color: '#c23b32' }}
                        >
                          <CircleX size={12} aria-hidden /> Rejeter
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
