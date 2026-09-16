import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function linkCls(isActive: boolean): string {
  return `flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition ${
    isActive ? "text-primary" : "text-cocoa-soft"
  }`;
}

export function BottomNav(): JSX.Element {
  const { user } = useAuth();
  if (!user || user.role !== "CLIENT") return <></>;

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-primary-pale bg-white/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-5xl">
        <NavLink to="/" className={({ isActive }) => linkCls(isActive)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 11 12 4l8 7v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
          Início
        </NavLink>
        <NavLink to="/servicos" className={({ isActive }) => linkCls(isActive)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Serviços
        </NavLink>
        <NavLink to="/agendar" className={({ isActive }) => linkCls(isActive)}>
          <span
            className="flex h-12 w-12 -translate-y-3 items-center justify-center rounded-full bg-primary text-white shadow-soft transition"
            aria-hidden="true"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </span>
          Agendar
        </NavLink>
        <NavLink to="/meus-agendamentos" className={({ isActive }) => linkCls(isActive)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="4" y="5" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <path d="M4 10h16M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Agenda
        </NavLink>
        <NavLink to="/perfil" className={({ isActive }) => linkCls(isActive)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
            <path d="M4 21c1.5-4 5-5.5 8-5.5s6.5 1.5 8 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Perfil
        </NavLink>
      </div>
    </nav>
  );
}
