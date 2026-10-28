import { createServerFn } from "@tanstack/react-start";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { productImageUrl, type Product } from "@/data/catalog";
import { SEED_PRODUCTS } from "@/data/seed-products";
import { getDb } from "@/server/db.server";
import { products, type ProductRow } from "@/server/schema";

function toProduct(row: ProductRow | Product): Product {
  const product: Product = {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    brand: row.brand,
    partNumber: row.partNumber,
    price: row.price,
    stock: row.stock,
    rating: row.rating,
    reviews: row.reviews,
    image: productImageUrl(row.image),
    description: row.description,
    fits: row.fits,
  };
  if (row.oldPrice != null) product.oldPrice = row.oldPrice;
  if (row.featured) product.featured = true;
  return product;
}

function seedFallback() {
  console.warn("DATABASE_URL is not set; serving seed Products.");
  return SEED_PRODUCTS.map(toProduct);
}

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const db = getDb();
  if (!db) return seedFallback();
  const rows = await db.select().from(products).orderBy(asc(products.id));
  return rows.map(toProduct);
});

export const getProductBySlug = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ slug: z.string().min(1).max(200) }).parse(data))
  .handler(async ({ data }) => {
    const db = getDb();
    if (!db) return seedFallback().find((p) => p.slug === data.slug) ?? null;
    const [row] = await db.select().from(products).where(eq(products.slug, data.slug)).limit(1);
    return row ? toProduct(row) : null;
  });
