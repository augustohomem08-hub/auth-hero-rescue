import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PerfilPage } from "@/features/configuracoes/PerfilPage";

export const Route = createFileRoute("/configuracoes/perfil")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Perfil e conta · Nosso Primeiro Lar" },
      {
        name: "description",
        content: "Edite seu nome de exibição e consulte os dados da sua conta.",
      },
      { property: "og:title", content: "Perfil e conta · Nosso Primeiro Lar" },
      {
        property: "og:description",
        content: "Edite seu nome de exibição e consulte os dados da sua conta.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <PerfilPage />
    </AppShell>
  ),
});
