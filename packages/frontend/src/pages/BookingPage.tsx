import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import type { Service, TimeSlot } from "../lib/types";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/Button";
import { CalendarPicker } from "../components/CalendarPicker";
import { TimeSlotGrid } from "../components/TimeSlotGrid";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STEPS = ["Serviço", "Data", "Horário", "Detalhes", "Revisão"] as const;

export function BookingPage(): JSX.Element {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState<string>(params.get("service") ?? "");
  const [date, setDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [time, setTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get<Service[]>("/appointments/services")
      .then((list) => {
        setServices(list);
        const pre = params.get("service");
        if (pre && list.some((s) => s.id === pre)) {
          setServiceId(pre);
          setStep(1);
        }
      })
      .catch((e) => error(e instanceof Error ? e.message : "Erro ao carregar serviços"))
      .finally(() => setLoadingServices(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!date || !serviceId) return;
    setLoadingSlots(true);
    setTime(null);
    api
      .get<TimeSlot[]>(`/appointments/time-slots?date=${date}&serviceId=${serviceId}`)
      .then(setSlots)
      .catch((e) => {
        error(e instanceof Error ? e.message : "Erro ao carregar horários");
        setSlots([]);
      })
      .finally(() => setLoadingSlots(false));
  }, [date, serviceId, error]);

  const service = services.find((s) => s.id === serviceId);

  const canNext =
    (step === 0 && !!serviceId) ||
    (step === 1 && !!date) ||
    (step === 2 && !!time) ||
    step === 3;

  const next = (): void => {
    if (!canNext) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const back = (): void => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (): Promise<void> => {
    if (!user) {
      navigate("/login", { state: { from: "/agendar" } });
      return;
    }
    if (!serviceId || !date || !time) return;
    setSubmitting(true);
    try {
      await api.post("/appointments/book", { serviceId, date, startTime: time, notes: notes.trim() || undefined });
      success("Solicitação enviada! Aguarde a confirmação da manicure.");
      navigate("/meus-agendamentos");
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        error("Esse horário acabou de ser ocupado. Escolha outro horário.");
        setStep(2);
        const fresh = await api
          .get<TimeSlot[]>(`/appointments/time-slots?date=${date}&serviceId=${serviceId}`)
          .catch(() => [] as TimeSlot[]);
        setSlots(fresh);
        setTime(null);
      } else {
        error(e instanceof Error ? e.message : "Não foi possível confirmar o agendamento");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const prettyDate = date ? format(new Date(`${date}T12:00:00`), "EEEE, dd 'de' MMMM", { locale: ptBR }) : "";

  return (
    <div className="flex flex-col gap-4 pb-24 md:pb-10">
      <div>
        <h1 className="font-display text-3xl font-bold">Agendar horário</h1>
        <p className="text-sm text-cocoa-soft">Siga as etapas para concluir sua reserva.</p>
      </div>

      <ol className="flex items-center gap-1" aria-label="Etapas do agendamento">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-1">
            <div className="flex flex-1 flex-col items-center gap-1">
              <span
                aria-current={i === step ? "step" : undefined}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                  i < step ? "bg-emerald-500 text-white" : i === step ? "bg-primary text-white shadow-soft" : "bg-cream-dark text-cocoa-soft"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </span>
              <span className={`hidden text-[11px] font-semibold sm:block ${i === step ? "text-primary" : "text-cocoa-soft"}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && <span className="mb-0 h-0.5 flex-1 rounded bg-cream-dark sm:mb-5" aria-hidden="true" />}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <section aria-label="Escolha o serviço" className="flex flex-col gap-3">
          {loadingServices ? (
            <div className="flex flex-col gap-3" role="status" aria-label="Carregando serviços">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-24" />
              ))}
            </div>
          ) : (
            services.map((s) => (
              <label
                key={s.id}
                className={`card flex cursor-pointer items-start gap-3 transition ${
                  serviceId === s.id ? "border-primary ring-2 ring-primary/30" : "hover:border-primary-soft"
                }`}
              >
                <input
                  type="radio"
                  name="service"
                  value={s.id}
                  checked={serviceId === s.id}
                  onChange={() => setServiceId(s.id)}
                  className="mt-1 h-5 w-5 accent-[#C14A6E]"
                />
                <span className="flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <strong className="font-display text-base">{s.name}</strong>
                    <strong className="whitespace-nowrap text-primary-dark">
                      R$ {Number(s.price).toFixed(2).replace(".", ",")}
                    </strong>
                  </span>
                  {s.description && <span className="mt-0.5 block text-sm text-cocoa-soft">{s.description}</span>}
                  <span className="mt-1 block text-xs font-medium text-cocoa-soft">{s.durationMinutes} min</span>
                </span>
              </label>
            ))
          )}
        </section>
      )}

      {step === 1 && (
        <section aria-label="Escolha a data">
          <CalendarPicker selected={date} onSelect={(d) => setDate(d)} />
        </section>
      )}

      {step === 2 && (
        <section aria-label="Escolha o horário" className="flex flex-col gap-3">
          <div className="card">
            <p className="text-sm text-cocoa-soft">
              {service?.name} · <span className="capitalize">{prettyDate}</span>
            </p>
            <div className="mt-3">
              <TimeSlotGrid slots={slots} loading={loadingSlots} selected={time} onSelect={setTime} />
            </div>
          </div>
        </section>
      )}

      {step === 3 && (
        <section aria-label="Detalhes" className="card flex flex-col gap-4">
          <div>
            <label className="label" htmlFor="notes">
              Como você gostaria das suas unhas?
            </label>
            <textarea
              id="notes"
              className="input min-h-[120px] resize-y"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              placeholder="Ex.: formato quadrado, francesinha branca e decoração em duas unhas."
            />
            <p className="helper">{notes.length}/500 caracteres</p>
          </div>
          {!user && (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Você precisará <Link to="/login" className="font-semibold underline">entrar</Link> ou{" "}
              <Link to="/cadastro" className="font-semibold underline">criar uma conta</Link> para confirmar.
            </p>
          )}
        </section>
      )}

      {step === 4 && (
        <section aria-label="Revisão" className="card flex flex-col gap-3">
          <h2 className="font-display text-xl font-semibold">Revise sua solicitação</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-cocoa-soft">Serviço</dt>
              <dd className="text-right font-semibold">{service?.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-cocoa-soft">Data</dt>
              <dd className="text-right font-semibold capitalize">{prettyDate}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-cocoa-soft">Horário</dt>
              <dd className="text-right font-semibold">{time}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-cocoa-soft">Duração</dt>
              <dd className="text-right font-semibold">{service?.durationMinutes} min</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-cocoa-soft">Valor</dt>
              <dd className="text-right font-semibold">R$ {service ? Number(service.price).toFixed(2).replace(".", ",") : "—"}</dd>
            </div>
            {notes.trim() && (
              <div className="rounded-xl bg-cream px-3 py-2">
                <dt className="font-semibold">Observação</dt>
                <dd className="mt-0.5 text-cocoa-soft">{notes.trim()}</dd>
              </div>
            )}
          </dl>
          <p className="rounded-xl bg-primary-pale/60 px-4 py-3 text-sm text-cocoa">
            Ao confirmar, o horário fica reservado como <strong>pendente</strong> até a manicure confirmar.
          </p>
        </section>
      )}

      <div className="flex gap-2">
        {step > 0 && (
          <Button variant="secondary" onClick={back} className="flex-1">
            Voltar
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button onClick={next} disabled={!canNext} className="flex-1">
            Continuar
          </Button>
        ) : (
          <Button onClick={submit} loading={submitting} className="flex-1">
            Confirmar agendamento
          </Button>
        )}
      </div>
    </div>
  );
}
