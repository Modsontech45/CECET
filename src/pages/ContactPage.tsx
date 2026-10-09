import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react'
import { SiWhatsapp } from 'react-icons/si'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(2),
  message: z.string().min(10),
})
type FormData = z.infer<typeof schema>

export default function ContactPage() {
  const { t } = useTranslation()
  const [submitted, setSubmitted] = useState(false)
  const [_error, _setError] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (_data: FormData) => {
    await new Promise((r) => setTimeout(r, 800))
    setSubmitted(true)
    reset()
  }

  const whatsappNumber = (import.meta.env['VITE_WHATSAPP_NUMBER'] as string | undefined) ?? '22890144204'

  const inputClass =
    'w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow'

  return (
    <>
      <Helmet>
        <title>{t('contact.title')} — CECT Togo</title>
      </Helmet>
      <Section>
        <SectionHeader title={t('contact.title')} subtitle={t('contact.subtitle')} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 max-w-5xl mx-auto">
          {/* Form */}
          <div>
            {submitted ? (
              <div className="p-6 rounded-2xl border border-[var(--color-success)]/30 bg-[var(--color-success)]/5 text-[var(--color-success)] text-center">
                {t('contact.form.success')}
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                    {t('contact.form.name')} *
                  </label>
                  <input {...register('name')} className={inputClass} placeholder="Jean Dupont" />
                  {errors.name && <p className="mt-1 text-xs text-[var(--color-danger)]">{t('common.required')}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                    {t('contact.form.email')} *
                  </label>
                  <input {...register('email')} type="email" className={inputClass} placeholder="exemple@email.com" />
                  {errors.email && <p className="mt-1 text-xs text-[var(--color-danger)]">{t('common.invalidEmail')}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                    {t('contact.form.phone')}
                  </label>
                  <input {...register('phone')} className={inputClass} placeholder="+228 90 00 00 00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                    {t('contact.form.subject')} *
                  </label>
                  <input {...register('subject')} className={inputClass} placeholder="Renseignement sur le YEM" />
                  {errors.subject && <p className="mt-1 text-xs text-[var(--color-danger)]">{t('common.required')}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                    {t('contact.form.message')} *
                  </label>
                  <textarea
                    {...register('message')}
                    rows={5}
                    className={inputClass}
                    placeholder="Votre message…"
                  />
                  {errors.message && <p className="mt-1 text-xs text-[var(--color-danger)]">{t('common.required')}</p>}
                </div>
                {_error && <p className="text-xs text-[var(--color-danger)]">{t('contact.form.error')}</p>}
                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  <Send size={18} aria-hidden />
                  {isSubmitting ? t('contact.form.sending') : t('contact.form.send')}
                </Button>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            {[
              { icon: Phone, label: t('contact.info.phones'), value: '+228 90 14 42 04\n+228 90 04 15 17' },
              { icon: Mail, label: t('contact.info.email'), value: 'cect@proton.me', href: 'mailto:cect@proton.me' },
              { icon: MapPin, label: t('contact.info.address'), value: t('contact.info.addressValue') },
              { icon: Clock, label: t('contact.info.hours'), value: t('contact.info.hoursValue') },
            ].map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-[var(--color-primary)]" aria-hidden />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">{label}</p>
                  {href ? (
                    <a href={href} className="text-sm text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors whitespace-pre-line">
                      {value}
                    </a>
                  ) : (
                    <p className="text-sm text-[var(--color-text)] whitespace-pre-line">{value}</p>
                  )}
                </div>
              </div>
            ))}

            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] text-white font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <SiWhatsapp size={18} />
              {t('contact.whatsapp')}
            </a>
          </div>
        </div>
      </Section>
    </>
  )
}
