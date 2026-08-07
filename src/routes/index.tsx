import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/routeGuards";
import { AppShell } from "@/components/layout/AppShell";
import { HomePage } from "@/features/home/HomePage";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Início · Nosso Lar" },
      {
        name: "description",
        content:
          "Acompanhe compras, finanças, cronograma e memórias do seu primeiro lar em um só lugar.",
      },
      { property: "og:title", content: "Início · Nosso Lar" },
      {
        property: "og:description",
        content:
          "Acompanhe compras, finanças, cronograma e memórias do seu primeiro lar em um só lugar.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <HomePage />
    </AppShell>
  ),
});
