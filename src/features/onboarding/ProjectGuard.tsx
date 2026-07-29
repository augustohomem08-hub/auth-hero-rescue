import { Navigate, Outlet } from '@tanstack/react-router';
import { FullPageLoading } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { useActiveProject } from '@/features/onboarding/useProjectMembership';

/**
 * Guard for the authenticated app area.
 *
 * - While auth/session or membership is loading → full-page spinner.
 * - If authenticated but belongs to NO project → render the onboarding
 *   flow (Create / Join project) in place of the app shell.
 * - If authenticated AND belongs to a project → render the normal app shell
 *   (sidebar/topbar/outlet) via AppLayout, which this guard is nested under.
 * - If unauthenticated → redirect to the onboarding screen as the entry point
 *   (there is no sign-in UI yet; the onboarding screen is the landing surface
 *   and the auth layer is ready to power a future sign-in screen).
 */
export function ProjectGuard() {
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

  return <Outlet />;
}
