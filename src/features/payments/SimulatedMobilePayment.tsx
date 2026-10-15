import { useState } from 'react'
import { CheckCircle2, Loader2, Smartphone } from 'lucide-react'
import { formatXof } from '@/lib/format'
import { authErrorMessage } from '@/features/auth/errors'
import { methodName } from './types'

export const PAYMENT_SIMULATION_ENABLED = import.meta.env.VITE_SIMULATE_PAYMENT === 'true'

const PROCESSING_DELAY_MS = 3000

type Step = 'phone' | 'processing' | 'done'

interface SimulatedMobilePaymentProps {
  method: string
  amount: number
  onConfirmed: () => Promise<void>
  onChangeMethod: () => void
}

export function SimulatedMobilePayment({ method, amount, onConfirmed, onChangeMethod }: SimulatedMobilePaymentProps) {
  const [phone, setPhone] = useState('')
  const [step, setStep] = useState<Step>('phone')
  const [error, setError] = useState<string | null>(null)

  const phoneValid = /^\d{8}$/.test(phone)

  async function pay() {
    setError(null)
    setStep('processing')
    try {
      await new Promise((resolve) => setTimeout(resolve, PROCESSING_DELAY_MS))
      await onConfirmed()
      setStep('done')
    } catch (caught) {
      setError(authErrorMessage(caught))
      setStep('phone')
    }
  }

  if (step === 'processing') {
    return (
      <div role="status" className="flex flex-col items-center gap-3 py-6 text-center">
        <Loader2 size={32} className="animate-spin text-[var(--color-primary)]" aria-hidden />
        <p className="text-sm font-semibold text-[var(--color-text)]">Confirmez le paiement sur votre telephone</p>
        <p className="text-xs text-[var(--color-text-muted)]">
          Une demande de {formatXof(amount)} a ete envoyee au +228 {phone} ({methodName(method)}).
        </p>
      </div>
    )
  }

  if (step === 'done') {
    return (
      <p role="status" className="flex items-center gap-2 rounded-2xl bg-[var(--color-primary)]/5 p-5 text-sm font-semibold text-[var(--color-text)]">
        <CheckCircle2 size={18} className="text-[var(--color-primary)]" aria-hidden />
        Paiement recu, activation en cours...
      </p>
    )
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (phoneValid) void pay()
      }}
      className="space-y-4"
    >
      <p className="flex items-start gap-2 text-sm text-[var(--color-text-muted)]">
        <Smartphone size={16} className="mt-0.5 shrink-0" aria-hidden />
        Saisissez le numero {methodName(method)} qui effectuera le paiement.
      </p>
      <div>
        <label htmlFor="simulated-phone" className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
          Numero de telephone
        </label>
        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm text-[var(--color-text-muted)]">+228</span>
          <input
            id="simulated-phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 8))}
            inputMode="numeric"
            placeholder="90123456"
            autoComplete="tel-national"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>
        {phone.length > 0 && !phoneValid && <p className="mt-1 text-xs text-[var(--color-danger)]">Le numero doit contenir 8 chiffres.</p>}
      </div>
      {error && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={!phoneValid}
        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
      >
        Payer {formatXof(amount)}
      </button>
      <button type="button" onClick={onChangeMethod} className="text-sm text-[var(--color-text-muted)] underline-offset-2 hover:underline">
        Changer de moyen de paiement
      </button>
    </form>
  )
}
