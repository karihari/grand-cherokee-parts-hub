import type { L, T } from "@/lib/i18n";

export type OrderItem = { productId: string; name: string; price: number; qty: number };

export const ORDER_STATUSES = ["New", "Completed", "Cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

// The database keeps the English status; the site shows these labels.
export const ORDER_STATUS_LABELS: Record<OrderStatus, L> = {
  New: { ru: "Новый", en: "New" },
  Completed: { ru: "Выполнен", en: "Completed" },
  Cancelled: { ru: "Отменён", en: "Cancelled" },
};

export function orderStatusLabel(status: string, t: T) {
  const label = ORDER_STATUS_LABELS[status as OrderStatus];
  return label ? t(label) : status;
}
