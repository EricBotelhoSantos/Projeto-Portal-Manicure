export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }): JSX.Element {
  return (
    <div className="card flex flex-col items-center gap-2 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-pale" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 21c-4.5-2-8-5.5-8-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 11c0 4.5-3.5 8-8 10Z"
            stroke="#C14A6E"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="font-display text-lg font-semibold">{title}</p>
      {hint ? <p className="max-w-xs text-sm text-cocoa-soft">{hint}</p> : null}
      {action}
    </div>
  );
}

export function SkeletonList({ rows = 3 }: { rows?: number }): JSX.Element {
  return (
    <div className="flex flex-col gap-3" aria-label="Carregando" role="status">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-24 w-full" />
      ))}
    </div>
  );
}
