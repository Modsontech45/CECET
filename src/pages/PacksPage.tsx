import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { User, Building2, TriangleAlert } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { PACK_FAMILIES, MEMBERSHIP_INDIVIDUAL, MEMBERSHIP_COMPANY, formatFCFA } from '@/data/packs'
import { ease } from '@/lib/motion'

export default function PacksPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('packs.title')} — CECT Togo</title>
      </Helmet>

      <Section>
        <SectionHeader title={t('packs.title')} subtitle={t('packs.subtitle')} />

        {/* Indicative values notice */}
        <div className="flex items-start gap-3 p-4 rounded-xl border border-[var(--brand-gold-600)]/40 bg-[var(--brand-gold-500)]/5 mb-8">
          <TriangleAlert size={17} className="text-[var(--brand-gold-700)] shrink-0 mt-0.5" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-[var(--brand-gold-700)] mb-0.5">{t('packs.provisional')}</p>
            <p className="text-sm text-[var(--color-text-muted)]">{t('packs.provisionalNote')}</p>
          </div>
        </div>

        {/* Membership */}
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] mb-4 sm:mb-6">{t('packs.membership')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-10 sm:mb-14">
          {[
            { icon: User, key: 'individual', price: MEMBERSHIP_INDIVIDUAL },
            { icon: Building2, key: 'company', price: MEMBERSHIP_COMPANY },
          ].map(({ icon: Icon, key, price }) => (
            <div
              key={key}
              className="flex gap-4 p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]"
            >
              <div className="h-12 w-12 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                <Icon size={22} className="text-[var(--color-primary)]" aria-hidden />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-text)]">{t(`packs.${key}`)}</h3>
                <p className="text-2xl font-extrabold text-[var(--color-primary)] my-1">{formatFCFA(price)}</p>
                <p className="text-sm text-[var(--color-text-muted)]">{t(`packs.${key}Desc`)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 4 pack families */}
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] mb-2 sm:mb-3">{t('packs.yemPacks')}</h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">{t('packs.maxPacks')}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
          {PACK_FAMILIES.map((family, i) => {
            const Icon = family.icon
            return (
              <motion.div
                key={family.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.09, ease: ease.out, duration: 0.45 }}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 hover:border-[var(--color-primary)]/40 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                    <Icon size={22} className="text-[var(--color-primary)]" aria-hidden />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-[var(--color-text)] text-base">
                        {t(`packs.families.${family.id}.name`)}
                      </h3>
                      {family.formulas && (
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                          {family.formulas}
                        </span>
                      )}
                      {family.forLegal && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--brand-gold-500)]/15 text-[var(--brand-gold-700)]">
                          {t('packs.legalOnly')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-5">
                  {t(`packs.families.${family.id}.detail`)}
                </p>

                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/inscription">{t('packs.join')}</Link>
                </Button>
              </motion.div>
            )
          })}
        </div>

        <p className="text-xs text-[var(--color-text-muted)] text-center mb-8 px-4">{t('packs.disclaimer')}</p>

        <div className="text-center">
          <Button size="lg" asChild>
            <Link to="/inscription">{t('packs.join')}</Link>
          </Button>
        </div>
      </Section>
    </>
  )
}
