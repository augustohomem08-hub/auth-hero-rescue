import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/routeGuards";
import { AppShell } from "@/components/layout/AppShell";
import { ConfiguracoesPage } from "@/features/configuracoes/ConfiguracoesPage";

export const Route = createFileRoute("/configuracoes")({
  ssr: false,
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Ajustes · Nosso Primeiro Lar" },
      {
        name: "description",
        content: "Gerencie o projeto, os membros convidados e as preferências da conta.",
      },
      { property: "og:title", content: "Ajustes · Nosso Primeiro Lar" },
      {
        property: "og:description",
        content: "Gerencie o projeto, os membros convidados e as preferências da conta.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <ConfiguracoesPage />
    </AppShell>
  ),
});
