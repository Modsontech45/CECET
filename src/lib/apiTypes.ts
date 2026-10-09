// ── Shared ──────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  links: { first: string | null; last: string | null; prev: string | null; next: string | null }
  meta: { current_page: number; last_page: number; per_page: number; total: number; from: number | null; to: number | null }
}

// ── Users / Auth ─────────────────────────────────────────────────────────────

export interface UserResource {
  id: string
  kind: string          // 'member' | 'staff'
  person_type: string | null
  member_number: string | null
  first_name: string
  last_name: string
  email: string
  phone: string | null
  status: string
  email_verified_at: string | null
  last_login_at: string | null
  created_at: string | null
  pernum?: string | null
  roles?: string[]
  permissions?: string[]
  yem_balance?: string
  membership_status?: string | null
  active_families?: string[]
  organization?: {
    id: string
    legal_name: string
    legal_form: string
    rccm: string | null
    nif: string | null
  } | null
  pernums?: { id: string; pernum: string; kind: string; status: string }[]
}

export interface AccessTokenResource {
  status: 'authenticated'
  mode: 'token'
  access_token: string
  token_type: 'Bearer'
  expires_at: string | null
  user: UserResource | null
}

export interface OtpChallengeResource {
  challenge_id: string
  purpose: string
  sent_to: string
  expires_at: string
}

// ── Auth responses ────────────────────────────────────────────────────────────

export type LoginResponse =
  | { data: AccessTokenResource }
  | { data: { status: 'otp_required'; challenge_id: string; sent_to?: string; expires_at?: string } }

export interface RegisterResponse {
  data: {
    user: UserResource
    verification: OtpChallengeResource
    membership_fee: { amount: number; currency: 'XOF'; payment_quote: null }
  }
}

// ── Member dashboard ──────────────────────────────────────────────────────────

export interface DashboardResponse {
  data: {
    profile: {
      name: string
      member_number: string | null
      pernum: string | null
      email: string
      phone: string | null
      city: string | null
      person_type: string | null
      status: string
    }
    membership: {
      status: string
      paid: string
      member_since: string | null
    } | null
    yem: {
      balance: string
      reserved: string
      total_credited: string
      total_spent: string
    }
    active_packs: {
      id: string
      family: string
      code: string
      name: string
      price_xof: number
      quota_per_period: number | null
      discount_bps: number | null
      available: number | null
      activated_at: string | null
      expires_at: string | null
    }[]
    recent_movements: {
      id: string
      date: string
      label: string
      type: string
      direction: 'credit' | 'debit'
      quantity: string
      user_pack_id: string
    }[]
    payments_awaiting_action: unknown[]
  }
}

// ── Admin overview ────────────────────────────────────────────────────────────

export interface AdminOverviewResponse {
  data: {
    members: number
    active_members: number
    total_collected_xof: number
    pending_validations: number
    yem_in_circulation: string
  }
}
