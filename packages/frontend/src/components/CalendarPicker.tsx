import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { CalendarDay } from "../lib/types";

interface Props {
  selected: string | null;
  onSelect: (date: string) => void;
}

const WEEK = ["D", "S", "T", "Q", "Q", "S", "S"];

export function CalendarPicker({ selected, onSelect }: Props): JSX.Element {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api
      .get<CalendarDay[]>(`/appointments/calendar?year=${year}&month=${month}`)
      .then((d) => {
        if (alive) setDays(d);
      })
      .catch(() => {
        if (alive) setDays([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [year, month]);

  const title = new Date(year, month - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const prev = (): void => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const next = (): void => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={prev} aria-label="Mês anterior" className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full hover:bg-primary-pale">
          ‹
        </button>
        <p className="font-display text-lg font-semibold capitalize">{title}</p>
        <button type="button" onClick={next} aria-label="Próximo mês" className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full hover:bg-primary-pale">
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-cocoa-soft" aria-hidden="true">
        {WEEK.map((w, i) => (
          <span key={i} className="py-1">
            {w}
          </span>
        ))}
      </div>
      {loading ? (
        <div className="grid grid-cols-7 gap-1" role="status" aria-label="Carregando calendário">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="skeleton h-11" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Escolha a data">
          {days.map((d) => {
            const isSelected = selected === d.date;
            return (
              <button
                key={d.date}
                type="button"
                role="gridcell"
                aria-selected={isSelected}
                aria-disabled={d.disabled}
                disabled={d.disabled}
                onClick={() => onSelect(d.date)}
                className={`flex h-11 min-w-[44px] cursor-pointer flex-col items-center justify-center rounded-xl text-sm transition ${
                  isSelected
                    ? "bg-primary font-bold text-white shadow-soft"
                    : d.disabled
                      ? "cursor-not-allowed text-cocoa-muted/40"
                      : d.isToday
                        ? "border border-primary font-semibold text-primary hover:bg-primary-pale"
                        : d.isCurrentMonth
                          ? "font-medium text-cocoa hover:bg-primary-pale"
                          : "text-cocoa-muted/50 hover:bg-primary-pale"
                }`}
              >
                {d.day}
                {d.isToday && !isSelected && <span className="h-1 w-1 rounded-full bg-primary" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
      <p className="helper mt-3">Somente dias com atendimento podem ser selecionados.</p>
    </div>
  );
}
