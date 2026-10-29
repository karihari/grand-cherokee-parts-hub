import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/server/auth.server";
import { getDb } from "@/server/db.server";
import { ENQUIRY_STATUSES, enquiries } from "@/server/schema";

const enquirySchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(3).max(40),
  email: z.string().trim().email().max(200),
  part: z.string().trim().max(200).optional(),
  message: z.string().trim().max(4000).optional(),
  vehicle: z.string().trim().max(200).optional(),
});

export const sendEnquiry = createServerFn({ method: "POST" })
  .validator((data: unknown) => enquirySchema.parse(data))
  .handler(async ({ data }) => {
    const db = getDb();
    if (!db) return { ok: false as const };
    const id = `MSG-${crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;
    await db.insert(enquiries).values({
      id,
      name: data.name,
      phone: data.phone,
      email: data.email,
      part: data.part ?? "",
      message: data.message ?? "",
      vehicle: data.vehicle ?? "",
    });
    await notifyShop({ id, ...data });
    return { ok: true as const };
  });

// Also sends the message to the Make webhook, if one is set, so the shop gets a notification.
// The message is already saved, so a failure here is only logged.
async function notifyShop(enquiry: z.infer<typeof enquirySchema> & { id: string }) {
  const url = process.env["MAKE_WEBHOOK_URL"];
  if (!url) return;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        source: "gcparts-contact-form",
        submittedAt: new Date().toISOString(),
        ...enquiry,
      }),
    });
    if (!res.ok) console.error(`Make webhook responded ${res.status}`);
  } catch (error) {
    console.error(error);
  }
}

export const listEnquiries = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const db = getDb();
  if (!db) return [];
  const rows = await db.select().from(enquiries).orderBy(desc(enquiries.createdAt));
  return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
});

export const setEnquiryStatus = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ id: z.string().min(1).max(40), status: z.enum(ENQUIRY_STATUSES) }).parse(data),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = getDb();
    if (!db) throw new Error("Database unavailable");
    await db.update(enquiries).set({ status: data.status }).where(eq(enquiries.id, data.id));
    return { ok: true as const };
  });
