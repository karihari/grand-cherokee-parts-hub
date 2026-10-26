export type OrderItem = { productId: string; name: string; price: number; qty: number };

export const ORDER_STATUSES = ["New", "Ready for pickup", "Completed", "Cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
