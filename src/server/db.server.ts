import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type Db = ReturnType<typeof createDb>;

function createDb(url: string) {
  return drizzle(neon(url), { schema });
}

let db: Db | undefined;

// Returns null when DATABASE_URL is not set, so callers can fall back to seed data.
export function getDb(): Db | null {
  const url = process.env["DATABASE_URL"];
  if (!url) return null;
  db ??= createDb(url);
  return db;
}
