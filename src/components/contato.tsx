import { useState } from "react";
import { servicos, site, whatsappLink } from "@/config/site";
import { Reveal } from "@/components/reveal";
import { WhatsAppIcon } from "@/components/whatsapp-icon";

export function Contato() {
  const [nome, setNome] = useState("");
  const [servico, setServico] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");

  function enviar(e: React.FormEvent) {
    e.preventDefault();

    const partes = [
      "Olá, Ana Paula! Gostaria de agendar um horário para fazer minhas unhas.",
      nome && `Meu nome é ${nome}.`,
      servico && `Serviço desejado: ${servico}.`,
      data && `Data de preferência: ${data}.`,
      hora && `Horário de preferência: ${hora}.`,
      "Poderia me informar os horários disponíveis?",
    ].filter(Boolean);

    window.open(whatsappLink(partes.join(" ")), "_blank", "noopener,noreferrer");
  }

  const campo =
    "w-full rounded-xl border border-border bg-background px-4 py-3.5 text-base text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none";

  return (
    <section id="contato" className="scroll-mt-24 bg-accent/30 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-start gap-12 px-5 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="eyebrow">Agendamento</p>
          <h2 className="mt-4 text-3xl text-foreground sm:text-4xl">
            Vamos cuidar das suas unhas?
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            Agende seu horário e venha viver uma experiência de beleza, cuidado e autoestima.
          </p>

          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-9 inline-flex w-full items-center justify-center gap-3 rounded-full bg-primary px-8 py-5 text-lg font-medium text-primary-foreground transition-all duration-300 hover:opacity-90 sm:w-auto"
          >
            <WhatsAppIcon className="size-6" />
            Agendar pelo WhatsApp
          </a>

          <p className="mt-5 text-sm text-muted-foreground">
            WhatsApp {site.whatsapp.exibicao} • {site.horarios}
          </p>
        </Reveal>

        <Reveal delay={100}>
          <form
            onSubmit={enviar}
            className="rounded-3xl border border-border/70 bg-card p-7 sm:p-9"
          >
            <h3 className="text-2xl text-foreground">Prefere adiantar os detalhes?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Todos os campos são opcionais. Ao enviar, abrimos o WhatsApp com sua mensagem pronta.
            </p>

            <div className="mt-7 space-y-4">
              <div>
                <label htmlFor="nome" className="mb-2 block text-sm text-foreground">
                  Nome
                </label>
                <input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  className={campo}
                />
              </div>

              <div>
                <label htmlFor="servico" className="mb-2 block text-sm text-foreground">
                  Serviço desejado
                </label>
                <select
                  id="servico"
                  value={servico}
                  onChange={(e) => setServico(e.target.value)}
                  className={campo}
                >
                  <option value="">Selecione um serviço</option>
                  {servicos.map((s) => (
                    <option key={s.nome} value={s.nome}>
                      {s.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="data" className="mb-2 block text-sm text-foreground">
                    Data de preferência
                  </label>
                  <input
                    id="data"
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className={campo}
                  />
                </div>
                <div>
                  <label htmlFor="hora" className="mb-2 block text-sm text-foreground">
                    Horário de preferência
                  </label>
                  <input
                    id="hora"
                    type="time"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    className={campo}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 text-base font-medium text-background transition-all duration-300 hover:opacity-90"
            >
              <WhatsAppIcon className="size-5" />
              Enviar pelo WhatsApp
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
