import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function CtaSection() {
  const { t } = useTranslation()

  return (
    <section className="py-20 md:py-28 relative overflow-hidden" aria-label="Appel à l'action">
      <div
        className="absolute inset-0"
        style={{ background: 'var(--color-hero-bg)' }}
        aria-hidden
      />
      <div className="absolute inset-0" aria-hidden>
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
      </div>
      <div className="relative z-10 container mx-auto px-4 sm:px-6 max-w-3xl text-center text-white">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-balance">
          {t('hero.tagline')}
        </h2>
        <p className="text-lg text-white/80 mb-8">
          {t('hero.subtitle')}
        </p>
        <Button size="xl" asChild className="bg-white text-[var(--color-primary)] hover:bg-white/90 font-bold">
          <Link to="/inscription">
            {t('hero.cta_join')}
            <ArrowRight size={20} aria-hidden />
          </Link>
        </Button>
      </div>
    </section>
  )
}
