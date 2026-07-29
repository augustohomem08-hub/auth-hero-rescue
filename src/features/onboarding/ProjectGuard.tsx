import type { ReactNode } from 'react';
import { Navigate } from '@tanstack/react-router';
import { FullPageLoading } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { useActiveProject } from '@/features/onboarding/useProjectMembership';

/**
 * Guard for the authenticated app area.
 *
 * - While auth/session or membership is loading → full-page spinner.
 * - If unauthenticated → redirect to the sign-in screen.
 * - If authenticated but belongs to NO project → redirect to onboarding.
 * - Otherwise render the app shell content.
 */
export function ProjectGuard({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const { data: activeProject, isLoading: projectLoading } = useActiveProject();

  if (status === 'loading' || (status === 'authenticated' && projectLoading)) {
    return <FullPageLoading label="Carregando seu espaço…" />;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/entrar" replace />;
  }

  if (status === 'authenticated' && !activeProject) {
    return <Navigate to="/novo" replace />;
  }

  return <>{children}</>;
}
