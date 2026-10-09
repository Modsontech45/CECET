import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { login as apiLogin, logout as apiLogout, getMe, loginVerifyOtp, verifyEmail } from '@/services/authService'
import type { UserResource } from '@/lib/apiTypes'

export type { UserResource }

export type MockUser = {
  id:     string
  pernum: string | null
  email:  string
  name:   string
  role:   string
  kind:   string
  raw:    UserResource
}

function toMockUser(u: UserResource): MockUser {
  return {
    id:     u.id,
    pernum: u.pernum ?? null,
    email:  u.email,
    name:   `${u.first_name} ${u.last_name}`.trim(),
    role:   u.roles?.[0] ?? (u.kind === 'staff' ? 'administrateur' : 'utilisateur'),
    kind:   u.kind,
    raw:    u,
  }
}

export function isAdminRole(user: MockUser): boolean {
  return user.kind === 'staff'
}

interface OtpChallenge {
  challenge_id: string
  sent_to?:     string
  type:         'login' | 'register'
}

interface AuthContextValue {
  user:      MockUser | null
  loading:   boolean
  login:     (identifier: string, password: string) => Promise<{ ok: boolean; redirectTo: string; otpRequired?: boolean; challenge?: OtpChallenge }>
  submitOtp: (challenge_id: string, code: string, type: 'login' | 'register') => Promise<{ ok: boolean; redirectTo: string }>
  logout:    () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getRedirect(_user: MockUser): string {
  return '/espace'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<MockUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore session from cookie on every page load
  useEffect(() => {
    getMe()
      .then((u)  => setUser(toMockUser(u)))
      .catch(()  => { /* no session — stay logged out */ })
      .finally(() => setLoading(false))
  }, [])

  async function login(identifier: string, password: string) {
    const result = await apiLogin({ identifier, password, device_name: 'Web CECT' })
    if (result.type === 'otp_required') {
      return { ok: true, redirectTo: '', otpRequired: true, challenge: { challenge_id: result.challenge_id, sent_to: result.sent_to, type: 'login' as const } }
    }
    // Session cookie set server-side — just fetch the current user
    const u = result.token.user ? toMockUser(result.token.user) : await getMe().then(toMockUser)
    setUser(u)
    return { ok: true, redirectTo: getRedirect(u) }
  }

  async function submitOtp(challenge_id: string, code: string, type: 'login' | 'register') {
    const token = type === 'login'
      ? await loginVerifyOtp(challenge_id, code)
      : await verifyEmail(challenge_id, code)
    const u = token.user ? toMockUser(token.user) : await getMe().then(toMockUser)
    setUser(u)
    return { ok: true, redirectTo: getRedirect(u) }
  }

  async function logout() {
    try { await apiLogout() } catch {}
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, submitOtp, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
