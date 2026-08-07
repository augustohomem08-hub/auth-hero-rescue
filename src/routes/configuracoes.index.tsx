import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ConfiguracoesPage } from "@/features/configuracoes/ConfiguracoesPage";

export const Route = createFileRoute("/configuracoes/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Ajustes · Nosso Lar" },
      {
        name: "description",
        content: "Gerencie o projeto, os membros convidados e as preferências da conta.",
      },
      { property: "og:title", content: "Ajustes · Nosso Lar" },
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
