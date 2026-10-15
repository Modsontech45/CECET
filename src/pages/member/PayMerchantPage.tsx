import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Camera, Search, Store } from 'lucide-react'
import { Panel } from '@/components/dashboard/Panel'
import { PageHeader } from '@/components/ui/PageHeader'
import { Steps } from '@/components/ui/Steps'
import { MERCHANT_PAYMENT_STATUS, StatusFrom } from '@/components/dashboard/StatusBadge'
import { FormDialog } from '@/components/ui/FormDialog'
import { get, getRaw, newIdempotencyKey, post } from '@/lib/api'
import { formatDateMedium, formatYem } from '@/lib/format'
import { authErrorMessage } from '@/features/auth/errors'
import type { UserPack } from '@/features/packs/types'

interface MerchantInfo {
  merchant: { id: string; name: string; member_number: string | null }
  outlet_label: string | null
  pernum: string
}

interface MerchantPayment {
  id: string
  reference: string
  status: string
  quantity: string
  merchant: { name: string; pernum: string | null }
  merchant_pernum: string
  outlet_label: string | null
  transfer_reference: string | null
  expires_at: string
  declared_at: string | null
  created_at: string
}

const PAYABLE_FAMILIES = ['CONSOMMATEUR', 'PERSONNEL']
const QUANTITY_PATTERN = /^\d{1,22}([.,]\d{1,6})?$/

function extractMerchantCode(input: string): string {
  const trimmed = input.trim()
  return (trimmed.split('/').filter(Boolean).pop() ?? '').slice(0, 64)
}

type DetectorConstructor = new (options: { formats: string[] }) => { detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]> }

function QrScanner({ onCode, onClose }: { onCode: (code: string) => void; onClose: () => void }) {
  const video = useRef<HTMLVideoElement>(null)
  const handler = useRef(onCode)
  handler.current = onCode
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let stream: MediaStream | null = null
    let frame = 0
    let stopped = false
    const Detector = (window as unknown as { BarcodeDetector?: DetectorConstructor }).BarcodeDetector

    async function start() {
      if (!Detector) {
        setError('Votre navigateur ne sait pas lire les QR codes : saisissez le code du marchand.')
        return
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (video.current) {
          video.current.srcObject = stream
          await video.current.play()
        }
        const detector = new Detector({ formats: ['qr_code'] })
        const scan = async () => {
          if (stopped || !video.current) return
          const [result] = await detector.detect(video.current).catch(() => [])
          if (result) {
            handler.current(extractMerchantCode(result.rawValue))
            return
          }
          frame = requestAnimationFrame(() => void scan())
        }
        void scan()
      } catch {
        setError("Impossible d'accéder à la caméra : saisissez le code du marchand.")
      }
    }
    void start()
    return () => {
      stopped = true
      cancelAnimationFrame(frame)
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  return (
    <FormDialog title="Scanner le QR du marchand" fields={[]} submitLabel="Fermer" onClose={onClose} onSubmit={async () => undefined}>
      {error ? <p role="alert" className="text-sm text-[var(--color-text-muted)]">{error}</p> : <video ref={video} muted playsInline className="aspect-square w-full rounded-2xl bg-black object-cover" />}
    </FormDialog>
  )
}

function TransferInstructions({ payment, onChanged }: { payment: MerchantPayment; onChanged: () => Promise<void> }) {
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

  const reserved = payment.status === 'reserved'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold text-[var(--color-text)]">
          {payment.reference} · {formatYem(payment.quantity)}
        </p>
        <StatusFrom statuses={MERCHANT_PAYMENT_STATUS} value={payment.status} />
      </div>
      {reserved ? (
        <>
          <p className="rounded-xl border border-[var(--color-border)] p-4 text-sm leading-relaxed text-[var(--color-text)]">
            Depuis votre portefeuille YEM, envoyez <strong>{formatYem(payment.quantity)}</strong> au Pernum <strong>{payment.merchant_pernum}</strong> ({payment.merchant.name}). Indiquez la référence <strong>{payment.reference}</strong>. Puis confirmez ci-dessous : le scan seul ne déplace aucun YEM.
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">La réservation expire le {formatDateMedium(payment.expires_at)} si vous ne déclarez pas l'envoi.</p>
          <form
            onSubmit={(event: FormEvent) => {
              event.preventDefault()
              void run(() => post(`/me/merchant-payments/${payment.id}/declare-sent`, { reference: reference.trim() || null }))
            }}
            className="space-y-3"
          >
            <div>
              <label htmlFor="transfer-ref" className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                Référence de votre transfert (facultatif)
              </label>
              <input id="transfer-ref" value={reference} onChange={(event) => setReference(event.target.value)} maxLength={120} className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={busy} className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60">
                J'ai envoyé les YEM
              </button>
              <button type="button" disabled={busy} onClick={() => void run(() => post(`/me/merchant-payments/${payment.id}/cancel`))} className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[var(--color-border)] px-5 text-sm font-semibold hover:bg-[var(--dash-bg)] disabled:opacity-60">
                Annuler
              </button>
            </div>
          </form>
        </>
      ) : (
        <p className="text-sm text-[var(--color-text-muted)]">
          {payment.status === 'declared_sent' ? 'Envoi déclaré. Le marchand (ou un validateur de la CECT) doit confirmer la réception ; vous recevrez un e-mail.' : 'Ce paiement est terminé.'}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}
    </div>
  )
}

export default function PayMerchantPage() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [code, setCode] = useState('')
  const [merchant, setMerchant] = useState<{ token: string; info: MerchantInfo } | null>(null)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [packId, setPackId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [focusId, setFocusId] = useState<string | null>(null)
  const intentKey = useRef(newIdempotencyKey())

  const packs = useQuery({ queryKey: ['my-packs'], queryFn: () => get<UserPack[]>('/me/packs'), staleTime: 0 })
  const payments = useQuery({ queryKey: ['merchant-payments'], queryFn: () => getRaw<{ data: MerchantPayment[] }>('/me/merchant-payments', { per_page: 20 }).then((body) => body.data), staleTime: 0 })

  const usable = (packs.data ?? []).filter((pack) => pack.status === 'active' && PAYABLE_FAMILIES.includes(pack.family))
  const selectedPackId = packId || usable[0]?.id || ''
  const selectedPack = usable.find((pack) => pack.id === selectedPackId)
  const open = (payments.data ?? []).filter((payment) => payment.status === 'reserved' || payment.status === 'declared_sent')
  const focused = payments.data?.find((payment) => payment.id === focusId) ?? open[0]

  async function lookup(raw: string) {
    const token = extractMerchantCode(raw)
    if (!token) return
    setLookupError(null)
    setMerchant(null)
    try {
      setMerchant({ token, info: await get<MerchantInfo>(`/merchant-payments/qr/${encodeURIComponent(token)}`) })
    } catch (caught) {
      setLookupError(authErrorMessage(caught))
    }
  }

  const scannedCode = searchParams.get('code')
  useEffect(() => {
    if (!scannedCode) return
    setSearchParams({}, { replace: true })
    setCode(scannedCode)
    void lookup(scannedCode)
  }, [scannedCode])

  async function refreshAll() {
    await queryClient.invalidateQueries({ queryKey: ['merchant-payments'] })
    await queryClient.invalidateQueries({ queryKey: ['my-packs'] })
    await queryClient.invalidateQueries({ queryKey: ['member-dashboard'] })
  }

  async function submitIntent(event: FormEvent) {
    event.preventDefault()
    if (!merchant || !selectedPackId) return
    if (!QUANTITY_PATTERN.test(quantity.trim())) {
      setFormError('Saisissez une quantité valide (6 décimales au plus).')
      return
    }
    setBusy(true)
    setFormError(null)
    try {
      const created = await post<MerchantPayment>('/merchant-payments/intents', { token: merchant.token, user_pack_id: selectedPackId, quantity: quantity.trim().replace(',', '.') }, intentKey.current)
      intentKey.current = newIdempotencyKey()
      setFocusId(created.id)
      setMerchant(null)
      setCode('')
      setQuantity('')
      await refreshAll()
    } catch (caught) {
      intentKey.current = newIdempotencyKey()
      setFormError(authErrorMessage(caught))
    } finally {
      setBusy(false)
    }
  }

  const inputClass = 'w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]'

  return (
    <>
      <Helmet>
        <title>Payer un marchand — CECT Togo</title>
      </Helmet>

      <div className="max-w-3xl space-y-6">
        <PageHeader title="Payer un marchand" description="Scannez le QR du marchand ou saisissez son code, puis réservez les YEM à envoyer." />

        <Steps steps={['Marchand', 'Montant', 'Envoi des YEM']} current={focused ? 2 : merchant ? 1 : 0} />

        {usable.length === 0 && packs.data && (
          <p className="rounded-2xl border border-[var(--color-border)] bg-[var(--dash-card)] p-5 text-sm">Il vous faut un pack Consommateur ou Personnel actif pour payer un marchand.</p>
        )}

        {focused && (
          <Panel title="Paiement en cours" subtitle="Suivez les étapes jusqu'à la confirmation">
            <TransferInstructions payment={focused} onChanged={refreshAll} />
          </Panel>
        )}

        {usable.length > 0 && (
          <Panel title="Nouveau paiement">
            <form
              onSubmit={(event) => {
                event.preventDefault()
                void lookup(code)
              }}
              className="flex flex-wrap gap-2"
            >
              <label htmlFor="merchant-code" className="sr-only">
                Code marchand
              </label>
              <input id="merchant-code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Code du marchand" className={`${inputClass} min-w-0 flex-1 basis-48`} />
              <button type="submit" className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]">
                <Search size={15} aria-hidden /> Rechercher
              </button>
              <button type="button" onClick={() => setScanning(true)} className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[var(--color-border)] px-5 text-sm font-semibold hover:bg-[var(--dash-bg)]">
                <Camera size={15} aria-hidden /> Scanner
              </button>
            </form>
            {lookupError && (
              <p role="alert" className="mt-3 text-sm text-[var(--color-danger)]">
                {lookupError}
              </p>
            )}

            {merchant && (
              <form onSubmit={(event) => void submitIntent(event)} className="mt-5 space-y-4 border-t border-[var(--color-border)] pt-5">
                <div className="flex items-center gap-3 rounded-2xl bg-[var(--dash-bg)] p-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    <Store size={20} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[var(--color-text)]">{merchant.info.merchant.name}</p>
                    <p className="truncate text-xs text-[var(--color-text-muted)]">{[merchant.info.outlet_label, `Pernum ${merchant.info.pernum}`].filter(Boolean).join(' · ')}</p>
                  </div>
                </div>
                <div>
                  <label htmlFor="pay-pack" className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                    Pack à débiter
                  </label>
                  <select id="pay-pack" value={selectedPackId} onChange={(event) => setPackId(event.target.value)} className={inputClass}>
                    {usable.map((pack) => (
                      <option key={pack.id} value={pack.id}>
                        {pack.plan.name} — {pack.balance ? formatYem(pack.balance.available) : '0 YEM'} disponibles
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="pay-quantity" className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                    Quantité de YEM
                  </label>
                  <input id="pay-quantity" value={quantity} onChange={(event) => setQuantity(event.target.value)} inputMode="decimal" placeholder="Ex. 12" required className={inputClass} />
                  {selectedPack?.balance && <p className="mt-1 text-xs text-[var(--color-text-muted)]">Disponible : {formatYem(selectedPack.balance.available)}</p>}
                </div>
                {formError && (
                  <p role="alert" className="text-sm text-[var(--color-danger)]">
                    {formError}
                  </p>
                )}
                <button type="submit" disabled={busy} className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60">
                  Réserver les YEM
                </button>
              </form>
            )}
          </Panel>
        )}

        <Panel title="Mes paiements marchands" flush>
          {payments.data && payments.data.length === 0 && <p className="px-6 pb-5 text-sm text-[var(--color-text-muted)]">Aucun paiement pour le moment.</p>}
          <ul className="divide-y divide-[var(--color-border)]">
            {payments.data?.map((payment) => (
              <li key={payment.id}>
                <button type="button" onClick={() => setFocusId(payment.id)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5 text-left hover:bg-[var(--dash-bg)] sm:px-6">
                  <span className="min-w-0 flex-1 basis-40">
                    <span className="block truncate text-sm font-bold text-[var(--color-text)]">{payment.merchant.name}</span>
                    <span className="block text-xs text-[var(--color-text-muted)]">
                      {payment.reference} · {formatDateMedium(payment.created_at)}
                    </span>
                  </span>
                  <span className="text-sm font-extrabold text-[var(--color-text)]">{formatYem(payment.quantity)}</span>
                  <StatusFrom statuses={MERCHANT_PAYMENT_STATUS} value={payment.status} />
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {scanning && (
        <QrScanner
          onCode={(scanned) => {
            setScanning(false)
            setCode(scanned)
            void lookup(scanned)
          }}
          onClose={() => setScanning(false)}
        />
      )}
    </>
  )
}
