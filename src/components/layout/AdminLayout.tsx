import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogOut, LayoutDashboard, Users, CircleCheck, Landmark, Settings, Download } from 'lucide-react'
import { useAuth } from '@/app/AuthContext'
import { cn } from '@/lib/utils'

const ROLE_LABELS: Record<string, string> = {
  administrateur: 'Administrateur',
  superadmin: 'Super-administrateur',
  validateur: 'Validateur',
  comptabilite: 'Comptabilité',
  utilisateur: 'Utilisateur',
}

const NAV_ITEMS = [
  { to: '/admin', label: 'Accueil', icon: LayoutDashboard, end: true, roles: ['administrateur','superadmin','validateur','comptabilite'] },
  { to: '/admin/validations', label: 'Validations', icon: CircleCheck, end: false, roles: ['validateur','administrateur','superadmin'] },
  { to: '/admin/membres', label: 'Membres', icon: Users, end: false, roles: ['administrateur','superadmin'] },
  { to: '/admin/finance', label: 'Finance', icon: Landmark, end: false, roles: ['comptabilite','administrateur','superadmin'] },
  { to: '/admin/configuration', label: 'Configuration', icon: Settings, end: false, roles: ['superadmin'] },
  { to: '/admin/export', label: 'Export', icon: Download, end: false, roles: ['administrateur','superadmin','comptabilite'] },
]

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    navigate('/connexion')
    return null
  }

  const visibleNav = NAV_ITEMS.filter(item => item.roles.includes(user.role))

  function handleLogout() {
    logout()
    navigate('/connexion')
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* ── Topbar ── */}
      <header
        className="relative overflow-hidden px-5 sm:px-8 py-4 flex items-center justify-between gap-4 flex-wrap"
        style={{ background: 'var(--color-primary)' }}
      >
        {/* Gold radial glow */}
        <div
          className="pointer-events-none absolute -top-1/2 -right-4 w-72 h-72 rounded-full"
          style={{ background: 'rgba(239,179,3,0.18)' }}
          aria-hidden
        />
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-10 w-10 rounded-xl bg-white overflow-hidden shrink-0 p-0.5">
            <img src="/logos/CECT_logo_transparent.png" alt="CECT" className="w-full h-full object-contain" />
          </div>
          <div className="text-white leading-tight">
            <strong className="block text-sm font-bold">Espace Admin CECT</strong>
            <span className="block text-xs opacity-70">{ROLE_LABELS[user.role] ?? user.role} · {user.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 relative z-10 flex-wrap">
          <a href="/" className="text-xs font-semibold text-white/80 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10">
            ← Site public
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-semibold text-white border border-white/25 bg-white/12 hover:bg-white/22 px-3 py-2 rounded-lg transition-colors"
          >
            <LogOut size={13} aria-hidden />
            Déconnexion
          </button>
        </div>
      </header>

      {/* ── Sub-nav ── */}
      <nav
        className="sticky top-0 z-20 flex gap-0.5 overflow-x-auto px-4 sm:px-8 border-b shadow-sm"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        aria-label="Navigation admin"
      >
        {visibleNav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 px-4 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors',
                isActive
                  ? 'text-[var(--color-primary)] border-[var(--color-primary)]'
                  : 'text-[var(--color-text-muted)] border-transparent hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/40'
              )
            }
          >
            <Icon size={15} aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* ── Page content ── */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
