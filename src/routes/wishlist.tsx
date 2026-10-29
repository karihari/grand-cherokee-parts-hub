import { createFileRoute, Link } from "@tanstack/react-router";

import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/shop/ProductCard";
import { useProducts } from "@/lib/products";
import { tr, useT } from "@/lib/i18n";

export const Route = createFileRoute("/wishlist")({
  head: ({ match }) => {
    const t = tr(match.context.lang);
    return {
      meta: [
        { title: t("Избранное | GC Parts", "Wishlist | GC Parts") },
        {
          name: "description",
          content: t(
            "Запчасти Grand Cherokee, которые вы сохранили.",
            "Grand Cherokee parts you saved for later.",
          ),
        },
        { property: "og:title", content: t("Избранное | GC Parts", "Wishlist | GC Parts") },
        {
          property: "og:description",
          content: t(
            "Ваши сохранённые запчасти Grand Cherokee.",
            "Your saved Grand Cherokee parts.",
          ),
        },
      ],
    };
  },
  component: WishlistPage,
});

function WishlistPage() {
  const t = useT();
  const products = useProducts();
  const { wishlist } = useStore();
  const items = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">{t("Избранное", "Wishlist")}</h1>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          {t("Пока ничего не сохранено.", "Nothing saved yet.")}{" "}
          <Link to="/parts" className="font-semibold text-primary underline">
            {t("Смотреть запчасти", "Browse parts")}
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
