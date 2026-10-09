import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { Search, MapPin, Phone } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/Section'
import { PARTNERS, PARTNER_CATEGORIES, PARTNER_CITIES } from '@/data/partners'

export default function PartnersPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language.startsWith('en') ? 'en' : 'fr'
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [city, setCity] = useState('')

  const filtered = PARTNERS.filter((p) => {
    const name = p.name.toLowerCase()
    const q = search.toLowerCase()
    return (
      (!search || name.includes(q)) &&
      (!category || p.category === category) &&
      (!city || p.city === city)
    )
  })

  const selectClass =
    'rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]'

  return (
    <>
      <Helmet>
        <title>{t('partners.title')} — CECT Togo</title>
      </Helmet>
      <Section>
        <SectionHeader title={t('partners.title')} subtitle={t('partners.subtitle')} />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" aria-hidden />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('partners.search')}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] pl-9 pr-4 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
            <option value="">{t('partners.allCategories')}</option>
            {PARTNER_CATEGORIES.map((c) => (
              <option key={c} value={c}>{t(`partners.categories.${c}`)}</option>
            ))}
          </select>
          <select value={city} onChange={(e) => setCity(e.target.value)} className={selectClass}>
            <option value="">{t('partners.allCities')}</option>
            {PARTNER_CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-[var(--color-text-muted)]">{t('partners.noResults')}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((partner) => (
              <div
                key={partner.id}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-[var(--color-text)]">{partner.name}</h3>
                  <span className="shrink-0 ml-2 text-xs px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium">
                    {t(`partners.categories.${partner.category}`)}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-text-muted)] mb-3">
                  {lang === 'en' ? partner.description_en : partner.description_fr}
                </p>
                <div className="space-y-1.5 text-xs text-[var(--color-text-muted)]">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-[var(--color-primary)]" aria-hidden />
                    <span>{partner.address}</span>
                  </div>
                  {partner.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone size={12} className="text-[var(--color-primary)]" aria-hidden />
                      <a href={`tel:${partner.phone}`} className="hover:text-[var(--color-primary)] transition-colors">
                        {partner.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  )
}
