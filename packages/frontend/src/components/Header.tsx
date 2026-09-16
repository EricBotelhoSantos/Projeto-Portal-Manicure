import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { NotificationBell } from "./NotificationBell";

export function Header(): JSX.Element {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-primary-pale/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Ana Paula Nail Designer — início">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-white" aria-hidden="true">
            A
          </span>
          <span className="leading-tight">
            <span className="block font-display text-base font-bold text-cocoa">Ana Paula</span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Nail Designer</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {user ? (
            <>
              <NotificationBell />
              <span className="hidden max-w-[140px] truncate text-sm font-medium text-cocoa-soft sm:block">
                Olá, {user.name.split(" ")[0]}
              </span>
              <button
                type="button"
                className="btn-ghost px-3 text-sm"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost px-3 text-sm">
                Entrar
              </Link>
              <Link to="/cadastro" className="btn-primary min-h-[44px] px-4 py-2 text-sm">
                Criar conta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
