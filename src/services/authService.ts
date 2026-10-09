import { api, ensureCsrf } from '@/lib/api'
import type { LoginResponse, RegisterResponse, AccessTokenResource, OtpChallengeResource } from '@/lib/apiTypes'

export interface LoginPayload {
  identifier: string
  password: string
  device_name?: string
}

export interface RegisterPayload {
  person_type: 'natural' | 'legal'
  first_name: string
  last_name: string
  email: string
  phone: string           // E.164 format e.g. +22890123456
  pernum: string
  password: string
  password_confirmation: string
  city?: string | null
  preferred_payment_method?: 'TMONEY' | 'FLOOZ' | 'BANK_TRANSFER' | 'CASH' | null
  commitment_accepted: 'yes'
  signed_place: string
  signed_on: string       // ISO 8601 datetime
  // Legal only
  legal_name?: string
  legal_form?: string
  rccm?: string | null
  nif?: string | null
}

export type LoginResult =
  | { type: 'authenticated'; token: AccessTokenResource }
  | { type: 'otp_required'; challenge_id: string; sent_to?: string }

export async function login(payload: LoginPayload): Promise<LoginResult> {
  await ensureCsrf()
  const res = await api.post<LoginResponse>('/auth/login', payload, {
    validateStatus: (s) => s === 200 || s === 202,
  })
  const data = res.data.data as any
  if (data.status === 'otp_required') {
    return { type: 'otp_required', challenge_id: data.challenge_id, sent_to: data.sent_to }
  }
  return { type: 'authenticated', token: data as AccessTokenResource }
}

export async function loginVerifyOtp(challenge_id: string, code: string): Promise<AccessTokenResource> {
  const res = await api.post<{ data: AccessTokenResource }>('/auth/login/verify', { challenge_id, code })
  return res.data.data
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse['data']> {
  await ensureCsrf()
  const key = `reg-${payload.pernum}-${Date.now()}`
  const res = await api.post<RegisterResponse>('/auth/register', payload, {
    headers: { 'Idempotency-Key': key },
  })
  return res.data.data
}

export async function verifyEmail(challenge_id: string, code: string): Promise<AccessTokenResource> {
  const res = await api.post<{ data: AccessTokenResource }>('/auth/email/verify', { challenge_id, code })
  return res.data.data
}

export async function resendOtp(challenge_id: string): Promise<OtpChallengeResource> {
  const res = await api.post<{ data: OtpChallengeResource }>('/auth/otp/resend', { challenge_id })
  return res.data.data
}

export async function logout(): Promise<void> {
  try { await api.post('/auth/logout') } catch {}
}

export async function getMe() {
  const res = await api.get<{ data: import('@/lib/apiTypes').UserResource }>('/me')
  return res.data.data
}
