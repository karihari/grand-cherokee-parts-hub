import { productImageUrl, type Fitment, type Product } from "@/data/catalog";
import type { OrderItem, OrderStatus } from "@/data/orders";
import { api } from "./client";

export type Paginated<T> = {
  data: T[];
  meta: { page: number; perPage: number; total: number; totalPages: number };
};

// The API returns null for "no old price"; the shop's Product type uses a missing field.
type ApiProduct = Omit<Product, "oldPrice" | "featured"> & {
  oldPrice: number | null;
  featured: boolean;
  fits: Fitment[];
};

export function toProduct(p: ApiProduct): Product {
  const { oldPrice, featured, ...rest } = p;
  const product: Product = { ...rest, image: productImageUrl(rest.image) };
  if (oldPrice != null) product.oldPrice = oldPrice;
  if (featured) product.featured = true;
  return product;
}

const PAGE_SIZE = 200;

// The storefront filters on the client, so it loads the whole catalogue.
export async function fetchAllProducts(): Promise<Product[]> {
  const all: ApiProduct[] = [];
  for (let page = 1; ; page++) {
    const res = await api<Paginated<ApiProduct>>("/products", {
      query: { page, perPage: PAGE_SIZE },
    });
    all.push(...res.data);
    if (page >= res.meta.totalPages) break;
  }
  return all.map(toProduct);
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    return toProduct(await api<ApiProduct>(`/products/${encodeURIComponent(slug)}`));
  } catch (error) {
    if ((error as { status?: number }).status === 404) return null;
    throw error;
  }
}

export type PlaceOrderInput = {
  name: string;
  phone: string;
  email: string;
  payment: "card" | "cash";
  items: { productId: string; qty: number }[];
};

export type PlacedOrder = {
  id: string;
  total: number;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string;
};

export const placeOrder = (input: PlaceOrderInput) =>
  api<PlacedOrder>("/orders", { method: "POST", body: input });

export const getOrderStatuses = (ids: string[]) =>
  api<{ id: string; status: OrderStatus }[]>("/orders/statuses", { method: "POST", body: { ids } });

export type EnquiryInput = {
  name: string;
  phone: string;
  email: string;
  part?: string;
  message?: string;
  vehicle?: string;
  // Spam trap; real visitors never fill it.
  website?: string;
};

export const sendEnquiry = (input: EnquiryInput) =>
  api<{ ok: true }>("/enquiries", { method: "POST", body: input });
