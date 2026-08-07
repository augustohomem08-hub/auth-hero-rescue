import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/routeGuards";
import { AppShell } from "@/components/layout/AppShell";
import { DocumentosPage } from "@/features/documentos/DocumentosPage";

export const Route = createFileRoute("/documentos")({
  ssr: false,
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Documentos · Nosso Lar" },
      {
        name: "description",
        content: "Guarde contratos, comprovantes e documentos importantes do imóvel.",
      },
      { property: "og:title", content: "Documentos · Nosso Lar" },
      {
        property: "og:description",
        content: "Guarde contratos, comprovantes e documentos importantes do imóvel.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <DocumentosPage />
    </AppShell>
  ),
});
