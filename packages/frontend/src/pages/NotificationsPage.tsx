import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import type { NotificationItem } from "../lib/types";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/Button";
import { SkeletonList, EmptyState } from "../components/EmptyState";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function NotificationsPage(): JSX.Element {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  const load = useCallback(async () => {
    try {
      setItems(await api.get<NotificationItem[]>("/notifications"));
    } catch (e) {
      error(e instanceof Error ? e.message : "Erro ao carregar notificações");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    void load();
  }, [load]);

  const markAll = async (): Promise<void> => {
    try {
      await api.post("/notifications/read-all");
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      error(e instanceof Error ? e.message : "Erro ao marcar como lidas");
    }
  };

  const markOne = async (id: string): Promise<void> => {
    try {
      await api.get(`/notifications/${id}/read`);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {
      /* silencioso */
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 pb-24 md:pb-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Notificações</h1>
        {items.some((n) => !n.read) && (
          <Button variant="ghost" onClick={markAll} className="min-h-[44px] text-sm">
            Marcar todas como lidas
          </Button>
        )}
      </div>
      {loading ? (
        <SkeletonList rows={4} />
      ) : items.length === 0 ? (
        <EmptyState title="Nenhuma notificação" hint="Você será avisada sobre confirmações e cancelamentos por aqui." />
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => void markOne(n.id)}
              className={`card cursor-pointer text-left transition hover:border-primary-soft ${n.read ? "opacity-70" : "border-primary/40"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{n.title}</p>
                {!n.read && <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-label="Não lida" />}
              </div>
              <p className="mt-1 text-sm text-cocoa-soft">{n.message}</p>
              <p className="mt-1.5 text-xs text-cocoa-muted">
                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR })}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
