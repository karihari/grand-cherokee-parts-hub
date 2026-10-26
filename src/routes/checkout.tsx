import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, CheckCircle2 } from "lucide-react";
import { formatAMD } from "@/data/catalog";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { findProduct, useProducts } from "@/lib/products";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout | GC Parts" },
      { name: "description", content: "Four short steps: details, delivery, payment, review." },
      { property: "og:title", content: "Checkout | GC Parts" },
      { property: "og:description", content: "Fast checkout for Grand Cherokee parts." },
    ],
  }),
  component: CheckoutPage,
});

const SHIPPING = 4500;
const STEPS = ["Your details", "Delivery", "Payment", "Review"];

type Form = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postcode: string;
  payment: "card" | "cash" | "transfer";
};

function CheckoutPage() {
  const products = useProducts();
  const { cart, cartSubtotal, clearCart } = useStore();
  const [step, setStep] = useState(0);
  const [placed, setPlaced] = useState<string | null>(null);
  const [form, setForm] = useState<Form>({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    postcode: "",
    payment: "card",
  });

  const lines = cart.flatMap((l) => {
    const product = findProduct(products, l.productId);
    return product ? [{ qty: l.qty, product }] : [];
  });
  const total = cartSubtotal + SHIPPING;
  const set = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }));

  if (placed) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <CheckCircle2 className="mx-auto size-14 text-success" aria-hidden="true" />
        <h1 className="mt-4 text-3xl font-bold">Order confirmed</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Order <span className="font-semibold text-foreground">{placed}</span> is confirmed. We message you on
          WhatsApp with tracking as soon as it ships.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/account" className="h-11 rounded-md bg-primary px-5 text-sm font-semibold leading-[2.75rem] text-primary-foreground">
            View my orders
          </Link>
          <Link to="/parts" className="h-11 rounded-md border border-border px-5 text-sm font-semibold leading-[2.75rem]">
            Keep shopping
          </Link>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Nothing to check out</h1>
        <Link to="/parts" className="mt-6 inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground">
          Shop all parts
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold">Checkout</h1>

      <ol className="mt-5 flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={cn(
              "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium",
              i === step ? "border-primary bg-primary/10 text-primary" : i < step ? "border-success/40 bg-success/10 text-success" : "border-border text-muted-foreground",
            )}
          >
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-card text-xs font-bold">
              {i < step ? <Check className="size-3" aria-hidden="true" /> : i + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <form
          className="card-surface space-y-4 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (step < 3) {
              setStep(step + 1);
              return;
            }
            const id = `GC-${Math.floor(100000 + Math.random() * 899999)}`;
            clearCart();
            setPlaced(id);
          }}
        >
          {step === 0 && (
            <>
              <h2 className="text-lg font-bold">Customer information</h2>
              <Field id="name" label="Full name" value={form.name} onChange={(v) => set({ name: v })} required />
              <Field id="phone" label="Phone" type="tel" value={form.phone} onChange={(v) => set({ phone: v })} required />
              <Field id="email" label="Email" type="email" value={form.email} onChange={(v) => set({ email: v })} required />
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-lg font-bold">Delivery address</h2>
              <Field id="address" label="Street address" value={form.address} onChange={(v) => set({ address: v })} required />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="city" label="City" value={form.city} onChange={(v) => set({ city: v })} required />
                <Field id="postcode" label="Postcode" value={form.postcode} onChange={(v) => set({ postcode: v })} />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-lg font-bold">Payment</h2>
              {(
                [
                  ["card", "Card on delivery / online card"],
                  ["cash", "Cash on delivery"],
                  ["transfer", "Bank transfer"],
                ] as const
              ).map(([value, label]) => (
                <label key={value} className="flex items-center gap-3 rounded-md border border-border p-3 text-sm">
                  <input
                    type="radio"
                    name="payment"
                    checked={form.payment === value}
                    onChange={() => set({ payment: value })}
                    className="size-4 accent-[var(--color-primary)]"
                  />
                  {label}
                </label>
              ))}
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-lg font-bold">Review your order</h2>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <Review label="Name" value={form.name} />
                <Review label="Phone" value={form.phone} />
                <Review label="Email" value={form.email} />
                <Review label="Address" value={`${form.address}, ${form.city} ${form.postcode}`} />
                <Review label="Payment" value={form.payment} />
              </dl>
              <ul className="mt-3 divide-y divide-border text-sm">
                {lines.map(({ product, qty }) => (
                  <li key={product.id} className="flex justify-between py-2">
                    <span>
                      {product.name} × {qty}
                    </span>
                    <span className="font-medium">{formatAMD(product.price * qty)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="h-12 rounded-md border border-border px-5 text-sm font-semibold"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              className="h-12 flex-1 rounded-md bg-accent text-sm font-semibold text-accent-foreground"
            >
              {step === 3 ? "Place Order" : "Continue"}
            </button>
          </div>
        </form>

        <aside className="card-surface h-fit p-5">
          <h2 className="text-lg font-bold">Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium">{formatAMD(cartSubtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="font-medium">{formatAMD(SHIPPING)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <dt className="font-bold">Total</dt>
              <dd className="font-display text-xl font-bold">{formatAMD(total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
      />
    </div>
  );
}

function Review({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-3">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value || "—"}</dd>
    </div>
  );
}
