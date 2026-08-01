import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PrivacidadePage } from "@/features/configuracoes/PrivacidadePage";

export const Route = createFileRoute("/configuracoes/privacidade")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Privacidade · Nosso Primeiro Lar" },
      {
        name: "description",
        content: "Veja quem tem acesso aos dados do lar e remova membros do projeto.",
      },
      { property: "og:title", content: "Privacidade · Nosso Primeiro Lar" },
      {
        property: "og:description",
        content: "Veja quem tem acesso aos dados do lar e remova membros do projeto.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <PrivacidadePage />
    </AppShell>
  ),
});
