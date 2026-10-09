import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { FileText } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'

const DOCS = [
  { key: 'legal', items: ['statuts', 'reglement', 'immatriculation', 'agrement'] },
  { key: 'financial', items: ['rapport-2026'] },
  { key: 'governance', items: ['proces-verbal-ag-2026'] },
]

const DOC_NAMES: Record<string, { fr: string; en: string }> = {
  statuts: { fr: 'Statuts de la coopérative', en: 'Cooperative bylaws' },
  reglement: { fr: 'Règlement intérieur', en: 'Internal rules' },
  immatriculation: { fr: 'Numéro d\'immatriculation', en: 'Registration number' },
  agrement: { fr: 'Agrément', en: 'Approval certificate' },
  'rapport-2026': { fr: 'Rapport annuel 2026', en: '2026 Annual report' },
  'proces-verbal-ag-2026': { fr: 'Procès-verbal AG 2026', en: '2026 General Assembly minutes' },
}

export default function DocumentsPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language.startsWith('en') ? 'en' : 'fr'

  return (
    <>
      <Helmet>
        <title>{t('documents.title')} — CECT Togo</title>
      </Helmet>
      <Section>
        <SectionHeader title={t('documents.title')} subtitle={t('documents.subtitle')} />
        <div className="max-w-3xl mx-auto space-y-10">
          {DOCS.map(({ key, items }) => (
            <div key={key}>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
                {t(`documents.categories.${key}`)}
              </h2>
              <div className="space-y-3">
                {items.map((docKey) => (
                  <div
                    key={docKey}
                    className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-[var(--color-primary)]" aria-hidden />
                      <span className="text-sm font-medium text-[var(--color-text)]">
                        {DOC_NAMES[docKey]?.[lang] ?? docKey}
                      </span>
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)] italic">
                      {t('documents.comingSoon')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}
