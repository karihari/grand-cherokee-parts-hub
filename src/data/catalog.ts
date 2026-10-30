import brakes from "@/assets/part-brakes.jpg";
import engine from "@/assets/part-engine.jpg";
import suspension from "@/assets/part-suspension.jpg";
import lighting from "@/assets/part-lighting.jpg";
import filters from "@/assets/part-filters.jpg";
import electrical from "@/assets/part-electrical.jpg";
import body from "@/assets/part-body.jpg";
import wheels from "@/assets/part-wheels.jpg";
import interior from "@/assets/part-interior.jpg";
import { apiImageUrl } from "@/lib/api/client";
import type { L, Lang, T } from "@/lib/i18n";

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
    years: [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021],
    engines: ["3.0L EcoDiesel", "3.6L V6", "5.7L V8 HEMI", "6.4L V8 SRT", "6.2L Supercharged"],
  },
  {
    code: "WL",
    name: "Grand Cherokee WL",
    years: [2021, 2022, 2023, 2024, 2025, 2026],
    engines: ["3.6L V6", "5.7L V8 HEMI", "2.0L Turbo 4xe"],
  },
];

export const YEARS: number[] = Array.from(new Set(GENERATIONS.flatMap((g) => g.years))).sort(
  (a, b) => b - a,
);

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
  name: L;
  icon: string;
  image: string;
  blurb: L;
};

export const CATEGORIES: Category[] = [
  {
    slug: "engine",
    name: { ru: "Двигатель", en: "Engine" },
    icon: "Cog",
    image: engine,
    blurb: { ru: "Прокладки, ремни, насосы, опоры", en: "Gaskets, belts, pumps, mounts" },
  },
  {
    slug: "transmission",
    name: { ru: "Трансмиссия", en: "Transmission" },
    icon: "Settings2",
    image: engine,
    blurb: { ru: "Соленоиды, фильтры, опоры", en: "Solenoids, filters, mounts" },
  },
  {
    slug: "brakes",
    name: { ru: "Тормоза", en: "Brakes" },
    icon: "Disc3",
    image: brakes,
    blurb: { ru: "Колодки, диски, суппорты, датчики", en: "Pads, discs, calipers, sensors" },
  },
  {
    slug: "suspension",
    name: { ru: "Подвеска", en: "Suspension" },
    icon: "Waves",
    image: suspension,
    blurb: { ru: "Пневмостойки, рычаги, сайлентблоки", en: "Air struts, arms, bushings" },
  },
  {
    slug: "electrical",
    name: { ru: "Электрика", en: "Electrical" },
    icon: "Zap",
    image: electrical,
    blurb: { ru: "Датчики, блоки, аккумуляторы", en: "Sensors, modules, batteries" },
  },
  {
    slug: "body",
    name: { ru: "Кузов", en: "Body Parts" },
    icon: "CarFront",
    image: body,
    blurb: { ru: "Бамперы, крылья, решётки", en: "Bumpers, fenders, grilles" },
  },
  {
    slug: "bumpers",
    name: { ru: "Бамперы", en: "Bumpers" },
    icon: "RectangleHorizontal",
    image: body,
    blurb: {
      ru: "Бамперы, усилители, решётки, накладки",
      en: "Bumpers, reinforcements, grilles, trims",
    },
  },
  {
    slug: "glass",
    name: { ru: "Стёкла", en: "Glass" },
    icon: "PanelTop",
    image: body,
    blurb: { ru: "Лобовые, боковые и задние стёкла", en: "Windshields, side and rear glass" },
  },
  {
    slug: "interior",
    name: { ru: "Салон", en: "Interior" },
    icon: "Armchair",
    image: interior,
    blurb: { ru: "Отделка, консоли, коврики", en: "Trim, consoles, mats" },
  },
  {
    slug: "exterior",
    name: { ru: "Экстерьер", en: "Exterior" },
    icon: "Shield",
    image: body,
    blurb: { ru: "Пороги, рейлинги, молдинги", en: "Steps, racks, mouldings" },
  },
  {
    slug: "lighting",
    name: { ru: "Освещение", en: "Lighting" },
    icon: "Lightbulb",
    image: lighting,
    blurb: { ru: "Фары, фонари, светодиоды", en: "Headlights, tails, LEDs" },
  },
  {
    slug: "cooling",
    name: { ru: "Охлаждение", en: "Cooling" },
    icon: "Snowflake",
    image: engine,
    blurb: { ru: "Радиаторы, вентиляторы, патрубки", en: "Radiators, fans, hoses" },
  },
  {
    slug: "exhaust",
    name: { ru: "Выхлоп", en: "Exhaust" },
    icon: "Wind",
    image: engine,
    blurb: { ru: "Глушители, датчики, трубы", en: "Mufflers, sensors, pipes" },
  },
  {
    slug: "steering",
    name: { ru: "Рулевое", en: "Steering" },
    icon: "Navigation",
    image: suspension,
    blurb: { ru: "Рейки, тяги, насосы", en: "Racks, tie rods, pumps" },
  },
  {
    slug: "filters",
    name: { ru: "Фильтры", en: "Filters" },
    icon: "Filter",
    image: filters,
    blurb: { ru: "Масляные, воздушные, салонные, топливные", en: "Oil, air, cabin, fuel" },
  },
  {
    slug: "wheels",
    name: { ru: "Колёса и шины", en: "Wheels & Tyres" },
    icon: "CircleDot",
    image: wheels,
    blurb: { ru: "Диски, датчики давления, шины", en: "Rims, TPMS, tyres" },
  },
  {
    slug: "accessories",
    name: { ru: "Аксессуары", en: "Accessories" },
    icon: "Package",
    image: interior,
    blurb: { ru: "Чехлы, багажники, коврики", en: "Covers, carriers, mats" },
  },
];

export type Fitment = { gen: "WK" | "WK2" | "WL"; from: number; to: number; engines?: string[] };

export type Product = {
  id: string;
  slug: string;
  name: string;
  nameEn?: string;
  category: string;
  brand: string;
  partNumber: string;
  price: number;
  oldPrice?: number;
  stock: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  descriptionEn?: string;
  fits: Fitment[];
  featured?: boolean;
};

// Product text in the visitor's language, falling back to the Russian text.
export function productName(p: Product, lang: Lang) {
  return (lang === "en" && p.nameEn) || p.name;
}

export function productDescription(p: Product, lang: Lang) {
  return (lang === "en" && p.descriptionEn) || p.description;
}

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

// Product images are stored as a key of PRODUCT_IMAGES, an uploaded "/images/<id>"
// (served by the API) or a full URL.
export function productImageUrl(image: string) {
  return PRODUCT_IMAGES[image] ?? apiImageUrl(image);
}

export function categoryName(slug: string, t: T) {
  const category = CATEGORIES.find((c) => c.slug === slug);
  return category ? t(category.name) : slug;
}

export function brandsOf(products: Product[]) {
  return Array.from(new Set(products.map((x) => x.brand))).sort();
}

export function formatAMD(value: number) {
  return `֏${value.toLocaleString("ru-RU")}`;
}

// A price of 0 means the shop has not set one yet: the part can go in the cart but cannot be ordered.
export function hasPrice(p: { price: number }) {
  return p.price > 0;
}

export function priceLabel(price: number, t: T) {
  return price > 0 ? formatAMD(price) : t("Цена по запросу", "Price on request");
}

export function fitmentLabel(f: Fitment) {
  const range = f.from === f.to ? `${f.from}` : `${f.from}–${f.to}`;
  return `Grand Cherokee ${f.gen} ${range}${f.engines ? ` · ${f.engines.join(", ")}` : ""}`;
}
