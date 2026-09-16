import type { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
}

export function Button({ variant = "primary", loading, children, disabled, className = "", ...rest }: Props): JSX.Element {
  const cls =
    variant === "primary"
      ? "btn-primary"
      : variant === "secondary"
        ? "btn-secondary"
        : variant === "danger"
          ? "btn-danger"
          : "btn-ghost";
  return (
    <button className={`${cls} ${className}`} disabled={disabled ?? loading} {...rest}>
      {loading ? (
        <span className="flex items-center gap-2" aria-live="polite">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
          Carregando…
        </span>
      ) : (
        children
      )}
    </button>
  );
}
