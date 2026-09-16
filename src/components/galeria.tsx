import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { galeria } from "@/config/site";
import { Reveal } from "@/components/reveal";

export function Galeria() {
  const [aberta, setAberta] = useState<number | null>(null);

  useEffect(() => {
    if (aberta === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberta(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aberta]);

  const foto = aberta === null ? null : galeria[aberta];

  return (
    <section id="galeria" className="scroll-mt-24 bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="max-w-xl">
          <p className="eyebrow">Portfólio</p>
          <h2 className="mt-4 text-3xl text-foreground sm:text-4xl">Galeria de Trabalhos</h2>
          <p className="mt-4 text-base text-muted-foreground">
            Confira alguns dos trabalhos realizados pela Ana Paula Nails Designer.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {galeria.map((item, i) => (
            <Reveal key={item.src} delay={(i % 3) * 80}>
              <button
                type="button"
                onClick={() => setAberta(i)}
                className="group block w-full overflow-hidden rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Ampliar imagem: ${item.alt}`}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                  className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {foto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Visualização ampliada"
          onClick={() => setAberta(null)}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/80 p-4 backdrop-blur-sm animate-fade-in"
        >
          <button
            type="button"
            onClick={() => setAberta(null)}
            aria-label="Fechar visualização"
            className="absolute top-5 right-5 inline-flex size-11 items-center justify-center rounded-full bg-background/90 text-foreground"
          >
            <X className="size-5" />
          </button>
          <img
            src={foto.src}
            alt={foto.alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-auto max-w-full rounded-2xl object-contain"
          />
        </div>
      )}
    </section>
  );
}
