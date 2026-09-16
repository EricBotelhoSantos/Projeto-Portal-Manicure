import { navLinks, site, whatsappLink } from "@/config/site";
import { InstagramIcon, WhatsAppIcon } from "@/components/whatsapp-icon";

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-background py-14">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <p className="font-display text-2xl text-foreground">{site.nome}</p>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">{site.slogan}</p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Falar no WhatsApp"
                className="inline-flex size-11 items-center justify-center rounded-full border border-border text-primary transition-colors hover:bg-secondary"
              >
                <WhatsAppIcon className="size-5" />
              </a>
              <a
                href={site.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Perfil no Instagram"
                className="inline-flex size-11 items-center justify-center rounded-full border border-border text-primary transition-colors hover:bg-secondary"
              >
                <InstagramIcon className="size-5" />
              </a>
            </div>
          </div>

          <div className="sm:justify-self-end">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Navegação</p>
            <ul className="mt-4 space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted-foreground">{site.horarios}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              WhatsApp {site.whatsapp.exibicao} • Instagram {site.instagram.usuario}
            </p>
          </div>
        </div>

        <p className="mt-12 border-t border-border/60 pt-6 text-xs text-muted-foreground">
          © 2026 {site.nome}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
