import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/routeGuards";
import { AppShell } from "@/components/layout/AppShell";
import { FinanceiroPage } from "@/features/financeiro/FinanceiroPage";

export const Route = createFileRoute("/financeiro")({
  ssr: false,
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Financeiro · Nosso Lar" },
      {
        name: "description",
        content: "Controle receitas, despesas e o saldo do projeto do seu primeiro lar.",
      },
      { property: "og:title", content: "Financeiro · Nosso Lar" },
      {
        property: "og:description",
        content: "Controle receitas, despesas e o saldo do projeto do seu primeiro lar.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <FinanceiroPage />
    </AppShell>
  ),
});
