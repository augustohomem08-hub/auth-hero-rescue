import { createFileRoute } from "@tanstack/react-router";
import { OnboardingPage } from "@/features/onboarding/OnboardingPage";

export const Route = createFileRoute("/novo")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Novo projeto · Nosso Lar" },
      {
        name: "description",
        content: "Crie um novo projeto de lar ou entre em um projeto existente com um código.",
      },
      { property: "og:title", content: "Novo projeto · Nosso Lar" },
      {
        property: "og:description",
        content: "Crie um novo projeto de lar ou entre em um projeto existente com um código.",
      },
    ],
  }),
  component: OnboardingPage,
});
