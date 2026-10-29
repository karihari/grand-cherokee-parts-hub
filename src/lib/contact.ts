import { priceLabel, productName, type Product } from "@/data/catalog";
import { vehicleLabel, type Vehicle } from "@/lib/store";
import { tr, type Lang } from "@/lib/i18n";

export const WHATSAPP_NUMBER = "37455050602";
export const TELEGRAM_USERNAME = "gcparts_support_bot";
export const PHONE_DISPLAY = "+374 55 050 602";

export function productEnquiry(
  lang: Lang,
  product: Product,
  vehicle: Vehicle | null,
  url?: string,
) {
  const t = tr(lang);
  const lines = [
    t(
      "Здравствуйте, меня интересует эта запчасть для Grand Cherokee.",
      "Hello, I am interested in this Grand Cherokee part.",
    ),
    "",
    `${t("Товар", "Product")}: ${productName(product, lang)}`,
    `${t("ID товара", "Product ID")}: ${product.id}`,
    `${t("Артикул", "Part Number")}: ${product.partNumber}`,
    `${t("Цена", "Price")}: ${priceLabel(product.price, t)}`,
    `${t("Автомобиль", "Vehicle")}: ${vehicle ? vehicleLabel(vehicle) : t("ещё не выбран", "not selected yet")}`,
  ];
  if (url) lines.push(`${t("Ссылка", "Link")}: ${url}`);
  lines.push(
    "",
    t("Эта запчасть есть в наличии и подойдёт?", "Is this part available and compatible?"),
  );
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
