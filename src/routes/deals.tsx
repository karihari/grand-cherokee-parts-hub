import { createFileRoute } from "@tanstack/react-router";
import { PRODUCTS } from "@/data/catalog";
import { ProductCard } from "@/components/shop/ProductCard";

export const Route = createFileRoute("/deals")({
  head: () => ({
    meta: [
      { title: "Grand Cherokee Parts Deals & Offers | GC Parts" },
      {
        name: "description",
        content: "Current price drops on Jeep Grand Cherokee brakes, engine, suspension and body parts.",
      },
      { property: "og:title", content: "Grand Cherokee Parts Deals & Offers | GC Parts" },
      { property: "og:description", content: "Discounted OEM and aftermarket Grand Cherokee parts, in stock now." },
    ],
  }),
  component: DealsPage,
});

function DealsPage() {
  const deals = PRODUCTS.filter((p) => p.oldPrice);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">Deals</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {deals.length} Grand Cherokee parts currently reduced. Prices update weekly.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {deals.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
