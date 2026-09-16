import type { TimeSlot } from "../lib/types";

interface Props {
  slots: TimeSlot[];
  loading: boolean;
  selected: string | null;
  onSelect: (time: string) => void;
}

export function TimeSlotGrid({ slots, loading, selected, onSelect }: Props): JSX.Element {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2" role="status" aria-label="Carregando horários">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-12" />
        ))}
      </div>
    );
  }

  const available = slots.filter((s) => s.available);
  if (available.length === 0) {
    return (
      <p className="rounded-xl bg-cream-dark/60 px-4 py-5 text-center text-sm text-cocoa-soft">
        Nenhum horário disponível nesta data. Escolha outro dia.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2" role="group" aria-label="Horários disponíveis">
      {slots.map((s) => (
        <button
          key={s.time}
          type="button"
          disabled={!s.available}
          aria-pressed={selected === s.time}
          onClick={() => onSelect(s.time)}
          className={`flex min-h-[48px] cursor-pointer items-center justify-center rounded-xl border px-2 py-3 text-sm font-semibold transition ${
            selected === s.time
              ? "border-primary bg-primary text-white shadow-soft"
              : s.available
                ? "border-primary-pale bg-white text-cocoa hover:border-primary"
                : "cursor-not-allowed border-transparent bg-cream-dark/50 text-cocoa-muted/40 line-through"
          }`}
        >
          {s.time}
        </button>
      ))}
    </div>
  );
}
