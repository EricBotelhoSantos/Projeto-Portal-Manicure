import type { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helper?: string;
}

export function Input({ label, error, helper, id, ...rest }: Props): JSX.Element {
  const inputId = id ?? rest.name;
  return (
    <div>
      <label className="label" htmlFor={inputId}>
        {label}
      </label>
      <input id={inputId} className="input" aria-invalid={!!error} aria-describedby={error ? `${inputId}-error` : undefined} {...rest} />
      {error ? (
        <p id={`${inputId}-error`} className="error-text" role="alert">
          {error}
        </p>
      ) : helper ? (
        <p className="helper">{helper}</p>
      ) : null}
    </div>
  );
}
