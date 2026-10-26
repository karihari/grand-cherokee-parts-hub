import { Link } from "@tanstack/react-router";
import { Heart, GitCompareArrows, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { formatAMD, fitmentLabel, type Product } from "@/data/catalog";
import { useStore } from "@/lib/store";
import { ContactButtons } from "@/components/shop/ContactButtons";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, wishlist, toggleCompare, compare } = useStore();
  const wished = wishlist.includes(product.id);
  const compared = compare.includes(product.id);

  return (
    <article className="card-surface group flex flex-col overflow-hidden transition-shadow hover:shadow-[var(--shadow-lift)]">
      <div className="relative">
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className="block aspect-square overflow-hidden bg-secondary"
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={800}
            height={800}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </Link>
        <div className="absolute right-2 top-2 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => {
              toggleWishlist(product.id);
              toast.success(wished ? "Removed from wishlist" : "Saved to wishlist");
            }}
            aria-pressed={wished}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-card/90 backdrop-blur transition-colors hover:bg-secondary"
          >
            <Heart className={cn("size-4", wished && "fill-destructive text-destructive")} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => {
              toggleCompare(product.id);
              toast.success(compared ? "Removed from comparison" : "Added to comparison");
            }}
            aria-pressed={compared}
            aria-label={compared ? "Remove from comparison" : "Add to comparison"}
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-md border border-border bg-card/90 backdrop-blur transition-colors hover:bg-secondary",
              compared && "border-primary text-primary",
            )}
          >
            <GitCompareArrows className="size-4" aria-hidden="true" />
          </button>
        </div>
        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          <span className="rounded-md bg-surface px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-surface-foreground">
            {product.condition}
          </span>
          <span className="rounded-md bg-accent px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-foreground">
            {product.origin}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{product.brand}</p>
          <h3 className="mt-1 text-base leading-snug font-semibold">
            <Link to="/product/$slug" params={{ slug: product.slug }} className="hover:text-primary">
              {product.name}
            </Link>
          </h3>
        </div>

        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <div>
            <dt className="inline">Part № </dt>
            <dd className="inline font-medium text-foreground">{product.partNumber}</dd>
          </div>
          <div>
            <dt className="inline">OEM № </dt>
            <dd className="inline font-medium text-foreground">{product.oemNumber}</dd>
          </div>
        </dl>

        <p className="text-xs text-muted-foreground">{product.fits.map(fitmentLabel).join(" · ")}</p>

        <div className="mt-auto space-y-3">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="font-display text-2xl font-bold leading-none">{formatAMD(product.price)}</p>
              {product.oldPrice ? (
                <p className="mt-1 text-xs text-muted-foreground line-through">{formatAMD(product.oldPrice)}</p>
              ) : null}
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p className={product.stock > 0 ? "font-medium text-success" : "font-medium text-destructive"}>
                {product.stock > 0 ? `In stock · ${product.stock}` : "Out of stock"}
              </p>
            </div>
          </div>

          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Star className="size-3.5 fill-accent text-accent" aria-hidden="true" />
            <span className="font-medium text-foreground">{product.rating.toFixed(1)}</span>
            <span>({product.reviews})</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                addToCart(product.id);
                toast.success("Added to cart", { description: product.name });
              }}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <ShoppingCart className="size-4" aria-hidden="true" /> Add to cart
            </button>
            <ContactButtons product={product} />
          </div>
        </div>
      </div>
    </article>
  );
}
