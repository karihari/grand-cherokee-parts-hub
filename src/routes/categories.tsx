import { createFileRoute, Link } from "@tanstack/react-router";
import { CATEGORIES } from "@/data/catalog";
import { useProducts } from "@/lib/products";
import { plural, tr, useLang, useT } from "@/lib/i18n";

export const Route = createFileRoute("/categories")({
  head: ({ match }) => {
    const t = tr(match.context.lang);
    return {
      meta: [
        {
          title: t(
            "Категории запчастей Grand Cherokee | GC Parts",
            "Grand Cherokee Part Categories | GC Parts",
          ),
        },
        {
          name: "description",
          content: t(
            "Все категории запчастей Jeep Grand Cherokee: тормоза, двигатель, трансмиссия, подвеска, освещение, фильтры, колёса и аксессуары.",
            "All Jeep Grand Cherokee part categories: brakes, engine, transmission, suspension, lighting, filters, wheels and accessories.",
          ),
        },
        {
          property: "og:title",
          content: t(
            "Категории запчастей Grand Cherokee | GC Parts",
            "Grand Cherokee Part Categories | GC Parts",
          ),
        },
        {
          property: "og:description",
          content: t(
            "Выберите категорию и смотрите только запчасти для Grand Cherokee.",
            "Pick a category and see only Grand Cherokee parts.",
          ),
        },
      ],
    };
  },
  component: CategoriesPage,
});

function CategoriesPage() {
  const t = useT();
  const lang = useLang();
  const products = useProducts();
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">{t("Запчасти Grand Cherokee", "Grand Cherokee Parts")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t(
          "Выберите категорию — все детали в ней только для Grand Cherokee.",
          "Choose a category — every listing inside is for the Grand Cherokee only.",
        )}
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
                <h2 className="text-lg font-semibold">{t(c.name)}</h2>
                <p className="text-sm text-muted-foreground">{t(c.blurb)}</p>
                <p className="mt-1 text-xs font-medium text-primary">
                  {count}{" "}
                  {plural(lang, count, ["товар", "товара", "товаров"], ["product", "products"])}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
