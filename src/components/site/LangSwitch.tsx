import { useRouter } from "@tanstack/react-router";
import { LANGS, saveLang, useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LangSwitch({ className }: { className?: string }) {
  const lang = useLang();
  const router = useRouter();

  return (
    <div
      role="group"
      aria-label="Язык / Language"
      className={cn(
        "inline-flex rounded-md border border-current/20 p-0.5 text-xs font-semibold",
        className,
      )}
    >
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={l === lang}
          onClick={() => {
            if (l === lang) return;
            saveLang(l);
            void router.invalidate();
          }}
          className={cn(
            "rounded px-2 py-1 uppercase transition-colors",
            l === lang
              ? "bg-accent text-accent-foreground"
              : "bg-transparent opacity-60 hover:opacity-100",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
