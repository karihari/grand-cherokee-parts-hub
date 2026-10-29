import { boolean, integer, jsonb, pgTable, real, text, timestamp } from "drizzle-orm/pg-core";
import type { Fitment } from "../data/catalog";
import { ORDER_STATUSES, type OrderItem } from "../data/orders.ts";

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  // English name and description; empty means English visitors see the Russian text.
  nameEn: text("name_en").notNull().default(""),
  category: text("category").notNull(),
  brand: text("brand").notNull(),
  partNumber: text("part_number").notNull(),
  // Whole drams; the shop has a single currency (AMD).
  price: integer("price").notNull(),
  oldPrice: integer("old_price"),
  stock: integer("stock").notNull().default(0),
  rating: real("rating").notNull().default(0),
  reviews: integer("reviews").notNull().default(0),
  // A key of PRODUCT_IMAGES or a full image URL.
  image: text("image").notNull(),
  description: text("description").notNull(),
  descriptionEn: text("description_en").notNull().default(""),
  fits: jsonb("fits").$type<Fitment[]>().notNull().default([]),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ProductRow = typeof products.$inferSelect;

// Photos the Admin uploads from their computer, served at /images/<id>.
export const productImages = pgTable("product_images", {
  id: text("id").primaryKey(),
  contentType: text("content_type").notNull(),
  // Base64 of the image bytes; photos are resized in the browser before upload.
  data: text("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  // There is no delivery: the customer pays when they pick the order up.
  payment: text("payment", { enum: ["card", "cash"] }).notNull(),
  // Name and price are copied at order time so later Product edits do not change the order.
  items: jsonb("items").$type<OrderItem[]>().notNull(),
  // Whole drams.
  total: integer("total").notNull(),
  status: text("status", { enum: ORDER_STATUSES }).notNull().default("New"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type OrderRow = typeof orders.$inferSelect;

export const ENQUIRY_STATUSES = ["New", "Resolved"] as const;

// Messages sent from the contact form; the Admin reads them on the Messages page.
export const enquiries = pgTable("enquiries", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  part: text("part").notNull().default(""),
  message: text("message").notNull().default(""),
  vehicle: text("vehicle").notNull().default(""),
  status: text("status", { enum: ENQUIRY_STATUSES }).notNull().default("New"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
