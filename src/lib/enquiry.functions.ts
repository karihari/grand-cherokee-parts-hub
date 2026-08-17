import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const enquirySchema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().min(3).max(40),
  email: z.string().email().max(200),
  part: z.string().max(200).optional(),
  message: z.string().max(4000).optional(),
  vehicle: z.string().max(200).optional(),
});

export const sendEnquiry = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => enquirySchema.parse(data))
  .handler(async ({ data }) => {
    const url = process.env["MAKE_WEBHOOK_URL"];
    if (!url) return { ok: false as const, error: "Webhook not configured" };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          source: "gcparts-contact-form",
          submittedAt: new Date().toISOString(),
          ...data,
        }),
      });
      if (!res.ok) {
        console.error(`Make webhook responded ${res.status}`);
        return { ok: false as const, error: "Delivery failed" };
      }
      return { ok: true as const };
    } catch (error) {
      console.error(error);
      return { ok: false as const, error: "Delivery failed" };
    }
  });
