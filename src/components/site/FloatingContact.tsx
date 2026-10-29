import { MessageCircle, Send } from "lucide-react";
import { telegramLink, whatsappLink } from "@/lib/contact";
import { useStore, vehicleLabel } from "@/lib/store";
import { useT } from "@/lib/i18n";

export function FloatingContact() {
  const t = useT();
  const { activeVehicle } = useStore();
  const vehicle = activeVehicle
    ? vehicleLabel(activeVehicle)
    : t("ещё не выбран", "not selected yet");
  const message = t(
    `Здравствуйте, помогите подобрать запчасть для моего Grand Cherokee.\nАвтомобиль: ${vehicle}`,
    `Hello, I need help finding a part for my Grand Cherokee.\nVehicle: ${vehicle}`,
  );

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col gap-2 md:bottom-6">
      <a
        href={whatsappLink(message)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("Написать нам в WhatsApp", "Chat with us on WhatsApp")}
        className="inline-flex size-12 items-center justify-center rounded-full bg-whatsapp text-primary-foreground shadow-[var(--shadow-lift)] transition-transform hover:scale-105"
      >
        <MessageCircle className="size-5" aria-hidden="true" />
      </a>
      <a
        href={telegramLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("Написать нам в Telegram", "Chat with us on Telegram")}
        className="inline-flex size-12 items-center justify-center rounded-full bg-telegram text-primary-foreground shadow-[var(--shadow-lift)] transition-transform hover:scale-105"
      >
        <Send className="size-5" aria-hidden="true" />
      </a>
    </div>
  );
}
