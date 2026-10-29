import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GitCompareArrows, Heart, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import {
  categoryName,
  fitmentLabel,
  formatAMD,
  hasPrice,
  priceLabel,
  productDescription,
  productName,
} from "@/data/catalog";
import { useStore } from "@/lib/store";
import { ContactButtons } from "@/components/shop/ContactButtons";
import { ProductCard } from "@/components/shop/ProductCard";
import { cn } from "@/lib/utils";
import { useProducts } from "@/lib/products";
import { getProductBySlug } from "@/lib/products.functions";
import { plural, tr, useLang, useT } from "@/lib/i18n";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const product = await getProductBySlug({ data: { slug: params.slug } });
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData, match }) => {
    const t = tr(match.context.lang);
    if (!loaderData) {
      return {
        meta: [
          { title: t("Запчасть недоступна | GC Parts", "Part unavailable | GC Parts") },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { product } = loaderData;
    const category = categoryName(product.category, t);
    const description = t(
      `${productName(product, match.context.lang)} для Jeep Grand Cherokee. Категория: ${category}. GC Parts.`,
      `${productName(product, match.context.lang)} for Jeep Grand Cherokee. ${category} part from GC Parts.`,
    );
    return {
      meta: [
        {
          title: `${productName(product, match.context.lang)} | Grand Cherokee ${category} | GC Parts`,
        },
        { name: "description", content: description },
        { property: "og:title", content: `${productName(product, match.context.lang)} | GC Parts` },
        { property: "og:description", content: description },
      ],
    };
  },
  notFoundComponent: ProductNotFound,
  component: ProductPage,
});

function ProductNotFound() {
  const t = useT();
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">{t("Запчасть не найдена", "Part not found")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t(
          "Возможно, она уже продана или снята с продажи.",
          "This listing may have been sold or removed.",
        )}
      </p>
      <Link
        to="/parts"
        className="mt-6 inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground"
      >
        {t("Все запчасти", "Browse all parts")}
      </Link>
    </div>
  );
}

function ProductPage() {
  const t = useT();
  const lang = useLang();
  const products = useProducts();
  const { product } = Route.useLoaderData();
  const { addToCart, toggleWishlist, wishlist, toggleCompare, trackView } = useStore();
  const [zoom, setZoom] = useState(false);
  const wished = wishlist.includes(product.id);

  useEffect(() => {
    trackView(product.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav aria-label={t("Навигация", "Breadcrumb")} className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          {t("Главная", "Home")}
        </Link>
        <span aria-hidden="true"> / </span>
        <Link to="/parts" search={{ category: product.category }} className="hover:text-primary">
          {categoryName(product.category, t)}
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-foreground">{productName(product, lang)}</span>
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <div>
          <button
            type="button"
            onClick={() => setZoom((v) => !v)}
            aria-label={zoom ? t("Уменьшить", "Zoom out") : t("Увеличить", "Zoom in")}
            className="card-surface block w-full overflow-hidden p-0"
          >
            <img
              src={product.image}
              alt={productName(product, lang)}
              width={800}
              height={800}
              className={cn(
                "aspect-square w-full object-cover transition-transform duration-300",
                zoom && "scale-150",
              )}
            />
          </button>
          <div className="mt-3 flex gap-3">
            {[0, 1, 2].map((i) => (
              <img
                key={i}
                src={product.image}
                alt={t(
                  `${productName(product, lang)}, фото ${i + 1}`,
                  `${productName(product, lang)} view ${i + 1}`,
                )}
                loading="lazy"
                width={800}
                height={800}
                className="size-20 rounded-md border border-border object-cover"
              />
            ))}
          </div>
        </div>

        <div>
          <p className="eyebrow text-primary">{product.brand}</p>
          <h1 className="mt-1 text-3xl font-bold leading-tight">{productName(product, lang)}</h1>

          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Star className="size-4 fill-accent text-accent" aria-hidden="true" />
              <span className="font-semibold text-foreground">{product.rating.toFixed(1)}</span> (
              {product.reviews}{" "}
              {plural(lang, product.reviews, ["отзыв", "отзыва", "отзывов"], ["review", "reviews"])}
              )
            </span>
            <span aria-hidden="true">·</span>
            <span>ID {product.id}</span>
          </p>

          {product.fits.length ? (
            <div className="mt-5 text-sm">
              <p className="font-semibold">{t("Подходит для", "Fits")}</p>
              <ul className="mt-1 space-y-0.5 text-muted-foreground">
                {product.fits.map((f) => (
                  <li key={`${f.gen}-${f.from}`}>{fitmentLabel(f)}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="card-surface mt-5 p-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="font-display text-4xl font-bold leading-none">
                  {priceLabel(product.price, t)}
                </p>
                {product.oldPrice ? (
                  <p className="mt-1 text-sm text-muted-foreground line-through">
                    {formatAMD(product.oldPrice)}
                  </p>
                ) : null}
              </div>
              <p
                className={cn(
                  "text-sm font-semibold",
                  product.stock > 0 ? "text-success" : "text-destructive",
                )}
              >
                {product.stock > 0
                  ? t(`В наличии · ${product.stock} шт.`, `In stock · ${product.stock} available`)
                  : t("Нет в наличии", "Out of stock")}
              </p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  addToCart(product.id);
                  toast.success(t("Добавлено в корзину", "Added to cart"), {
                    description: productName(product, lang),
                  });
                }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <ShoppingCart className="size-4" aria-hidden="true" />{" "}
                {t("В корзину", "Add to cart")}
              </button>
              {hasPrice(product) ? (
                <Link
                  to="/checkout"
                  onClick={() => addToCart(product.id)}
                  className="inline-flex h-12 items-center justify-center rounded-md bg-accent text-sm font-semibold text-accent-foreground hover:brightness-95"
                >
                  {t("Купить сейчас", "Buy now")}
                </Link>
              ) : null}
            </div>

            <p className="mt-4 text-sm font-semibold">
              {t("Есть вопрос об этой детали?", "Have a question about this part?")}
            </p>
            <ContactButtons product={product} variant="full" className="mt-2" />

            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 font-medium hover:bg-secondary"
              >
                <Heart
                  className={cn("size-4", wished && "fill-destructive text-destructive")}
                  aria-hidden="true"
                />
                {wished ? t("В избранном", "In wishlist") : t("В избранное", "Add to wishlist")}
              </button>
              <button
                type="button"
                onClick={() => {
                  toggleCompare(product.id);
                  toast.success(t("Сравнение обновлено", "Comparison updated"));
                }}
                className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 font-medium hover:bg-secondary"
              >
                <GitCompareArrows className="size-4" aria-hidden="true" />{" "}
                {t("Сравнить", "Compare")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold">{t("Описание", "Description")}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {productDescription(product, lang)}
        </p>
      </section>

      {related.length ? (
        <section className="mt-10">
          <h2 className="text-xl font-bold">
            {t("Похожие запчасти", "Related parts")}: {categoryName(product.category, t)}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-card p-3 md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">{productName(product, lang)}</p>
            <p className="font-display text-lg font-bold leading-none">
              {priceLabel(product.price, t)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              addToCart(product.id);
              toast.success(t("Добавлено в корзину", "Added to cart"));
            }}
            className="h-11 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground"
          >
            {t("В корзину", "Add to cart")}
          </button>
        </div>
      </div>
    </div>
  );
}
