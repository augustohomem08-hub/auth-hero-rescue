import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/routeGuards";
import { AppShell } from "@/components/layout/AppShell";
import { CronogramaPage } from "@/features/cronograma/CronogramaPage";

export const Route = createFileRoute("/cronograma")({
  ssr: false,
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Cronograma · Nosso Primeiro Lar" },
      {
        name: "description",
        content: "Acompanhe marcos e prazos importantes da jornada até a mudança.",
      },
      { property: "og:title", content: "Cronograma · Nosso Primeiro Lar" },
      {
        property: "og:description",
        content: "Acompanhe marcos e prazos importantes da jornada até a mudança.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <CronogramaPage />
    </AppShell>
  ),
});
