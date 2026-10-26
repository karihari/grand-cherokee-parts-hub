import { boolean, integer, jsonb, pgTable, real, text, timestamp } from "drizzle-orm/pg-core";
import type { Fitment } from "../data/catalog";

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  brand: text("brand").notNull(),
  partNumber: text("part_number").notNull(),
  oemNumber: text("oem_number").notNull(),
  // Whole drams; the shop has a single currency (AMD).
  price: integer("price").notNull(),
  oldPrice: integer("old_price"),
  condition: text("condition", { enum: ["New", "Used"] }).notNull(),
  origin: text("origin", { enum: ["OEM", "Aftermarket"] }).notNull(),
  stock: integer("stock").notNull().default(0),
  rating: real("rating").notNull().default(0),
  reviews: integer("reviews").notNull().default(0),
  seller: text("seller").notNull(),
  sellerRating: real("seller_rating").notNull().default(0),
  delivery: text("delivery").notNull(),
  warranty: text("warranty").notNull(),
  // A key of PRODUCT_IMAGES or a full image URL.
  image: text("image").notNull(),
  description: text("description").notNull(),
  fits: jsonb("fits").$type<Fitment[]>().notNull().default([]),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ProductRow = typeof products.$inferSelect;
