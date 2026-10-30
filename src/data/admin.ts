import type { L } from "@/lib/i18n";

export type AdminOrder = {
  id: string;
  customer: string;
  product: string;
  amount: number;
  payment: "Paid" | "Pending" | "Refunded";
  status:
    | "Pending"
    | "Confirmed"
    | "Processing"
    | "Shipped"
    | "Delivered"
    | "Cancelled"
    | "Returned"
    | "Refunded";
  date: string;
};

export const ADMIN_ORDERS: AdminOrder[] = [
  {
    id: "GC-482913",
    customer: "Karine H.",
    product: "Front Brake Disc Vented 350mm ×2",
    amount: 93000,
    payment: "Paid",
    status: "Delivered",
    date: "2026-08-12",
  },
  {
    id: "GC-482910",
    customer: "Arman P.",
    product: "Oil Filter Housing with Cooler",
    amount: 118000,
    payment: "Paid",
    status: "Shipped",
    date: "2026-08-12",
  },
  {
    id: "GC-482905",
    customer: "David S.",
    product: "Quadra-Lift Air Suspension Strut",
    amount: 245000,
    payment: "Pending",
    status: "Pending",
    date: "2026-08-11",
  },
  {
    id: "GC-482899",
    customer: "Nare G.",
    product: "LED Headlight Assembly — Left",
    amount: 312000,
    payment: "Paid",
    status: "Processing",
    date: "2026-08-11",
  },
  {
    id: "GC-482884",
    customer: "Tigran M.",
    product: "Cabin Air Filter ×3",
    amount: 23400,
    payment: "Paid",
    status: "Delivered",
    date: "2026-08-10",
  },
  {
    id: "GC-482870",
    customer: "Sona A.",
    product: "Front Grille with Chrome Inserts",
    amount: 129000,
    payment: "Refunded",
    status: "Returned",
    date: "2026-08-09",
  },
  {
    id: "GC-482861",
    customer: "Hayk V.",
    product: "Ignition Coil Pack (Set of 6)",
    amount: 96500,
    payment: "Paid",
    status: "Confirmed",
    date: "2026-08-09",
  },
  {
    id: "GC-482842",
    customer: "Lilit K.",
    product: "All-Weather Rubber Floor Mat Set",
    amount: 48900,
    payment: "Paid",
    status: "Delivered",
    date: "2026-08-08",
  },
];

export type AdminCustomer = {
  name: string;
  phone: string;
  email: string;
  orders: number;
  spent: number;
  joined: string;
  status: "Active" | "Blocked";
};

export const ADMIN_CUSTOMERS: AdminCustomer[] = [
  {
    name: "Karine H.",
    phone: "+374 55 050 602",
    email: "karine@example.com",
    orders: 7,
    spent: 512000,
    joined: "2024-03-11",
    status: "Active",
  },
  {
    name: "Arman P.",
    phone: "+374 91 224 118",
    email: "arman@example.com",
    orders: 3,
    spent: 264500,
    joined: "2025-01-04",
    status: "Active",
  },
  {
    name: "David S.",
    phone: "+374 77 908 442",
    email: "david@example.com",
    orders: 2,
    spent: 388000,
    joined: "2025-06-19",
    status: "Active",
  },
  {
    name: "Nare G.",
    phone: "+374 93 551 730",
    email: "nare@example.com",
    orders: 5,
    spent: 741200,
    joined: "2024-11-02",
    status: "Active",
  },
  {
    name: "Sona A.",
    phone: "+374 98 310 655",
    email: "sona@example.com",
    orders: 1,
    spent: 129000,
    joined: "2026-02-27",
    status: "Blocked",
  },
];

export type AdminSeller = {
  name: string;
  products: number;
  rating: number;
  sales: number;
  status: "Approved" | "Pending";
};

export const ADMIN_SELLERS: AdminSeller[] = [
  { name: "Mopar Direct", products: 11, rating: 4.8, sales: 1_842_000, status: "Approved" },
  { name: "TrailLine Parts", products: 8, rating: 4.9, sales: 1_204_500, status: "Approved" },
  { name: "OffRoad Depot", products: 7, rating: 4.6, sales: 903_000, status: "Approved" },
  { name: "AirRide Garage", products: 4, rating: 4.9, sales: 762_500, status: "Approved" },
  { name: "Cherokee Salvage", products: 5, rating: 4.5, sales: 418_900, status: "Pending" },
];

export type AdminReview = {
  customer: string;
  product: string;
  rating: number;
  text: L;
  date: string;
  status: "Published" | "Pending" | "Hidden";
};

export const ADMIN_REVIEWS: AdminReview[] = [
  {
    customer: "Hayk V.",
    product: "Ignition Coil Pack (Set of 6)",
    rating: 5,
    text: {
      ru: "Пропуски зажигания исчезли, установил за 40 минут.",
      en: "Misfire gone, fitted in 40 minutes.",
    },
    date: "2026-08-10",
    status: "Published",
  },
  {
    customer: "Sona A.",
    product: "Front Grille with Chrome Inserts",
    rating: 3,
    text: { ru: "Хорошая деталь, но не хватало клипс.", en: "Good part but clips were missing." },
    date: "2026-08-08",
    status: "Pending",
  },
  {
    customer: "Lilit K.",
    product: "All-Weather Rubber Floor Mat Set",
    rating: 5,
    text: { ru: "Идеально подошло на WK2 2019.", en: "Perfect fit for a 2019 WK2." },
    date: "2026-08-06",
    status: "Published",
  },
];

export type AdminPromotion = {
  name: L;
  discount: string;
  start: string;
  end: string;
  scope: L;
  status: "Active" | "Scheduled" | "Ended";
};

export const ADMIN_PROMOTIONS: AdminPromotion[] = [
  {
    name: { ru: "Неделя тормозов", en: "Brake Week" },
    discount: "-12%",
    start: "2026-08-10",
    end: "2026-08-20",
    scope: { ru: "Категория «Тормоза»", en: "Brakes category" },
    status: "Active",
  },
  {
    name: { ru: "Комплект подвески WK2", en: "WK2 Suspension Bundle" },
    discount: "-8%",
    start: "2026-08-25",
    end: "2026-09-10",
    scope: { ru: "Категория «Подвеска»", en: "Suspension category" },
    status: "Scheduled",
  },
  {
    name: { ru: "Летние фильтры", en: "Summer Filters" },
    discount: "-15%",
    start: "2026-06-01",
    end: "2026-07-15",
    scope: { ru: "Категория «Фильтры»", en: "Filters category" },
    status: "Ended",
  },
];

export const SALES_SERIES = [
  { day: { ru: "Пн", en: "Mon" }, sales: 412000, orders: 9 },
  { day: { ru: "Вт", en: "Tue" }, sales: 528000, orders: 12 },
  { day: { ru: "Ср", en: "Wed" }, sales: 386000, orders: 8 },
  { day: { ru: "Чт", en: "Thu" }, sales: 641000, orders: 15 },
  { day: { ru: "Пт", en: "Fri" }, sales: 712000, orders: 17 },
  { day: { ru: "Сб", en: "Sat" }, sales: 845000, orders: 21 },
  { day: { ru: "Вс", en: "Sun" }, sales: 498000, orders: 11 },
];

export const ROLES = [
  {
    role: { ru: "Главный администратор", en: "Super Admin" },
    people: 1,
    permissions: {
      ru: "Полный доступ, включая настройки, роли и выплаты",
      en: "Full access including settings, roles and payouts",
    },
  },
  {
    role: { ru: "Администратор", en: "Admin" },
    people: 2,
    permissions: {
      ru: "Всё, кроме ролей, безопасности и выплат",
      en: "Everything except roles, security and payouts",
    },
  },
  {
    role: { ru: "Менеджер товаров", en: "Product Manager" },
    people: 3,
    permissions: {
      ru: "Товары, категории, склад, совместимость",
      en: "Products, categories, inventory, compatibility",
    },
  },
  {
    role: { ru: "Менеджер заказов", en: "Order Manager" },
    people: 2,
    permissions: { ru: "Заказы, возвраты, возмещения", en: "Orders, returns, refunds" },
  },
  {
    role: { ru: "Поддержка", en: "Support" },
    people: 4,
    permissions: {
      ru: "Сообщения, отзывы, профили клиентов (только чтение)",
      en: "Messages, reviews, customer profiles (read only)",
    },
  },
];
