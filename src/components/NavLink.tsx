import type { ReactNode } from 'react';
import { Link as RouterLink, useLocation } from '@tanstack/react-router';

/**
 * Thin compatibility layer over TanStack Router's <Link> so the app can keep
 * using plain string paths (and the active-state render-prop API) without
 * depending on react-router-dom.
 */

type AnyTo = string;

export function Link({
  to,
  className,
  children,
  ...rest
}: {
  to: AnyTo;
  className?: string;
  children: ReactNode;
} & Record<string, unknown>) {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <RouterLink to={to as any} className={className} {...(rest as any)}>
      {children}
    </RouterLink>
  );
}

export function useIsActive(to: string, end = false): boolean {
  const { pathname } = useLocation();
  return end || to === '/' ? pathname === to : pathname === to || pathname.startsWith(to + '/');
}

export function NavLink({
  to,
  end = false,
  className,
  children,
  ...rest
}: {
  to: AnyTo;
  end?: boolean;
  className?: string | ((state: { isActive: boolean }) => string);
  children: ReactNode | ((state: { isActive: boolean }) => ReactNode);
} & Record<string, unknown>) {
  const isActive = useIsActive(to, end);
  const resolved = typeof className === 'function' ? className({ isActive }) : className;

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <RouterLink to={to as any} className={resolved} {...(rest as any)}>
      {typeof children === 'function' ? children({ isActive }) : children}
    </RouterLink>
  );
}
