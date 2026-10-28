import type { Fitment } from "@/data/catalog";
import type { OrderItem, OrderStatus } from "@/data/orders";
import { api } from "./client";
import type { Paginated } from "./shop";

// ---- Auth ----

export type AdminRole = "admin" | "staff";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  lastLoginAt: string | null;
};

export type AuthSession = {
  id: string;
  current: boolean;
  userAgent: string | null;
  ip: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string;
};

export const login = (email: string, password: string, rememberMe: boolean) =>
  api<AuthUser>("/auth/login", { method: "POST", body: { email, password, rememberMe } });

export const getMe = () => api<AuthUser>("/auth/me");

export const logout = () => api<{ ok: true }>("/auth/logout", { method: "POST" });

export const logoutEverywhere = () => api<{ ok: true }>("/auth/logout-all", { method: "POST" });

export const changePassword = (currentPassword: string, newPassword: string) =>
  api<{ ok: true }>("/auth/change-password", {
    method: "POST",
    body: { currentPassword, newPassword },
  });

export const listSessions = () => api<AuthSession[]>("/auth/sessions");

export const revokeSession = (id: string) =>
  api<{ ok: true }>(`/auth/sessions/${id}`, { method: "DELETE" });

// ---- Admin users (admin role only) ----

export type AdminUser = AuthUser & { isActive: boolean; createdAt: string };

export const listAdminUsers = () => api<AdminUser[]>("/admin/users");

export const createAdminUser = (input: {
  email: string;
  name: string;
  role: AdminRole;
  password: string;
}) => api<AdminUser>("/admin/users", { method: "POST", body: input });

export const updateAdminUser = (
  id: string,
  patch: Partial<{ name: string; role: AdminRole; isActive: boolean }>,
) => api<AdminUser>(`/admin/users/${id}`, { method: "PATCH", body: patch });

export const resetAdminPassword = (id: string, password: string) =>
  api<{ ok: true }>(`/admin/users/${id}/reset-password`, { method: "POST", body: { password } });

// ---- Products ----

export type ProductInput = {
  name: string;
  category: string;
  brand: string;
  partNumber: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  image: string;
  description: string;
  fits: Fitment[];
  featured: boolean;
};

export const createProduct = (input: ProductInput) =>
  api<{ id: string; slug: string }>("/admin/products", { method: "POST", body: input });

export const updateProduct = (id: string, input: ProductInput) =>
  api<{ id: string; slug: string }>(`/admin/products/${id}`, { method: "PUT", body: input });

export const deleteProduct = (id: string) =>
  api<void>(`/admin/products/${id}`, { method: "DELETE" });

export function uploadProductImage(image: Blob) {
  const form = new FormData();
  form.append("file", image, "photo.jpg");
  return api<{ id: string; url: string }>("/admin/images", { method: "POST", form });
}

// ---- Orders ----

export type AdminOrder = {
  id: string;
  name: string;
  phone: string;
  email: string;
  payment: "card" | "cash";
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

export const listOrders = (
  query: { page?: number; perPage?: number; status?: OrderStatus; q?: string } = {},
) => api<Paginated<AdminOrder>>("/admin/orders", { query });

export const setOrderStatus = (id: string, status: OrderStatus) =>
  api<AdminOrder>(`/admin/orders/${id}/status`, { method: "PATCH", body: { status } });
