import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatAMD, productName } from "@/data/catalog";
import { useStore } from "@/lib/store";
import { ContactButtons } from "@/components/shop/ContactButtons";
import { findProduct, useProducts } from "@/lib/products";
import { tr, useT, useLang } from "@/lib/i18n";

export const Route = createFileRoute("/cart")({
  head: ({ match }) => {
    const t = tr(match.context.lang);
    return {
      meta: [
        { title: t("Корзина | GC Parts", "Your Cart | GC Parts") },
        {
          name: "description",
          content: t(
            "Проверьте запчасти перед оформлением заказа.",
            "Review your Jeep Grand Cherokee parts before checkout.",
          ),
        },
        { property: "og:title", content: t("Корзина | GC Parts", "Your Cart | GC Parts") },
        {
          property: "og:description",
          content: t(
            "Запчасти Grand Cherokee, готовые к заказу.",
            "Grand Cherokee parts ready for checkout.",
          ),
        },
      ],
    };
  },
  component: CartPage,
});

function CartPage() {
  const t = useT();
  const lang = useLang();
  const products = useProducts();
  const { cart, setQty, removeFromCart, cartSubtotal, toggleSaved, saved } = useStore();
  const lines = cart.flatMap((l) => {
    const product = findProduct(products, l.productId);
    return product ? [{ line: l, product }] : [];
  });

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">{t("Корзина пуста", "Your cart is empty")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t(
            "Найдите запчасть для вашего Grand Cherokee.",
            "Find a part for your Grand Cherokee to get started.",
          )}
        </p>
        <Link
          to="/parts"
          className="mt-6 inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          {t("Все запчасти", "Shop all parts")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold">{t("Корзина", "Cart")}</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <ul className="space-y-3">
          {lines.map(({ line, product }) => (
            <li key={product.id} className="card-surface flex gap-4 p-4">
              <img
                src={product.image}
                alt={productName(product, lang)}
                loading="lazy"
                width={800}
                height={800}
                className="size-24 rounded-md object-cover"
              />
              <div className="flex-1">
                <Link
                  to="/product/$slug"
                  params={{ slug: product.slug }}
                  className="font-semibold hover:text-primary"
                >
                  {productName(product, lang)}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {product.brand} · {t("Артикул", "Part №")} {product.partNumber}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center rounded-md border border-border">
                    <button
                      type="button"
                      aria-label={t("Уменьшить количество", "Decrease quantity")}
                      onClick={() => setQty(product.id, line.qty - 1)}
                      className="inline-flex size-9 items-center justify-center"
                    >
                      <Minus className="size-4" aria-hidden="true" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{line.qty}</span>
                    <button
                      type="button"
                      aria-label={t("Увеличить количество", "Increase quantity")}
                      onClick={() => setQty(product.id, line.qty + 1)}
                      className="inline-flex size-9 items-center justify-center"
                    >
                      <Plus className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(product.id)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden="true" /> {t("Удалить", "Remove")}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSaved(product.id)}
                    className="text-sm font-medium text-muted-foreground hover:text-primary"
                  >
                    {saved.includes(product.id)
                      ? t("Отложено", "Saved for later")
                      : t("Отложить", "Save for later")}
                  </button>
                  <ContactButtons product={product} />
                </div>
              </div>
              <p className="font-display text-xl font-bold">
                {formatAMD(product.price * line.qty)}
              </p>
            </li>
          ))}
        </ul>

        <aside className="card-surface h-fit p-5">
          <h2 className="text-lg font-bold">{t("Ваш заказ", "Order summary")}</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label={t("Итого", "Total")} value={formatAMD(cartSubtotal)} strong />
          </dl>
          <p className="mt-2 text-xs text-muted-foreground">
            {t(
              "Самовывоз и оплата в магазине. Доставки нет.",
              "Pick up and pay at our shop. No delivery.",
            )}
          </p>
          <Link
            to="/checkout"
            className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-md bg-accent text-sm font-semibold text-accent-foreground"
          >
            {t("Оформить заказ", "Proceed to Checkout")}
          </Link>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className={strong ? "font-bold" : "text-muted-foreground"}>{label}</dt>
      <dd className={strong ? "font-display text-lg font-bold" : "font-medium"}>{value}</dd>
    </div>
  );
}
