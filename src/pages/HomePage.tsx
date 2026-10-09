import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { Hero } from '@/features/home/Hero'
import { Marquee } from '@/components/ui/Marquee'
import { StatsBar } from '@/features/home/StatsBar'
import { ServicesPreview } from '@/features/home/ServicesPreview'
import { MissionSection } from '@/features/home/MissionSection'
import { YemPreview } from '@/features/home/YemPreview'
import { PacksPreview } from '@/features/home/PacksPreview'
import { CtaSection } from '@/features/home/CtaSection'

export default function HomePage() {
  const { t } = useTranslation()
  return (
    <>
      <Helmet>
        <title>CECT Togo — {t('hero.tagline')}</title>
        <meta name="description" content={t('hero.subtitle')} />
      </Helmet>
      <Hero />
      <Marquee />
      <StatsBar />
      <ServicesPreview />
      <MissionSection />
      <YemPreview />
      <PacksPreview />
      <CtaSection />
    </>
  )
}
