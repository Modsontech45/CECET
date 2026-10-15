import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, FileText, Monitor, Smartphone, Trash2 } from 'lucide-react'
import { Panel } from '@/components/dashboard/Panel'
import { PageHeader } from '@/components/ui/PageHeader'
import { btnOutline } from '@/components/ui/buttons'
import { ApiError, del, downloadFile, get, post } from '@/lib/api'
import { formatDateMedium } from '@/lib/format'
import { authErrorMessage } from '@/features/auth/errors'
import { methodName } from '@/features/payments/types'
import { useMemberDashboard } from '@/data/useMemberDashboard'

interface PayoutDestination {
  method: string
  phone: string | null
  bank_name: string | null
  account_number: string | null
}

interface Session {
  id: number
  device_name: string
  ip_address: string | null
  user_agent: string | null
  created_at: string | null
  last_used_at: string | null
  current: boolean
}

interface MemberDoc {
  type: string
  label: string
  available: boolean
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-[var(--color-text-muted)]">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-[var(--color-text)]">{value || '—'}</dd>
    </div>
  )
}

function deviceIcon(userAgent: string | null) {
  if (!userAgent) return <Monitor size={15} aria-hidden />
  const ua = userAgent.toLowerCase()
  return ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')
    ? <Smartphone size={15} aria-hidden />
    : <Monitor size={15} aria-hidden />
}

export default function ProfilePage() {
  const queryClient = useQueryClient()
  const dashboard = useMemberDashboard()
  const profile = dashboard.data?.profile
  const [feedback, setFeedback] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [revokingId, setRevokingId] = useState<number | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)

  const destination = useQuery({
    queryKey: ['payout-destination'],
    queryFn: async () => {
      try { return await get<PayoutDestination>('/me/payout-destination') }
      catch (caught) {
        if (caught instanceof ApiError && caught.status === 404) return null
        throw caught
      }
    },
    staleTime: 0,
  })

  const sessions = useQuery({
    queryKey: ['my-sessions'],
    queryFn: () => get<Session[]>('/me/sessions'),
    staleTime: 0,
  })

  const documents = useQuery({
    queryKey: ['my-documents'],
    queryFn: async () => {
      try { return await get<MemberDoc[]>('/me/documents') }
      catch (caught) {
        if (caught instanceof ApiError && caught.status === 404) return []
        throw caught
      }
    },
    staleTime: 0,
  })

  async function revokeOthers() {
    setBusy(true)
    setFeedback(null)
    try {
      const result = await post<{ revoked: number }>('/me/sessions/revoke-others')
      setFeedback(result.revoked > 0 ? `${result.revoked} appareil(s) déconnecté(s).` : "Aucun autre appareil n'était connecté.")
      await queryClient.invalidateQueries({ queryKey: ['my-sessions'] })
    } catch (caught) {
      setFeedback(authErrorMessage(caught))
    } finally {
      setBusy(false)
    }
  }

  async function revokeOne(id: number) {
    setRevokingId(id)
    try {
      await del(`/me/sessions/${id}`)
      await queryClient.invalidateQueries({ queryKey: ['my-sessions'] })
    } catch (caught) {
      setFeedback(authErrorMessage(caught))
    } finally {
      setRevokingId(null)
    }
  }

  async function download(type: string, label: string) {
    setDownloading(type)
    try {
      await downloadFile(`/me/documents/${type}.pdf`, `${label}.pdf`)
    } catch (caught) {
      setFeedback(authErrorMessage(caught))
    } finally {
      setDownloading(null)
    }
  }

  return (
    <>
      <Helmet>
        <title>Profil et sécurité — CECT Togo</title>
      </Helmet>

      <PageHeader title="Profil et sécurité" description="Vos informations, votre moyen de réception et vos connexions." />

      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Identité">
            {profile ? (
              <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Nom" value={profile.name} />
                <Field label="Type de compte" value={profile.kind === 'legal' ? 'Personne morale' : 'Personne physique'} />
                <Field label="Pernum" value={profile.pernum} />
                <Field label="Numéro de membre" value={profile.member_number ?? ''} />
                <Field label="E-mail" value={profile.email} />
                <Field label="Téléphone" value={profile.phone} />
                <Field label="Ville" value={profile.city} />
                <Field label="Membre depuis" value={profile.member_since ? formatDateMedium(profile.member_since) : ''} />
              </dl>
            ) : (
              <div className="h-40 animate-pulse rounded-xl bg-[var(--chart-track)]" />
            )}
          </Panel>

          <div className="space-y-6">
            <Panel title="Moyen de réception" subtitle="Où la CECT vous verse le produit de vos ventes de YEM">
              <p className="text-sm font-semibold text-[var(--color-text)]">
                {destination.data
                  ? [methodName(destination.data.method), destination.data.method === 'BANK_TRANSFER' ? destination.data.bank_name : destination.data.phone].filter(Boolean).join(' · ')
                  : 'Aucun moyen enregistré'}
              </p>
              <Link to="/espace/vendre" className={`${btnOutline} mt-4`}>
                {destination.data ? 'Modifier' : 'Renseigner'}
              </Link>
            </Panel>

            {/* Documents */}
            {documents.data && documents.data.length > 0 && (
              <Panel title="Mes documents">
                <ul className="space-y-2">
                  {documents.data.map((doc) => (
                    <li key={doc.type} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText size={16} className="shrink-0 text-[var(--color-text-muted)]" aria-hidden />
                        <span className="truncate text-sm font-semibold text-[var(--color-text)]">{doc.label}</span>
                      </div>
                      {doc.available && (
                        <button
                          type="button"
                          disabled={downloading === doc.type}
                          onClick={() => void download(doc.type, doc.label)}
                          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-[var(--dash-bg)] disabled:opacity-60"
                        >
                          <Download size={13} aria-hidden />
                          {downloading === doc.type ? 'Téléchargement…' : 'PDF'}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </Panel>
            )}
          </div>
        </div>

        {/* Sessions */}
        <Panel title="Appareils connectés" subtitle="Toutes vos sessions actives. Révoquez celles que vous ne reconnaissez pas.">
          {sessions.data && sessions.data.length > 0 ? (
            <ul className="divide-y divide-[var(--color-border)]">
              {sessions.data.map((session) => (
                <li key={session.id} className="flex flex-wrap items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--chart-track)] text-[var(--color-text-muted)]">
                    {deviceIcon(session.user_agent)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      {session.device_name}
                      {session.current && <span className="ml-2 rounded-full bg-[var(--tone-success-bg)] px-2 py-0.5 text-[11px] font-bold text-[var(--tone-success-fg)]">Cet appareil</span>}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {[session.ip_address, session.last_used_at ? `Dernière activité ${formatDateMedium(session.last_used_at)}` : null].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  {!session.current && (
                    <button
                      type="button"
                      disabled={revokingId === session.id}
                      onClick={() => void revokeOne(session.id)}
                      className="flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--tone-danger-fg)] transition-colors hover:bg-[var(--tone-danger-bg)] disabled:opacity-60"
                      aria-label={`Déconnecter ${session.device_name}`}
                    >
                      <Trash2 size={13} aria-hidden />
                      Révoquer
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="h-16 animate-pulse rounded-xl bg-[var(--chart-track)]" />
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[var(--color-border)] pt-4">
            <button type="button" onClick={() => void revokeOthers()} disabled={busy} className={btnOutline}>
              Déconnecter tous les autres appareils
            </button>
            {feedback && (
              <p role="status" className="text-sm text-[var(--color-text-muted)]">
                {feedback}
              </p>
            )}
          </div>
        </Panel>
      </div>
    </>
  )
}
