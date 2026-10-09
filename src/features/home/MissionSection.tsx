import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Handshake, ArrowLeftRight, ShieldCheck, Sprout } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { ease } from '@/lib/motion'

const VALUES = [
  { key: 'solidarity', icon: Handshake },
  { key: 'exchange', icon: ArrowLeftRight },
  { key: 'responsibility', icon: ShieldCheck },
  { key: 'value', icon: Sprout },
] as const

export function MissionSection() {
  const { t } = useTranslation()

  return (
    <Section alt id="mission">
      <SectionHeader title={t('mission.title')} subtitle={t('mission.subtitle')} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {VALUES.map(({ key, icon: Icon }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: i * 0.09, ease: ease.out }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="flex flex-col items-center text-center p-4 sm:p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-primary)]/50 hover:shadow-md transition-colors duration-200 cursor-default"
          >
            <motion.div
              className="h-12 w-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mb-3"
              whileHover={{ scale: 1.12, backgroundColor: 'var(--color-primary)' }}
              transition={{ duration: 0.2 }}
            >
              <Icon size={22} className="text-[var(--color-primary)]" aria-hidden />
            </motion.div>
            <h3 className="font-semibold text-[var(--color-text)] text-sm sm:text-base mb-1.5">
              {t(`mission.values.${key}.name`)}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
              {t(`mission.values.${key}.desc`)}
            </p>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}
