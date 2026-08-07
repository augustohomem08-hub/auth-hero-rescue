import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { NotificacoesPage } from "@/features/configuracoes/NotificacoesPage";

export const Route = createFileRoute("/configuracoes/notificacoes")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Notificações · Nosso Lar" },
      {
        name: "description",
        content: "Escolha quais lembretes de prazos aparecem dentro do aplicativo.",
      },
      { property: "og:title", content: "Notificações · Nosso Lar" },
      {
        property: "og:description",
        content: "Escolha quais lembretes de prazos aparecem dentro do aplicativo.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <NotificacoesPage />
    </AppShell>
  ),
});
