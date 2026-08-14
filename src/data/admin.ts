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
  { id: "GC-482913", customer: "Karine H.", product: "Front Brake Disc Vented 350mm ×2", amount: 93000, payment: "Paid", status: "Delivered", date: "2026-08-12" },
  { id: "GC-482910", customer: "Arman P.", product: "Oil Filter Housing with Cooler", amount: 118000, payment: "Paid", status: "Shipped", date: "2026-08-12" },
  { id: "GC-482905", customer: "David S.", product: "Quadra-Lift Air Suspension Strut", amount: 245000, payment: "Pending", status: "Pending", date: "2026-08-11" },
  { id: "GC-482899", customer: "Nare G.", product: "LED Headlight Assembly — Left", amount: 312000, payment: "Paid", status: "Processing", date: "2026-08-11" },
  { id: "GC-482884", customer: "Tigran M.", product: "Cabin Air Filter ×3", amount: 23400, payment: "Paid", status: "Delivered", date: "2026-08-10" },
  { id: "GC-482870", customer: "Sona A.", product: "Front Grille with Chrome Inserts", amount: 129000, payment: "Refunded", status: "Returned", date: "2026-08-09" },
  { id: "GC-482861", customer: "Hayk V.", product: "Ignition Coil Pack (Set of 6)", amount: 96500, payment: "Paid", status: "Confirmed", date: "2026-08-09" },
  { id: "GC-482842", customer: "Lilit K.", product: "All-Weather Rubber Floor Mat Set", amount: 48900, payment: "Paid", status: "Delivered", date: "2026-08-08" },
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
  { name: "Karine H.", phone: "+374 55 050 602", email: "karine@example.com", orders: 7, spent: 512000, joined: "2024-03-11", status: "Active" },
  { name: "Arman P.", phone: "+374 91 224 118", email: "arman@example.com", orders: 3, spent: 264500, joined: "2025-01-04", status: "Active" },
  { name: "David S.", phone: "+374 77 908 442", email: "david@example.com", orders: 2, spent: 388000, joined: "2025-06-19", status: "Active" },
  { name: "Nare G.", phone: "+374 93 551 730", email: "nare@example.com", orders: 5, spent: 741200, joined: "2024-11-02", status: "Active" },
  { name: "Sona A.", phone: "+374 98 310 655", email: "sona@example.com", orders: 1, spent: 129000, joined: "2026-02-27", status: "Blocked" },
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

export type AdminMessage = {
  customer: string;
  product: string;
  channel: "WhatsApp" | "Telegram" | "Website";
  last: string;
  date: string;
  status: "New" | "Open" | "Waiting" | "Resolved";
};

export const ADMIN_MESSAGES: AdminMessage[] = [
  { customer: "Arman P.", product: "Oil Filter Housing with Cooler", channel: "WhatsApp", last: "Does this fit a 2016 WK2 3.6?", date: "10 min ago", status: "New" },
  { customer: "Nare G.", product: "LED Headlight Assembly — Left", channel: "Telegram", last: "Can you ship to Gyumri today?", date: "42 min ago", status: "Open" },
  { customer: "David S.", product: "Quadra-Lift Air Suspension Strut", channel: "WhatsApp", last: "Waiting for the invoice", date: "2 h ago", status: "Waiting" },
  { customer: "Tigran M.", product: "Cabin Air Filter — Activated Carbon", channel: "Website", last: "Thanks, received it", date: "Yesterday", status: "Resolved" },
];

export type AdminReview = {
  customer: string;
  product: string;
  rating: number;
  text: string;
  date: string;
  status: "Published" | "Pending" | "Hidden";
};

export const ADMIN_REVIEWS: AdminReview[] = [
  { customer: "Hayk V.", product: "Ignition Coil Pack (Set of 6)", rating: 5, text: "Misfire gone, fitted in 40 minutes.", date: "2026-08-10", status: "Published" },
  { customer: "Sona A.", product: "Front Grille with Chrome Inserts", rating: 3, text: "Good part but clips were missing.", date: "2026-08-08", status: "Pending" },
  { customer: "Lilit K.", product: "All-Weather Rubber Floor Mat Set", rating: 5, text: "Perfect fit for a 2019 WK2.", date: "2026-08-06", status: "Published" },
];

export type AdminPromotion = {
  name: string;
  discount: string;
  start: string;
  end: string;
  scope: string;
  status: "Active" | "Scheduled" | "Ended";
};

export const ADMIN_PROMOTIONS: AdminPromotion[] = [
  { name: "Brake Week", discount: "-12%", start: "2026-08-10", end: "2026-08-20", scope: "Brakes category", status: "Active" },
  { name: "WK2 Suspension Bundle", discount: "-8%", start: "2026-08-25", end: "2026-09-10", scope: "Suspension category", status: "Scheduled" },
  { name: "Summer Filters", discount: "-15%", start: "2026-06-01", end: "2026-07-15", scope: "Filters category", status: "Ended" },
];

export const SALES_SERIES = [
  { day: "Mon", sales: 412000, orders: 9 },
  { day: "Tue", sales: 528000, orders: 12 },
  { day: "Wed", sales: 386000, orders: 8 },
  { day: "Thu", sales: 641000, orders: 15 },
  { day: "Fri", sales: 712000, orders: 17 },
  { day: "Sat", sales: 845000, orders: 21 },
  { day: "Sun", sales: 498000, orders: 11 },
];

export const ROLES = [
  { role: "Super Admin", people: 1, permissions: "Full access including settings, roles and payouts" },
  { role: "Admin", people: 2, permissions: "Everything except roles, security and payouts" },
  { role: "Product Manager", people: 3, permissions: "Products, categories, inventory, compatibility" },
  { role: "Order Manager", people: 2, permissions: "Orders, returns, refunds, shipping" },
  { role: "Support", people: 4, permissions: "Messages, reviews, customer profiles (read only)" },
];
