import { getRouteApi } from "@tanstack/react-router";
import type { Product } from "@/data/catalog";

const rootRoute = getRouteApi("__root__");

// All Products, loaded once by the root route from the database.
export function useProducts(): Product[] {
  return rootRoute.useLoaderData().products;
}

export function findProduct(products: Product[], id: string) {
  return products.find((p) => p.id === id);
}
