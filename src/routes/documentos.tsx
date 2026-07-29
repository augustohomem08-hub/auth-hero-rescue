import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { DocumentosPage } from "@/features/documentos/DocumentosPage";

export const Route = createFileRoute("/documentos")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Documentos · Nosso Primeiro Lar" },
      {
        name: "description",
        content: "Guarde contratos, comprovantes e documentos importantes do imóvel.",
      },
      { property: "og:title", content: "Documentos · Nosso Primeiro Lar" },
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
