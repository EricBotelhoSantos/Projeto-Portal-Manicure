import { createFileRoute } from "@tanstack/react-router";

import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Servicos } from "@/components/servicos";
import { Sobre } from "@/components/sobre";
import { Galeria } from "@/components/galeria";
import { Depoimentos } from "@/components/depoimentos";
import { Contato } from "@/components/contato";
import { Footer } from "@/components/footer";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { site } from "@/config/site";

const titulo = "Ana Paula Nails Designer | Manicure e Nail Designer";
const descricao =
  "Conheça a Ana Paula Nails Designer. Serviços de manicure, alongamento, nail art e cuidados especiais para suas unhas. Agende seu horário pelo WhatsApp.";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: titulo },
      { name: "description", content: descricao },
      { property: "og:title", content: titulo },
      { property: "og:description", content: descricao },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "NailSalon",
          name: site.nome,
          description: descricao,
          telephone: `+${site.whatsapp.numero}`,
          sameAs: [site.instagram.url],
        }),
      },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Servicos />
        <Sobre />
        <Galeria />
        <Depoimentos />
        <Contato />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
