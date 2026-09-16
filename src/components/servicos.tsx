import { Hand, Paintbrush, Sparkles, Flower2, Gem, RefreshCw } from "lucide-react";
import type { ComponentType } from "react";
import { servicos, site, whatsappLink, type Servico } from "@/config/site";
import { Reveal } from "@/components/reveal";

const icones: Record<Servico["icone"], ComponentType<{ className?: string }>> = {
  manicure: Hand,
  esmaltacao: Paintbrush,
  alongamento: Gem,
  nailart: Sparkles,
  manutencao: RefreshCw,
  spa: Flower2,
};

export function Servicos() {
  return (
    <section id="servicos" className="scroll-mt-24 bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="max-w-xl">
          <p className="eyebrow">Cuidados</p>
          <h2 className="mt-4 text-3xl text-foreground sm:text-4xl">Serviços</h2>
          <p className="mt-4 text-base text-muted-foreground">
            Cuidados especiais para deixar suas unhas ainda mais bonitas.
          </p>
        </Reveal>

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {servicos.map((servico, i) => {
            const Icone = icones[servico.icone];
            return (
              <li key={servico.nome}>
                <Reveal delay={i * 70} className="h-full">
                  <article className="group flex h-full flex-col rounded-3xl border border-border/70 bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-gold/50">
                    <span className="inline-flex size-12 items-center justify-center rounded-full bg-accent/50 text-primary transition-colors group-hover:bg-accent">
                      <Icone className="size-6" />
                    </span>
                    <h3 className="mt-6 text-2xl text-foreground">{servico.nome}</h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {servico.descricao}
                    </p>
                    <a
                      href={whatsappLink(site.mensagens.servico(servico.nome))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-7 inline-flex w-fit items-center justify-center rounded-full border border-primary/30 px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      Agendar
                      <span className="sr-only"> {servico.nome} pelo WhatsApp</span>
                    </a>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
