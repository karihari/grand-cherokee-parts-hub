import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Check, CheckCircle2, Store } from "lucide-react";
import { toast } from "sonner";
import { formatAMD } from "@/data/catalog";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { findProduct, useProducts } from "@/lib/products";
import { placeOrder } from "@/lib/api/shop";
import { errorText } from "@/lib/api/errors";
import { cleanLocalNumber, dialCode, PhoneInput, type PhoneCountry } from "@/components/shop/PhoneInput";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout | GC Parts" },
      { name: "description", content: "Three short steps: details, payment, review." },
      { property: "og:title", content: "Checkout | GC Parts" },
      { property: "og:description", content: "Fast checkout for Grand Cherokee parts." },
    ],
  }),
  component: CheckoutPage,
});

const STEPS = ["Your details", "Payment", "Review"];
const LAST_STEP = STEPS.length - 1;

// There is no delivery: orders are picked up and paid for at the shop.
const PAYMENT_OPTIONS = [
  ["cash", "Cash at pickup"],
  ["card", "Card at pickup"],
] as const;

type Form = {
  name: string;
  phoneCountry: PhoneCountry;
  phone: string;
  email: string;
  payment: "card" | "cash";
};

function CheckoutPage() {
  const products = useProducts();
  const { cart, cartSubtotal, clearCart, addOrder } = useStore();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [placed, setPlaced] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [form, setForm] = useState<Form>({
    name: "",
    phoneCountry: "AM",
    phone: "",
    email: "",
    payment: "cash",
  });

  const lines = cart.flatMap((l) => {
    const product = findProduct(products, l.productId);
    return product ? [{ qty: l.qty, product }] : [];
  });
  const set = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }));
  const localPhone = cleanLocalNumber(form.phone);
  const fullPhone = `${dialCode(form.phoneCountry)} ${localPhone}`;
  const paymentLabel = PAYMENT_OPTIONS.find(([value]) => value === form.payment)![1];

  const submit = async () => {
    setSubmitting(true);
    try {
      const result = await placeOrder({
        name: form.name,
        phone: fullPhone,
        email: form.email,
        payment: form.payment,
        items: lines.map(({ product, qty }) => ({ productId: product.id, qty })),
      });
      addOrder({
        id: result.id,
        createdAt: result.createdAt,
        items: result.items.map((i) => ({ name: i.name, qty: i.qty })),
        total: result.total,
      });
      clearCart();
      setPlaced(result.id);
      window.scrollTo({ top: 0 });
      // Reload Products so the new stock levels show.
      void router.invalidate();
    } catch (error) {
      toast.error("Could not place the order", { description: errorText(error) });
    } finally {
      setSubmitting(false);
    }
  };

  if (placed) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <CheckCircle2 className="mx-auto size-14 text-success" aria-hidden="true" />
        <h1 className="mt-4 text-3xl font-bold">Order confirmed</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Order <span className="font-semibold text-foreground">{placed}</span> is confirmed. We will call or
          message you when it is ready to pick up. You pay when you collect it.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/account" search={{ tab: "orders" }} className="h-11 rounded-md bg-primary px-5 text-sm font-semibold leading-[2.75rem] text-primary-foreground">
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
            if (step === 0 && (localPhone.length < 5 || localPhone.length > 14)) {
              setPhoneError("Enter a valid phone number.");
              return;
            }
            if (step < LAST_STEP) {
              setStep(step + 1);
              return;
            }
            if (!submitting) void submit();
          }}
        >
          {step === 0 && (
            <>
              <h2 className="text-lg font-bold">Customer information</h2>
              <Field id="name" label="Full name" value={form.name} onChange={(v) => set({ name: v })} required />
              <div>
                <label htmlFor="phone" className="mb-1 block text-sm font-medium">
                  Phone
                </label>
                <PhoneInput
                  id="phone"
                  country={form.phoneCountry}
                  number={form.phone}
                  onCountryChange={(iso) => set({ phoneCountry: iso })}
                  onNumberChange={(v) => {
                    set({ phone: v });
                    setPhoneError("");
                  }}
                  required
                />
                {phoneError ? <p className="mt-1 text-sm text-destructive">{phoneError}</p> : null}
              </div>
              <Field id="email" label="Email" type="email" value={form.email} onChange={(v) => set({ email: v })} required />
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-lg font-bold">Payment</h2>
              <p className="flex items-start gap-2 rounded-md bg-muted p-3 text-sm">
                <Store className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                We do not deliver. We will contact you when your order is ready, and you pay when you pick it up.
              </p>
              {PAYMENT_OPTIONS.map(([value, label]) => (
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

          {step === 2 && (
            <>
              <h2 className="text-lg font-bold">Review your order</h2>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <Review label="Name" value={form.name} />
                <Review label="Phone" value={fullPhone} />
                <Review label="Email" value={form.email} />
                <Review label="Payment" value={paymentLabel} />
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
                disabled={submitting}
                className="h-12 rounded-md border border-border px-5 text-sm font-semibold"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="h-12 flex-1 rounded-md bg-accent text-sm font-semibold text-accent-foreground disabled:opacity-60"
            >
              {step === LAST_STEP ? (submitting ? "Placing order…" : "Place Order") : "Continue"}
            </button>
          </div>
        </form>

        <aside className="card-surface h-fit p-5">
          <h2 className="text-lg font-bold">Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="font-bold">Total</dt>
              <dd className="font-display text-xl font-bold">{formatAMD(cartSubtotal)}</dd>
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
