import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { Service } from "../lib/types";
import { Button } from "../components/Button";
import { SkeletonList, EmptyState } from "../components/EmptyState";
import { useToast } from "../context/ToastContext";

export function HomePage(): JSX.Element {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  useEffect(() => {
    api
      .get<Service[]>("/appointments/services")
      .then(setServices)
      .catch((e) => error(e instanceof Error ? e.message : "Não foi possível carregar os serviços"))
      .finally(() => setLoading(false));
  }, [error]);

  return (
    <div className="flex flex-col gap-8 pb-24 md:pb-10">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary-dark px-6 py-10 text-white shadow-soft sm:px-10">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-14 -left-6 h-44 w-44 rounded-full bg-white/10" aria-hidden="true" />
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/80">Espaço de beleza</p>
        <h1 className="mt-2 max-w-md font-display text-3xl font-bold leading-tight sm:text-4xl">
          Unhas que elevam a sua autoestima
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-white/90 sm:text-base">
          Escolha o serviço, selecione o melhor dia e horário e receba a confirmação da manicure. Simples, rápido e sem
          ligações.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link to="/agendar" className="btn min-h-[48px] bg-white px-6 font-semibold text-primary shadow hover:bg-primary-pale">
            Agendar horário
          </Link>
          <Link
            to="/servicos"
            className="btn min-h-[48px] border border-white/50 px-6 font-semibold text-white hover:bg-white/10"
          >
            Ver serviços
          </Link>
        </div>
      </section>

      <section aria-labelledby="home-services">
        <div className="mb-3 flex items-end justify-between">
          <h2 id="home-services" className="font-display text-2xl font-bold">
            Serviços e preços
          </h2>
          <Link to="/servicos" className="text-sm font-semibold text-primary">
            Ver todos
          </Link>
        </div>
        {loading ? (
          <SkeletonList rows={3} />
        ) : services.length === 0 ? (
          <EmptyState title="Nenhum serviço disponível" hint="Volte em breve para conferir as novidades." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {services.slice(0, 4).map((s) => (
              <article key={s.id} className="card flex flex-col gap-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg font-semibold">{s.name}</h3>
                  <span className="whitespace-nowrap rounded-full bg-primary-pale px-3 py-1 text-sm font-bold text-primary-dark">
                    R$ {Number(s.price).toFixed(2).replace(".", ",")}
                  </span>
                </div>
                {s.description && <p className="text-sm leading-relaxed text-cocoa-soft">{s.description}</p>}
                <p className="text-xs font-medium text-cocoa-soft">Duração: {s.durationMinutes} min</p>
                <Link to={`/agendar?service=${s.id}`} className="btn-secondary mt-2 min-h-[44px] py-2 text-sm">
                  Agendar este serviço
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section aria-label="Como funciona" className="card bg-cream-dark/40">
        <h2 className="font-display text-xl font-bold">Como funciona</h2>
        <ol className="mt-3 flex flex-col gap-3 text-sm text-cocoa-soft">
          {[
            ["Escolha o serviço", "Manicure, gel, fibra, francesinha e mais."],
            ["Selecione data e horário", "Só aparecem os horários realmente livres."],
            ["Conte como quer as unhas", "Observações e referência do resultado desejado."],
            ["Aguarde a confirmação", "A manicure confirma e você recebe a notificação."],
          ].map(([title, desc], i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-white" aria-hidden="true">
                {i + 1}
              </span>
              <span>
                <strong className="block text-cocoa">{title}</strong>
                {desc}
              </span>
            </li>
          ))}
        </ol>
        <Link to="/agendar">
          <Button className="mt-5 w-full">Começar agora</Button>
        </Link>
      </section>
    </div>
  );
}
