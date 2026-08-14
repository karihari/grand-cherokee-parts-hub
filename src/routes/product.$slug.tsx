import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  GitCompareArrows,
  Heart,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { PRODUCTS, formatAMD, fitmentLabel, getProduct, categoryName } from "@/data/catalog";
import { checkFit, useStore, vehicleLabel } from "@/lib/store";
import { ContactButtons } from "@/components/shop/ContactButtons";
import { ProductCard } from "@/components/shop/ProductCard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Part unavailable | GC Parts" }, { name: "robots", content: "noindex" }] };
    }
    const { product } = loaderData;
    const description = `${product.name} — ${product.brand}, part ${product.partNumber}, OEM ${product.oemNumber}. ${product.condition} ${product.origin} part for Jeep Grand Cherokee.`;
    return {
      meta: [
        { title: `${product.name} | Grand Cherokee ${categoryName(product.category)} | GC Parts` },
        { name: "description", content: description },
        { property: "og:title", content: `${product.name} | GC Parts` },
        { property: "og:description", content: description },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Part not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">This listing may have been sold or removed.</p>
      <Link to="/parts" className="mt-6 inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground">
        Browse all parts
      </Link>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { activeVehicle, addToCart, toggleWishlist, wishlist, toggleCompare, trackView } = useStore();
  const [zoom, setZoom] = useState(false);
  const fit = checkFit(product, activeVehicle);
  const wished = wishlist.includes(product.id);

  useEffect(() => {
    trackView(product.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const related = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <span aria-hidden="true"> / </span>
        <Link to="/parts" search={{ category: product.category }} className="hover:text-primary">
          {categoryName(product.category)}
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <div>
          <button
            type="button"
            onClick={() => setZoom((v) => !v)}
            aria-label={zoom ? "Zoom out" : "Zoom in"}
            className="card-surface block w-full overflow-hidden p-0"
          >
            <img
              src={product.image}
              alt={product.name}
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
                alt={`${product.name} view ${i + 1}`}
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
          <h1 className="mt-1 text-3xl font-bold leading-tight">{product.name}</h1>

          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Star className="size-4 fill-accent text-accent" aria-hidden="true" />
              <span className="font-semibold text-foreground">{product.rating.toFixed(1)}</span> ({product.reviews} reviews)
            </span>
            <span aria-hidden="true">·</span>
            <span>ID {product.id}</span>
          </p>

          <div
            className={cn(
              "mt-5 rounded-lg border p-4",
              fit === "fits"
                ? "border-success/40 bg-success/10"
                : fit === "verify"
                  ? "border-warning/50 bg-warning/12"
                  : "border-border bg-muted",
            )}
          >
            <div className="flex items-start gap-3">
              {fit === "fits" ? (
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
              ) : (
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning-foreground" aria-hidden="true" />
              )}
              <div>
                <p className="font-display text-lg font-bold uppercase tracking-wide">
                  {fit === "fits"
                    ? "Fits your Grand Cherokee"
                    : fit === "verify"
                      ? "Compatibility needs verification"
                      : "Select your Grand Cherokee"}
                </p>
                {activeVehicle ? (
                  <p className="text-sm font-medium">{vehicleLabel(activeVehicle)}</p>
                ) : (
                  <p className="text-sm">
                    <Link to="/models" className="font-semibold text-primary underline">
                      Choose year, generation and engine
                    </Link>{" "}
                    to confirm fit instantly.
                  </p>
                )}
                <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                  {product.fits.map((f) => (
                    <li key={`${f.gen}-${f.from}`}>Fits {fitmentLabel(f)}</li>
                  ))}
                </ul>
                {fit === "verify" ? (
                  <p className="mt-2 text-sm font-medium">Contact us to confirm compatibility.</p>
                ) : null}
              </div>
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <Spec label="Part number" value={product.partNumber} />
            <Spec label="OEM number" value={product.oemNumber} />
            <Spec label="Condition" value={product.condition} />
            <Spec label="Type" value={product.origin} />
            <Spec label="Warranty" value={product.warranty} />
            <Spec label="Delivery" value={product.delivery} />
          </dl>

          <div className="card-surface mt-5 p-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="font-display text-4xl font-bold leading-none">{formatAMD(product.price)}</p>
                {product.oldPrice ? (
                  <p className="mt-1 text-sm text-muted-foreground line-through">{formatAMD(product.oldPrice)}</p>
                ) : null}
              </div>
              <p className={cn("text-sm font-semibold", product.stock > 0 ? "text-success" : "text-destructive")}>
                {product.stock > 0 ? `In stock · ${product.stock} available` : "Out of stock"}
              </p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  addToCart(product.id);
                  toast.success("Added to cart", { description: product.name });
                }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <ShoppingCart className="size-4" aria-hidden="true" /> Add to cart
              </button>
              <Link
                to="/checkout"
                onClick={() => addToCart(product.id)}
                className="inline-flex h-12 items-center justify-center rounded-md bg-accent text-sm font-semibold text-accent-foreground hover:brightness-95"
              >
                Buy now
              </Link>
            </div>

            <p className="mt-4 text-sm font-semibold">Have a question about this part?</p>
            <ContactButtons product={product} variant="full" className="mt-2" />

            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 font-medium hover:bg-secondary"
              >
                <Heart className={cn("size-4", wished && "fill-destructive text-destructive")} aria-hidden="true" />
                {wished ? "In wishlist" : "Add to wishlist"}
              </button>
              <button
                type="button"
                onClick={() => {
                  toggleCompare(product.id);
                  toast.success("Comparison updated");
                }}
                className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 font-medium hover:bg-secondary"
              >
                <GitCompareArrows className="size-4" aria-hidden="true" /> Compare
              </button>
            </div>
          </div>

          <div className="card-surface mt-5 p-4 text-sm">
            <p className="font-semibold">Seller: {product.seller}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Star className="size-4 fill-accent text-accent" aria-hidden="true" /> {product.sellerRating} seller rating
              </span>
              <span className="inline-flex items-center gap-1">
                <Truck className="size-4" aria-hidden="true" /> Ships in {product.delivery}
              </span>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="size-4" aria-hidden="true" /> {product.warranty} warranty
              </span>
            </p>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold">Description</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{product.description}</p>
      </section>

      {related.length ? (
        <section className="mt-10">
          <h2 className="text-xl font-bold">Related {categoryName(product.category)} parts</h2>
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
            <p className="truncate text-xs text-muted-foreground">{product.name}</p>
            <p className="font-display text-lg font-bold leading-none">{formatAMD(product.price)}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              addToCart(product.id);
              toast.success("Added to cart");
            }}
            className="h-11 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-3">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-semibold">{value}</dd>
    </div>
  );
}
