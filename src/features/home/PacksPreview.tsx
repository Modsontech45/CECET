import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ArrowRight, Building2 } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { PACK_FAMILIES } from '@/data/packs'
import { ease } from '@/lib/motion'

export function PacksPreview() {
  const { t } = useTranslation()

  return (
    <Section alt id="packs">
      <SectionHeader title={t('packs.title')} subtitle={t('packs.subtitle')} />

      {/* Indicative values banner */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--brand-gold-600)]/40 bg-[var(--brand-gold-500)]/8 mb-7 text-sm text-[var(--color-text-muted)]">
        <span className="font-semibold text-[var(--brand-gold-700)]">{t('packs.provisional', 'Valeurs indicatives')}</span>
        <span>—</span>
        <span>{t('packs.provisionalNote', 'Les formules et tarifs seront confirmés par le Conseil d\'administration.')}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        {PACK_FAMILIES.map((family, i) => {
          const Icon = family.icon
          return (
            <motion.div
              key={family.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.45, delay: i * 0.09, ease: ease.out }}
              whileHover={{ y: -4, transition: { duration: 0.2, ease: ease.out } }}
              className="flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:border-[var(--color-primary)]/50 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="h-11 w-11 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-3">
                <Icon size={20} className="text-[var(--color-primary)]" aria-hidden />
              </div>

              <h3 className="font-bold text-[var(--color-text)] text-sm sm:text-base mb-1">
                {t(`packs.families.${family.id}.name`)}
              </h3>

              {family.formulas && (
                <p className="text-xs font-mono text-[var(--color-primary)] mb-1">
                  {family.formulas}
                </p>
              )}

              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed flex-1 mb-4">
                {t(`packs.families.${family.id}.desc`)}
              </p>

              {family.forLegal && (
                <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] mb-3">
                  <Building2 size={12} aria-hidden />
                  <span>{t('packs.legalOnly', 'Personnes morales uniquement')}</span>
                </div>
              )}

              <Link
                to="/packs"
                className="flex w-full items-center justify-center gap-1 rounded-xl border border-[var(--color-primary)] text-[var(--color-primary)] text-xs sm:text-sm font-medium py-2 hover:bg-[var(--color-primary)] hover:text-white transition-colors duration-200"
              >
                {t('packs.seeFormulas', 'Voir les formules')}
              </Link>
            </motion.div>
          )
        })}
      </div>

      <p className="text-xs text-[var(--color-text-muted)] text-center mb-5 px-4">
        {t('packs.disclaimer')}
      </p>

      <div className="text-center">
        <Button variant="outline" size="md" asChild>
          <Link to="/packs">
            {t('common.seeAll')}
            <ArrowRight size={16} aria-hidden />
          </Link>
        </Button>
      </div>
    </Section>
  )
}
