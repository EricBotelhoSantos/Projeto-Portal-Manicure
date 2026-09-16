import { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { CANCEL_REASONS } from "../lib/types";

interface Props {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function CancelModal({ open, loading, onClose, onConfirm }: Props): JSX.Element {
  const [reason, setReason] = useState<string>("");
  const [custom, setCustom] = useState("");

  const valid = reason !== "" && (reason !== "Outro" || custom.trim() !== "");

  const confirm = (): void => {
    if (!valid) return;
    onConfirm(reason === "Outro" ? custom.trim() : reason);
  };

  return (
    <Modal open={open} title="Cancelar agendamento" onClose={onClose}>
      <p className="mb-3 text-sm text-cocoa-soft">
        Informe o motivo do cancelamento <span className="font-semibold text-cocoa">(obrigatório)</span>. O horário será liberado automaticamente.
      </p>
      <div className="flex flex-col gap-2" role="radiogroup" aria-label="Motivo do cancelamento">
        {CANCEL_REASONS.map((r) => (
          <label
            key={r}
            className={`flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition ${
              reason === r ? "border-primary bg-primary-pale" : "border-cocoa-muted/25 hover:border-primary-soft"
            }`}
          >
            <input
              type="radio"
              name="cancel-reason"
              value={r}
              checked={reason === r}
              onChange={() => setReason(r)}
              className="h-5 w-5 accent-[#C14A6E]"
            />
            {r}
          </label>
        ))}
      </div>
      {reason === "Outro" && (
        <div className="mt-3">
          <label className="label" htmlFor="cancel-custom">
            Descreva o motivo
          </label>
          <textarea
            id="cancel-custom"
            className="input min-h-[88px] resize-y"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Conte o motivo do cancelamento"
            maxLength={300}
          />
        </div>
      )}
      <div className="mt-5 flex gap-2">
        <Button variant="secondary" onClick={onClose} className="flex-1" disabled={loading}>
          Voltar
        </Button>
        <Button variant="danger" onClick={confirm} className="flex-1" disabled={!valid} loading={loading}>
          Confirmar
        </Button>
      </div>
    </Modal>
  );
}
