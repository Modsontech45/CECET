import { Helmet } from 'react-helmet-async'
import { ArrowUpRight, ShoppingCart, Store, Wallet, TriangleAlert } from 'lucide-react'

const VENDEUR = [
  { code: 'V1',  droit: 100000,   quota_annuel: 1500,  quota_mensuel: 125 },
  { code: 'V2',  droit: 250000,   quota_annuel: 4000,  quota_mensuel: 333 },
  { code: 'V3',  droit: 400000,   quota_annuel: 6000,  quota_mensuel: 500 },
  { code: 'V4',  droit: 600000,   quota_annuel: 9000,  quota_mensuel: 750 },
  { code: 'V5',  droit: 800000,   quota_annuel: 15000, quota_mensuel: 1250 },
  { code: 'V6',  droit: 1500000,  quota_annuel: 26000, quota_mensuel: 2250 },
]

const CONSOMMATEUR = [
  { code: 'PERSO', montant: 0,       remise: 15, prix_yem: 650, mensuel: '—',    actif: true },
  { code: 'C1',    montant: 300000,  remise: 15, prix_yem: 650, mensuel: '38,5', actif: true },
  { code: 'C2',    montant: 600000,  remise: 15, prix_yem: 650, mensuel: '76,9', actif: true },
  { code: 'C3',    montant: 1200000, remise: 15, prix_yem: 650, mensuel: '153',  actif: true },
  { code: 'C4',    montant: 1800000, remise: 15, prix_yem: 650, mensuel: '230',  actif: true },
  { code: 'C5',    montant: 3000000, remise: 15, prix_yem: 650, mensuel: '384',  actif: true },
  { code: 'C6',    montant: 6000000, remise: 15, prix_yem: 650, mensuel: '769',  actif: true },
]

const MARCHAND = [
  { code: 'BRONZE',  nom: 'Bronze',  contribution: 100000,  yem: 6000,   duree: 48 },
  { code: 'ARGENT',  nom: 'Argent',  contribution: 300000,  yem: 15000,  duree: 48 },
  { code: 'OR',      nom: 'Or',      contribution: 500000,  yem: 30000,  duree: 48 },
  { code: 'DIAMANT', nom: 'Diamant', contribution: 1000000, yem: 65000,  duree: 48 },
  { code: 'PLATINE', nom: 'Platine', contribution: 2000000, yem: 140000, duree: 48 },
  { code: 'PRESTIGE',nom: 'Prestige',contribution: 5000000, yem: 350000, duree: 48 },
]

function fmt(n: number) {
  return n === 0 ? '—' : n.toLocaleString('fr-FR') + ' FCFA'
}

const sectionClass = 'rounded-2xl border mb-6 overflow-hidden'
const sectionStyle = { borderColor: 'var(--color-border)', background: 'var(--color-surface)' }
const headClass = 'flex items-center gap-3 px-5 py-4 border-b'
const headStyleBorder = { borderColor: 'var(--color-border)' }
const thClass = 'px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wide'
const thStyle = { color: 'var(--color-text-muted)' }
const tdClass = 'px-3 py-2.5 text-sm'
const trBorder = { borderTop: '1px solid var(--color-border)' }

export default function ConfigurationPage() {
  return (
    <>
      <Helmet><title>Configuration — Admin CECT</title></Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold" style={{ color: 'var(--color-primary)' }}>Configuration des packs</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Modifier les tarifs, remises, quotas et cours du YEM. Toutes les valeurs sont indicatives (PROVISOIRE).
        </p>
      </div>

      {/* Warning */}
      <div
        className="flex items-start gap-3 p-4 rounded-xl border mb-7"
        style={{ background: '#fdf1e1', borderColor: '#f3e3bd', color: '#93690a' }}
      >
        <TriangleAlert size={16} className="shrink-0 mt-0.5" aria-hidden />
        <p className="text-sm leading-relaxed">
          <strong>Valeurs provisoires — </strong>
          Les cours et remises ci-dessous ne sont pas encore ratifiés par le Conseil d'administration (PO-01, PO-02).
          La modification réelle se fera via l'API Laravel lors de la phase suivante.
        </p>
      </div>

      {/* Vendeur */}
      <div className={sectionClass} style={{ ...sectionStyle, borderTopWidth: 4, borderTopColor: '#2563eb' }}>
        <div className={headClass} style={headStyleBorder}>
          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: '#eaf0fe', color: '#2563eb' }}>
            <ArrowUpRight size={16} aria-hidden />
          </div>
          <h2 className="font-bold" style={{ color: 'var(--color-text)' }}>Packs Vendeur — droit d'accès</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 480 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th className={thClass} style={thStyle}>Code</th>
                <th className={thClass} style={thStyle}>Droit d'accès</th>
                <th className={thClass} style={thStyle}>Quota annuel</th>
                <th className={thClass} style={thStyle}>Quota mensuel</th>
              </tr>
            </thead>
            <tbody>
              {VENDEUR.map(v => (
                <tr key={v.code} style={trBorder}>
                  <td className={tdClass}><strong style={{ color: '#1741a6' }}>{v.code}</strong></td>
                  <td className={tdClass} style={{ color: 'var(--color-text)' }}>{v.droit.toLocaleString('fr-FR')} FCFA</td>
                  <td className={tdClass} style={{ color: 'var(--color-text)' }}>{v.quota_annuel.toLocaleString('fr-FR')} YEM</td>
                  <td className={tdClass} style={{ color: 'var(--color-text-muted)' }}>{v.quota_mensuel.toLocaleString('fr-FR')} YEM</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Consommateur */}
      <div className={sectionClass} style={{ ...sectionStyle, borderTopWidth: 4, borderTopColor: '#7c3aed' }}>
        <div className={headClass} style={headStyleBorder}>
          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: '#f2ecfe', color: '#7c3aed' }}>
            <ShoppingCart size={16} aria-hidden />
          </div>
          <h2 className="font-bold" style={{ color: 'var(--color-text)' }}>Packs Consommateur (C1–C8 + Perso)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 560 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th className={thClass} style={thStyle}>Code</th>
                <th className={thClass} style={thStyle}>Montant affiché</th>
                <th className={thClass} style={thStyle}>Remise %</th>
                <th className={thClass} style={thStyle}>Prix du YEM</th>
                <th className={thClass} style={thStyle}>YEM / mois</th>
                <th className={thClass} style={thStyle}>Actif</th>
              </tr>
            </thead>
            <tbody>
              {CONSOMMATEUR.map(c => (
                <tr key={c.code} style={trBorder}>
                  <td className={tdClass}><strong style={{ color: '#54209e' }}>{c.code}</strong></td>
                  <td className={tdClass} style={{ color: 'var(--color-text)' }}>{fmt(c.montant)}</td>
                  <td className={tdClass} style={{ color: 'var(--color-text)' }}>{c.remise} %</td>
                  <td className={tdClass} style={{ color: 'var(--color-text)' }}>{c.prix_yem} FCFA</td>
                  <td className={tdClass} style={{ color: 'var(--color-text-muted)' }}>{c.mensuel}</td>
                  <td className={tdClass}>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#eaf6ee', color: '#1c7a43' }}>
                      {c.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Marchand */}
      <div className={sectionClass} style={{ ...sectionStyle, borderTopWidth: 4, borderTopColor: '#db2777' }}>
        <div className={headClass} style={headStyleBorder}>
          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: '#fce7f3', color: '#db2777' }}>
            <Store size={16} aria-hidden />
          </div>
          <h2 className="font-bold" style={{ color: 'var(--color-text)' }}>Packs Marchand — personnes morales</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 480 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th className={thClass} style={thStyle}>Code</th>
                <th className={thClass} style={thStyle}>Nom</th>
                <th className={thClass} style={thStyle}>Contribution</th>
                <th className={thClass} style={thStyle}>Total YEM</th>
                <th className={thClass} style={thStyle}>Durée</th>
              </tr>
            </thead>
            <tbody>
              {MARCHAND.map(m => (
                <tr key={m.code} style={trBorder}>
                  <td className={tdClass}><strong style={{ color: '#9d174d' }}>{m.code}</strong></td>
                  <td className={tdClass} style={{ color: 'var(--color-text)' }}>{m.nom}</td>
                  <td className={tdClass} style={{ color: 'var(--color-text)' }}>{m.contribution.toLocaleString('fr-FR')} FCFA</td>
                  <td className={tdClass} style={{ color: 'var(--color-text)' }}>{m.yem.toLocaleString('fr-FR')} YEM</td>
                  <td className={tdClass} style={{ color: 'var(--color-text-muted)' }}>{m.duree} semaines</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Personnel */}
      <div className={sectionClass} style={{ ...sectionStyle, borderTopWidth: 4, borderTopColor: '#d97706' }}>
        <div className={headClass} style={headStyleBorder}>
          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: '#fdf1e1', color: '#d97706' }}>
            <Wallet size={16} aria-hidden />
          </div>
          <h2 className="font-bold" style={{ color: 'var(--color-text)' }}>Pack Personnel — achat libre</h2>
        </div>
        <div className="px-5 py-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Le membre choisit son montant (minimum configurable). La remise et le prix du YEM sont ceux du pack Perso ci-dessus.
          Sans quota ni durée fixe. Disponible pour les personnes physiques comme morales.
        </div>
      </div>
    </>
  )
}
