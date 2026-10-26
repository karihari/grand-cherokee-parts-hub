import brakes from "@/assets/part-brakes.jpg";
import engine from "@/assets/part-engine.jpg";
import suspension from "@/assets/part-suspension.jpg";
import lighting from "@/assets/part-lighting.jpg";
import filters from "@/assets/part-filters.jpg";
import electrical from "@/assets/part-electrical.jpg";
import body from "@/assets/part-body.jpg";
import wheels from "@/assets/part-wheels.jpg";
import interior from "@/assets/part-interior.jpg";

export type Generation = {
  code: "WK" | "WK2" | "WL";
  name: string;
  years: number[];
  engines: string[];
};

export const GENERATIONS: Generation[] = [
  {
    code: "WK",
    name: "Grand Cherokee WK",
    years: [2005, 2006, 2007, 2008, 2009, 2010],
    engines: ["3.0L CRD Diesel", "3.7L V6", "4.7L V8", "5.7L V8 HEMI", "6.1L V8 SRT"],
  },
  {
    code: "WK2",
    name: "Grand Cherokee WK2",
    years: [
      2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021,
    ],
    engines: ["3.0L EcoDiesel", "3.6L V6", "5.7L V8 HEMI", "6.4L V8 SRT", "6.2L Supercharged"],
  },
  {
    code: "WL",
    name: "Grand Cherokee WL",
    years: [2021, 2022, 2023, 2024, 2025, 2026],
    engines: ["3.6L V6", "5.7L V8 HEMI", "2.0L Turbo 4xe"],
  },
];

export const YEARS: number[] = Array.from(
  new Set(GENERATIONS.flatMap((g) => g.years)),
).sort((a, b) => b - a);

export function generationsForYear(year: number) {
  return GENERATIONS.filter((g) => g.years.includes(year));
}

export function enginesFor(year: number, code: string) {
  const gen = GENERATIONS.find((g) => g.code === code);
  if (!gen) return [];
  if (code === "WL" && year <= 2021) return ["3.6L V6", "5.7L V8 HEMI"];
  if (code === "WK2" && year <= 2013) return gen.engines.filter((e) => e !== "6.4L V8 SRT");
  return gen.engines;
}

export type Category = {
  slug: string;
  name: string;
  icon: string;
  image: string;
  blurb: string;
};

export const CATEGORIES: Category[] = [
  { slug: "engine", name: "Engine", icon: "Cog", image: engine, blurb: "Gaskets, belts, pumps, mounts" },
  { slug: "transmission", name: "Transmission", icon: "Settings2", image: engine, blurb: "Solenoids, filters, mounts" },
  { slug: "brakes", name: "Brakes", icon: "Disc3", image: brakes, blurb: "Pads, discs, calipers, sensors" },
  { slug: "suspension", name: "Suspension", icon: "Waves", image: suspension, blurb: "Air struts, arms, bushings" },
  { slug: "electrical", name: "Electrical", icon: "Zap", image: electrical, blurb: "Sensors, modules, batteries" },
  { slug: "body", name: "Body Parts", icon: "CarFront", image: body, blurb: "Bumpers, fenders, grilles" },
  { slug: "interior", name: "Interior", icon: "Armchair", image: interior, blurb: "Trim, consoles, mats" },
  { slug: "exterior", name: "Exterior", icon: "Shield", image: body, blurb: "Steps, racks, mouldings" },
  { slug: "lighting", name: "Lighting", icon: "Lightbulb", image: lighting, blurb: "Headlights, tails, LEDs" },
  { slug: "cooling", name: "Cooling", icon: "Snowflake", image: engine, blurb: "Radiators, fans, hoses" },
  { slug: "exhaust", name: "Exhaust", icon: "Wind", image: engine, blurb: "Mufflers, sensors, pipes" },
  { slug: "steering", name: "Steering", icon: "Navigation", image: suspension, blurb: "Racks, tie rods, pumps" },
  { slug: "filters", name: "Filters", icon: "Filter", image: filters, blurb: "Oil, air, cabin, fuel" },
  { slug: "wheels", name: "Wheels & Tyres", icon: "CircleDot", image: wheels, blurb: "Rims, TPMS, tyres" },
  { slug: "accessories", name: "Accessories", icon: "Package", image: interior, blurb: "Covers, carriers, mats" },
];

export type Fitment = { gen: "WK" | "WK2" | "WL"; from: number; to: number; engines?: string[] };

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  brand: string;
  partNumber: string;
  oemNumber: string;
  price: number;
  oldPrice?: number;
  condition: "New" | "Used";
  origin: "OEM" | "Aftermarket";
  stock: number;
  rating: number;
  reviews: number;
  seller: string;
  sellerRating: number;
  delivery: string;
  warranty: string;
  image: string;
  description: string;
  fits: Fitment[];
  featured?: boolean;
};

export const PRODUCT_IMAGES: Record<string, string> = {
  brakes,
  engine,
  suspension,
  lighting,
  filters,
  electrical,
  body,
  wheels,
  interior,
};

// Product images are stored as a key of PRODUCT_IMAGES or as a full URL.
export function productImageUrl(image: string) {
  return PRODUCT_IMAGES[image] ?? image;
}

export function categoryName(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}

export function brandsOf(products: Product[]) {
  return Array.from(new Set(products.map((x) => x.brand))).sort();
}

export function sellersOf(products: Product[]) {
  return Array.from(new Set(products.map((x) => x.seller))).sort();
}

export function formatAMD(value: number) {
  return `֏${value.toLocaleString("en-US")}`;
}

export function fitmentLabel(f: Fitment) {
  const range = f.from === f.to ? `${f.from}` : `${f.from}–${f.to}`;
  return `Grand Cherokee ${f.gen} ${range}${f.engines ? ` · ${f.engines.join(", ")}` : ""}`;
}
