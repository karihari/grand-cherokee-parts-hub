import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { CATEGORIES, categoryName, type Product } from "@/data/catalog";
import { checkFit, useStore } from "@/lib/store";
import { ProductCard } from "@/components/shop/ProductCard";
import { MyGarage } from "@/components/shop/MyGarage";
import { cn } from "@/lib/utils";
import { useProducts } from "@/lib/products";

type Search = { q?: string | undefined; category?: string | undefined };

export const Route = createFileRoute("/parts")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    q: typeof search["q"] === "string" && search["q"] ? search["q"] : undefined,
    category:
      typeof search["category"] === "string" && search["category"] ? search["category"] : undefined,
  }),

  head: () => ({
    meta: [
      { title: "Grand Cherokee Parts Catalogue | GC Parts" },
      {
        name: "description",
        content:
          "Browse Jeep Grand Cherokee parts by category, price and fitment. Compatible results are shown first.",
      },
      { property: "og:title", content: "Grand Cherokee Parts Catalogue | GC Parts" },
      {
        property: "og:description",
        content: "Filter Grand Cherokee brakes, engine, suspension, lighting and more by fitment.",
      },
    ],
  }),
  component: PartsPage,
});

type SortKey = "recommended" | "price-asc" | "price-desc" | "newest" | "rating";

function PartsPage() {
  const products = useProducts();
  const { q, category } = Route.useSearch();
  const { activeVehicle } = useStore();

  const [inStockOnly, setInStockOnly] = useState(false);
  const [fitsOnly, setFitsOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(500000);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<SortKey>("recommended");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const results = useMemo(() => {
    const term = (q ?? "").trim().toLowerCase();
    let list = products.filter((p) => {
      if (category && p.category !== category) return false;
      if (inStockOnly && p.stock === 0) return false;
      if (p.price > maxPrice) return false;
      if (p.rating < minRating) return false;
      if (fitsOnly && checkFit(p, activeVehicle) !== "fits") return false;
      if (term) {
        const haystack = [p.name, p.brand, p.partNumber, p.category, p.description]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });

    const fitScore = (p: Product) => (checkFit(p, activeVehicle) === "fits" ? 0 : 1);
    list = [...list].sort((a, b) => {
      const byFit = fitScore(a) - fitScore(b);
      if (byFit !== 0) return byFit;
      switch (sort) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "newest":
          return b.id.localeCompare(a.id);
        default:
          return b.reviews - a.reviews;
      }
    });
    return list;
  }, [products, q, category, inStockOnly, fitsOnly, maxPrice, minRating, sort, activeVehicle]);

  const title = category ? `Grand Cherokee ${categoryName(category)} Parts` : "Grand Cherokee Parts";

  const filters = (
    <div className="space-y-6">
      <FilterGroup title="Compatibility">
        <Check label="Only parts that fit my Grand Cherokee" checked={fitsOnly} onChange={() => setFitsOnly((v) => !v)} />
        {!activeVehicle && (
          <p className="text-xs text-muted-foreground">Save a vehicle first to use this filter.</p>
        )}
      </FilterGroup>

      <FilterGroup title="Category">
        <div className="flex flex-wrap gap-2">
          <Link
            to="/parts"
            search={{ q }}
            className={cn(
              "rounded-md border px-2.5 py-1 text-xs font-medium",
              !category ? "border-primary bg-primary/10 text-primary" : "border-border",
            )}
          >
            All
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/parts"
              search={{ q, category: c.slug }}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-medium",
                category === c.slug ? "border-primary bg-primary/10 text-primary" : "border-border",
              )}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title={`Price up to ֏${maxPrice.toLocaleString("en-US")}`}>
        <input
          type="range"
          min={5000}
          max={500000}
          step={5000}
          value={maxPrice}
          aria-label="Maximum price"
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[var(--color-primary)]"
        />
      </FilterGroup>

      <FilterGroup title="Availability">
        <Check label="In stock only" checked={inStockOnly} onChange={() => setInStockOnly((v) => !v)} />
      </FilterGroup>

      <FilterGroup title="Rating">
        {[0, 4, 4.5].map((r) => (
          <label key={r} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="rating"
              checked={minRating === r}
              onChange={() => setMinRating(r)}
              className="size-4 accent-[var(--color-primary)]"
            />
            {r === 0 ? "Any rating" : `${r}+ stars`}
          </label>
        ))}
      </FilterGroup>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-foreground">{title}</span>
      </nav>

      <h1 className="mt-2 text-3xl font-bold">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {results.length} products{q ? ` for “${q}”` : ""}
      </p>

      <div className="mt-5">
        <MyGarage />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="card-surface sticky top-32 max-h-[calc(100vh-9rem)] overflow-auto p-4">{filters}</div>
        </aside>

        <div>
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-semibold lg:hidden"
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" /> Filters
            </button>
            <label className="ml-auto flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-11 rounded-md border border-input bg-card px-3 text-sm"
              >
                <option value="recommended">Recommended</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="newest">Newest</option>
                <option value="rating">Best rated</option>
              </select>
            </label>
          </div>

          {results.length === 0 ? (
            <div className="card-surface mt-5 p-10 text-center">
              <p className="text-lg font-semibold">No parts match these filters</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try removing a filter, or message us and we will source the part.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {filtersOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-foreground/40 lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            className="flex-1"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="max-h-[80vh] overflow-auto rounded-t-2xl bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Filters</h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
                className="inline-flex size-10 items-center justify-center rounded-md border border-border"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            {filters}
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="mt-6 h-12 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground"
            >
              Show {results.length} products
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-bold uppercase tracking-wide">{title}</legend>
      {children}
    </fieldset>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4 accent-[var(--color-primary)]"
      />
      {label}
    </label>
  );
}
