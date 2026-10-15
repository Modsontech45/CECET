import { useRef, useState, type FormEvent } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import { Plus } from 'lucide-react'
import { Panel } from '@/components/dashboard/Panel'
import { PageHeader } from '@/components/ui/PageHeader'
import { SegmentedControl } from '@/components/dashboard/SegmentedControl'
import { MERCHANT_PAYMENT_STATUS, StatusBadge, StatusFrom } from '@/components/dashboard/StatusBadge'
import { FormDialog } from '@/components/ui/FormDialog'
import { ApiError, get, getRaw, newIdempotencyKey, post, put } from '@/lib/api'
import { formatDateMedium, formatYem } from '@/lib/format'
import { authErrorMessage } from '@/features/auth/errors'
import { ExchangeCard, type Exchange } from '@/features/exchanges/ExchangeCard'
import type { UserPack } from '@/features/packs/types'

type Section = 'payments' | 'qr' | 'balance' | 'directory'

interface ReceivedPayment {
  id: string
  reference: string
  status: string
  quantity: string
  payer: { name: string; pernum: string | null }
  outlet_label: string | null
  confirmation_mode: string
  transfer_reference: string | null
  declared_at: string | null
  created_at: string
}

interface MerchantQr {
  id: string
  user_pack_id: string
  outlet_label: string | null
  version: number
  status: string
  code: string | null
  payload: string | null
  created_at: string
}

interface MerchantBalance {
  packs: { user_pack_id: string; eligible: string; reserved: string; redeemed: string }[]
}

interface DirectoryProfile {
  name: string
  activity: string | null
  city: string | null
  address: string | null
  phone: string | null
  description: string | null
  listed: boolean
}

const INPUT = 'w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]'
const QUANTITY_PATTERN = /^\d{1,22}([.,]\d{1,6})?$/

function PaymentsSection() {
  const queryClient = useQueryClient()
  const [reporting, setReporting] = useState<ReceivedPayment | null>(null)
  const [error, setError] = useState<string | null>(null)
  const query = useQuery({ queryKey: ['merchant-received'], queryFn: () => getRaw<{ data: ReceivedPayment[] }>('/merchant/payments', { per_page: 30 }).then((body) => body.data), staleTime: 0 })

  async function confirm(payment: ReceivedPayment) {
    setError(null)
    try {
      await post(`/merchant/payments/${payment.id}/confirm`, undefined, newIdempotencyKey())
      await queryClient.invalidateQueries({ queryKey: ['merchant-received'] })
    } catch (caught) {
      setError(authErrorMessage(caught))
    }
  }

  return (
    <Panel title="Paiements reçus" subtitle="Confirmez la réception des YEM envoyés par vos clients" flush>
      {error && <p role="alert" className="px-6 pb-3 text-sm text-[var(--color-danger)]">{error}</p>}
      {query.data && query.data.length === 0 && <p className="px-6 pb-5 text-sm text-[var(--color-text-muted)]">Aucun paiement reçu pour le moment.</p>}
      <ul className="divide-y divide-[var(--color-border)]">
        {query.data?.map((payment) => (
          <li key={payment.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 sm:px-6">
            <div className="min-w-0 flex-1 basis-48">
              <p className="truncate text-sm font-bold text-[var(--color-text)]">{payment.payer.name}</p>
              <p className="truncate text-xs text-[var(--color-text-muted)]">
                {payment.reference} · {formatDateMedium(payment.created_at)}
                {payment.outlet_label ? ` · ${payment.outlet_label}` : ''}
              </p>
            </div>
            <span className="text-sm font-extrabold text-[var(--color-text)]">{formatYem(payment.quantity)}</span>
            <StatusFrom statuses={MERCHANT_PAYMENT_STATUS} value={payment.status} />
            {payment.status === 'declared_sent' && payment.confirmation_mode === 'merchant' && (
              <div className="flex w-full gap-2 sm:w-auto">
                <button type="button" onClick={() => void confirm(payment)} className="inline-flex min-h-[40px] items-center rounded-xl bg-[var(--color-primary)] px-4 text-xs font-bold text-white">
                  Confirmer la réception
                </button>
                <button type="button" onClick={() => setReporting(payment)} className="inline-flex min-h-[40px] items-center rounded-xl border border-[var(--color-border)] px-4 text-xs font-bold hover:bg-[var(--dash-bg)]">
                  Non reçu
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      {reporting && (
        <FormDialog
          title="Signaler un paiement non reçu"
          subtitle={`${reporting.payer.name} · ${reporting.reference}`}
          fields={[{ name: 'reason', label: 'Motif (5 caractères minimum)', type: 'textarea', required: true }]}
          submitLabel="Signaler"
          danger
          onClose={() => setReporting(null)}
          onSubmit={async (values) => {
            await post(`/merchant/payments/${reporting.id}/report-not-received`, { reason: values.reason })
            await queryClient.invalidateQueries({ queryKey: ['merchant-received'] })
          }}
        />
      )}
    </Panel>
  )
}

function QrSection({ merchantPacks }: { merchantPacks: UserPack[] }) {
  const queryClient = useQueryClient()
  const [creating, setCreating] = useState(false)
  const [action, setAction] = useState<{ qr: MerchantQr; kind: 'rotate' | 'revoke' } | null>(null)
  const key = useRef(newIdempotencyKey())
  const query = useQuery({ queryKey: ['merchant-qr'], queryFn: () => get<MerchantQr[]>('/merchant/qr-codes'), staleTime: 0 })
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['merchant-qr'] })

  return (
    <Panel
      title="QR codes d'encaissement"
      subtitle="Affichez-les en caisse : le client les scanne pour vous payer"
      action={
        <button type="button" onClick={() => setCreating(true)} className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white">
          <Plus size={15} aria-hidden /> Nouveau
        </button>
      }
    >
      {query.data && query.data.length === 0 && <p className="text-sm text-[var(--color-text-muted)]">Aucun QR code. Créez-en un par point de vente.</p>}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {query.data?.map((qr) => (
          <article key={qr.id} className="rounded-2xl border border-[var(--color-border)] p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-bold text-[var(--color-text)]">{qr.outlet_label ?? 'Point de vente'}</p>
              <StatusBadge label={qr.status === 'active' ? 'Actif' : 'Révoqué'} tone={qr.status === 'active' ? 'success' : 'neutral'} />
            </div>
            {qr.payload && qr.status === 'active' && (
              <div className="mt-3 flex flex-col items-center gap-2 rounded-xl bg-white p-3">
                <QRCodeSVG value={qr.payload} size={160} />
                <p className="break-all text-center text-[11px] text-gray-600">Code : {qr.code}</p>
              </div>
            )}
            {qr.status === 'active' && (
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => setAction({ qr, kind: 'rotate' })} className="inline-flex min-h-[38px] flex-1 items-center justify-center rounded-xl border border-[var(--color-border)] text-xs font-bold hover:bg-[var(--dash-bg)]">
                  Renouveler
                </button>
                <button type="button" onClick={() => setAction({ qr, kind: 'revoke' })} className="inline-flex min-h-[38px] flex-1 items-center justify-center rounded-xl border border-[var(--color-danger)]/40 text-xs font-bold text-[var(--color-danger)]">
                  Révoquer
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

      {creating && (
        <FormDialog
          title="Nouveau QR code"
          fields={[
            { name: 'pack', label: 'Pack Marchand', type: 'select', options: merchantPacks.map((pack) => ({ value: pack.id, label: pack.plan.name })) },
            { name: 'outlet_label', label: 'Point de vente (facultatif)' },
          ]}
          submitLabel="Créer"
          onClose={() => setCreating(false)}
          onSubmit={async (values) => {
            await post('/merchant/qr-codes', { user_pack_id: values.pack, outlet_label: values.outlet_label || null }, key.current)
            key.current = newIdempotencyKey()
            await refresh()
          }}
        />
      )}
      {action && (
        <FormDialog
          title={action.kind === 'rotate' ? 'Renouveler le QR code' : 'Révoquer le QR code'}
          subtitle={action.kind === 'rotate' ? "L'ancien code cesse de fonctionner. Une confirmation par code e-mail est demandée." : 'Les clients ne pourront plus payer avec ce code.'}
          fields={[{ name: 'reason', label: 'Motif', type: 'textarea', required: true }]}
          submitLabel={action.kind === 'rotate' ? 'Renouveler' : 'Révoquer'}
          danger={action.kind === 'revoke'}
          onClose={() => setAction(null)}
          onSubmit={async (values) => {
            await post(`/merchant/qr-codes/${action.qr.id}/${action.kind}`, { reason: values.reason })
            await refresh()
          }}
        />
      )}
    </Panel>
  )
}

function BalanceSection({ merchantPacks }: { merchantPacks: UserPack[] }) {
  const queryClient = useQueryClient()
  const [packId, setPackId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const key = useRef(newIdempotencyKey())

  const balance = useQuery({ queryKey: ['merchant-balance'], queryFn: () => get<MerchantBalance>('/merchant/balance'), staleTime: 0 })
  const exchanges = useQuery({ queryKey: ['exchanges'], queryFn: () => getRaw<{ data: Exchange[] }>('/me/exchange-requests', { per_page: 20 }).then((body) => body.data), staleTime: 0 })
  const redemptions = (exchanges.data ?? []).filter((exchange) => exchange.kind === 'merchant_redemption')
  const selectedPackId = packId || merchantPacks[0]?.id || ''
  const available = balance.data?.packs.find((pack) => pack.user_pack_id === selectedPackId)

  const refreshAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ['exchanges'] })
    await queryClient.invalidateQueries({ queryKey: ['merchant-balance'] })
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!QUANTITY_PATTERN.test(quantity.trim())) {
      setError('Saisissez une quantité valide (6 décimales au plus).')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await post('/merchant/redemptions', { user_pack_id: selectedPackId, quantity: quantity.trim().replace(',', '.') }, key.current)
      key.current = newIdempotencyKey()
      setQuantity('')
      await refreshAll()
    } catch (caught) {
      key.current = newIdempotencyKey()
      setError(caught instanceof ApiError && caught.code === 'PAYOUT_DESTINATION_REQUIRED' ? "Renseignez d'abord votre moyen de réception dans « Vendre mes YEM »." : authErrorMessage(caught))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <Panel title="Solde marchand" subtitle="YEM encaissés auprès de vos clients">
        {balance.data?.packs.length === 0 && <p className="text-sm text-[var(--color-text-muted)]">Aucun solde pour le moment.</p>}
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            ['Rééchangeable', available?.eligible],
            ['Réservé', available?.reserved],
            ['Déjà racheté', available?.redeemed],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-[var(--dash-bg)] p-4">
              <dt className="text-xs text-[var(--color-text-muted)]">{label}</dt>
              <dd className="mt-0.5 text-lg font-extrabold text-[var(--color-text)]">{formatYem(value ?? '0')}</dd>
            </div>
          ))}
        </dl>
      </Panel>

      <Panel title="Demander un rééchange" subtitle="La CECT rachète vos YEM et vous verse le montant en FCFA">
        <form onSubmit={(event) => void submit(event)} className="space-y-4">
          <div>
            <label htmlFor="redeem-pack" className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">Pack Marchand</label>
            <select id="redeem-pack" value={selectedPackId} onChange={(event) => setPackId(event.target.value)} className={INPUT}>
              {merchantPacks.map((pack) => (
                <option key={pack.id} value={pack.id}>{pack.plan.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="redeem-quantity" className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">Quantité de YEM</label>
            <input id="redeem-quantity" value={quantity} onChange={(event) => setQuantity(event.target.value)} inputMode="decimal" required className={INPUT} />
          </div>
          {error && <p role="alert" className="text-sm text-[var(--color-danger)]">{error}</p>}
          <button type="submit" disabled={busy || !selectedPackId} className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60">
            Réserver et obtenir les instructions
          </button>
        </form>
      </Panel>

      <Panel title="Mes rééchanges">
        {redemptions.length === 0 && <p className="text-sm text-[var(--color-text-muted)]">Aucun rééchange pour le moment.</p>}
        <div className="space-y-4">
          {redemptions.map((exchange) => (
            <ExchangeCard key={exchange.id} exchange={exchange} onChanged={refreshAll} />
          ))}
        </div>
      </Panel>
    </div>
  )
}

function DirectorySection() {
  const queryClient = useQueryClient()
  const [saved, setSaved] = useState(false)
  const profile = useQuery({
    queryKey: ['merchant-directory'],
    queryFn: async () => {
      try {
        return await get<DirectoryProfile>('/merchant/directory-profile')
      } catch (caught) {
        if (caught instanceof ApiError && caught.status === 404) return null
        throw caught
      }
    },
    staleTime: 0,
  })
  const [form, setForm] = useState<Record<string, string | boolean> | null>(null)

  const current = form ?? {
    display_name: profile.data?.name ?? '',
    activity: profile.data?.activity ?? '',
    city: profile.data?.city ?? '',
    address: profile.data?.address ?? '',
    public_phone: profile.data?.phone ?? '',
    description: profile.data?.description ?? '',
    listed: profile.data?.listed ?? false,
  }
  const set = (name: string, value: string | boolean) => {
    setSaved(false)
    setForm({ ...current, [name]: value })
  }
  const [error, setError] = useState<string | null>(null)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    try {
      await put('/merchant/directory-profile', {
        listed: current.listed,
        display_name: current.display_name,
        activity: current.activity || null,
        city: current.city || null,
        address: current.address || null,
        public_phone: current.public_phone || null,
        description: current.description || null,
      })
      await queryClient.invalidateQueries({ queryKey: ['merchant-directory'] })
      setSaved(true)
    } catch (caught) {
      setError(authErrorMessage(caught))
    }
  }

  const field = (name: string, label: string, textarea = false) => (
    <div>
      <label htmlFor={`dir-${name}`} className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">{label}</label>
      {textarea ? (
        <textarea id={`dir-${name}`} rows={3} value={String(current[name])} onChange={(event) => set(name, event.target.value)} className={INPUT} />
      ) : (
        <input id={`dir-${name}`} value={String(current[name])} onChange={(event) => set(name, event.target.value)} className={INPUT} />
      )}
    </div>
  )

  return (
    <Panel title="Fiche annuaire" subtitle="Les marchands inscrits apparaissent dans l'annuaire public du réseau">
      <form onSubmit={(event) => void submit(event)} className="space-y-4">
        <label className="flex items-center gap-3 text-sm font-medium text-[var(--color-text)]">
          <input type="checkbox" checked={Boolean(current.listed)} onChange={(event) => set('listed', event.target.checked)} className="h-4 w-4 accent-[var(--color-primary)]" />
          Apparaître dans l'annuaire
        </label>
        {field('display_name', 'Nom affiché')}
        {field('activity', 'Activité')}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {field('city', 'Ville')}
          {field('public_phone', 'Téléphone public')}
        </div>
        {field('address', 'Adresse')}
        {field('description', 'Description', true)}
        {error && <p role="alert" className="text-sm text-[var(--color-danger)]">{error}</p>}
        {saved && <p role="status" className="text-sm text-[var(--color-primary)]">Fiche enregistrée.</p>}
        <button type="submit" className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[var(--color-primary)] px-6 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]">
          Enregistrer
        </button>
      </form>
    </Panel>
  )
}

export default function MerchantPage() {
  const [section, setSection] = useState<Section>('payments')
  const packs = useQuery({ queryKey: ['my-packs'], queryFn: () => get<UserPack[]>('/me/packs'), staleTime: 0 })
  const merchantPacks = (packs.data ?? []).filter((pack) => pack.family === 'MARCHAND' && pack.status === 'active')

  return (
    <>
      <Helmet>
        <title>Espace marchand — CECT Togo</title>
      </Helmet>

      <div className="max-w-3xl space-y-6">
        <PageHeader title="Espace marchand" description="Encaissez des YEM, suivez vos paiements et faites-les racheter par la CECT." />

        {packs.data && merchantPacks.length === 0 ? (
          <p className="rounded-2xl border border-[var(--color-border)] bg-[var(--dash-card)] p-5 text-sm">
            Il vous faut un pack Marchand actif (réservé aux personnes morales).{' '}
            <Link to="/espace/packs" className="font-semibold text-[var(--color-primary)] underline">
              Voir les packs
            </Link>
          </p>
        ) : (
          <>
            <SegmentedControl
              label="Section"
              value={section}
              onChange={setSection}
              options={[
                { value: 'payments', label: 'Paiements' },
                { value: 'qr', label: 'QR codes' },
                { value: 'balance', label: 'Solde' },
                { value: 'directory', label: 'Annuaire' },
              ]}
            />
            {section === 'payments' && <PaymentsSection />}
            {section === 'qr' && <QrSection merchantPacks={merchantPacks} />}
            {section === 'balance' && <BalanceSection merchantPacks={merchantPacks} />}
            {section === 'directory' && <DirectorySection />}
          </>
        )}
      </div>
    </>
  )
}
