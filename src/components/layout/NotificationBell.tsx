import { useEffect, useRef, useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { get, patch } from '@/lib/api'
import { formatDateMedium } from '@/lib/format'
import { TONES } from '@/components/dashboard/tones'

interface Notif {
  id: string
  type: string
  title: string
  body: string
  read_at: string | null
  created_at: string
}

function toneFor(type: string) {
  if (type.includes('success') || type.includes('confirm') || type.includes('activ')) return TONES.success
  if (type.includes('warn') || type.includes('pending') || type.includes('await')) return TONES.warning
  if (type.includes('err') || type.includes('fail') || type.includes('reject')) return TONES.danger
  return TONES.info
}

export function NotificationBell() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => get<Notif[]>('/me/notifications'),
    refetchInterval: 30_000,
    staleTime: 15_000,
  })

  const unread = notifications.filter((n) => !n.read_at).length

  useEffect(() => {
    if (!open) return
    function handleClick(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  async function markAll() {
    await patch('/me/notifications/read-all')
    await queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }

  async function markOne(id: string) {
    await patch(`/me/notifications/${id}/read`)
    await queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--dash-card)] text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
        aria-label={`Notifications${unread > 0 ? ` (${unread} non lues)` : ''}`}
      >
        <Bell size={17} aria-hidden />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--tone-danger-fg)] text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl border border-[var(--color-border)] bg-[var(--dash-card)] shadow-[var(--shadow-pop)]">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
            <p className="text-sm font-bold text-[var(--color-text)]">Notifications</p>
            {unread > 0 && (
              <button type="button" onClick={() => void markAll()} className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] hover:underline">
                <CheckCheck size={13} aria-hidden /> Tout marquer lu
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">Aucune notification.</p>
          ) : (
            <ul className="max-h-[380px] overflow-y-auto">
              {notifications.map((n) => {
                const tone = toneFor(n.type)
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => { if (!n.read_at) void markOne(n.id) }}
                      className={`flex w-full gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[var(--chart-track)] ${n.read_at ? 'opacity-60' : ''}`}
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold" style={{ background: tone.bg, color: tone.fg }}>
                        {!n.read_at && <span className="h-2 w-2 rounded-full" style={{ background: tone.fg }} />}
                        {n.read_at && <span className="h-2 w-2 rounded-full bg-[var(--color-border)]" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[var(--color-text)]">{n.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-[var(--color-text-muted)]">{n.body}</p>
                        <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">{formatDateMedium(n.created_at)}</p>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
