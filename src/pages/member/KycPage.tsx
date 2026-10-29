import { useEffect, useState, type FormEvent } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FileCheck2, ShieldCheck, UploadCloud, ScanFace, Video, FileClock, Info, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/app/AuthContext'
import { ensureCsrfCookie, get, http, post, toApiError } from '@/lib/api'
import { Panel } from '@/components/dashboard/Panel'
import { PageHeader } from '@/components/ui/PageHeader'

interface CaseState {
  account_status: string
  provider: 'manual' | 'didit'
  provider_environment?: 'sandbox' | 'live' | null
  provider_document_only_test?: boolean
  sandbox_test_completed?: boolean
  kyc: {
    id: string
    status: 'provider_pending' | 'submitted' | 'approved' | 'rejected' | 'needs_information'
    submitted_at: string
    reviewed_at: string | null
    provider_status?: string | null
    can_resume?: boolean
    review_reason: string | null
  } | null
}

export default function KycPage() {
  const { user, refresh } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [type, setType] = useState('national_id')
  const [number, setNumber] = useState('')
  const [country, setCountry] = useState('TG')
  const [birthday, setBirthday] = useState('')
  const [address, setAddress] = useState('')
  const [front, setFront] = useState<File | null>(null)
  const [back, setBack] = useState<File | null>(null)
  const [company, setCompany] = useState<File | null>(null)
  const [accepted, setAccepted] = useState(false)
  const [diditAccepted, setDiditAccepted] = useState(false)
  const [diditBusy, setDiditBusy] = useState(false)
  const [embeddedSessionUrl, setEmbeddedSessionUrl] = useState<string | null>(null)
  const [verificationSent, setVerificationSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isCompany = user?.personType === 'legal'

  const query = useQuery({
    queryKey: ['member-kyc'],
    queryFn: () => get<CaseState>('/me/kyc'),
    refetchInterval: 12000,
  })
  const state = query.data
  const status = state?.kyc?.status
  const documentOnlyTest = state?.provider_document_only_test === true

  // The Sandbox document journey continues to the read-only membership
  // checkout preview, never to a real payment or activated YEM account.
  useEffect(() => {
    if (state?.provider_environment === 'sandbox' && state?.sandbox_test_completed) {
      navigate('/espace/adhesion', { replace: true })
    }
  }, [state?.provider_environment, state?.sandbox_test_completed, navigate])

  useEffect(() => {
    if (status !== 'approved') return
    void refresh().then((next) => {
      if (next?.status === 'pending_payment') navigate('/espace/adhesion', { replace: true })
    })
  }, [status, user?.status, refresh, navigate])

  const send = useMutation({
    mutationFn: async () => {
      if (!front || (type !== 'passport' && !back) || (isCompany && !company) || !accepted) {
        throw new Error('Veuillez compléter les pièces et accepter la notice.')
      }
      const form = new FormData()
      form.append('document_type', type)
      form.append('document_number', number)
      form.append('document_country', country.trim().toUpperCase())
      form.append('date_of_birth', birthday)
      form.append('address', address)
      form.append('privacy_notice_accepted', '1')
      form.append('document_front', front)
      if (back) form.append('document_back', back)
      if (company) form.append('company_document', company)
      await ensureCsrfCookie()
      await http.post('/me/kyc', form)
    },
    onSuccess: async () => {
      setError(null)
      await queryClient.invalidateQueries({ queryKey: ['member-kyc'] })
    },
    onError: (err: unknown) => setError(toApiError(err).message),
  })

  async function startDidit() {
    if (!diditAccepted) { setError('Acceptez la notice de confidentialité pour continuer.'); return }
    setError(null)
    setDiditBusy(true)
    try {
      const result = await post<{ url: string; status: string }>('/me/kyc/didit/start', {
        privacy_notice_accepted: true,
        restart_sandbox: state?.provider_environment === 'sandbox' && status === 'provider_pending',
      })
      setEmbeddedSessionUrl(result.url)
      setDiditBusy(false)
    } catch (err) {
      setError(toApiError(err).message)
      setDiditBusy(false)
    }
  }

  useEffect(() => {
    if (!embeddedSessionUrl) return
    let disposed = false
    let release: (() => void) | undefined
    async function mountVerification() {
      try {
        const { DiditSdk } = await import('@didit-protocol/sdk-web')
        if (disposed) return
        release = () => DiditSdk.shared.close()
        DiditSdk.shared.onComplete = (result) => {
          // Never trust the browser result: only Laravel's authenticated decision may update a dossier.
          if (result.type === 'completed') {
            setVerificationSent(true)
            setEmbeddedSessionUrl(null)
            void post('/me/kyc/didit/refresh', {})
              .then(() => queryClient.invalidateQueries({ queryKey: ['member-kyc'] }))
              .then(() => refresh())
              .catch((err: unknown) => setError(toApiError(err).message))
          }
        }
        DiditSdk.shared.onStateChange = (state) => {
          if (state === 'error') setError('Le module de vérification ne peut pas s’ouvrir. Réessayez.')
        }
        DiditSdk.shared.startVerification({
          url: embeddedSessionUrl!,
          configuration: {
            embedded: true,
            embeddedContainerId: 'cect-verification-documentaire',
            loggingEnabled: false,
            showCloseButton: false,
          },
        })
      } catch {
        if (!disposed) setError('Impossible de charger le module sécurisé de vérification.')
      }
    }
    void mountVerification()
    return () => { disposed = true; release?.() }
  }, [embeddedSessionUrl, queryClient, refresh])

  async function checkDidit() {
    setDiditBusy(true)
    setError(null)
    try {
      await post('/me/kyc/didit/refresh', {})
      await queryClient.invalidateQueries({ queryKey: ['member-kyc'] })
      await refresh()
    } catch (err) {
      setError(toApiError(err).message)
    } finally {
      setDiditBusy(false)
    }
  }

  // Reconcile pending Sandbox sessions even when a completion callback was
  // missed (page reload, closed SDK, delayed provider response or worker outage).
  // This is read-only at Didit; the Laravel server independently validates it.
  useEffect(() => {
    if (state?.provider !== 'didit' || state.provider_environment !== 'sandbox'
      || state.sandbox_test_completed || !['provider_pending', 'submitted'].includes(status ?? '')) return

    let disposed = false
    let inFlight = false
    async function reconcile() {
      if (disposed || inFlight || document.visibilityState !== 'visible') return
      inFlight = true
      try {
        await post('/me/kyc/didit/refresh', {})
        if (!disposed) await queryClient.invalidateQueries({ queryKey: ['member-kyc'] })
      } catch {
        // Keep the dossier visible; automatic retries should never claim approval.
      } finally {
        inFlight = false
      }
    }

    const interval = window.setInterval(() => { void reconcile() }, 60_000)
    const onFocus = () => { void reconcile() }
    window.addEventListener('focus', onFocus)
    const submittedAt = state.kyc?.submitted_at ? Date.parse(state.kyc.submitted_at) : NaN
    if (!embeddedSessionUrl && (status === 'submitted'
      || (Number.isFinite(submittedAt) && Date.now() - submittedAt > 60_000))) {
      void reconcile()
    }
    return () => {
      disposed = true
      window.clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [state?.provider, state?.provider_environment, state?.sandbox_test_completed,
    state?.kyc?.id, state?.kyc?.submitted_at, status, embeddedSessionUrl, queryClient])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    send.mutate()
  }

  // After a document has been submitted, show ONLY the status card.
  // Never re-display the upload form, scenario controls or embedded verification.
  if (state?.provider === 'didit' && (status === 'submitted' || verificationSent)) {
    const sandboxComplete = state.sandbox_test_completed === true
    return (
      <>
        <Helmet><title>Suivi de votre dossier d&apos;identité — CECT</title></Helmet>
        <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-[var(--color-border)] bg-[var(--dash-card)] p-6 shadow-[var(--shadow-card)] sm:p-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
              {sandboxComplete
                ? <CheckCircle2 size={40} className="text-emerald-400" aria-hidden />
                : <FileClock size={40} className="text-emerald-400" aria-hidden />}
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-text)]">
              {sandboxComplete ? 'Contrôle documentaire terminé (test)' : 'Dossier en vérification'}
            </h1>
            <p className="max-w-lg text-[var(--color-text-muted)]">
              {sandboxComplete
                ? "Le scénario documentaire de test est terminé. Il ne constitue pas une validation d'identité réelle."
                : "Votre dossier a été reçu et est en cours de vérification. Vous serez informé après examen."}
            </p>
          </div>
          <div className="mt-8 border-t border-[var(--color-border)] pt-6">
            <div className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
              <Info size={20} className="mt-0.5 shrink-0 text-[var(--color-text-muted)]" aria-hidden />
              <div className="text-sm">
                <p className="font-bold">Vous ne pouvez pas payer pour le moment.</p>
                <p className="mt-1 text-[var(--color-text-muted)]">
                  Le paiement sera disponible uniquement après une véritable validation de votre identité.
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  const field = 'min-h-[44px] w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-sm'
  const label = 'block mb-1.5 text-sm font-semibold text-[var(--color-text)]'
  const fileField = (id: string, title: string, setter: (file: File | null) => void) => (
    <div>
      <label className={label} htmlFor={id}>{title}</label>
      <input id={id} required={id === 'front' || (id === 'back' && type !== 'passport') || (id === 'company' && isCompany)}
        className={field} type="file" accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
        onChange={(e) => setter(e.target.files?.[0] ?? null)} />
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">JPG, PNG ou PDF — 2 Mo maximum par fichier.</p>
    </div>
  )

  return (
    <>
      <Helmet><title>Vérification d&apos;identité — CECT</title></Helmet>
      <div className="max-w-2xl space-y-5">
        <PageHeader title="Vérification d'identité (KYC)"
          description="Après la confirmation de votre e-mail, contrôlez votre pièce d'identité dans votre espace CECT avant l'adhésion." />
        <Panel title="Étape obligatoire avant l'adhésion">
          <div className="flex items-start gap-3 text-sm text-[var(--color-text-muted)]">
            <ShieldCheck className="shrink-0 text-[var(--color-primary)]" size={24} />
            <p>Vos justificatifs sont conservés en espace privé et accessibles uniquement aux agents habilités.
              Aucun paiement n&apos;est autorisé avant approbation de votre identité.</p>
          </div>
        </Panel>

        {state?.provider === 'didit' && (user?.status === 'pending_kyc' || user?.status === 'pending_payment') && status !== 'approved' && (
          <Panel title={documentOnlyTest ? "Carte d'identité — test CECT" : isCompany ? "Vérification d'entreprise CECT (KYB)" : "Contrôle d'identité CECT"}>
            <div className="space-y-4 text-sm">
              {state?.provider_environment === 'sandbox' && (
                <div role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
                  <strong className="block mb-1">Mode test — vérification non officielle</strong>
                  Ce contrôle utilise un environnement de test. Utilisez exclusivement une
                  pièce d&apos;identité de démonstration, jamais une véritable carte personnelle.
                  Le résultat reste simulé et ne permet ni de payer
                  l&apos;adhésion ni d&apos;accéder aux opérations YEM.
                </div>
              )}
              <div className="flex gap-3 items-start">
                <ScanFace className="shrink-0 text-[var(--color-primary)]" size={24} />
                <p>{isCompany && !documentOnlyTest
                  ? "Didit vous guidera dans la vérification du registre de votre société, de ses documents officiels et de ses bénéficiaires effectifs. Les dirigeants concernés effectueront leur propre contrôle d'identité."
                  : "Pour ce test, seule la carte d'identité est demandée (recto et verso si nécessaire). Prenez des photos nettes ou importez des images de démonstration. Aucun selfie ou contrôle vidéo n'est demandé."}</p>
              </div>
              <div className="flex gap-3 items-start">
                <Video className="shrink-0 text-[var(--color-primary)]" size={24} />
                <p>{isCompany && !documentOnlyTest
                  ? "Préparez les informations de votre entreprise. Les décisions restent désactivées en mode test."
                  : "La capture s'effectue ici, dans l'espace CECT. Elle n'accorde aucun droit d'adhésion : le dossier restera en attente jusqu'à une véritable vérification."}</p>
              </div>
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1" checked={diditAccepted}
                  onChange={e => setDiditAccepted(e.target.checked)} />
                <span>J&apos;accepte de commencer ce contrôle documentaire de test. CECT fait appel à Didit
                  comme prestataire technique pour le traitement sécurisé des pièces. Je comprends que
                  les données utilisées à cette étape lui seront transmises et qu&apos;aucune identité
                  n&apos;est officiellement validée en Sandbox.</span>
              </label>
              <button type="button" onClick={() => void startDidit()}
                disabled={!diditAccepted || diditBusy}
                className="min-h-11 w-full rounded-xl bg-[var(--color-primary)] px-4 py-3 font-bold text-white disabled:opacity-50">
                {diditBusy ? 'Ouverture du contrôle…' : status === 'provider_pending' ? 'Reprendre mon contrôle' : documentOnlyTest ? "Photographier ma carte d'identité" : isCompany ? 'Démarrer le contrôle entreprise' : 'Contrôler mon identité'}
              </button>
              {embeddedSessionUrl && (
                <section aria-label="Module intégré de vérification" className="rounded-xl border border-[var(--color-border)] overflow-hidden">
                  <div className="flex items-center justify-between gap-3 px-4 py-3 bg-[var(--color-bg)]">
                    <strong>Vérification documentaire CECT</strong>
                    <button type="button" className="underline text-sm" onClick={() => setEmbeddedSessionUrl(null)}>Fermer</button>
                  </div>
                  <div id="cect-verification-documentaire" className="w-full bg-white" style={{ height: 'min(780px, 78vh)', minHeight: 510 }} />
                </section>
              )}
              {!!state.kyc && <button type="button" onClick={() => void checkDidit()} disabled={diditBusy}
                className="min-h-11 w-full rounded-xl border border-[var(--color-border)] px-4 py-3 font-semibold disabled:opacity-50">
                Vérifier le résultat de mon contrôle
              </button>}
              {error && <p role="alert" className="text-[var(--color-danger)]">{error}</p>}
              {status === 'provider_pending' && <p>Vérification en cours ou non terminée. Vous ne pouvez pas payer pour le moment.</p>}
            </div>
          </Panel>
        )}

        {query.isPending && <p role="status">Chargement de votre dossier…</p>}
        {query.isError && <p role="alert">Impossible de consulter le dossier KYC. Actualisez la page.</p>}

        {status === 'submitted' && <Panel title="Dossier en vérification">
          <p className="flex items-center gap-2 text-sm"><FileCheck2 size={20} /> Votre dossier de test a été reçu. La validation réelle reste désactivée tant que le contrôle d&apos;identité complet n&apos;est pas activé.</p>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">Vous ne pouvez pas payer après un contrôle Sandbox. Cette page se met à jour automatiquement.</p>
        </Panel>}

        {status === 'approved' && <Panel title="Identité validée">
          <p className="text-sm">Votre dossier a été approuvé. Ouverture de la page de paiement…</p>
        </Panel>}

        {(status === 'rejected' || status === 'needs_information') && (
          <p className="rounded-xl border border-[var(--color-border)] p-4 text-sm" role="alert">
            {status === 'rejected' ? "Votre dossier n'a pas été approuvé." : 'Des pièces complémentaires ou corrigées sont nécessaires.'}
            {state?.kyc?.review_reason && <strong className="block mt-2">Motif : {state.kyc.review_reason}</strong>}
            Vous pouvez transmettre un dossier corrigé.
          </p>
        )}

        {state?.provider !== 'didit' && !query.isPending && (!status || status === 'rejected' || status === 'needs_information') && (
          <Panel title={status ? 'Corriger le dossier KYC' : 'Soumettre vos justificatifs'}>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label htmlFor="id-type" className={label}>Pièce d&apos;identité</label>
                <select id="id-type" value={type} onChange={e => setType(e.target.value)} className={field}>
                  <option value="national_id">Carte nationale d&apos;identité</option>
                  <option value="passport">Passeport</option>
                  <option value="residence_permit">Carte de séjour</option>
                </select>
              </div>
              <div>
                <label htmlFor="id-number" className={label}>Numéro de la pièce</label>
                <input id="id-number" className={field} required minLength={4} maxLength={60}
                  autoComplete="off" value={number} onChange={e => setNumber(e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="id-country" className={label}>Pays émetteur (code ISO à 2 lettres)</label>
                  <input id="id-country" className={field} required maxLength={2} minLength={2} value={country}
                    onChange={e => setCountry(e.target.value.toUpperCase())} placeholder="TG" />
                </div>
                <div>
                  <label htmlFor="birthdate" className={label}>Date de naissance du titulaire</label>
                  <input id="birthdate" className={field} required type="date" max={new Date().toISOString().slice(0, 10)}
                    value={birthday} onChange={e => setBirthday(e.target.value)} />
                </div>
              </div>
              <div>
                <label htmlFor="address" className={label}>Adresse de résidence</label>
                <textarea id="address" className={field} required minLength={8} maxLength={300} rows={3}
                  value={address} onChange={e => setAddress(e.target.value)} />
              </div>
              {fileField('front', type === 'passport' ? "Page d'identité du passeport" : 'Recto de la pièce', setFront)}
              {type !== 'passport' && fileField('back', 'Verso de la pièce', setBack)}
              {isCompany && fileField('company', 'Pièce juridique de la société (RCCM ou document officiel)', setCompany)}
              <label className="flex gap-3 items-start text-sm text-[var(--color-text)]">
                <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} required className="mt-1" />
                <span>J&apos;ai pris connaissance de l&apos;usage de mes données pour vérifier mon identité et instruire mon adhésion. Les pièces seront consultées uniquement par des agents habilités.</span>
              </label>
              {error && <p role="alert" className="text-sm text-[var(--color-danger)]">{error}</p>}
              <button type="submit" disabled={send.isPending || !accepted} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 text-sm font-bold text-white disabled:opacity-50">
                <UploadCloud size={18} /> {send.isPending ? 'Envoi en cours…' : 'Soumettre le dossier KYC'}
              </button>
            </form>
          </Panel>
        )}
      </div>
    </>
  )
}
