import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import type { StaffRole } from '../../types/tour'
import { hasStaffSession } from '../../lib/supabaseStaff'

interface Props {
  children: ReactNode
  allow?: StaffRole[]
}

/**
 * UI-layer guard for /app/* pages — the real enforcement is the JWT + RLS
 * (see supabase/2026-07-rls-lockdown.sql); this just stops direct URL
 * navigation from rendering a protected page before that request fails.
 */
export default function RequireStaffRole({ children, allow }: Props) {
  const role = sessionStorage.getItem('staff_role') as StaffRole | null

  if (!hasStaffSession() || !role) return <Navigate to="/app" replace />
  if (allow && !allow.includes(role)) return <Navigate to="/app" replace />

  return <>{children}</>
}
