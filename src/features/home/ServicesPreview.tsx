import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  PiggyBank,
  Coins,
  MessageCircleQuestion,
  TrendingUp,
  GraduationCap,
  Users,
  ArrowRight,
} from 'lucide-react'
import { animate } from 'animejs'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'

const SERVICE_ICONS = [PiggyBank, Coins, MessageCircleQuestion, TrendingUp, GraduationCap, Users]
const SERVICE_KEYS = ['savings', 'yem', 'advice', 'investment', 'training', 'solidarity'] as const
const SERVICE_SLUGS = [
  'epargne-consommation',
  'yem',
  'assistance-conseil',
  'investissement',
  'formation',
  'entraide',
]

/* Icon container that bounces with spring physics on hover */
function SpringIcon({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  function handleEnter() {
    const el = ref.current
    if (!el) return
    animate(el, {
      scale: [1, 1.25, 1.1],
      rotate: [0, -10, 10, 0],
      duration: 600,
      ease: 'outElastic(1, .5)',
    })
  }

  function handleLeave() {
    const el = ref.current
    if (!el) return
    animate(el, {
      scale: 1,
      rotate: 0,
      duration: 300,
      ease: 'outExpo',
    })
  }

  return (
    <div
      ref={ref}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="h-11 w-11 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-3 group-hover:bg-[var(--color-primary)] transition-colors duration-200 cursor-default"
    >
      {children}
    </div>
  )
}

export function ServicesPreview() {
  const { t } = useTranslation()

  return (
    <Section id="services">
      <SectionHeader title={t('services.title')} subtitle={t('services.subtitle')} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {SERVICE_KEYS.map((key, i) => {
          const Icon = SERVICE_ICONS[i]
          const slug = SERVICE_SLUGS[i]
          const to = key === 'yem' ? '/le-yem' : `/services/${slug}`
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
            >
              <Card className="h-full flex flex-col group hover:-translate-y-1 transition-transform duration-200">
                <SpringIcon>
                  <Icon
                    size={20}
                    className="text-[var(--color-primary)] group-hover:text-white transition-colors duration-200"
                    aria-hidden
                  />
                </SpringIcon>
                <h3 className="font-semibold text-[var(--color-text)] mb-1.5 text-sm sm:text-base">
                  {t(`services.${key}.name`)}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--color-text-muted)] flex-1 leading-relaxed">
                  {t(`services.${key}.desc`)}
                </p>
                <Link
                  to={to}
                  className="mt-4 inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-[var(--color-primary)] hover:gap-2 transition-all duration-150"
                >
                  {t('services.learnMore')}
                  <ArrowRight size={13} aria-hidden />
                </Link>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </Section>
  )
}
