import { createServerFn } from "@tanstack/react-start";
import { and, eq, like, ne, or } from "drizzle-orm";
import { z } from "zod";
import { CATEGORIES, type Fitment } from "@/data/catalog";
import { requireAdmin } from "@/server/auth.server";
import { getDb } from "@/server/db.server";
import { productImages, products } from "@/server/schema";

const fitmentSchema = z
  .object({
    gen: z.enum(["WK", "WK2", "WL"]),
    from: z.number().int().min(2005).max(2030),
    to: z.number().int().min(2005).max(2030),
    engines: z.array(z.string().min(1).max(60)).max(10).optional(),
  })
  .refine((f) => f.from <= f.to, { message: "Year from must be before year to" });

export const productInputSchema = z
  .object({
    id: z.string().max(40).optional(),
    name: z.string().trim().min(2).max(160),
    category: z.enum(CATEGORIES.map((c) => c.slug) as [string, ...string[]]),
    brand: z.string().trim().min(1).max(80),
    partNumber: z.string().trim().min(1).max(80),
    price: z.number().int().min(0).max(100_000_000),
    oldPrice: z.number().int().min(0).max(100_000_000).nullable(),
    stock: z.number().int().min(0).max(100_000),
    image: z.string().trim().min(1).max(500),
    description: z.string().trim().max(4000),
    fits: z.array(fitmentSchema).max(20),
    featured: z.boolean(),
  })
  .refine((p) => p.oldPrice == null || p.oldPrice > p.price, {
    message: "Old Price must be higher than Price",
    path: ["oldPrice"],
  });

export type ProductInput = z.infer<typeof productInputSchema>;

function dbOrThrow() {
  const db = getDb();
  if (!db) throw new Error("The database is not configured (DATABASE_URL is missing).");
  return db;
}

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "product"
  );
}

function newId() {
  return `GC-${crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export const saveProduct = createServerFn({ method: "POST" })
  .validator((data: unknown) => productInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = dbOrThrow();
    const id = data.id ?? newId();

    // Keep the slug unique: "front-grille", "front-grille-2", ...
    const base = slugify(data.name);
    const taken = await db
      .select({ slug: products.slug })
      .from(products)
      .where(
        and(or(eq(products.slug, base), like(products.slug, `${base}-%`)), ne(products.id, id)),
      );
    const takenSet = new Set(taken.map((t) => t.slug));
    let slug = base;
    for (let n = 2; takenSet.has(slug); n++) slug = `${base}-${n}`;

    const { id: _ignored, ...fields } = data;
    const values = {
      ...fields,
      slug,
      fits: data.fits.map((f): Fitment => {
        const fit: Fitment = { gen: f.gen, from: f.from, to: f.to };
        if (f.engines?.length) fit.engines = f.engines;
        return fit;
      }),
      updatedAt: new Date(),
    };

    if (data.id) {
      const [row] = await db
        .update(products)
        .set(values)
        .where(eq(products.id, data.id))
        .returning({ id: products.id, slug: products.slug });
      if (!row) throw new Error("This Product no longer exists.");
      return row;
    }
    const [row] = await db
      .insert(products)
      .values({ ...values, id })
      .returning({ id: products.id, slug: products.slug });
    return row!;
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: z.string().min(1).max(40) }).parse(data))
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = dbOrThrow();
    await db.delete(products).where(eq(products.id, data.id));
    return { ok: true as const };
  });

// Accepts a data URL ("data:image/jpeg;base64,...") and returns the URL to store on the Product.
export const uploadProductImage = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        dataUrl: z
          .string()
          .max(4_000_000)
          .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = dbOrThrow();
    const [, contentType, base64] = /^data:([^;]+);base64,(.*)$/.exec(data.dataUrl)!;
    const id = crypto.randomUUID().replace(/-/g, "");
    await db.insert(productImages).values({ id, contentType: contentType!, data: base64! });
    return { url: `/images/${id}` };
  });
