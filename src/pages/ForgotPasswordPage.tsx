import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { KeyRound, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  pernum: z.string().min(1),
  email: z.string().email(),
})
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [done, setDone] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (_: FormData) => {
    await new Promise((r) => setTimeout(r, 600))
    setDone(true)
  }

  const inputClass =
    'w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow'

  return (
    <>
      <Helmet><title>{t('auth.forgotPassword.title')} — CECT Togo</title></Helmet>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 mb-4">
              <KeyRound size={28} className="text-[var(--color-primary)]" aria-hidden />
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">{t('auth.forgotPassword.title')}</h1>
          </div>

          {done ? (
            <div className="p-6 rounded-2xl border border-[var(--color-success)]/30 bg-[var(--color-success)]/5 text-center">
              <CheckCircle2 size={36} className="mx-auto mb-3 text-[var(--color-success)]" aria-hidden />
              <p className="text-sm text-[var(--color-text)]">{t('auth.forgotPassword.success')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">{t('auth.forgotPassword.pernum')}</label>
                <input {...register('pernum')} className={inputClass} placeholder="CECT123" />
                {errors.pernum && <p className="mt-1 text-xs text-[var(--color-danger)]">{t('common.required')}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">{t('auth.forgotPassword.email')}</label>
                <input {...register('email')} type="email" className={inputClass} placeholder="exemple@email.com" />
                {errors.email && <p className="mt-1 text-xs text-[var(--color-danger)]">{t('common.invalidEmail')}</p>}
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {t('auth.forgotPassword.submit')}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm">
            <Link to="/connexion" className="text-[var(--color-primary)] hover:underline">
              {t('auth.forgotPassword.backToLogin')}
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}
