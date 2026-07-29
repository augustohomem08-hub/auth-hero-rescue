import type { ReactNode } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProjectGuard } from '@/features/onboarding/ProjectGuard';

/** Wraps a page with the auth/project guard and the app chrome. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ProjectGuard>
      <AppLayout>{children}</AppLayout>
    </ProjectGuard>
  );
}
