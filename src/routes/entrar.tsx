import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/features/auth/AuthPage";

export const Route = createFileRoute("/entrar")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar · Nosso Lar" },
      {
        name: "description",
        content: "Acesse sua conta ou crie um cadastro para organizar seu primeiro lar.",
      },
      { property: "og:title", content: "Entrar · Nosso Lar" },
      {
        property: "og:description",
        content: "Acesse sua conta ou crie um cadastro para organizar seu primeiro lar.",
      },
    ],
  }),
  component: AuthPage,
});
