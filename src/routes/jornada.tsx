import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { JornadaPage } from "@/features/jornada/JornadaPage";

export const Route = createFileRoute("/jornada")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Nossa Jornada · Nosso Primeiro Lar" },
      {
        name: "description",
        content: "Registre memórias e fotos de cada etapa da conquista do lar de vocês.",
      },
      { property: "og:title", content: "Nossa Jornada · Nosso Primeiro Lar" },
      {
        property: "og:description",
        content: "Registre memórias e fotos de cada etapa da conquista do lar de vocês.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <JornadaPage />
    </AppShell>
  ),
});
