import { useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Users, Landmark, CircleCheck, Settings, ChevronRight, LayoutDashboard, Download, Coins, Clock } from 'lucide-react'
import { animate, stagger } from 'animejs'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/app/AuthContext'
import { useCountUp } from '@/hooks/useCountUp'
import { getAdminOverview } from '@/services/memberService'

const AREA_CARDS = [
  {
    to: '/admin/validations',
    icon: CircleCheck,
    title: 'Validations',
    desc: 'Valider ou rejeter les adhésions, packs et rechargements.',
    color: '#d97706',
    colorBg: '#fdf1e1',
    roles: ['validateur', 'administrateur', 'superadmin'],
  },
  {
    to: '/admin/membres',
    icon: Users,
    title: 'Membres',
    desc: 'Consulter la liste et la fiche détaillée de chaque membre.',
    color: 'var(--color-primary)',
    colorBg: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
    roles: ['administrateur', 'superadmin'],
  },
  {
    to: '/admin/finance',
    icon: Landmark,
    title: 'Finance & Rapports',
    desc: 'Revenus, paiements confirmés, répartition, export CSV.',
    color: '#7c3aed',
    colorBg: '#f2ecfe',
    roles: ['comptabilite', 'administrateur', 'superadmin'],
  },
  {
    to: '/admin/configuration',
    icon: Settings,
    title: 'Configuration des packs',
    desc: 'Modifier les tarifs, remises, quotas et cours du YEM.',
    color: '#db2777',
    colorBg: '#fce7f3',
    roles: ['superadmin'],
  },
  {
    to: '/admin/export',
    icon: Download,
    title: 'Export Excel / CSV',
    desc: 'Télécharger les données membres et paiements.',
    color: '#0891b2',
    colorBg: '#e0f5fa',
    roles: ['administrateur', 'superadmin', 'comptabilite'],
  },
  {
    to: '/admin',
    icon: LayoutDashboard,
    title: 'Tableau de bord',
    desc: "Vue d'ensemble : revenus, YEM, répartition des packs.",
    color: '#2563eb',
    colorBg: '#eaf0fe',
    roles: ['administrateur', 'superadmin'],
  },
]

/* ── Single KPI card with its own count-up ── */
type KpiDef = { label: string; numericValue: number; display: (n: number) => string; icon: React.ElementType; color: string }
function KpiCard({ label, numericValue, display, icon: Icon, color, delay }: KpiDef & { delay: number }) {
  const { count, ref } = useCountUp(numericValue, numericValue > 1000 ? 1800 : 1200, delay)
  return (
    <div
      className="flex items-center gap-3 p-4 rounded-2xl border"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}18`, color }}
      >
        <Icon size={18} aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide truncate" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
        {/* ref attached here so IntersectionObserver watches the number element */}
        <p
          ref={ref as React.RefObject<HTMLParagraphElement>}
          className="text-lg font-extrabold leading-tight truncate tabular-nums"
          style={{ color: 'var(--color-text)' }}
        >
          {display(count)}
        </p>
      </div>
    </div>
  )
}

export default function AdminHomePage() {
  const { user } = useAuth()
  const cardsRef = useRef<HTMLDivElement>(null)

  const { data: overview } = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: getAdminOverview,
  })

  const KPIS = [
    { label: 'Membres inscrits',    numericValue: overview?.members ?? 0,            display: (n: number) => `${n}`,                               icon: Users, color: 'var(--color-primary)' },
    { label: 'Total collecté',      numericValue: overview?.total_collected_xof ?? 0, display: (n: number) => `${n.toLocaleString('fr-FR')} FCFA`, icon: Coins, color: '#7c3aed' },
    { label: 'Demandes en attente', numericValue: overview?.pending_validations ?? 0, display: (n: number) => `${n}`,                               icon: Clock, color: '#d97706' },
    { label: 'YEM en circulation',  numericValue: Math.round(parseFloat(overview?.yem_in_circulation ?? '0')), display: (n: number) => `${n}`, icon: Coins, color: '#0891b2' },
  ]

  /* ── Staggered entrance for area cards ── */
  useEffect(() => {
    const container = cardsRef.current
    if (!container) return
    const cards = container.querySelectorAll<HTMLElement>('.area-card')
    // start invisible
    cards.forEach(c => { c.style.opacity = '0'; c.style.transform = 'translateY(24px)' })

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      animate(cards, {
        opacity: [0, 1],
        translateY: [24, 0],
        duration: 540,
        ease: 'outExpo',
        delay: stagger(70),
      })
    }, { threshold: 0.1 })

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  if (!user) return null

  const now = new Date()
  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const availableCards = AREA_CARDS.filter(c => c.roles.includes(user.role))

  return (
    <>
      <Helmet><title>Accueil Admin — CECT Togo</title></Helmet>

      {/* Welcome banner */}
      <div
        className="relative overflow-hidden rounded-2xl px-6 sm:px-8 py-7 mb-8 text-white"
        style={{ background: 'var(--color-primary)' }}
      >
        <div
          className="pointer-events-none absolute -bottom-1/2 -left-6 w-80 h-80 rounded-full opacity-30"
          style={{ background: 'rgba(124,58,237,0.35)' }}
          aria-hidden
        />
        <p className="text-xs font-semibold uppercase tracking-widest opacity-65 mb-1">{dateStr}</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1">Bonjour, {user.name}</h1>
        <p className="text-sm opacity-75">Choisissez la section à ouvrir.</p>
      </div>

      {/* KPI stats — each card manages its own count-up */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {KPIS.map((kpi, i) => (
          <KpiCard key={kpi.label} {...kpi} delay={i * 120} />
        ))}
      </div>

      {/* Area cards — anime.js stagger entrance */}
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
        Accès rapide
      </p>
      <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableCards.map(({ to, icon: Icon, title, desc, color, colorBg }) => (
          <Link
            key={to}
            to={to}
            className="area-card flex flex-col gap-3 p-5 rounded-2xl border transition-shadow hover:shadow-lg group"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              borderTopWidth: '3px',
              borderTopColor: color,
            }}
          >
            <div
              className="h-11 w-11 rounded-xl flex items-center justify-center"
              style={{ background: colorBg, color }}
            >
              <Icon size={20} aria-hidden />
            </div>
            <div className="flex-1">
              <h2 className="font-bold mb-1" style={{ color: 'var(--color-text)' }}>{title}</h2>
              <p className="text-sm leading-snug" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color }}>
              Ouvrir
              <ChevronRight size={14} aria-hidden className="transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
