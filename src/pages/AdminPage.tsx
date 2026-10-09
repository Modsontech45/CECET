import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, Users, CircleCheck, Landmark, Settings, LogOut, Construction, ChevronRight } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/app/AuthContext'

const ROLE_LABELS: Record<string, string> = {
  administrateur: 'Administrateur',
  superadmin: 'Super-administrateur',
  validateur: 'Validateur',
  comptabilite: 'Comptabilité',
}

const ROLE_COLOR: Record<string, string> = {
  administrateur: 'var(--color-primary)',
  superadmin: 'var(--brand-gold-700)',
  validateur: 'var(--color-accent)',
  comptabilite: 'var(--brand-gold-600)',
}

const ADMIN_AREAS = [
  {
    icon: CircleCheck,
    title: 'Validations',
    desc: 'Confirmer les arrivées de YEM sur le Pernum CECT.',
    route: '/admin/validations',
    roles: ['validateur', 'administrateur', 'superadmin'],
  },
  {
    icon: Landmark,
    title: 'Finance & Comptabilité',
    desc: 'Suivi des paiements FCFA, rapprochements, exports.',
    route: '/admin/finance',
    roles: ['comptabilite', 'administrateur', 'superadmin'],
  },
  {
    icon: Users,
    title: 'Membres',
    desc: 'Gérer les adhésions, les packs et les statuts des comptes.',
    route: '/admin/membres',
    roles: ['administrateur', 'superadmin'],
  },
  {
    icon: Settings,
    title: 'Configuration',
    desc: 'Paramétrer les cours YEM, les quotas, les packs et les règles.',
    route: '/admin/configuration',
    roles: ['superadmin'],
  },
]

export default function AdminPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/connexion')
  }

  if (!user) {
    navigate('/connexion')
    return null
  }

  const availableAreas = ADMIN_AREAS.filter((a) => a.roles.includes(user.role))

  return (
    <>
      <Helmet>
        <title>Back-office — CECT Togo</title>
      </Helmet>

      <Section>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
              <ShieldCheck size={26} className="text-[var(--color-primary)]" aria-hidden />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text)]">
                Bonjour, {user.name}
              </h1>
              <span
                className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                style={{
                  background: `color-mix(in srgb, ${ROLE_COLOR[user.role] ?? 'var(--color-primary)'} 15%, transparent)`,
                  color: ROLE_COLOR[user.role] ?? 'var(--color-primary)',
                }}
              >
                {ROLE_LABELS[user.role] ?? user.role}
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut size={15} aria-hidden />
            Se déconnecter
          </Button>
        </div>

        {/* Phase notice */}
        <div className="flex items-center gap-3 p-4 rounded-xl border border-[var(--brand-gold-600)]/40 bg-[var(--brand-gold-500)]/5 mb-8">
          <Construction size={18} className="text-[var(--brand-gold-700)] shrink-0" aria-hidden />
          <p className="text-sm text-[var(--color-text-muted)]">
            <span className="font-semibold text-[var(--brand-gold-700)]">Phase suivante — </span>
            Le back-office complet (tableaux de bord, actions, rapports) sera construit lors de la prochaine phase de développement.
          </p>
        </div>

        {/* Admin area cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-8">
          {availableAreas.map(({ icon: Icon, title, desc, route }) => (
            <Link
              key={route}
              to={route}
              className="flex items-start gap-4 p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/50 hover:shadow-md transition-all group"
            >
              <div className="h-11 w-11 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0 group-hover:bg-[var(--color-primary)] transition-colors">
                <Icon size={20} className="text-[var(--color-primary)] group-hover:text-white transition-colors" aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-[var(--color-text)] mb-1">{title}</h2>
                <p className="text-sm text-[var(--color-text-muted)] leading-snug">{desc}</p>
              </div>
              <ChevronRight size={18} className="text-[var(--color-text-muted)] shrink-0 mt-0.5 group-hover:text-[var(--color-primary)] transition-colors" aria-hidden />
            </Link>
          ))}
        </div>

        {availableAreas.length === 0 && (
          <p className="text-center text-[var(--color-text-muted)] py-12">
            Aucune zone accessible pour ce rôle.
          </p>
        )}

        <div className="text-center">
          <Link to="/" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
            ← Retour au site public
          </Link>
        </div>
      </Section>
    </>
  )
}
