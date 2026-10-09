import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { Search, Eye, User, Building2, CircleCheck, CircleX, Minus, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { getAdminMembers } from '@/services/memberService'
import type { UserResource } from '@/lib/apiTypes'

const PACK_COLORS: Record<string, { bg: string; color: string }> = {
  VENDEUR:      { bg: '#eaf0fe', color: '#2563eb' },
  CONSOMMATEUR: { bg: '#f2ecfe', color: '#7c3aed' },
  MARCHAND:     { bg: '#fce7f3', color: '#db2777' },
  PERSONNEL:    { bg: '#fdf1e1', color: '#d97706' },
}

function initials(m: UserResource) {
  return `${m.first_name?.[0] ?? ''}${m.last_name?.[0] ?? ''}`.toUpperCase()
}

function fullName(m: UserResource) {
  return `${m.first_name} ${m.last_name}`.trim()
}

export default function MembresPage() {
  const [search,     setSearch]     = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [page,       setPage]       = useState(1)

  // Simple debounce: commit search after user stops typing
  function handleSearchChange(val: string) {
    setSearch(val)
    clearTimeout((window as any).__cect_members_debounce)
    ;(window as any).__cect_members_debounce = setTimeout(() => {
      setDebouncedQ(val)
      setPage(1)
    }, 400)
  }

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'members', debouncedQ, page],
    queryFn: () => getAdminMembers({ search: debouncedQ || undefined, per_page: 20, page }),
    placeholderData: (prev) => prev,
  })

  const members  = data?.data  ?? []
  const meta     = data?.meta
  const lastPage = meta?.last_page ?? 1

  return (
    <>
      <Helmet><title>Membres — Admin CECT</title></Helmet>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--color-primary)' }}>Gestion des membres</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {meta ? `${meta.total} membre(s) au total` : 'Chargement…'}
          </p>
        </div>
        <button onClick={() => refetch()}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-colors hover:border-[var(--color-primary)]"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)', background: 'var(--color-surface)' }}>
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} aria-hidden /> Actualiser
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border mb-5"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <Search size={16} className="shrink-0" style={{ color: 'var(--color-text-muted)' }} aria-hidden />
        <input type="text" value={search} onChange={e => handleSearchChange(e.target.value)}
          placeholder="Rechercher par Pernum, nom, téléphone ou email…"
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: 'var(--color-text)' }} />
        {search && (
          <button onClick={() => { setSearch(''); setDebouncedQ(''); setPage(1) }}
            className="text-xs px-2 py-0.5 rounded-lg" style={{ color: 'var(--color-text-muted)' }}>
            ✕
          </button>
        )}
      </div>

      {/* Error */}
      {isError && (
        <div className="rounded-xl border p-4 mb-4 text-sm" style={{ borderColor: 'var(--color-danger)', background: 'var(--color-danger)0d', color: 'var(--color-danger)' }}>
          Impossible de charger les membres. Vérifiez la connexion au serveur.
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 640 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Membre', 'Type', 'Contact', 'Adhésion', 'Packs actifs', 'YEM', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide"
                    style={{ color: 'var(--color-text-muted)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    <RefreshCw size={20} className="animate-spin mx-auto mb-2" aria-hidden />
                    Chargement des membres…
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Aucun membre trouvé.
                  </td>
                </tr>
              ) : members.map((m, i) => (
                <motion.tr key={m.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b last:border-0"
                  style={{ borderColor: 'var(--color-border)' }}>

                  {/* Membre */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: 'var(--color-primary)' }}>
                        {initials(m)}
                      </div>
                      <div>
                        <p className="font-semibold leading-tight" style={{ color: 'var(--color-text)' }}>{fullName(m)}</p>
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{m.pernum ?? m.member_number}</p>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    {m.person_type === 'natural' ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: '#eaf0fe', color: '#2563eb' }}>
                        <User size={11} aria-hidden /> Physique
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: '#fdf1e1', color: '#d97706' }}>
                        <Building2 size={11} aria-hidden /> Morale
                      </span>
                    )}
                  </td>

                  {/* Contact */}
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    <p>{m.phone}</p>
                    <p className="truncate max-w-[160px]">{m.email}</p>
                  </td>

                  {/* Adhésion */}
                  <td className="px-4 py-3">
                    {m.membership_status === 'active' ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: 'var(--color-success)12', color: 'var(--color-success)', border: '1px solid var(--color-success)' }}>
                        <CircleCheck size={11} aria-hidden /> Payée
                      </span>
                    ) : m.membership_status ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: '#fceceb', color: '#c23b32' }}>
                        <CircleX size={11} aria-hidden /> Non payée
                      </span>
                    ) : (
                      <Minus size={14} style={{ color: 'var(--color-text-muted)' }} aria-hidden />
                    )}
                  </td>

                  {/* Packs */}
                  <td className="px-4 py-3">
                    {!m.active_families?.length ? (
                      <Minus size={14} style={{ color: 'var(--color-text-muted)' }} aria-hidden />
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {m.active_families.map((f: string) => (
                          <span key={f} className="text-xs font-bold px-2 py-0.5 rounded-full capitalize"
                            style={{ background: PACK_COLORS[f]?.bg ?? '#f1f3f5', color: PACK_COLORS[f]?.color ?? '#6b7688' }}>
                            {f.charAt(0) + f.slice(1).toLowerCase()}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* YEM */}
                  <td className="px-4 py-3 font-bold tabular-nums" style={{ color: '#7c3aed' }}>
                    {m.yem_balance != null ? Math.round(parseFloat(String(m.yem_balance))) : '—'}
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3 text-right">
                    <button className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-colors hover:brightness-110"
                      style={{ background: 'var(--color-primary)' }}
                      onClick={() => window.alert(`Fiche de ${fullName(m)} (pernum: ${m.pernum}) — page de détail à venir.`)}>
                      <Eye size={12} aria-hidden /> Voir la fiche
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm"
            style={{ borderColor: 'var(--color-border)' }}>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Page {meta.current_page} / {meta.last_page} · {meta.total} membres
            </p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="h-8 w-8 rounded-lg flex items-center justify-center border transition-colors disabled:opacity-40"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                <ChevronLeft size={15} aria-hidden />
              </button>
              <button disabled={page >= lastPage} onClick={() => setPage(p => p + 1)}
                className="h-8 w-8 rounded-lg flex items-center justify-center border transition-colors disabled:opacity-40"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                <ChevronRight size={15} aria-hidden />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
