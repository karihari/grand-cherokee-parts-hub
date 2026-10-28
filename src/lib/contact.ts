import { formatAMD, type Product } from "@/data/catalog";
import { vehicleLabel, type Vehicle } from "@/lib/store";

export const WHATSAPP_NUMBER = "37455050602";
export const TELEGRAM_USERNAME = "gcparts_support_bot";
export const PHONE_DISPLAY = "+374 55 050 602";

export function productEnquiry(product: Product, vehicle: Vehicle | null, url?: string) {
  const lines = [
    "Hello, I am interested in this Grand Cherokee part.",
    "",
    `Product: ${product.name}`,
    `Product ID: ${product.id}`,
    `Part Number: ${product.partNumber}`,
    `Price: ${formatAMD(product.price)}`,
    `Vehicle: ${vehicle ? vehicleLabel(vehicle) : "not selected yet"}`,
  ];
  if (url) lines.push(`Link: ${url}`);
  lines.push("", "Is this part available and compatible?");
  return lines.join("\n");
}

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// Telegram bots ignore a prefilled ?text=, so the link just opens the bot chat.
export function telegramLink() {
  return `https://t.me/${TELEGRAM_USERNAME}`;
}

export function productUrl(slug: string) {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/product/${slug}`;
}
