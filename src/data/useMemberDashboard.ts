import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/app/AuthContext'
import { fetchMemberDashboard } from './memberDashboard'

export function useMemberDashboard() {
  const { user } = useAuth()
  return useQuery({ queryKey: ['member-dashboard', user?.id], queryFn: fetchMemberDashboard, enabled: Boolean(user), staleTime: 30_000 })
}
