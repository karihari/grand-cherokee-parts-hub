import { MessageCircle, Send } from "lucide-react";
import type { Product } from "@/data/catalog";
import { useStore } from "@/lib/store";
import { productEnquiry, productUrl, telegramLink, whatsappLink } from "@/lib/contact";
import { cn } from "@/lib/utils";

export function ContactButtons({
  product,
  variant = "icon",
  className,
}: {
  product: Product;
  variant?: "icon" | "full";
  className?: string;
}) {
  const { activeVehicle } = useStore();
  const message = () => productEnquiry(product, activeVehicle, productUrl(product.slug));

  if (variant === "icon") {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <a
          href={whatsappLink(message())}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Ask about ${product.name} on WhatsApp`}
          className="inline-flex size-9 items-center justify-center rounded-md border border-border text-whatsapp transition-colors hover:bg-whatsapp/10"
        >
          <MessageCircle className="size-4" aria-hidden="true" />
        </a>
        <a
          href={telegramLink(message())}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Ask about ${product.name} on Telegram`}
          className="inline-flex size-9 items-center justify-center rounded-md border border-border text-telegram transition-colors hover:bg-telegram/10"
        >
          <Send className="size-4" aria-hidden="true" />
        </a>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      <a
        href={whatsappLink(message())}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-whatsapp/40 bg-whatsapp/10 text-sm font-semibold text-whatsapp transition-colors hover:bg-whatsapp/20"
      >
        <MessageCircle className="size-4" aria-hidden="true" /> WhatsApp
      </a>
      <a
        href={telegramLink(message())}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-telegram/40 bg-telegram/10 text-sm font-semibold text-telegram transition-colors hover:bg-telegram/20"
      >
        <Send className="size-4" aria-hidden="true" /> Telegram
      </a>
    </div>
  );
}
