import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Users, Calendar, Package, Heart } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { ease } from '@/lib/motion'

const stats = (t: (k: string) => string) => [
  { icon: Users, label: t('stats.members'), value: '100+' },
  { icon: Calendar, label: t('stats.years'), value: '1' },
  { icon: Package, label: t('stats.packs'), value: '6' },
  { icon: Heart, label: t('stats.solidarity'), value: '100%' },
]

export function StatsBar() {
  const { t } = useTranslation()

  return (
    <Section alt className="py-10 md:py-14">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-6">
        {stats(t).map(({ icon: Icon, label, value }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.09, ease: ease.out }}
            className="flex flex-col items-center text-center gap-2 px-2"
          >
            <motion.div
              className="h-11 w-11 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <Icon size={20} className="text-[var(--color-primary)]" aria-hidden />
            </motion.div>
            <AnimatedCounter
              value={value}
              className="text-2xl sm:text-3xl font-extrabold text-[var(--color-primary)] leading-none"
            />
            <span className="text-xs sm:text-sm text-[var(--color-text-muted)] text-balance leading-snug">
              {label}
            </span>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}
