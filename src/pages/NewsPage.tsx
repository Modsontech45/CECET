import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { ARTICLES } from '@/data/news'

export default function NewsPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language.startsWith('en') ? 'en' : 'fr'

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

  return (
    <>
      <Helmet>
        <title>{t('news.title')} — CECT Togo</title>
      </Helmet>
      <Section>
        <SectionHeader title={t('news.title')} subtitle={t('news.subtitle')} />
        <div className="max-w-3xl mx-auto space-y-6">
          {ARTICLES.map((a) => (
            <article
              key={a.id}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 hover:shadow-md transition-shadow"
            >
              <p className="text-xs text-[var(--color-text-muted)] mb-2">
                {t('news.publishedOn')} {fmtDate(a.date)}
              </p>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                {lang === 'en' ? a.title_en : a.title_fr}
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                {lang === 'en' ? a.excerpt_en : a.excerpt_fr}
              </p>
              <button className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:gap-2 transition-all">
                {t('news.readMore')}
                <ArrowRight size={14} aria-hidden />
              </button>
            </article>
          ))}
        </div>
      </Section>
    </>
  )
}
