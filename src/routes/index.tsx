import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { HomePage } from "@/features/home/HomePage";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Início · Nosso Primeiro Lar" },
      {
        name: "description",
        content:
          "Acompanhe compras, finanças, cronograma e memórias do seu primeiro lar em um só lugar.",
      },
      { property: "og:title", content: "Início · Nosso Primeiro Lar" },
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
