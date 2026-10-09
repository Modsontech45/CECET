import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import * as Accordion from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'

export default function FaqPage() {
  const { t } = useTranslation()
  const items = t('faq.items', { returnObjects: true }) as Array<{ q: string; a: string }>

  return (
    <>
      <Helmet>
        <title>{t('faq.title')} — CECT Togo</title>
        <meta name="description" content={t('faq.subtitle')} />
      </Helmet>
      <Section>
        <SectionHeader title={t('faq.title')} subtitle={t('faq.subtitle')} />
        <div className="max-w-2xl mx-auto">
          <Accordion.Root type="multiple" className="space-y-3">
            {items.map((item, i) => (
              <Accordion.Item
                key={i}
                value={`item-${i}`}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="flex w-full items-center justify-between px-5 py-4 text-left text-[var(--color-text)] font-medium hover:text-[var(--color-primary)] transition-colors group">
                    <span>{item.q}</span>
                    <ChevronDown
                      size={18}
                      className="shrink-0 ml-3 text-[var(--color-text-muted)] transition-transform group-data-[state=open]:rotate-180"
                      aria-hidden
                    />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="px-5 pb-4 text-sm text-[var(--color-text-muted)] data-[state=open]:animate-none">
                  {item.a}
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>
      </Section>
    </>
  )
}
