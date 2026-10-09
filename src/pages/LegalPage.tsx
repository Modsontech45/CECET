import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { Section, SectionHeader } from '@/components/ui/Section'

const titles: Record<string, { fr: string; en: string }> = {
  'mentions-legales': { fr: 'Mentions légales', en: 'Legal Notice' },
  confidentialite: { fr: 'Politique de confidentialité', en: 'Privacy Policy' },
  conditions: { fr: 'Conditions générales', en: 'Terms & Conditions' },
}

export default function LegalPage() {
  const { i18n } = useTranslation()
  const lang = i18n.language.startsWith('en') ? 'en' : 'fr'
  const { pathname } = useLocation()
  const key = pathname.replace(/^\//, '')
  const title = titles[key] ?? { fr: 'Document légal', en: 'Legal document' }

  return (
    <>
      <Helmet><title>{title[lang]} — CECT Togo</title></Helmet>
      <Section>
        <SectionHeader title={title[lang]} />
        <div className="max-w-3xl mx-auto space-y-4 text-sm text-[var(--color-text-muted)]">
          <p>
            {lang === 'fr'
              ? 'Ce document est en cours de rédaction. Revenez bientôt pour consulter sa version définitive.'
              : 'This document is being drafted. Check back soon for the final version.'}
          </p>
          <p>
            {lang === 'fr'
              ? 'Pour toute question, contactez-nous à cect@proton.me ou au +228 90 14 42 04.'
              : 'For any questions, contact us at cect@proton.me or +228 90 14 42 04.'}
          </p>
        </div>
      </Section>
    </>
  )
}
