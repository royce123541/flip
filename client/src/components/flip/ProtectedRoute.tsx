import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/useAuth'

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Skeleton className="m-8 h-40" />
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return <Outlet />
}
