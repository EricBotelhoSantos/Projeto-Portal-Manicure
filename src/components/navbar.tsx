import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navLinks, site, whatsappLink } from "@/config/site";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/70 bg-background/90 shadow-[0_6px_24px_-18px_oklch(0.32_0.025_35_/_0.5)] backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <nav
        aria-label="Navegação principal"
        className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 lg:flex lg:justify-between"
      >
        <a href="#inicio" className="min-w-0 leading-tight">
          <span className="block font-display text-lg tracking-wide text-foreground sm:text-xl">
            Ana Paula
          </span>
          <span className="block text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">
            Nails Designer
          </span>
        </a>

        <ul className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 sm:inline-flex"
          >
            Agendar
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <div
        className={cn(
          "overflow-hidden border-t border-border/60 bg-background/95 backdrop-blur-md transition-all duration-300 lg:hidden",
          open ? "max-h-96" : "max-h-0 border-t-0",
        )}
      >
        <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-3 text-base text-foreground transition-colors hover:bg-secondary"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="pt-2">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="block rounded-full bg-primary px-6 py-3.5 text-center text-base font-medium text-primary-foreground"
            >
              Agendar pelo WhatsApp
            </a>
          </li>
          <li className="px-3 pt-2 text-xs text-muted-foreground">{site.whatsapp.exibicao}</li>
        </ul>
      </div>
    </header>
  );
}
