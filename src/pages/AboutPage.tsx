import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { Handshake, ArrowLeftRight, ShieldCheck, Gem, Users } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'

export default function AboutPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('about.title')} — CECT Togo</title>
      </Helmet>

      <div className="py-14 sm:py-20 text-center" style={{ background: 'var(--color-hero-bg)' }}>
        <div className="container mx-auto px-4 max-w-3xl text-white">
          <Users size={40} className="mx-auto mb-4 opacity-80" aria-hidden />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3">{t('about.title')}</h1>
          <p className="text-base sm:text-xl text-white/80 leading-relaxed">{t('about.subtitle')}</p>
        </div>
      </div>

      <Section>
        <div className="max-w-4xl mx-auto space-y-10 sm:space-y-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <Card>
              <h2 className="text-xl font-bold text-[var(--color-text)] mb-3">{t('about.history.title')}</h2>
              <p className="text-[var(--color-text-muted)]">{t('about.history.text')}</p>
            </Card>
            <Card>
              <h2 className="text-xl font-bold text-[var(--color-text)] mb-3">{t('about.mission.title')}</h2>
              <p className="text-[var(--color-text-muted)]">{t('about.mission.text')}</p>
            </Card>
          </div>

          {/* Governance */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] mb-4 sm:mb-6">{t('about.governance.title')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
              {[t('about.governance.board'), t('about.governance.committee')].map((name) => (
                <div key={name} className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                  <h3 className="font-semibold text-[var(--color-primary)] mb-2">{name}</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">{t('about.governance.text')}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Values */}
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-6 text-center">{t('mission.title')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {([
                { key: 'solidarity', icon: Handshake },
                { key: 'exchange', icon: ArrowLeftRight },
                { key: 'responsibility', icon: ShieldCheck },
                { key: 'value', icon: Gem },
              ] as const).map(({ key, icon: Icon }) => (
                <div key={key} className="flex flex-col items-center text-center p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                  <Icon size={24} className="text-[var(--color-primary)] mb-3" aria-hidden />
                  <h3 className="font-semibold text-[var(--color-text)] mb-1">{t(`mission.values.${key}.name`)}</h3>
                  <p className="text-xs text-[var(--color-text-muted)]">{t(`mission.values.${key}.desc`)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
