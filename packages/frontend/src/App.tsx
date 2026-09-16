import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { Header } from "./components/Header";
import { BottomNav } from "./components/BottomNav";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { HomePage } from "./pages/HomePage";
import { ServicesPage } from "./pages/ServicesPage";
import { BookingPage } from "./pages/BookingPage";
import { MyAppointmentsPage } from "./pages/MyAppointmentsPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ProfilePage } from "./pages/ProfilePage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminServicesPage } from "./pages/AdminServicesPage";
import { AdminAvailabilityPage } from "./pages/AdminAvailabilityPage";
import { AdminCalendarPage } from "./pages/AdminCalendarPage";

function ContextNav(): JSX.Element | null {
  const { user } = useAuth();
  const { pathname } = useLocation();
  if (!user) return null;

  if (user.role === "ADMIN" && pathname.startsWith("/admin")) {
    return (
      <nav aria-label="Navegação administrativa" className="mb-6 flex flex-wrap gap-1">
        {[
          ["/admin", "Painel"],
          ["/admin/calendario", "Calendário"],
          ["/admin/servicos", "Serviços"],
          ["/admin/horarios", "Horários"],
        ].map(([to, label]) => (
          <Link
            key={to}
            to={to}
            aria-current={pathname === to ? "page" : undefined}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:bg-primary-pale ${
              pathname === to ? "bg-primary-pale text-primary-dark" : "text-cocoa-soft"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    );
  }

  if (user.role === "CLIENT") {
    return (
      <nav aria-label="Navegação" className="mb-6 hidden gap-1 md:flex">
        {[
          ["/", "Início"],
          ["/servicos", "Serviços"],
          ["/agendar", "Agendar"],
          ["/meus-agendamentos", "Meus agendamentos"],
          ["/notificacoes", "Notificações"],
          ["/perfil", "Perfil"],
        ].map(([to, label]) => (
          <Link
            key={to}
            to={to}
            aria-current={pathname === to ? "page" : undefined}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:bg-primary-pale ${
              pathname === to ? "bg-primary-pale text-primary-dark" : "text-cocoa-soft"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    );
  }

  return null;
}

function Shell(): JSX.Element {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <ContextNav />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/servicos" element={<ServicesPage />} />
          <Route path="/agendar" element={<BookingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />

          <Route element={<ProtectedRoute roles={["CLIENT", "ADMIN"]} />}>
            <Route path="/notificacoes" element={<NotificationsPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
          </Route>
          <Route element={<ProtectedRoute roles={["CLIENT"]} />}>
            <Route path="/meus-agendamentos" element={<MyAppointmentsPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/servicos" element={<AdminServicesPage />} />
            <Route path="/admin/horarios" element={<AdminAvailabilityPage />} />
            <Route path="/admin/calendario" element={<AdminCalendarPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="border-t border-primary-pale/70 bg-white py-6 pb-24 md:pb-6">
        <p className="mx-auto max-w-5xl px-4 text-center text-xs text-cocoa-soft">
          Ana Paula Nail Designer · Agendamento online · Feito com cuidado
        </p>
      </footer>
      <BottomNav />
    </div>
  );
}

export default function App(): JSX.Element {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Shell />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
