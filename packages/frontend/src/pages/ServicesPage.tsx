import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { Service } from "../lib/types";
import { SkeletonList, EmptyState } from "../components/EmptyState";
import { useToast } from "../context/ToastContext";

export function ServicesPage(): JSX.Element {
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
    <div className="flex flex-col gap-4 pb-24 md:pb-10">
      <div>
        <h1 className="font-display text-3xl font-bold">Serviços</h1>
        <p className="text-sm text-cocoa-soft">Escolha um serviço para agendar seu horário.</p>
      </div>
      {loading ? (
        <SkeletonList rows={4} />
      ) : services.length === 0 ? (
        <EmptyState title="Nenhum serviço disponível" hint="Volte em breve para conferir as novidades." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {services.map((s) => (
            <article key={s.id} className="card flex flex-col gap-1.5">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-display text-lg font-semibold">{s.name}</h2>
                <span className="whitespace-nowrap rounded-full bg-primary-pale px-3 py-1 text-sm font-bold text-primary-dark">
                  R$ {Number(s.price).toFixed(2).replace(".", ",")}
                </span>
              </div>
              {s.description && <p className="text-sm leading-relaxed text-cocoa-soft">{s.description}</p>}
              <p className="text-xs font-medium text-cocoa-soft">Duração aproximada: {s.durationMinutes} min</p>
              <Link to={`/agendar?service=${s.id}`} className="btn-primary mt-2 min-h-[44px] py-2 text-sm">
                Agendar
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
