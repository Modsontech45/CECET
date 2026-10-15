import { useState } from 'react'
import { ExternalLink, Hourglass, RefreshCw, Smartphone } from 'lucide-react'
import { ApiError } from '@/lib/api'
import { formatXof } from '@/lib/format'
import { authErrorMessage } from '@/features/auth/errors'
import { PAYMENT_FAILURE_LABELS, isInFlight, methodName, usePaymentMethods, type PaymentAttempt } from './types'

interface MethodPickerProps {
  value: string
  onChange: (code: string) => void
}

export function MethodPicker({ value, onChange }: MethodPickerProps) {
  const methods = usePaymentMethods()
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-semibold text-[var(--color-text)]">Moyen de paiement</legend>
      {methods.map((method) => (
        <label
          key={method.code}
          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors ${
            value === method.code ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-[var(--color-border)] hover:bg-[var(--dash-bg)]'
          }`}
        >
          <input type="radio" name="payment-method" value={method.code} checked={value === method.code} onChange={() => onChange(method.code)} className="accent-[var(--color-primary)]" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-[var(--color-text)]">{method.label}</span>
            <span className="block text-xs text-[var(--color-text-muted)]">{method.hint}</span>
          </span>
        </label>
      ))}
    </fieldset>
  )
}

interface AmountBreakdownProps {
  net: number
  fee: number
  total: number
}

export function AmountBreakdown({ net, fee, total }: AmountBreakdownProps) {
  return (
    <dl className="space-y-1.5 rounded-xl bg-[var(--dash-bg)] p-4 text-sm">
      <div className="flex justify-between gap-4">
        <dt className="text-[var(--color-text-muted)]">Montant</dt>
        <dd className="font-semibold text-[var(--color-text)]">{formatXof(net)}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-[var(--color-text-muted)]">Frais de transaction</dt>
        <dd className="font-semibold text-[var(--color-text)]">{formatXof(fee)}</dd>
      </div>
      <div className="flex justify-between gap-4 border-t border-[var(--color-border)] pt-2">
        <dt className="font-bold text-[var(--color-text)]">Total a payer</dt>
        <dd className="text-base font-extrabold text-[var(--color-primary)]">{formatXof(total)}</dd>
      </div>
    </dl>
  )
}

interface PaymentCheckoutProps {
  payment: PaymentAttempt
  onDeclare: (reference: string) => Promise<void>
  onRefresh: () => Promise<void>
  onChangeMethod: () => void
}

export function PaymentCheckout({ payment, onDeclare, onRefresh, onChangeMethod }: PaymentCheckoutProps) {
  const [reference, setReference] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run(action: () => Promise<void>) {
    setBusy(true)
    setError(null)
    try {
      await action()
    } catch (caught) {
      setError(caught instanceof ApiError && caught.code === 'PAYMENT_ATTEMPT_IN_PROGRESS' ? 'Une tentative est deja en cours, patientez un instant.' : authErrorMessage(caught))
    } finally {
      setBusy(false)
    }
  }

  const failure = PAYMENT_FAILURE_LABELS[payment.status]
  const declared = payment.declared_at !== null

  return (
    <div className="space-y-4">
      <AmountBreakdown net={payment.net_amount} fee={payment.fee_amount} total={payment.amount} />

      {failure && (
        <p role="alert" className="rounded-xl border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 px-4 py-3 text-sm text-[var(--color-danger)]">
          {failure}
        </p>
      )}

      {isInFlight(payment.status) && payment.mode === 'psp' && (
        <div className="space-y-3">
          <p className="flex items-start gap-2 text-sm text-[var(--color-text-muted)]">
            <Smartphone size={16} className="mt-0.5 shrink-0" aria-hidden />
            Vous allez etre redirige vers la page securisee de {methodName(payment.method)}. Revenez ensuite sur cette page : l'activation est automatique.
          </p>
          {payment.checkout_url && (
            <a
              href={payment.checkout_url}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]"
            >
              <ExternalLink size={16} aria-hidden />
              Payer {formatXof(payment.amount)}
            </a>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(onRefresh)}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-5 text-sm font-semibold hover:bg-[var(--dash-bg)] disabled:opacity-60"
          >
            <RefreshCw size={15} aria-hidden />
            J'ai paye, verifier
          </button>
        </div>
      )}

      {isInFlight(payment.status) && payment.mode === 'manual' && (
        <div className="space-y-3">
          {payment.instructions && <p className="whitespace-pre-line rounded-xl border border-[var(--color-border)] p-4 text-sm leading-relaxed text-[var(--color-text)]">{payment.instructions}</p>}
          <p className="text-xs text-[var(--color-text-muted)]">
            Reference a indiquer : <strong className="text-[var(--color-text)]">{payment.reference}</strong>
          </p>
          {declared ? (
            <p className="flex items-start gap-2 rounded-xl bg-[var(--color-primary)]/5 px-4 py-3 text-sm text-[var(--color-text)]">
              <Hourglass size={16} className="mt-0.5 shrink-0 text-[var(--color-primary)]" aria-hidden />
              Paiement declare. Un validateur de la CECT le controle ; vous recevrez un e-mail des la decision.
            </p>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault()
                void run(() => onDeclare(reference.trim()))
              }}
              className="space-y-3"
            >
              <div>
                <label htmlFor="declared-reference" className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                  Reference du depot ou du virement (facultatif)
                </label>
                <input
                  id="declared-reference"
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  maxLength={120}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
              >
                J'ai effectue le paiement
              </button>
            </form>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}

      {!(isInFlight(payment.status) && payment.mode === 'manual' && declared) && (
        <button type="button" onClick={onChangeMethod} className="text-sm text-[var(--color-text-muted)] underline-offset-2 hover:underline">
          {failure ? 'Choisir un autre moyen de paiement' : 'Changer de moyen de paiement'}
        </button>
      )}
    </div>
  )
}
