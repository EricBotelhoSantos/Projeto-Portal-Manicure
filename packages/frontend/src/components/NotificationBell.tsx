import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export function NotificationBell(): JSX.Element {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    const load = async (): Promise<void> => {
      try {
        const data = await api.get<{ count: number }>("/notifications/unread-count");
        if (alive) setCount(data.count);
      } catch {
        /* silencioso */
      }
    };
    void load();
    const id = window.setInterval(load, 30000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [user]);

  const to = user?.role === "ADMIN" ? "/admin" : "/notificacoes";

  return (
    <Link
      to={to}
      aria-label={count > 0 ? `${count} notificações não lidas` : "Notificações"}
      className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-cocoa transition hover:bg-primary-pale"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Zm4 10a2 2 0 0 0 4 0"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {count > 0 && (
        <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
