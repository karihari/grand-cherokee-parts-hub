import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, gte, inArray, ne, sql } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/server/auth.server";
import { getDb } from "@/server/db.server";
import { ORDER_STATUSES, type OrderItem } from "@/data/orders";
import { orders, products } from "@/server/schema";
import { getLang, tr } from "@/lib/i18n";

const serverT = () => tr(getLang());

const placeOrderSchema = z.object({
  name: z.string().trim().min(2).max(120),
  // "+374 98281116": dial code, a space, then the local number.
  phone: z
    .string()
    .trim()
    .refine(
      (v) => /^\+\d{1,4} \d{5,14}$/.test(v),
      () => ({
        message: serverT()("Введите корректный номер телефона", "Enter a valid phone number"),
      }),
    ),
  email: z.string().trim().email().max(200),
  payment: z.enum(["card", "cash"]),
  items: z
    .array(
      z.object({ productId: z.string().min(1).max(40), qty: z.number().int().min(1).max(100) }),
    )
    .min(1)
    .max(50),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

function dbOrThrow() {
  const db = getDb();
  if (!db)
    throw new Error(
      serverT()(
        "Заказы сейчас недоступны. Напишите нам в WhatsApp.",
        "Orders are unavailable right now. Please message us on WhatsApp.",
      ),
    );
  return db;
}

function newOrderId() {
  return `ORD-${crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;
}

async function changeStock(items: { productId: string; qty: number }[], sign: 1 | -1) {
  const db = dbOrThrow();
  for (const item of items) {
    await db
      .update(products)
      .set({ stock: sql`${products.stock} + ${sign * item.qty}` })
      .where(eq(products.id, item.productId));
  }
}

export const placeOrder = createServerFn({ method: "POST" })
  .validator((data: unknown) => placeOrderSchema.parse(data))
  .handler(async ({ data }) => {
    const db = dbOrThrow();

    // Merge repeated lines so stock is checked against the full quantity.
    const qtyById = new Map<string, number>();
    for (const i of data.items) qtyById.set(i.productId, (qtyById.get(i.productId) ?? 0) + i.qty);

    // Prices come from the database, never from the browser.
    const rows = await db
      .select()
      .from(products)
      .where(inArray(products.id, [...qtyById.keys()]));
    const items: OrderItem[] = [];
    for (const [productId, qty] of qtyById) {
      const row = rows.find((r) => r.id === productId);
      if (!row)
        return {
          ok: false as const,
          error: serverT()(
            "Одна из запчастей в корзине больше не продаётся. Удалите её.",
            "A part in your cart is no longer for sale. Please remove it.",
          ),
        };
      // A price of 0 means the shop has not set one yet.
      if (row.price <= 0)
        return {
          ok: false as const,
          error: serverT()(
            `У запчасти «${row.name}» ещё нет цены. Напишите нам или удалите её из корзины.`,
            `"${row.nameEn || row.name}" does not have a price yet. Message us or remove it from your cart.`,
          ),
        };
      items.push({ productId, name: row.name, price: row.price, qty });
    }

    // Reserve stock one Product at a time; undo what was reserved if any part has run out.
    const reserved: OrderItem[] = [];
    for (const item of items) {
      const [ok] = await db
        .update(products)
        .set({ stock: sql`${products.stock} - ${item.qty}` })
        .where(and(eq(products.id, item.productId), gte(products.stock, item.qty)))
        .returning({ id: products.id });
      if (!ok) {
        await changeStock(reserved, 1);
        return {
          ok: false as const,
          error: serverT()(
            `Недостаточно товара «${item.name}» на складе. Уменьшите количество.`,
            `Not enough stock for "${item.name}". Please lower the quantity.`,
          ),
        };
      }
      reserved.push(item);
    }

    const id = newOrderId();
    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    try {
      await db.insert(orders).values({
        id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        payment: data.payment,
        items,
        total,
      });
    } catch (error) {
      await changeStock(reserved, 1);
      throw error;
    }

    await notifyShop({ id, ...data, items, total });
    return { ok: true as const, id, total, items, createdAt: new Date().toISOString() };
  });

// Sends the new order to the Make webhook, if one is set, so the shop gets a message.
// The order is already saved, so a failure here is only logged.
async function notifyShop(order: {
  id: string;
  name: string;
  phone: string;
  email: string;
  payment: string;
  items: OrderItem[];
  total: number;
}) {
  const url = process.env["MAKE_WEBHOOK_URL"];
  if (!url) return;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        source: "gcparts-order",
        submittedAt: new Date().toISOString(),
        ...order,
      }),
    });
    if (!res.ok) console.error(`Make webhook responded ${res.status}`);
  } catch (error) {
    console.error(error);
  }
}

// The customer's own orders, looked up by the ids saved in their browser.
// Contact details are left out on purpose.
export const getOrderStatuses = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ ids: z.array(z.string().min(1).max(40)).max(100) }).parse(data),
  )
  .handler(async ({ data }) => {
    const db = getDb();
    if (!db || data.ids.length === 0) return [];
    return db
      .select({ id: orders.id, status: orders.status })
      .from(orders)
      .where(inArray(orders.id, data.ids));
  });

export const listOrders = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const db = getDb();
  if (!db) return [];
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
  return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
});

export const setOrderStatus = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ id: z.string().min(1).max(40), status: z.enum(ORDER_STATUSES) }).parse(data),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = dbOrThrow();
    const [order] = await db.select().from(orders).where(eq(orders.id, data.id)).limit(1);
    if (!order)
      throw new Error(
        serverT()("Этот заказ больше не существует.", "This order no longer exists."),
      );
    if (order.status === "Cancelled")
      throw new Error(
        serverT()("Отменённый заказ нельзя изменить.", "A cancelled order cannot be changed."),
      );
    if (order.status === data.status) return { ok: true as const };

    // The status guard stops two clicks on "Cancelled" from restocking twice.
    const [updated] = await db
      .update(orders)
      .set({ status: data.status })
      .where(and(eq(orders.id, data.id), ne(orders.status, "Cancelled")))
      .returning({ id: orders.id });
    // Cancelling puts the parts back on the shelf.
    if (updated && data.status === "Cancelled") await changeStock(order.items, 1);
    return { ok: true as const };
  });
