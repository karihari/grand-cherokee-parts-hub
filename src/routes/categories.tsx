import { createFileRoute, Link } from "@tanstack/react-router";
import { CATEGORIES } from "@/data/catalog";
import { useProducts } from "@/lib/products";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Grand Cherokee Part Categories | GC Parts" },
      {
        name: "description",
        content:
          "All Jeep Grand Cherokee part categories: brakes, engine, transmission, suspension, lighting, filters, wheels and accessories.",
      },
      { property: "og:title", content: "Grand Cherokee Part Categories | GC Parts" },
      { property: "og:description", content: "Pick a category and see only Grand Cherokee parts." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const products = useProducts();
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">Grand Cherokee Parts</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose a category — every listing inside is for the Grand Cherokee only.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c) => {
          const count = products.filter((p) => p.category === c.slug).length;
          return (
            <Link
              key={c.slug}
              to="/parts"
              search={{ category: c.slug }}
              className="card-surface flex items-center gap-4 p-4 transition-shadow hover:shadow-[var(--shadow-lift)]"
            >
              <img
                src={c.image}
                alt=""
                loading="lazy"
                width={800}
                height={800}
                className="size-20 rounded-md object-cover"
              />
              <div>
                <h2 className="text-lg font-semibold">{c.name}</h2>
                <p className="text-sm text-muted-foreground">{c.blurb}</p>
                <p className="mt-1 text-xs font-medium text-primary">{count} products</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
