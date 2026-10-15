import { useState, type FormEvent } from 'react'
import { EXCHANGE_STATUS, StatusFrom } from '@/components/dashboard/StatusBadge'
import { post } from '@/lib/api'
import { formatDateMedium, formatXof, formatYem } from '@/lib/format'
import { authErrorMessage } from '@/features/auth/errors'

const INPUT = 'w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]'

export interface Exchange {
  id: string
  reference: string
  kind: string
  status: string
  quantity_requested: string
  quantity_received: string | null
  estimated_amount_xof: number
  amount_due_xof: number | null
  transfer_instructions: { send_to_pernum: string; from_pernum: string; quantity: string; reference: string } | null
  payout: { reference: string; status: string; total_amount: number; paid_amount: number; remaining_amount: number } | null
  expires_at: string
  created_at: string
}

const PAYOUT_LABELS: Record<string, string> = {
  awaiting_dispatch: 'Versement a venir',
  processing: 'Versement en cours',
  partially_paid: 'Versement partiel',
  paid: 'Verse',
  failed: 'Versement en echec',
  manual_required: 'Reglement manuel en cours',
}

export function ExchangeCard({ exchange, onChanged }: { exchange: Exchange; onChanged: () => Promise<void> }) {
  const [reference, setReference] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run(action: () => Promise<unknown>) {
    setBusy(true)
    setError(null)
    try {
      await action()
      await onChanged()
    } catch (caught) {
      setError(authErrorMessage(caught))
    } finally {
      setBusy(false)
    }
  }

  const awaiting = exchange.status === 'awaiting_transfer'
  const instructions = exchange.transfer_instructions

  return (
    <article className="rounded-2xl border border-[var(--color-border)] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-[var(--color-text)]">
            {exchange.reference} - {formatYem(exchange.quantity_requested)}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {formatDateMedium(exchange.created_at)} - estime {formatXof(exchange.amount_due_xof ?? exchange.estimated_amount_xof)}
          </p>
        </div>
        <StatusFrom statuses={EXCHANGE_STATUS} value={exchange.status} />
      </div>

      {awaiting && instructions && (
        <div className="mt-4 space-y-3">
          <p className="rounded-xl bg-[var(--dash-bg)] p-4 text-sm leading-relaxed text-[var(--color-text)]">
            Depuis votre portefeuille YEM (Pernum <strong>{instructions.from_pernum}</strong>), envoyez <strong>{formatYem(instructions.quantity)}</strong> au Pernum de la CECT <strong>{instructions.send_to_pernum}</strong> avec la reference <strong>{instructions.reference}</strong>. Rien n'est du tant qu'un validateur n'a pas constate la reception.
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">La reservation est liberee automatiquement le {formatDateMedium(exchange.expires_at)} sans declaration.</p>
          <form
            onSubmit={(event: FormEvent) => {
              event.preventDefault()
              void run(() => post(`/me/exchange-requests/${exchange.id}/declare-sent`, { transfer_reference: reference.trim() || null }))
            }}
            className="space-y-3"
          >
            <div>
              <label htmlFor={`ref-${exchange.id}`} className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                Reference de la transaction YEM
              </label>
              <input id={`ref-${exchange.id}`} value={reference} onChange={(event) => setReference(event.target.value)} maxLength={120} className={INPUT} />
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={busy} className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60">
                J'ai envoye les YEM
              </button>
              <button type="button" disabled={busy} onClick={() => void run(() => post(`/me/exchange-requests/${exchange.id}/cancel`))} className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[var(--color-border)] px-5 text-sm font-semibold hover:bg-[var(--dash-bg)] disabled:opacity-60">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {exchange.status === 'declared_sent' && <p className="mt-3 text-sm text-[var(--color-text-muted)]">Envoi declare : un validateur de la CECT controle la reception.</p>}

      {exchange.payout && (
        <p className="mt-3 text-sm text-[var(--color-text)]">
          <strong>{PAYOUT_LABELS[exchange.payout.status] ?? exchange.payout.status}</strong> - {formatXof(exchange.payout.paid_amount)} sur {formatXof(exchange.payout.total_amount)}
        </p>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}
    </article>
  )
}
