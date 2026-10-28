import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { getDb } from "@/server/db.server";
import { productImages } from "@/server/schema";

// Serves photos uploaded in the Admin product form.
export const Route = createFileRoute("/images/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const db = getDb();
        if (!db) return new Response("Not found", { status: 404 });
        const [row] = await db
          .select()
          .from(productImages)
          .where(eq(productImages.id, params.id))
          .limit(1);
        if (!row) return new Response("Not found", { status: 404 });
        const bytes = Uint8Array.from(atob(row.data), (c) => c.charCodeAt(0));
        return new Response(bytes, {
          headers: {
            "content-type": row.contentType,
            // An id is never reused, so the photo can be cached for good.
            "cache-control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
