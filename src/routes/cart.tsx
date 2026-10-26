import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatAMD } from "@/data/catalog";
import { useStore } from "@/lib/store";
import { ContactButtons } from "@/components/shop/ContactButtons";
import { findProduct, useProducts } from "@/lib/products";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart | GC Parts" },
      { name: "description", content: "Review your Jeep Grand Cherokee parts before checkout." },
      { property: "og:title", content: "Your Cart | GC Parts" },
      { property: "og:description", content: "Grand Cherokee parts ready for checkout." },
    ],
  }),
  component: CartPage,
});

const SHIPPING = 4500;

function CartPage() {
  const products = useProducts();
  const { cart, setQty, removeFromCart, cartSubtotal, toggleSaved, saved } = useStore();
  const lines = cart.flatMap((l) => {
    const product = findProduct(products, l.productId);
    return product ? [{ line: l, product }] : [];
  });

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">Find a part for your Grand Cherokee to get started.</p>
        <Link to="/parts" className="mt-6 inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground">
          Shop all parts
        </Link>
      </div>
    );
  }

  const total = cartSubtotal + SHIPPING;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold">Cart</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <ul className="space-y-3">
          {lines.map(({ line, product }) => (
            <li key={product.id} className="card-surface flex gap-4 p-4">
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                width={800}
                height={800}
                className="size-24 rounded-md object-cover"
              />
              <div className="flex-1">
                <Link to="/product/$slug" params={{ slug: product.slug }} className="font-semibold hover:text-primary">
                  {product.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {product.brand} · Part № {product.partNumber} · {product.condition}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center rounded-md border border-border">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => setQty(product.id, line.qty - 1)}
                      className="inline-flex size-9 items-center justify-center"
                    >
                      <Minus className="size-4" aria-hidden="true" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{line.qty}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
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
                    <Trash2 className="size-4" aria-hidden="true" /> Remove
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSaved(product.id)}
                    className="text-sm font-medium text-muted-foreground hover:text-primary"
                  >
                    {saved.includes(product.id) ? "Saved for later" : "Save for later"}
                  </button>
                  <ContactButtons product={product} />
                </div>
              </div>
              <p className="font-display text-xl font-bold">{formatAMD(product.price * line.qty)}</p>
            </li>
          ))}
        </ul>

        <aside className="card-surface h-fit p-5">
          <h2 className="text-lg font-bold">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Subtotal" value={formatAMD(cartSubtotal)} />
            <Row label="Shipping" value={formatAMD(SHIPPING)} />
            <div className="border-t border-border pt-2">
              <Row label="Total" value={formatAMD(total)} strong />
            </div>
          </dl>
          <Link
            to="/checkout"
            className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-md bg-accent text-sm font-semibold text-accent-foreground"
          >
            Proceed to Checkout
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
