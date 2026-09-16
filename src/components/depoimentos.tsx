import { Quote } from "lucide-react";
import { depoimentos } from "@/config/site";
import { Reveal } from "@/components/reveal";

/**
 * ⚠️ Os depoimentos vêm de src/config/site.ts e são apenas EXEMPLOS fictícios.
 * Substitua pelos depoimentos reais das clientes.
 */
export function Depoimentos() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="max-w-xl">
          <p className="eyebrow">Depoimentos</p>
          <h2 className="mt-4 text-3xl text-foreground sm:text-4xl">O que nossas clientes dizem</h2>
        </Reveal>

        <ul className="mt-14 grid gap-6 md:grid-cols-3">
          {depoimentos.map((item, i) => (
            <li key={item.texto}>
              <Reveal delay={i * 90} className="h-full">
                <figure className="flex h-full flex-col rounded-3xl border border-border/70 bg-card p-8">
                  <Quote className="size-7 text-gold" />
                  <blockquote className="mt-5 flex-1 font-display text-xl leading-snug text-foreground">
                    “{item.texto}”
                  </blockquote>
                  <figcaption className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    — {item.autora}
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
