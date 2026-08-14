import { MessageCircle, Send } from "lucide-react";
import { telegramLink, whatsappLink } from "@/lib/contact";
import { useStore, vehicleLabel } from "@/lib/store";

export function FloatingContact() {
  const { activeVehicle } = useStore();
  const message = `Hello, I need help finding a part for my Grand Cherokee.\nVehicle: ${
    activeVehicle ? vehicleLabel(activeVehicle) : "not selected yet"
  }`;

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col gap-2 md:bottom-6">
      <a
        href={whatsappLink(message)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="inline-flex size-12 items-center justify-center rounded-full bg-whatsapp text-primary-foreground shadow-[var(--shadow-lift)] transition-transform hover:scale-105"
      >
        <MessageCircle className="size-5" aria-hidden="true" />
      </a>
      <a
        href={telegramLink(message)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on Telegram"
        className="inline-flex size-12 items-center justify-center rounded-full bg-telegram text-primary-foreground shadow-[var(--shadow-lift)] transition-transform hover:scale-105"
      >
        <Send className="size-5" aria-hidden="true" />
      </a>
    </div>
  );
}
