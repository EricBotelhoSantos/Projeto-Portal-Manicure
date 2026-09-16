import heroImg from "@/assets/hero.jpg";
import { whatsappLink } from "@/config/site";
import { Reveal } from "@/components/reveal";
import { WhatsAppIcon } from "@/components/whatsapp-icon";

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-24 size-[28rem] rounded-full bg-accent/40 blur-3xl"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2 lg:gap-16">
        <Reveal className="order-2 lg:order-1">
          <p className="eyebrow">Nail Designer</p>
          <h1 className="mt-5 text-4xl leading-[1.1] text-foreground sm:text-5xl lg:text-6xl">
            Suas unhas merecem um toque especial.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            Beleza, cuidado e sofisticação em cada detalhe. Conheça o trabalho da Ana Paula Nails
            Designer.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-medium text-primary-foreground transition-all duration-300 hover:opacity-90"
            >
              <WhatsAppIcon className="size-5" />
              Agendar meu horário
            </a>
            <a
              href="#servicos"
              className="inline-flex items-center justify-center rounded-full border border-primary/30 px-8 py-4 text-base font-medium text-primary transition-all duration-300 hover:bg-secondary"
            >
              Conhecer serviços
            </a>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Atendimento personalizado • Qualidade • Sofisticação
          </p>
        </Reveal>

        <Reveal delay={120} className="order-1 lg:order-2">
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-3 rounded-[2.5rem] border border-gold/40"
            />
            <img
              src={heroImg}
              width={1408}
              height={1600}
              alt="Mãos com unhas amendoadas em esmalte nude sobre tecido de seda rosé"
              className="relative aspect-[4/5] w-full rounded-[2rem] object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
