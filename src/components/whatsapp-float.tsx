import { site, whatsappLink } from "@/config/site";
import { WhatsAppIcon } from "@/components/whatsapp-icon";

export function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink(site.mensagens.flutuante)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Agendar pelo WhatsApp"
      className="fixed right-5 bottom-5 z-50 inline-flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_14px_30px_-12px_oklch(0.32_0.025_35_/_0.7)] transition-transform duration-300 hover:scale-105"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
