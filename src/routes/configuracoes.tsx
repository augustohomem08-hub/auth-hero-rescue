import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireAuth } from "@/lib/routeGuards";

/**
 * Layout route for the settings area. Child routes (`/configuracoes`,
 * `/configuracoes/perfil`, `/configuracoes/notificacoes`,
 * `/configuracoes/privacidade`) render inside the shared auth guard.
 */
export const Route = createFileRoute("/configuracoes")({
  ssr: false,
  beforeLoad: requireAuth,
  component: () => <Outlet />,
});
