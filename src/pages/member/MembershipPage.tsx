import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2 } from 'lucide-react'
import { Panel } from '@/components/dashboard/Panel'
import { PageHeader } from '@/components/ui/PageHeader'
import { useAuth } from '@/app/AuthContext'
import { get, newIdempotencyKey, post } from '@/lib/api'
import { formatXof } from '@/lib/format'
import { authErrorMessage } from '@/features/auth/errors'
import { AmountBreakdown, MethodPicker, PaymentCheckout } from '@/features/payments/PaymentCheckout'
import { PAYMENT_SIMULATION_ENABLED, SimulatedMobilePayment } from '@/features/payments/SimulatedMobilePayment'
import { isInFlight, type PaymentAttempt } from '@/features/payments/types'

interface MembershipState {
  status: string
  fee_due: number
  payment_quote: { net_amount: number; fee_amount: number; total_amount: number } | null
  payment_attempts: PaymentAttempt[]
}

const QUERY_KEY = ['membership']

export default function MembershipPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, refresh } = useAuth()
  const [method, setMethod] = useState('TMONEY')
  const [choosing, setChoosing] = useState(false)
  const [methodChosen, setMethodChosen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => get<MembershipState>('/me/membership'),
    staleTime: 0,
    refetchInterval: (state) => {
      const attempt = state.state.data?.payment_attempts[0]
      return attempt && isInFlight(attempt.status) ? 4000 : false
    },
  })

  const state = query.data
  const attempt = state?.payment_attempts[0]
  const active = state?.status === 'active' || user?.status === 'active'

  useEffect(() => {
    if (!active) return
    void refresh().then(() => {
      queryClient.clear()
      navigate('/espace', { replace: true })
    })
  }, [active, navigate, queryClient, refresh])

  const startPayment = useMutation({
    mutationFn: () => post<PaymentAttempt>('/me/membership/payments', { method }, newIdempotencyKey()),
    onSuccess: () => {
      setChoosing(false)
      setError(null)
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
    onError: (caught) => setError(authErrorMessage(caught)),
  })

  const showCheckout = attempt && !choosing && (isInFlight(attempt.status) || attempt.status !== 'approved')

  return (
    <>
      <Helmet>
        <title>Adhésion — CECT Togo</title>
      </Helmet>

      <div className="max-w-xl space-y-6">
        <PageHeader title="Finalisez votre adhésion" description="Votre e-mail est vérifié. Réglez les frais d'adhésion pour activer votre compte et accéder aux packs." />

        {query.isPending && <div className="h-64 animate-pulse rounded-3xl bg-[var(--chart-track)]" />}

        {query.isError && (
          <p role="alert" className="rounded-2xl border border-[var(--color-border)] p-5 text-sm">
            Impossible de charger votre adhésion.{' '}
            <button type="button" onClick={() => void query.refetch()} className="font-semibold text-[var(--color-primary)] underline">
              Réessayer
            </button>
          </p>
        )}

        {active && (
          <p role="status" className="flex items-center gap-2 rounded-2xl bg-[var(--color-primary)]/5 p-5 text-sm font-semibold text-[var(--color-text)]">
            <CheckCircle2 size={18} className="text-[var(--color-primary)]" aria-hidden />
            Adhésion activée, redirection vers votre espace…
          </p>
        )}

        {state && !active && (
          <Panel title="Frais d'adhésion" subtitle={`Montant : ${formatXof(state.fee_due)}`}>
            {PAYMENT_SIMULATION_ENABLED ? (
              methodChosen ? (
                <SimulatedMobilePayment
                  method={method}
                  amount={state.payment_quote?.total_amount ?? state.fee_due}
                  onConfirmed={async () => {
                    await post('/me/membership/demo-activation')
                    await query.refetch()
                  }}
                  onChangeMethod={() => setMethodChosen(false)}
                />
              ) : (
                <form
                  onSubmit={(event) => {
                    event.preventDefault()
                    setMethodChosen(true)
                  }}
                  className="space-y-4"
                >
                  {state.payment_quote && <AmountBreakdown net={state.payment_quote.net_amount} fee={state.payment_quote.fee_amount} total={state.payment_quote.total_amount} />}
                  <MethodPicker value={method} onChange={setMethod} />
                  <button
                    type="submit"
                    className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]"
                  >
                    Continuer
                  </button>
                </form>
              )
            ) : showCheckout ? (
              <PaymentCheckout
                payment={attempt}
                onRefresh={async () => {
                  await post(`/me/membership/payments/${attempt.id}/refresh`)
                  await query.refetch()
                }}
                onDeclare={async (reference) => {
                  await post(`/me/payments/${attempt.id}/declare`, { reference: reference || null })
                  await query.refetch()
                }}
                onChangeMethod={() => setChoosing(true)}
              />
            ) : (
              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  startPayment.mutate()
                }}
                className="space-y-4"
              >
                {state.payment_quote && <AmountBreakdown net={state.payment_quote.net_amount} fee={state.payment_quote.fee_amount} total={state.payment_quote.total_amount} />}
                <MethodPicker value={method} onChange={setMethod} />
                {error && (
                  <p role="alert" className="text-sm text-[var(--color-danger)]">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={startPayment.isPending}
                  className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
                >
                  Continuer
                </button>
              </form>
            )}
          </Panel>
        )}
      </div>
    </>
  )
}
