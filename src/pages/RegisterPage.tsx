import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Smartphone, Banknote, Eye, EyeOff, MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/app/AuthContext'
import { register as apiRegister } from '@/services/authService'
import { extractApiError } from '@/lib/api'
import type { OtpChallengeResource } from '@/lib/apiTypes'

const LEGAL_STATUSES = ['SARL', 'SA', 'SAS', 'SASU', 'EURL', 'GIE', 'Association', 'Coopérative', 'Auto-entrepreneur', 'Autre']

const UEMOA_COUNTRIES = [
  { code: '+229', flag: '🇧🇯', name: 'Bénin' },
  { code: '+226', flag: '🇧🇫', name: 'Burkina Faso' },
  { code: '+225', flag: '🇨🇮', name: "Côte d'Ivoire" },
  { code: '+245', flag: '🇬🇼', name: 'Guinée-Bissau' },
  { code: '+223', flag: '🇲🇱', name: 'Mali' },
  { code: '+227', flag: '🇳🇪', name: 'Niger' },
  { code: '+221', flag: '🇸🇳', name: 'Sénégal' },
  { code: '+228', flag: '🇹🇬', name: 'Togo' },
]

const schema = z.object({
  personType: z.enum(['natural', 'legal']),
  companyName: z.string().optional(),
  legalStatus: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  pernum: z.string().regex(/^[A-Za-z0-9._-]{3,64}$/, { message: 'Pernum invalide (3-64 caractères alphanumériques)' }),
  countryCode: z.string().min(1),
  phone: z.string().regex(/^\d{8,10}$/, { message: 'phone_invalid' }),
  email: z.string().email({ message: 'invalid_email' }),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
  paymentMethod: z.enum(['TMONEY', 'FLOOZ', 'CASH']),
  commitment: z.literal(true, { errorMap: () => ({ message: 'required' }) }),
  location: z.string().min(1),
  date: z.string().min(1),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'mismatch',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

const STEPS = ['step1', 'step2', 'step3', 'step4'] as const

export default function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { submitOtp } = useAuth()
  const [step, setStep] = useState(0)
  const [apiError, setApiError] = useState<string | null>(null)
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const [otpChallenge, setOtpChallenge] = useState<OtpChallengeResource | null>(null)
  const [otpCode, setOtpCode] = useState('')
  const [otpSubmitting, setOtpSubmitting] = useState(false)

  const { register, handleSubmit, watch, formState: { errors, isSubmitting }, trigger } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { personType: 'natural', paymentMethod: 'TMONEY', countryCode: '+228' },
  })

  const personType = watch('personType')

  const STEP_FIELDS: (keyof FormData)[][] = [
    ['personType', 'firstName', 'lastName', 'pernum', 'countryCode', 'phone', 'email', 'password', 'confirmPassword'],
    ['paymentMethod'],
    ['commitment'],
    ['location', 'date'],
  ]

  const next = async () => {
    const valid = await trigger(STEP_FIELDS[step])
    if (valid) setStep((s) => s + 1)
  }

  const onSubmit = async (data: FormData) => {
    setApiError(null)
    try {
      const phone = `${data.countryCode}${data.phone.replace(/^0/, '')}`
      const result = await apiRegister({
        person_type: data.personType,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone,
        pernum: data.pernum,
        password: data.password,
        password_confirmation: data.confirmPassword,
        city: data.location || null,
        preferred_payment_method: data.paymentMethod,
        commitment_accepted: 'yes',
        signed_place: data.location,
        signed_on: new Date(data.date).toISOString(),
        ...(data.personType === 'legal' && {
          legal_name: data.companyName,
          legal_form: data.legalStatus,
        }),
      })
      setOtpChallenge(result.verification)
    } catch (err) {
      setApiError(extractApiError(err).message)
    }
  }

  const handleOtpSubmit = async () => {
    if (!otpChallenge || otpCode.length !== 6) return
    setOtpSubmitting(true)
    setApiError(null)
    try {
      const result = await submitOtp(otpChallenge.challenge_id, otpCode, 'register')
      navigate(result.redirectTo, { replace: true })
    } catch (err) {
      setApiError(extractApiError(err).message)
    } finally {
      setOtpSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow'

  /* ── OTP verification screen ── */
  if (otpChallenge) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <MailCheck size={52} className="mx-auto mb-4 text-[var(--color-primary)]" aria-hidden />
          <h1 className="text-xl font-bold text-[var(--color-text)] mb-1">Vérification de votre e-mail</h1>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            Un code à 6 chiffres a été envoyé à <strong>{otpChallenge.sent_to}</strong>.
          </p>

          <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Code de vérification</label>
              <input
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className={inputClass}
                placeholder="123456"
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                autoFocus
              />
            </div>

            {apiError && (
              <p className="text-sm text-[var(--color-danger)] bg-[var(--color-danger)]/5 border border-[var(--color-danger)]/20 rounded-xl px-3 py-2">
                {apiError}
              </p>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={handleOtpSubmit}
              disabled={otpCode.length !== 6 || otpSubmitting}
            >
              {otpSubmitting ? 'Vérification…' : 'Confirmer mon adresse e-mail'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet><title>{t('auth.register.title')} — CECT Togo</title></Helmet>
      <div className="min-h-[80vh] flex items-start justify-center px-3 sm:px-4 py-8 sm:py-12">
        <div className="w-full max-w-lg">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] text-center mb-5 sm:mb-6">
            {t('auth.register.title')}
          </h1>

          {/* Progress */}
          <div className="flex gap-2 mb-6 sm:mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex-1 flex flex-col items-center gap-1">
                <div className={`h-2 w-full rounded-full transition-colors ${i <= step ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`} />
                <span className="text-xs text-[var(--color-text-muted)] hidden sm:block">{t(`auth.register.${s}`)}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-4 sm:p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-4">

              {/* ─── Step 1: Identification ─── */}
              {step === 0 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">{t('auth.register.personType')}</label>
                    <select {...register('personType')} className={inputClass}>
                      <option value="natural">{t('auth.register.physical')}</option>
                      <option value="legal">{t('auth.register.legal')}</option>
                    </select>
                  </div>

                  {personType === 'legal' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">{t('auth.register.companyName')} *</label>
                        <input {...register('companyName')} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">{t('auth.register.legalStatus')} *</label>
                        <select {...register('legalStatus')} className={inputClass}>
                          {LEGAL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">{t('auth.register.firstName')}</label>
                    <input {...register('firstName')} className={inputClass} placeholder="Jean" />
                    {errors.firstName && <p className="mt-1 text-xs text-[var(--color-danger)]">{t('common.required')}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">{t('auth.register.lastName')}</label>
                    <input {...register('lastName')} className={inputClass} placeholder="Dupont" />
                    {errors.lastName && <p className="mt-1 text-xs text-[var(--color-danger)]">{t('common.required')}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">{t('auth.register.pernum')}</label>
                    <input {...register('pernum')} className={inputClass} placeholder="mon-pernum" />
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">{t('auth.register.pernumHint')}</p>
                    {errors.pernum && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.pernum.message ?? t('common.required')}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">{t('auth.register.phone')} *</label>
                    <div className="flex">
                      <select
                        {...register('countryCode')}
                        className="shrink-0 rounded-l-xl rounded-r-none border border-r-0 border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow appearance-none"
                        style={{ width: '7.5rem' }}
                      >
                        {UEMOA_COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                        ))}
                      </select>
                      <input
                        {...register('phone')}
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        className="flex-1 rounded-r-xl rounded-l-none border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow"
                        placeholder="90123456"
                      />
                    </div>
                    {errors.phone && <p className="mt-1 text-xs text-[var(--color-danger)]">Numéro invalide</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">{t('auth.register.email')} *</label>
                    <input {...register('email')} type="email" className={inputClass} placeholder="exemple@email.com" />
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">Un code de vérification vous sera envoyé par e-mail.</p>
                    {errors.email && <p className="mt-1 text-xs text-[var(--color-danger)]">Adresse e-mail invalide</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">{t('auth.register.password')} *</label>
                    <div className="relative">
                      <input {...register('password')} type={showPwd ? 'text' : 'password'} className={`${inputClass} pr-11`} placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" tabIndex={-1}>
                        {showPwd ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1 text-xs text-[var(--color-danger)]">{t('common.passwordMin')}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">{t('auth.register.confirmPassword')} *</label>
                    <div className="relative">
                      <input {...register('confirmPassword')} type={showConfirmPwd ? 'text' : 'password'} className={`${inputClass} pr-11`} placeholder="••••••••" />
                      <button type="button" onClick={() => setShowConfirmPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" tabIndex={-1}>
                        {showConfirmPwd ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-xs text-[var(--color-danger)]">
                        {errors.confirmPassword.message === 'mismatch' ? t('common.passwordMatch') : t('common.passwordMin')}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* ─── Step 2: Payment ─── */}
              {step === 1 && (
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-3">{t('auth.register.paymentMethod')}</label>
                  <div className="space-y-3">
                    {([
                      { value: 'TMONEY', label: t('auth.register.tmoney'), icon: Smartphone },
                      { value: 'FLOOZ',  label: t('auth.register.flooz'),  icon: Smartphone },
                      { value: 'CASH',   label: t('auth.register.cash'),   icon: Banknote },
                    ] as const).map(({ value, label, icon: Icon }) => (
                      <label
                        key={value}
                        className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                          watch('paymentMethod') === value
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                            : 'border-[var(--color-border)]'
                        }`}
                      >
                        <input {...register('paymentMethod')} type="radio" value={value} className="sr-only" />
                        <Icon size={18} className="text-[var(--color-primary)]" aria-hidden />
                        <span className="text-sm font-medium">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── Step 3: Commitment ─── */}
              {step === 2 && (
                <div>
                  <p className="text-sm text-[var(--color-text-muted)] mb-4 leading-relaxed">
                    {t('auth.register.commitment')}
                  </p>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input {...register('commitment')} type="checkbox" className="mt-0.5 h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]" />
                    <span className="text-sm text-[var(--color-text)]">{t('auth.register.commitment')}</span>
                  </label>
                  {errors.commitment && <p className="mt-2 text-xs text-[var(--color-danger)]">{t('common.required')}</p>}
                </div>
              )}

              {/* ─── Step 4: Location + date ─── */}
              {step === 3 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">{t('auth.register.location')} *</label>
                    <input {...register('location')} className={inputClass} placeholder="Lomé" />
                    {errors.location && <p className="mt-1 text-xs text-[var(--color-danger)]">{t('common.required')}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">{t('auth.register.date')} *</label>
                    <input {...register('date')} type="date" className={inputClass} />
                    {errors.date && <p className="mt-1 text-xs text-[var(--color-danger)]">{t('common.required')}</p>}
                  </div>
                </>
              )}

              {apiError && (
                <p className="text-sm text-[var(--color-danger)] bg-[var(--color-danger)]/5 border border-[var(--color-danger)]/20 rounded-xl px-3 py-2">
                  {apiError}
                </p>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              {step > 0 && (
                <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
                  {t('auth.register.back')}
                </Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button type="button" className="flex-1" onClick={next}>
                  {t('auth.register.next')}
                </Button>
              ) : (
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Envoi en cours…' : t('auth.register.submit')}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
