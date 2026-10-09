import { api } from '@/lib/api'
import type { DashboardResponse, AdminOverviewResponse, UserResource } from '@/lib/apiTypes'

export async function getDashboard(): Promise<DashboardResponse['data']> {
  const res = await api.get<DashboardResponse>('/me/dashboard')
  return res.data.data
}

export async function getAdminOverview(): Promise<AdminOverviewResponse['data']> {
  const res = await api.get<AdminOverviewResponse>('/admin/overview')
  return res.data.data
}

export interface AdminMembersParams {
  search?: string
  status?: string
  person_type?: string
  family?: string
  per_page?: number
  page?: number
}

export interface PaginatedMembers {
  data: UserResource[]
  meta: { current_page: number; last_page: number; per_page: number; total: number }
}

export async function getAdminMembers(params: AdminMembersParams = {}): Promise<PaginatedMembers> {
  const res = await api.get<{ data: UserResource[]; meta: PaginatedMembers['meta'] }>('/admin/members', { params })
  return { data: res.data.data, meta: res.data.meta }
}

export interface ReportSummary {
  period:       { from: string; to: string }
  kpis: {
    total_collected_xof:  number
    confirmed_payments:   number
    average_payment_xof:  number
    new_members:          number
    registrations:        number
    manual_validations:   number
    manual_rejections:    number
    rejection_rate_bps:   number
    pending_payments:     number
    pending_amount_xof:   number
    yem_in_circulation:   string
  }
  by_source:   any[]
  by_method:   any[]
  top_members: any[]
}

export async function getReportSummary(params: { from?: string; to?: string } = {}): Promise<ReportSummary> {
  const res = await api.get<{ data: ReportSummary }>('/admin/reports/summary', { params })
  return res.data.data
}
