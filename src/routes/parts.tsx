import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { CATEGORIES, categoryName, type Product } from "@/data/catalog";
import { checkFit, useStore } from "@/lib/store";
import { ProductCard } from "@/components/shop/ProductCard";
import { MyGarage } from "@/components/shop/MyGarage";
import { cn } from "@/lib/utils";
import { useProducts } from "@/lib/products";
import { plural, tr, useLang, useT } from "@/lib/i18n";

type Search = { q?: string | undefined; category?: string | undefined };

export const Route = createFileRoute("/parts")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    q: typeof search["q"] === "string" && search["q"] ? search["q"] : undefined,
    category:
      typeof search["category"] === "string" && search["category"] ? search["category"] : undefined,
  }),

  head: ({ match }) => {
    const t = tr(match.context.lang);
    return {
      meta: [
        {
          title: t(
            "Каталог запчастей Grand Cherokee | GC Parts",
            "Grand Cherokee Parts Catalogue | GC Parts",
          ),
        },
        {
          name: "description",
          content: t(
            "Запчасти Jeep Grand Cherokee по категориям, цене и совместимости. Подходящие детали показываются первыми.",
            "Browse Jeep Grand Cherokee parts by category, price and fitment. Compatible results are shown first.",
          ),
        },
        {
          property: "og:title",
          content: t(
            "Каталог запчастей Grand Cherokee | GC Parts",
            "Grand Cherokee Parts Catalogue | GC Parts",
          ),
        },
        {
          property: "og:description",
          content: t(
            "Тормоза, двигатель, подвеска, освещение и другие запчасти Grand Cherokee с фильтром по совместимости.",
            "Filter Grand Cherokee brakes, engine, suspension, lighting and more by fitment.",
          ),
        },
      ],
    };
  },
  component: PartsPage,
});

type SortKey = "recommended" | "price-asc" | "price-desc" | "newest" | "rating";

function PartsPage() {
  const t = useT();
  const lang = useLang();
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
        const haystack = [
          p.name,
          p.nameEn,
          p.brand,
          p.partNumber,
          p.category,
          p.description,
          p.descriptionEn,
        ]
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

  const title = category
    ? `${categoryName(category, t)} — Grand Cherokee`
    : t("Запчасти Grand Cherokee", "Grand Cherokee Parts");

  const filters = (
    <div className="space-y-6">
      <FilterGroup title={t("Совместимость", "Compatibility")}>
        <Check
          label={t(
            "Только подходящие для моего Grand Cherokee",
            "Only parts that fit my Grand Cherokee",
          )}
          checked={fitsOnly}
          onChange={() => setFitsOnly((v) => !v)}
        />
        {!activeVehicle && (
          <p className="text-xs text-muted-foreground">
            {t(
              "Сначала сохраните автомобиль, чтобы использовать этот фильтр.",
              "Save a vehicle first to use this filter.",
            )}
          </p>
        )}
      </FilterGroup>

      <FilterGroup title={t("Категория", "Category")}>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/parts"
            search={{ q }}
            className={cn(
              "rounded-md border px-2.5 py-1 text-xs font-medium",
              !category ? "border-primary bg-primary/10 text-primary" : "border-border",
            )}
          >
            {t("Все", "All")}
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
              {t(c.name)}
            </Link>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title={`${t("Цена до", "Price up to")} ֏${maxPrice.toLocaleString("ru-RU")}`}>
        <input
          type="range"
          min={5000}
          max={500000}
          step={5000}
          value={maxPrice}
          aria-label={t("Максимальная цена", "Maximum price")}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[var(--color-primary)]"
        />
      </FilterGroup>

      <FilterGroup title={t("Наличие", "Availability")}>
        <Check
          label={t("Только в наличии", "In stock only")}
          checked={inStockOnly}
          onChange={() => setInStockOnly((v) => !v)}
        />
      </FilterGroup>

      <FilterGroup title={t("Рейтинг", "Rating")}>
        {[0, 4, 4.5].map((r) => (
          <label key={r} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="rating"
              checked={minRating === r}
              onChange={() => setMinRating(r)}
              className="size-4 accent-[var(--color-primary)]"
            />
            {r === 0 ? t("Любой рейтинг", "Any rating") : `${r}+ ${t("звёзд", "stars")}`}
          </label>
        ))}
      </FilterGroup>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav aria-label={t("Навигация", "Breadcrumb")} className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          {t("Главная", "Home")}
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-foreground">{title}</span>
      </nav>

      <h1 className="mt-2 text-3xl font-bold">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {results.length}{" "}
        {plural(lang, results.length, ["товар", "товара", "товаров"], ["product", "products"])}
        {q ? t(` по запросу «${q}»`, ` for “${q}”`) : ""}
      </p>

      <div className="mt-5">
        <MyGarage />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="card-surface sticky top-32 max-h-[calc(100vh-9rem)] overflow-auto p-4">
            {filters}
          </div>
        </aside>

        <div>
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-semibold lg:hidden"
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" /> {t("Фильтры", "Filters")}
            </button>
            <label className="ml-auto flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{t("Сортировка", "Sort")}</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-11 rounded-md border border-input bg-card px-3 text-sm"
              >
                <option value="recommended">{t("Рекомендуемые", "Recommended")}</option>
                <option value="price-asc">{t("Сначала дешевле", "Price: low to high")}</option>
                <option value="price-desc">{t("Сначала дороже", "Price: high to low")}</option>
                <option value="newest">{t("Новинки", "Newest")}</option>
                <option value="rating">{t("По рейтингу", "Best rated")}</option>
              </select>
            </label>
          </div>

          {results.length === 0 ? (
            <div className="card-surface mt-5 p-10 text-center">
              <p className="text-lg font-semibold">
                {t("Нет запчастей по этим фильтрам", "No parts match these filters")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(
                  "Уберите какой-нибудь фильтр или напишите нам — мы найдём нужную деталь.",
                  "Try removing a filter, or message us and we will source the part.",
                )}
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
            aria-label={t("Закрыть фильтры", "Close filters")}
            className="flex-1"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="max-h-[80vh] overflow-auto rounded-t-2xl bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{t("Фильтры", "Filters")}</h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                aria-label={t("Закрыть фильтры", "Close filters")}
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
              {t("Показать", "Show")} {results.length}{" "}
              {plural(
                lang,
                results.length,
                ["товар", "товара", "товаров"],
                ["product", "products"],
              )}
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
