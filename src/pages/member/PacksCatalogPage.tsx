import { useEffect, useState, type FormEvent } from 'react'
import { Helmet } from 'react-helmet-async'
import * as Dialog from '@radix-ui/react-dialog'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BadgeCheck, CheckCircle2, Clock3, X } from 'lucide-react'
import { SegmentedControl } from '@/components/dashboard/SegmentedControl'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { btnPrimary } from '@/components/ui/buttons'
import { useMemberDashboard } from '@/data/useMemberDashboard'
import type { MemberPack } from '@/data/memberDashboard'
import { get, newIdempotencyKey, post } from '@/lib/api'
import { formatBps, formatDateMedium, formatXof, formatYem } from '@/lib/format'
import { authErrorMessage } from '@/features/auth/errors'
import { AmountBreakdown, MethodPicker, PaymentCheckout } from '@/features/payments/PaymentCheckout'
import { PAYMENT_SIMULATION_ENABLED, SimulatedMobilePayment } from '@/features/payments/SimulatedMobilePayment'
import { isInFlight, type PaymentAttempt } from '@/features/payments/types'
import { FAMILIES, packFacts, type PackPlan, type SubscribeResult, type UserPack } from '@/features/packs/types'

type Step = { name: 'method' } | { name: 'checkout'; result: SubscribeResult } | { name: 'done'; pack: UserPack }

function SubscribeDialog({ plan, onClose }: { plan: PackPlan; onClose: () => void }) {
  const queryClient = useQueryClient()
  const free = (plan.current_version?.price_xof ?? 0) === 0
  const [method, setMethod] = useState('TMONEY')
  const [step, setStep] = useState<Step>({ name: 'method' })
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const pendingPack = step.name === 'checkout' ? step.result.user_pack : null
  const status = useQuery({
    queryKey: ['user-pack', pendingPack?.id],
    queryFn: () => get<UserPack>(`/me/packs/${pendingPack?.id}`),
    enabled: pendingPack !== null,
    refetchInterval: 4000,
    staleTime: 0,
  })

  useEffect(() => {
    if (status.data?.status === 'active') {
      void queryClient.invalidateQueries({ queryKey: ['my-packs'] })
      void queryClient.invalidateQueries({ queryKey: ['member-dashboard'] })
      setStep({ name: 'done', pack: status.data })
    }
  }, [status.data, queryClient])

  async function subscribe() {
    setBusy(true)
    setError(null)
    try {
      const result = await post<SubscribeResult>('/me/packs', { plan_id: plan.id, ...(free ? {} : { method }) }, newIdempotencyKey())
      if (result.payment === null || result.user_pack.status === 'active') {
        void queryClient.invalidateQueries({ queryKey: ['my-packs'] })
        void queryClient.invalidateQueries({ queryKey: ['member-dashboard'] })
        setStep({ name: 'done', pack: result.user_pack })
      } else {
        setStep({ name: 'checkout', result })
      }
    } catch (caught) {
      setError(authErrorMessage(caught))
    } finally {
      setBusy(false)
    }
  }

  function patchPayment(patch: Partial<PaymentAttempt>) {
    setStep((current) => (current.name === 'checkout' && current.result.payment ? { name: 'checkout', result: { ...current.result, payment: { ...current.result.payment, ...patch } } } : current))
  }

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[var(--forest-900)]/60" />
        <Dialog.Content aria-describedby={undefined} className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl bg-[var(--dash-card)] p-6 shadow-2xl outline-none">
          <div className="mb-4 flex items-start justify-between gap-3">
            <Dialog.Title className="text-lg font-extrabold tracking-tight text-[var(--color-text)]">{plan.name}</Dialog.Title>
            <Dialog.Close aria-label="Fermer" className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--color-text-muted)] hover:bg-[var(--chart-track)]">
              <X size={18} aria-hidden />
            </Dialog.Close>
          </div>

          {step.name === 'method' && (
            <div className="space-y-4">
              {plan.payment_quote && !free && <AmountBreakdown net={plan.payment_quote.net_amount} fee={plan.payment_quote.fee_amount} total={plan.payment_quote.total_amount} />}
              {free ? <p className="text-sm text-[var(--color-text-muted)]">Ce pack est gratuit : il sera activé immédiatement.</p> : <MethodPicker value={method} onChange={setMethod} />}
              {error && (
                <p role="alert" className="text-sm text-[var(--color-danger)]">
                  {error}
                </p>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => void subscribe()}
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
              >
                {free ? 'Activer le pack' : 'Continuer'}
              </button>
            </div>
          )}

          {step.name === 'checkout' && step.result.payment && PAYMENT_SIMULATION_ENABLED && step.result.payment.mode === 'psp' && isInFlight(step.result.payment.status) && (
            <SimulatedMobilePayment
              method={step.result.payment.method ?? method}
              amount={step.result.payment.amount}
              onConfirmed={async () => {
                await post(`/me/payments/${step.result.payment?.id}/demo-settle`)
                await status.refetch()
              }}
              onChangeMethod={() => setStep({ name: 'method' })}
            />
          )}

          {step.name === 'checkout' && step.result.payment && !(PAYMENT_SIMULATION_ENABLED && step.result.payment.mode === 'psp' && isInFlight(step.result.payment.status)) && (
            <PaymentCheckout
              payment={step.result.payment}
              onRefresh={async () => {
                await status.refetch()
              }}
              onDeclare={async (reference) => {
                await post(`/me/payments/${step.result.payment?.id}/declare`, { reference: reference || null })
                patchPayment({ declared_at: new Date().toISOString() })
              }}
              onChangeMethod={() => setStep({ name: 'method' })}
            />
          )}

          {step.name === 'done' && (
            <div className="space-y-4 text-center">
              <CheckCircle2 size={44} className="mx-auto text-[var(--color-primary)]" aria-hidden />
              <p className="text-base font-bold text-[var(--color-text)]">Votre pack {step.pack.plan.name} est actif.</p>
              <button type="button" onClick={onClose} className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]">
                Terminer
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

interface Topup {
  id: string
  status: string
  amount_xof: number
  quantity: string
  discount_bps: number
  credited_at: string | null
}

function TopupDialog({ pack, minimum, onClose }: { pack: UserPack; minimum: number; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [amount, setAmount] = useState(String(minimum || ''))
  const [method, setMethod] = useState('TMONEY')
  const [state, setState] = useState<{ topup: Topup; payment: PaymentAttempt } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const topups = useQuery({
    queryKey: ['topups', pack.id],
    queryFn: () => get<Topup[]>(`/me/packs/${pack.id}/topups`),
    enabled: state !== null,
    refetchInterval: 4000,
    staleTime: 0,
  })
  const credited = state ? topups.data?.find((topup) => topup.id === state.topup.id)?.credited_at != null : false

  useEffect(() => {
    if (!credited) return
    void queryClient.invalidateQueries({ queryKey: ['my-packs'] })
    void queryClient.invalidateQueries({ queryKey: ['member-dashboard'] })
  }, [credited, queryClient])

  async function submit(event: FormEvent) {
    event.preventDefault()
    const value = Number.parseInt(amount, 10)
    if (!Number.isFinite(value) || value < minimum) {
      setError(`Le rechargement minimum est de ${formatXof(minimum)}.`)
      return
    }
    setBusy(true)
    setError(null)
    try {
      setState(await post<{ topup: Topup; payment: PaymentAttempt }>(`/me/packs/${pack.id}/topups`, { amount_xof: value, method }, newIdempotencyKey()))
    } catch (caught) {
      setError(authErrorMessage(caught))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[var(--forest-900)]/60" />
        <Dialog.Content aria-describedby={undefined} className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl bg-[var(--dash-card)] p-6 shadow-2xl outline-none">
          <div className="mb-4 flex items-start justify-between gap-3">
            <Dialog.Title className="text-lg font-extrabold tracking-tight text-[var(--color-text)]">Recharger {pack.plan.name}</Dialog.Title>
            <Dialog.Close aria-label="Fermer" className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--color-text-muted)] hover:bg-[var(--chart-track)]">
              <X size={18} aria-hidden />
            </Dialog.Close>
          </div>

          {credited && state ? (
            <div className="space-y-4 text-center">
              <CheckCircle2 size={44} className="mx-auto text-[var(--color-primary)]" aria-hidden />
              <p className="text-base font-bold text-[var(--color-text)]">{formatYem(state.topup.quantity)} crédités sur votre pack.</p>
              <button type="button" onClick={onClose} className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white">
                Terminer
              </button>
            </div>
          ) : state ? (
            <div className="space-y-4">
              <p className="text-sm text-[var(--color-text-muted)]">
                {formatYem(state.topup.quantity)} seront crédités une fois le paiement confirmé (remise de {formatBps(state.topup.discount_bps)} incluse).
              </p>
              {PAYMENT_SIMULATION_ENABLED && state.payment.mode === 'psp' && isInFlight(state.payment.status) ? (
                <SimulatedMobilePayment
                  method={state.payment.method ?? method}
                  amount={state.payment.amount}
                  onConfirmed={async () => {
                    await post(`/me/payments/${state.payment.id}/demo-settle`)
                    await topups.refetch()
                  }}
                  onChangeMethod={() => setState(null)}
                />
              ) : (
                <PaymentCheckout
                  payment={state.payment}
                  onRefresh={async () => {
                    await topups.refetch()
                  }}
                  onDeclare={async (reference) => {
                    await post(`/me/payments/${state.payment.id}/declare`, { reference: reference || null })
                    setState({ ...state, payment: { ...state.payment, declared_at: new Date().toISOString() } })
                  }}
                  onChangeMethod={() => setState(null)}
                />
              )}
            </div>
          ) : (
            <form onSubmit={(event) => void submit(event)} className="space-y-4">
              <div>
                <label htmlFor="topup-amount" className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                  Montant à payer (FCFA)
                </label>
                <input
                  id="topup-amount"
                  type="number"
                  min={minimum}
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  required
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">Minimum : {formatXof(minimum)}. La quantité de YEM est calculée au cours du jour.</p>
              </div>
              <MethodPicker value={method} onChange={setMethod} />
              {error && (
                <p role="alert" className="text-sm text-[var(--color-danger)]">
                  {error}
                </p>
              )}
              <button type="submit" disabled={busy} className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60">
                Continuer
              </button>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function PlanCard({ plan, owned, onSelect, onTopup }: { plan: PackPlan; owned: UserPack | undefined; onSelect: () => void; onTopup: () => void }) {
  const version = plan.current_version
  if (!version) return null
  const hasActive = owned?.status === 'active'
  const pending = owned?.status === 'pending_payment'
  const locked = plan.eligible === false
  const facts = packFacts(version).filter((fact) => fact.label !== 'Prix')
  const price = version.price_xof === 0 ? 'Gratuit' : formatXof(version.price_xof)

  return (
    <article className="flex flex-col rounded-[18px] border border-[var(--color-border)] bg-[var(--dash-card)] p-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">{FAMILIES.find((family) => family.family === plan.family)?.title}</p>
          <h3 className="text-base font-bold text-[var(--color-text)]">{plan.name}</h3>
        </div>
        {hasActive && <StatusBadge label="Souscrit" tone="success" icon={BadgeCheck} />}
        {pending && <StatusBadge label="Paiement en attente" tone="warning" icon={Clock3} />}
      </div>
      <p className="mt-3 text-[28px] font-bold leading-8 tracking-tight text-[var(--color-text)] [font-variant-numeric:tabular-nums]">{price}</p>
      {plan.description && <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">{plan.description}</p>}
      <dl className="mt-5 divide-y divide-[var(--color-border)] border-t border-[var(--color-border)] text-sm">
        {facts.map((fact) => (
          <div key={fact.label} className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--color-text-muted)]">{fact.label}</dt>
            <dd className="text-right font-semibold text-[var(--color-text)]">{fact.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-auto pt-5">
        {locked ? (
          <p className="text-sm text-[var(--color-text-muted)]">Ce pack n'est pas ouvert à votre type de compte.</p>
        ) : (
          <button type="button" disabled={hasActive && plan.family !== 'PERSONNEL'} onClick={hasActive && plan.family === 'PERSONNEL' ? onTopup : onSelect} className={`${btnPrimary} w-full`}>
            {hasActive ? (plan.family === 'PERSONNEL' ? 'Recharger' : 'Déjà souscrit') : pending ? 'Reprendre le paiement' : version.price_xof === 0 ? 'Activer gratuitement' : plan.payment_quote ? `Souscrire · ${formatXof(plan.payment_quote.total_amount)}` : 'Souscrire'}
          </button>
        )}
      </div>
    </article>
  )
}

function MyPackCard({ pack, detail, plan, onResume, onTopup }: { pack: UserPack; detail: MemberPack | undefined; plan: PackPlan | undefined; onResume: () => void; onTopup: () => void }) {
  const active = pack.status === 'active'
  const quota = detail ? Number.parseFloat(detail.quota_per_period) : 0
  const used = detail ? Number.parseFloat(detail.quota_used) : 0
  const ratio = quota > 0 ? Math.min(used / quota, 1) : 0

  return (
    <article className="rounded-[18px] border border-[var(--color-border)] bg-[var(--dash-card)] p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-[var(--color-text)]">{pack.plan.name}</h3>
          <p className="text-sm text-[var(--color-text-muted)]">{FAMILIES.find((family) => family.family === pack.family)?.title}</p>
        </div>
        <StatusBadge label={active ? 'Actif' : 'Paiement en attente'} tone={active ? 'success' : 'warning'} icon={active ? BadgeCheck : Clock3} />
      </div>

      {active && (
        <>
          <dl className="mt-5 grid grid-cols-3 gap-4">
            {[
              ['Disponible', pack.balance?.available ?? '0'],
              ['Réservé', pack.balance?.reserved ?? '0'],
              ['Consommé', pack.balance?.consumed ?? '0'],
            ].map(([label, quantity]) => (
              <div key={label}>
                <dt className="text-xs font-semibold text-[var(--color-text-muted)]">{label}</dt>
                <dd className="mt-1 text-lg font-bold text-[var(--color-text)] [font-variant-numeric:tabular-nums]">{formatYem(quantity ?? '0')}</dd>
              </div>
            ))}
          </dl>
          {detail && quota > 0 && (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-[var(--color-text)]">Quota de la période</span>
                <span className="text-[var(--color-text-muted)]">
                  {formatYem(detail.quota_used)} sur {formatYem(detail.quota_per_period)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--chart-track)]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(ratio * 100)} aria-label="Quota utilisé">
                <div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${ratio * 100}%` }} />
              </div>
              {detail.period && (
                <p className="mt-3 text-sm text-[var(--color-text-muted)]">
                  Période {detail.period.number} sur {detail.period.cycles} · prochain crédit le {formatDateMedium(detail.period.next_credit_at)}
                </p>
              )}
            </div>
          )}
          {pack.expires_at && <p className="mt-3 text-sm text-[var(--color-text-muted)]">Valable jusqu'au {formatDateMedium(pack.expires_at)}.</p>}
          {pack.family === 'PERSONNEL' && (
            <button type="button" onClick={onTopup} className={`${btnPrimary} mt-5`}>
              Recharger
            </button>
          )}
        </>
      )}

      {!active && plan && (
        <button type="button" onClick={onResume} className={`${btnPrimary} mt-5`}>
          Reprendre le paiement
        </button>
      )}
    </article>
  )
}

type Tab = 'mine' | 'catalog'

export default function PacksCatalogPage() {
  const [tab, setTab] = useState<Tab>('mine')
  const [selected, setSelected] = useState<PackPlan | null>(null)
  const [topupFor, setTopupFor] = useState<{ pack: UserPack; minimum: number } | null>(null)
  const catalog = useQuery({ queryKey: ['packs-catalog'], queryFn: () => get<PackPlan[]>('/packs'), staleTime: 0 })
  const mine = useQuery({ queryKey: ['my-packs'], queryFn: () => get<UserPack[]>('/me/packs'), staleTime: 0 })
  const dashboard = useMemberDashboard()

  const ownedByPlan = new Map<string, UserPack>()
  for (const pack of mine.data ?? []) {
    const existing = ownedByPlan.get(pack.plan.id)
    if (!existing || (existing.status !== 'active' && pack.status === 'active')) ownedByPlan.set(pack.plan.id, pack)
  }

  const myPacks = (mine.data ?? []).filter((pack) => pack.status === 'active' || pack.status === 'pending_payment')
  const planById = new Map((catalog.data ?? []).map((plan) => [plan.id, plan]))

  function topup(pack: UserPack) {
    setTopupFor({ pack, minimum: planById.get(pack.plan.id)?.current_version?.rules.min_topup_xof ?? 0 })
  }

  return (
    <>
      <Helmet>
        <title>Mes packs — CECT Togo</title>
      </Helmet>

      <PageHeader
        title="Mes packs"
        description="Vos souscriptions et les formules proposées par la CECT."
        actions={
          <SegmentedControl
            label="Affichage"
            value={tab}
            onChange={setTab}
            options={[
              { value: 'mine', label: 'Mes packs' },
              { value: 'catalog', label: 'Catalogue' },
            ]}
          />
        }
      />

      {tab === 'mine' && (
        <div className="space-y-6">
          {mine.isPending && <div className="h-48 animate-pulse rounded-[18px] bg-[var(--chart-track)]" />}
          {mine.data && myPacks.length === 0 && (
            <div className="rounded-[18px] border border-[var(--color-border)] bg-[var(--dash-card)]">
              <EmptyState
                title="Vous n'avez pas encore de pack"
                description="Choisissez une formule dans le catalogue pour recevoir un quota de YEM."
                action={
                  <button type="button" onClick={() => setTab('catalog')} className={btnPrimary}>
                    Voir le catalogue
                  </button>
                }
              />
            </div>
          )}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {myPacks.map((pack) => (
              <MyPackCard key={pack.id} pack={pack} detail={dashboard.data?.packs.find((item) => item.id === pack.id)} plan={planById.get(pack.plan.id)} onResume={() => setSelected(planById.get(pack.plan.id) ?? null)} onTopup={() => topup(pack)} />
            ))}
          </div>
        </div>
      )}

      {tab === 'catalog' && (
        <div className="space-y-10">
          {catalog.isPending && <div className="h-48 animate-pulse rounded-[18px] bg-[var(--chart-track)]" />}
          {catalog.isError && (
            <p role="alert" className="rounded-[18px] border border-[var(--color-border)] bg-[var(--dash-card)] p-6 text-sm">
              Impossible de charger le catalogue.{' '}
              <button type="button" onClick={() => void catalog.refetch()} className="font-semibold text-[var(--color-primary)] underline">
                Réessayer
              </button>
            </p>
          )}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {FAMILIES.flatMap(({ family }) => (catalog.data ?? []).filter((plan) => plan.family === family)).map((plan) => (
              <PlanCard key={plan.id} plan={plan} owned={ownedByPlan.get(plan.id)} onSelect={() => setSelected(plan)} onTopup={() => { const pack = ownedByPlan.get(plan.id); if (pack) topup(pack) }} />
            ))}
          </div>
        </div>
      )}

      {selected && <SubscribeDialog plan={selected} onClose={() => setSelected(null)} />}
      {topupFor && <TopupDialog pack={topupFor.pack} minimum={topupFor.minimum} onClose={() => setTopupFor(null)} />}
    </>
  )
}
