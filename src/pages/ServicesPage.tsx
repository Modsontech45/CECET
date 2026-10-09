import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { type LucideIcon, PiggyBank, Coins, MessageCircleQuestion, TrendingUp, GraduationCap, Users, ArrowRight } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import NotFoundPage from './NotFoundPage'

const SERVICES: Array<{
  slug: string
  key: 'savings' | 'yem' | 'advice' | 'investment' | 'training' | 'solidarity'
  icon: LucideIcon
  externalPath?: string
}> = [
  { slug: 'epargne-consommation', key: 'savings', icon: PiggyBank },
  { slug: 'yem', key: 'yem', icon: Coins, externalPath: '/le-yem' },
  { slug: 'assistance-conseil', key: 'advice', icon: MessageCircleQuestion },
  { slug: 'investissement', key: 'investment', icon: TrendingUp },
  { slug: 'formation', key: 'training', icon: GraduationCap },
  { slug: 'entraide', key: 'solidarity', icon: Users },
]

export default function ServicesPage() {
  const { t } = useTranslation()
  const { slug } = useParams<{ slug?: string }>()

  if (!slug) {
    return (
      <>
        <Helmet>
          <title>{t('services.title')} — CECT Togo</title>
        </Helmet>
        <Section>
          <SectionHeader title={t('services.title')} subtitle={t('services.subtitle')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map(({ slug: s, key, icon: Icon, externalPath }) => {
              const to = externalPath ?? `/services/${s}`
              return (
                <Card key={s} className="flex flex-col group hover:-translate-y-1 transition-transform">
                  <div className="h-12 w-12 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--color-primary)] transition-colors">
                    <Icon size={22} className="text-[var(--color-primary)] group-hover:text-white transition-colors" aria-hidden />
                  </div>
                  <h3 className="font-semibold text-[var(--color-text)] mb-2">{t(`services.${key}.name`)}</h3>
                  <p className="text-sm text-[var(--color-text-muted)] flex-1">{t(`services.${key}.desc`)}</p>
                  <Link to={to} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:gap-2 transition-all">
                    {t('services.learnMore')}
                    <ArrowRight size={14} aria-hidden />
                  </Link>
                </Card>
              )
            })}
          </div>
        </Section>
      </>
    )
  }

  const service = SERVICES.find((s) => s.slug === slug)
  if (!service) return <NotFoundPage />

  const { key, icon: Icon } = service

  return (
    <>
      <Helmet>
        <title>{t(`services.${key}.name`)} — CECT Togo</title>
      </Helmet>
      <div className="py-14 sm:py-20 text-center" style={{ background: 'var(--color-hero-bg)' }}>
        <div className="container mx-auto px-4 max-w-3xl text-white">
          <Icon size={40} className="mx-auto mb-4 opacity-80" aria-hidden />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3">{t(`services.${key}.name`)}</h1>
          <p className="text-base sm:text-xl text-white/80 leading-relaxed">{t(`services.${key}.desc`)}</p>
        </div>
      </div>
      <Section>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-lg text-[var(--color-text-muted)] mb-8">{t(`services.${key}.desc`)}</p>
          <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-hover)] transition-colors">
            {t('contact.title')}
            <ArrowRight size={18} aria-hidden />
          </Link>
        </div>
      </Section>
    </>
  )
}
