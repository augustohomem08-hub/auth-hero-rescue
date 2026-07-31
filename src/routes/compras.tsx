import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/routeGuards";
import { AppShell } from "@/components/layout/AppShell";
import { ComprasPage } from "@/features/compras/ComprasPage";

export const Route = createFileRoute("/compras")({
  ssr: false,
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Compras · Nosso Primeiro Lar" },
      {
        name: "description",
        content: "Organize os cômodos e a lista de itens da casa com orçamento e prioridades.",
      },
      { property: "og:title", content: "Compras · Nosso Primeiro Lar" },
      {
        property: "og:description",
        content: "Organize os cômodos e a lista de itens da casa com orçamento e prioridades.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <ComprasPage />
    </AppShell>
  ),
});
