import { createFileRoute, Link } from "@tanstack/react-router";
import { fitmentLabel, formatAMD, productName } from "@/data/catalog";
import { useStore } from "@/lib/store";
import { useProducts } from "@/lib/products";
import { tr, useT, useLang } from "@/lib/i18n";

export const Route = createFileRoute("/compare")({
  head: ({ match }) => {
    const t = tr(match.context.lang);
    return {
      meta: [
        {
          title: t(
            "Сравнение запчастей Grand Cherokee | GC Parts",
            "Compare Grand Cherokee Parts | GC Parts",
          ),
        },
        {
          name: "description",
          content: t(
            "Сравните цену и совместимость запчастей.",
            "Compare price, condition, warranty and fitment side by side.",
          ),
        },
        {
          property: "og:title",
          content: t(
            "Сравнение запчастей Grand Cherokee | GC Parts",
            "Compare Grand Cherokee Parts | GC Parts",
          ),
        },
        {
          property: "og:description",
          content: t(
            "Сравнение запчастей Grand Cherokee.",
            "Side-by-side comparison of Grand Cherokee parts.",
          ),
        },
      ],
    };
  },
  component: ComparePage,
});

function ComparePage() {
  const t = useT();
  const lang = useLang();
  const products = useProducts();
  const { compare, toggleCompare } = useStore();
  const items = products.filter((p) => compare.includes(p.id));

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">
          {t("Пока нечего сравнивать", "Nothing to compare yet")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t(
            "Нажмите значок сравнения на карточке товара, чтобы добавить до четырёх запчастей.",
            "Use the compare icon on any product card to add up to four parts.",
          )}
        </p>
        <Link
          to="/parts"
          className="mt-6 inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          {t("Смотреть запчасти", "Browse parts")}
        </Link>
      </div>
    );
  }

  const rows: [string, (p: (typeof items)[number]) => React.ReactNode][] = [
    [
      t("Цена", "Price"),
      (p) => <span className="font-display text-lg font-bold">{formatAMD(p.price)}</span>,
    ],
    [t("Бренд", "Brand"), (p) => p.brand],
    [t("Артикул", "Part number"), (p) => p.partNumber],
    [
      t("Подходит для", "Fits"),
      (p) => (
        <span className="text-xs text-muted-foreground">
          {p.fits.map(fitmentLabel).join(" · ")}
        </span>
      ),
    ],
    [t("Рейтинг", "Rating"), (p) => `${p.rating.toFixed(1)} (${p.reviews})`],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">{t("Сравнение запчастей", "Compare parts")}</h1>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-3xl border-collapse text-sm">
          <thead>
            <tr>
              <th
                scope="col"
                className="w-40 p-3 text-left align-bottom text-xs uppercase text-muted-foreground"
              >
                {t("Товар", "Product")}
              </th>
              {items.map((p) => (
                <th key={p.id} scope="col" className="p-3 text-left align-bottom">
                  <img
                    src={p.image}
                    alt={productName(p, lang)}
                    loading="lazy"
                    width={800}
                    height={800}
                    className="mb-2 size-24 rounded-md object-cover"
                  />
                  <Link
                    to="/product/$slug"
                    params={{ slug: p.slug }}
                    className="font-semibold hover:text-primary"
                  >
                    {productName(p, lang)}
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleCompare(p.id)}
                    className="mt-1 block text-xs font-medium text-muted-foreground hover:text-destructive"
                  >
                    {t("Удалить", "Remove")}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, render]) => (
              <tr key={label} className="border-t border-border">
                <th
                  scope="row"
                  className="p-3 text-left text-xs font-semibold uppercase text-muted-foreground"
                >
                  {label}
                </th>
                {items.map((p) => (
                  <td key={p.id} className="p-3 align-top">
                    {render(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
