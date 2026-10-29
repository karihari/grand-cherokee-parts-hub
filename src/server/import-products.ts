// Replaces every Product with the rows of a CSV export
// (sku,title_ru,title_en,category_ru,category_en,quantity,position,price,currency,…,vehicle,vin,…).
// An empty price is imported as 0 for the Admin to fill in later.
// Without --apply it only prints what would be imported.
// Run with: node --env-file-if-exists=.env.local src/server/import-products.ts <file.csv> [--apply]
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { Fitment } from "../data/catalog";
import { products } from "./schema.ts";

const BODY = { slug: "body", image: "body" };
const ENGINE = { slug: "engine", image: "engine" };
const TRANSMISSION = { slug: "transmission", image: "engine" };
const SUSPENSION = { slug: "suspension", image: "suspension" };
const INTERIOR = { slug: "interior", image: "interior" };

const CATEGORY: Record<string, { slug: string; image: string }> = {
  "Body panels": BODY,
  "Front end structure": BODY,
  "Front bumper": { slug: "bumpers", image: "body" },
  "Rear bumper": { slug: "bumpers", image: "body" },
  Doors: BODY,
  "Liftgate (tailgate)": BODY,
  "Glass & mirrors": { slug: "glass", image: "body" },
  Lighting: { slug: "lighting", image: "lighting" },
  "Engine — 3.6L V6 Pentastar": ENGINE,
  "Ignition & engine sensors": ENGINE,
  "Fuel system": ENGINE,
  "Air intake": ENGINE,
  Exhaust: { slug: "exhaust", image: "engine" },
  "Cooling system": { slug: "cooling", image: "engine" },
  "Accessory drive": ENGINE,
  "Transmission — 8-speed automatic": TRANSMISSION,
  "4WD drivetrain": TRANSMISSION,
  "Front suspension": SUSPENSION,
  "Rear suspension": SUSPENSION,
  Steering: { slug: "steering", image: "suspension" },
  Brakes: { slug: "brakes", image: "brakes" },
  "Wheels & tires": { slug: "wheels", image: "wheels" },
  "Electrical & modules": { slug: "electrical", image: "electrical" },
  "Instrument panel & infotainment": INTERIOR,
  "HVAC (heating & A/C)": { slug: "cooling", image: "engine" },
  "Interior & seats": INTERIOR,
  "Safety / airbags": INTERIOR,
  "Underbody & frame": BODY,
};

// The position column, keyed by its English part ("L/R · Лев/Прав" → "L/R").
const POSITION: Record<string, { ru: string; en: string }> = {
  "L/R": { ru: "Сторона: левая и правая.", en: "Side: left and right." },
  "F/R": { ru: "Положение: спереди и сзади.", en: "Position: front and rear." },
  "FL/FR/RL/RR": {
    ru: "Положение: спереди и сзади, слева и справа.",
    en: "Position: front and rear, left and right.",
  },
  Set: { ru: "Продаётся комплектом.", en: "Sold as a set." },
};

// Notes meant for the shop, and set-price notes that would contradict the per-piece price.
const DROP = [
  /\s*Цена за пару\.?/g,
  /\s*Цена за \d+ шт\.?/g,
  /\s*Цена с пометкой \(\?\) — подтвердите\.?/g,
  /\s*Уточнить английское название\.?/g,
  /\s*Price for the pair\.?/g,
  /\s*Price for \d+ pcs\.?/g,
  /\s*Price marked \(\?\) — please confirm\.?/g,
  /\s*English name to confirm\.?/g,
  /\s*\(to confirm\)/g,
];

function clean(text: string) {
  return DROP.reduce((s, re) => s.replace(re, ""), text).trim();
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') ((cell += '"'), i++);
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") (row.push(cell), (cell = ""));
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      (row.push(cell), (cell = ""));
      if (row.some((v) => v !== "")) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((v) => v !== "")) rows.push(row);
  const [header, ...body] = rows;
  return body.map((r) =>
    Object.fromEntries(header!.map((h, i) => [h.trim(), (r[i] ?? "").trim()])),
  );
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// "2023 Jeep Grand Cherokee L Laredo 3.6L 4WD" → WL, 2023, 3.6L V6.
function fitsOf(vehicle: string): Fitment[] {
  const year = Number(vehicle.match(/\b(20\d\d)\b/)?.[1]);
  if (!year) throw new Error(`No model year in "${vehicle}"`);
  const gen: Fitment["gen"] = year >= 2022 ? "WL" : year >= 2011 ? "WK2" : "WK";
  const engines = /3\.6L/.test(vehicle)
    ? ["3.6L V6"]
    : /5\.7L/.test(vehicle)
      ? ["5.7L V8 HEMI"]
      : undefined;
  return [engines ? { gen, from: year, to: year, engines } : { gen, from: year, to: year }];
}

const [file, flag] = process.argv.slice(2);
if (!file) {
  console.error(
    "Usage: node --env-file-if-exists=.env.local src/server/import-products.ts <file.csv> [--apply]",
  );
  process.exit(1);
}

const rows = parseCsv(readFileSync(file, "utf8")).map((r) => {
  const category = CATEGORY[r["category_en"]!];
  if (!category) throw new Error(`${r["sku"]}: unknown category "${r["category_en"]}"`);
  if (r["price"] && r["currency"] !== "AMD") throw new Error(`${r["sku"]}: currency must be AMD`);
  const qty = Number(r["quantity"]);
  const price = Number(r["price"] || 0);
  if (!Number.isInteger(qty) || qty < 1 || !Number.isFinite(price))
    throw new Error(`${r["sku"]}: bad quantity or price`);
  const positionKey = (r["position"] ?? "").split(" · ")[0]!;
  const position = POSITION[positionKey];
  if (positionKey && !position) throw new Error(`${r["sku"]}: unknown position "${r["position"]}"`);
  const name = clean(r["title_ru"]!);
  const nameEn = clean(r["title_en"]!);
  const vehicle = r["vehicle"]!;
  const vin = r["vin"] ? ` VIN ${r["vin"]}.` : "";
  return {
    id: r["sku"]!,
    slug: `${slugify(nameEn)}-${r["sku"]!.toLowerCase()}`,
    name,
    nameEn,
    category: category.slug,
    brand: "Jeep",
    partNumber: r["sku"]!,
    // The list gives the price of one piece.
    price,
    stock: qty,
    image: category.image,
    description: `${name} для ${vehicle}.${vin} ${position?.ru ?? ""}`.trim(),
    descriptionEn: `${nameEn} for ${vehicle}.${vin} ${position?.en ?? ""}`.trim(),
    fits: fitsOf(vehicle),
  };
});

for (const p of rows) {
  console.log(
    `${p.id}  ${p.category.padEnd(10)} ${String(p.price).padStart(7)} ×${p.stock}  ${p.name} / ${p.nameEn}`,
  );
}

if (flag !== "--apply") {
  console.log(
    `\nDry run: ${rows.length} Products. Add --apply to replace all Products with these.`,
  );
  process.exit(0);
}

const url = process.env["DATABASE_URL"];
if (!url) {
  console.error("DATABASE_URL is not set. Add it to .env.local first.");
  process.exit(1);
}
const db = drizzle(neon(url));
// One transaction: if the insert fails, the old Products stay.
await db.batch([db.delete(products), db.insert(products).values(rows)]);
console.log(`\nReplaced all Products with ${rows.length} from ${file}.`);
