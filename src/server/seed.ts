// Copies SEED_PRODUCTS into the database. Existing Products with the same id are
// left untouched, so running it twice never overwrites what the Admin changed.
// Run with: npm run db:seed
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { SEED_PRODUCTS } from "../data/seed-products.ts";
import { products } from "./schema.ts";

const url = process.env["DATABASE_URL"];
if (!url) {
  console.error("DATABASE_URL is not set. Add it to .env.local first.");
  process.exit(1);
}

const db = drizzle(neon(url));

const inserted = await db
  .insert(products)
  .values(
    SEED_PRODUCTS.map((p) => ({
      ...p,
      oldPrice: p.oldPrice ?? null,
      featured: p.featured ?? false,
    })),
  )
  .onConflictDoNothing({ target: products.id })
  .returning({ id: products.id });

console.log(`Seeded ${inserted.length} of ${SEED_PRODUCTS.length} Products.`);
