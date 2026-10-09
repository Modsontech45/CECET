import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { KeyRound, Lock, Eye, EyeOff, MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/app/AuthContext'
import { extractApiError } from '@/lib/api'

const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
})
const otpSchema = z.object({ code: z.string().length(6, 'Le code doit contenir 6 chiffres') })

type LoginData = z.infer<typeof loginSchema>
type OtpData   = z.infer<typeof otpSchema>

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login, submitOtp } = useAuth()
  const [showPwd, setShowPwd] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [challenge, setChallenge] = useState<{ id: string; sentTo?: string } | null>(null)

  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) })
  const otpForm   = useForm<OtpData>({ resolver: zodResolver(otpSchema) })

  const inputClass =
    'w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow'

  const onLogin = async (data: LoginData) => {
    setApiError(null)
    try {
      const result = await login(data.identifier, data.password)
      if (result.otpRequired && result.challenge) {
        setChallenge({ id: result.challenge.challenge_id, sentTo: result.challenge.sent_to })
        return
      }
      if (!result.ok) { setApiError('Identifiant ou mot de passe incorrect.'); return }
      navigate(result.redirectTo, { replace: true })
    } catch (err) {
      setApiError(extractApiError(err).message)
    }
  }

  const onOtp = async (data: OtpData) => {
    if (!challenge) return
    setApiError(null)
    try {
      const result = await submitOtp(challenge.id, data.code, 'login')
      navigate(result.redirectTo, { replace: true })
    } catch (err) {
      setApiError(extractApiError(err).message)
    }
  }

  return (
    <>
      <Helmet><title>{t('auth.login.title')} — CECT Togo</title></Helmet>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">

          <div className="text-center mb-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 mb-3">
              {challenge
                ? <MailCheck size={26} className="text-[var(--color-primary)]" aria-hidden />
                : <KeyRound  size={26} className="text-[var(--color-primary)]" aria-hidden />
              }
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">
              {challenge ? 'Vérification par e-mail' : t('auth.login.title')}
            </h1>
            {challenge?.sentTo && (
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Code envoyé à <strong>{challenge.sentTo}</strong>
              </p>
            )}
          </div>

          {/* ── OTP step ── */}
          {challenge ? (
            <form
              onSubmit={otpForm.handleSubmit(onOtp)}
              className="space-y-4 p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm"
            >
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Code de vérification</label>
                <input
                  {...otpForm.register('code')}
                  className={inputClass}
                  placeholder="123456"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  autoFocus
                />
                {otpForm.formState.errors.code && (
                  <p className="mt-1 text-xs text-[var(--color-danger)]">{otpForm.formState.errors.code.message}</p>
                )}
              </div>

              {apiError && (
                <p className="text-sm text-center text-[var(--color-danger)] bg-[var(--color-danger)]/5 border border-[var(--color-danger)]/20 rounded-xl px-3 py-2">
                  {apiError}
                </p>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={otpForm.formState.isSubmitting}>
                <Lock size={16} aria-hidden /> Valider
              </Button>

              <button
                type="button"
                onClick={() => setChallenge(null)}
                className="w-full text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                ← Retour
              </button>
            </form>
          ) : (
            /* ── Login step ── */
            <form
              onSubmit={loginForm.handleSubmit(onLogin)}
              className="space-y-4 p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm"
            >
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                  {t('auth.login.pernum')}
                </label>
                <input
                  {...loginForm.register('identifier')}
                  className={inputClass}
                  placeholder="Pernum ou e-mail"
                  autoComplete="username"
                />
                {loginForm.formState.errors.identifier && (
                  <p className="mt-1 text-xs text-[var(--color-danger)]">{t('common.required')}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-[var(--color-text)]">{t('auth.login.password')}</label>
                  <Link to="/mot-de-passe-oublie" className="text-xs text-[var(--color-primary)] hover:underline">
                    {t('auth.login.forgot')}
                  </Link>
                </div>
                <div className="relative">
                  <input
                    {...loginForm.register('password')}
                    type={showPwd ? 'text' : 'password'}
                    className={`${inputClass} pr-11`}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                    aria-label={showPwd ? 'Masquer' : 'Afficher'}
                    tabIndex={-1}
                  >
                    {showPwd ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-[var(--color-danger)]">{t('common.required')}</p>
                )}
              </div>

              {apiError && (
                <p className="text-sm text-center text-[var(--color-danger)] bg-[var(--color-danger)]/5 border border-[var(--color-danger)]/20 rounded-xl px-3 py-2">
                  {apiError}
                </p>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loginForm.formState.isSubmitting}>
                <Lock size={16} aria-hidden />
                {t('auth.login.submit')}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
            {t('auth.login.noAccount')}{' '}
            <Link to="/inscription" className="text-[var(--color-primary)] font-medium hover:underline">
              {t('auth.login.register')}
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}
