import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Coins, Banknote, ShoppingCart, TriangleAlert, ArrowRight, UserCheck, ShoppingBag } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { YEM_BUY_PRICE, YEM_SELL_PRICE, YEM_DISCOUNT_MIN, YEM_DISCOUNT_MAX, formatFCFA } from '@/data/packs'

export function YemPreview() {
  const { t } = useTranslation()

  const stats = [
    { icon: Coins, label: t('yem.buyPrice'), value: `${formatFCFA(YEM_BUY_PRICE)}`, color: 'var(--color-primary)' },
    { icon: Banknote, label: t('yem.sellPrice'), value: `${formatFCFA(YEM_SELL_PRICE)}`, color: 'var(--color-secondary)' },
    { icon: ShoppingCart, label: t('yem.discount'), value: `${YEM_DISCOUNT_MIN}–${YEM_DISCOUNT_MAX} %`, color: 'var(--color-accent)' },
  ]

  const steps = [
    { icon: UserCheck, key: 'join' },
    { icon: Coins, key: 'buy' },
    { icon: ShoppingBag, key: 'spend' },
  ] as const

  return (
    <Section id="yem">
      <SectionHeader title={t('yem.title')} subtitle={t('yem.subtitle')} />

      {/* Key figures */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-10 sm:mb-12">
        {stats.map(({ icon: Icon, label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.09 }}
            className="flex items-center sm:flex-col sm:items-center gap-4 sm:gap-0 sm:text-center p-4 sm:p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]"
          >
            <div className="h-10 w-10 sm:h-auto sm:w-auto sm:mb-3 shrink-0 flex items-center justify-center">
              <Icon size={26} style={{ color }} aria-hidden />
            </div>
            <div className="flex flex-col sm:items-center">
              <span className="text-xl sm:text-2xl font-bold leading-none" style={{ color }}>{value}</span>
              <span className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1 leading-snug">{label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* How it works */}
      <h3 className="text-lg sm:text-xl font-semibold text-[var(--color-text)] text-center mb-6 sm:mb-8">
        {t('yem.howItWorks')}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 mb-10 sm:mb-12">
          {steps.map(({ icon: Icon, key }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.12 }}
              className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]"
            >
              <div className="h-9 w-9 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-sm shrink-0 relative z-10">
                {i + 1}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={16} className="text-[var(--color-primary)]" aria-hidden />
                  <h4 className="font-semibold text-sm sm:text-base text-[var(--color-text)]">
                    {t(`yem.steps.${key}.title`)}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {t(`yem.steps.${key}.desc`)}
                </p>
              </div>
            </motion.div>
          ))}
      </div>

      {/* Warning */}
      <div className="flex gap-3 p-4 rounded-xl border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5 mb-8">
        <TriangleAlert size={17} className="text-[var(--color-warning)] shrink-0 mt-0.5" aria-hidden />
        <div>
          <p className="text-xs sm:text-sm font-semibold text-[var(--color-warning)] mb-1">
            {t('yem.warning.title')}
          </p>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
            {t('yem.warning.text')}
          </p>
        </div>
      </div>

      <div className="text-center">
        <Button size="lg" asChild>
          <Link to="/le-yem">
            {t('common.learnMore')}
            <ArrowRight size={17} aria-hidden />
          </Link>
        </Button>
      </div>
    </Section>
  )
}
