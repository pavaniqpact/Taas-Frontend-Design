import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { AuthUser, Role } from '@/types';
import { useAuth } from '@/store/auth';

/**
 * Reads the effective user from context first, then falls back to sessionStorage.
 * This prevents a white-screen during the React state propagation window that
 * occurs between the navigate() call and the first re-render with the new user.
 */
function getEffectiveUser(contextUser: AuthUser | null): AuthUser | null {
  if (contextUser) return contextUser;
  try {
    const raw = sessionStorage.getItem('qpact.session');
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function ProtectedRoute({ role, children }: { role: Role; children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const effective = getEffectiveUser(user);

  if (!effective) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (effective.role !== role) {
    const dest =
      effective.role === 'client'    ? '/client'            :
      effective.role === 'recruiter' ? '/recruiter'         : '/admin/recruiters';
    return <Navigate to={dest} replace />;
  }
  return <>{children}</>;
}
