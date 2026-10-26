import { createFileRoute, Link } from "@tanstack/react-router";

import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/shop/ProductCard";
import { useProducts } from "@/lib/products";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist | GC Parts" },
      { name: "description", content: "Grand Cherokee parts you saved for later." },
      { property: "og:title", content: "Wishlist | GC Parts" },
      { property: "og:description", content: "Your saved Grand Cherokee parts." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const products = useProducts();
  const { wishlist } = useStore();
  const items = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">Wishlist</h1>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Nothing saved yet.{" "}
          <Link to="/parts" className="font-semibold text-primary underline">
            Browse parts
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
