import { createFileRoute } from "@tanstack/react-router";

import { ProductCard } from "@/components/shop/ProductCard";
import { useProducts } from "@/lib/products";
import { tr, useT } from "@/lib/i18n";

export const Route = createFileRoute("/deals")({
  head: ({ match }) => {
    const t = tr(match.context.lang);
    return {
      meta: [
        {
          title: t(
            "Акции на запчасти Grand Cherokee | GC Parts",
            "Grand Cherokee Parts Deals & Offers | GC Parts",
          ),
        },
        {
          name: "description",
          content: t(
            "Скидки на тормоза, двигатель, подвеску и кузовные детали Jeep Grand Cherokee.",
            "Current price drops on Jeep Grand Cherokee brakes, engine, suspension and body parts.",
          ),
        },
        {
          property: "og:title",
          content: t(
            "Акции на запчасти Grand Cherokee | GC Parts",
            "Grand Cherokee Parts Deals & Offers | GC Parts",
          ),
        },
        {
          property: "og:description",
          content: t(
            "Запчасти Grand Cherokee со скидкой, в наличии.",
            "Discounted OEM and aftermarket Grand Cherokee parts, in stock now.",
          ),
        },
      ],
    };
  },
  component: DealsPage,
});

function DealsPage() {
  const t = useT();
  const products = useProducts();
  const deals = products.filter((p) => p.oldPrice);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">{t("Акции", "Deals")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t(
          `Запчастей со скидкой: ${deals.length}. Цены обновляются еженедельно.`,
          `${deals.length} Grand Cherokee parts currently reduced. Prices update weekly.`,
        )}
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {deals.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
