import { Check } from "lucide-react";
import { diferenciais, estudioFoto, whatsappLink } from "@/config/site";
import { Reveal } from "@/components/reveal";

export function Sobre() {
  return (
    <section id="sobre" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <img
            src={estudioFoto.src}
            alt={estudioFoto.alt}
            loading="lazy"
            className="aspect-[4/5] w-full rounded-[2rem] object-cover"
          />
        </Reveal>

        <Reveal delay={100}>
          <p className="eyebrow">Sobre a Ana Paula</p>
          <h2 className="mt-4 text-3xl text-foreground sm:text-4xl">Beleza em cada detalhe</h2>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            Na Ana Paula Nails Designer, cada atendimento é pensado para proporcionar uma
            experiência especial. O trabalho une técnica, cuidado e atenção aos detalhes para
            entregar unhas bonitas, bem cuidadas e que combinam com o estilo de cada cliente.
          </p>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {diferenciais.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-foreground">
                <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/60 text-primary">
                  <Check className="size-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-medium text-primary-foreground transition-all duration-300 hover:opacity-90"
          >
            Quero agendar meu horário
          </a>
        </Reveal>
      </div>
    </section>
  );
}
