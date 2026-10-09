import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Coins, Banknote, ShoppingCart, TriangleAlert, UserCheck, ShoppingBag } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { YEM_BUY_PRICE, YEM_SELL_PRICE, YEM_DISCOUNT_MIN, YEM_DISCOUNT_MAX, formatFCFA } from '@/data/packs'

export default function YemPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('yem.title')} — CECT Togo</title>
        <meta name="description" content={t('yem.subtitle')} />
      </Helmet>

      {/* Hero */}
      <div className="py-14 sm:py-20 text-center" style={{ background: 'var(--color-hero-bg)' }}>
        <div className="container mx-auto px-4 max-w-3xl text-white">
          <Coins size={40} className="mx-auto mb-4 opacity-80" aria-hidden />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3">{t('yem.title')}</h1>
          <p className="text-base sm:text-xl text-white/80 leading-relaxed">{t('yem.subtitle')}</p>
        </div>
      </div>

      <Section>
        <div className="max-w-3xl mx-auto">
          <p className="text-lg text-[var(--color-text-muted)] mb-10 text-center">{t('yem.description')}</p>

          {/* Key figures */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Coins, label: t('yem.buyPrice'), value: `${formatFCFA(YEM_BUY_PRICE).split(' ')[0]} F`, color: 'var(--color-primary)' },
              { icon: Banknote, label: t('yem.sellPrice'), value: `${formatFCFA(YEM_SELL_PRICE).split(' ')[0]} F`, color: 'var(--color-secondary)' },
              { icon: ShoppingCart, label: t('yem.discount'), value: `${YEM_DISCOUNT_MIN}–${YEM_DISCOUNT_MAX} %`, color: 'var(--color-accent)' },
            ].map(({ icon: Icon, label, value, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                <Icon size={28} style={{ color }} className="mb-3" aria-hidden />
                <span className="text-3xl font-extrabold" style={{ color }}>{value}</span>
                <span className="text-sm text-[var(--color-text-muted)] mt-1">{label}</span>
              </motion.div>
            ))}
          </div>

          {/* Warning */}
          <div className="flex gap-3 p-5 rounded-xl border border-[var(--color-warning)]/40 bg-[var(--color-warning)]/5 mb-12">
            <TriangleAlert size={20} className="text-[var(--color-warning)] shrink-0 mt-0.5" aria-hidden />
            <div>
              <p className="font-semibold text-[var(--color-warning)] mb-1">{t('yem.warning.title')}</p>
              <p className="text-sm text-[var(--color-text-muted)]">{t('yem.warning.text')}</p>
            </div>
          </div>

          {/* Steps */}
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-8 text-center">{t('yem.howItWorks')}</h2>
          <div className="space-y-6">
            {([
              { icon: UserCheck, key: 'join' },
              { icon: Coins, key: 'buy' },
              { icon: ShoppingBag, key: 'spend' },
            ] as const).map(({ icon: Icon, key }, i) => (
              <Card key={key} className="flex gap-4 items-start">
                <div className="h-10 w-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold shrink-0">
                  {i + 1}
                </div>
                <div className="flex items-start gap-3">
                  <Icon size={20} className="text-[var(--color-primary)] mt-0.5" aria-hidden />
                  <div>
                    <h3 className="font-semibold text-[var(--color-text)]">{t(`yem.steps.${key}.title`)}</h3>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">{t(`yem.steps.${key}.desc`)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Section>
    </>
  )
}
