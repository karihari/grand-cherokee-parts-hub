import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { CATEGORIES, GENERATIONS, PRODUCT_IMAGES, type Product } from "@/data/catalog";
import type { ProductInput } from "@/lib/admin-products.functions";
import { Panel } from "@/components/admin/ui";

type FitRow = { gen: "WK" | "WK2" | "WL"; from: string; to: string; engines: string };

type FormState = {
  name: string;
  category: string;
  brand: string;
  partNumber: string;
  oemNumber: string;
  price: string;
  oldPrice: string;
  condition: "New" | "Used";
  origin: "OEM" | "Aftermarket";
  stock: string;
  seller: string;
  delivery: string;
  warranty: string;
  imageKey: string;
  imageUrl: string;
  description: string;
  featured: boolean;
  fits: FitRow[];
};

const CUSTOM_IMAGE = "__url";

function imageKeyOf(url: string) {
  return Object.keys(PRODUCT_IMAGES).find((k) => PRODUCT_IMAGES[k] === url);
}

function initialState(product: Product | null): FormState {
  if (!product) {
    return {
      name: "",
      category: CATEGORIES[0]?.slug ?? "",
      brand: "",
      partNumber: "",
      oemNumber: "",
      price: "",
      oldPrice: "",
      condition: "New",
      origin: "OEM",
      stock: "1",
      seller: "GC Parts",
      delivery: "2–4 days",
      warranty: "12 months",
      imageKey: "engine",
      imageUrl: "",
      description: "",
      featured: false,
      fits: [{ gen: "WK2", from: "2011", to: "2021", engines: "" }],
    };
  }
  const key = imageKeyOf(product.image);
  return {
    name: product.name,
    category: product.category,
    brand: product.brand,
    partNumber: product.partNumber,
    oemNumber: product.oemNumber,
    price: String(product.price),
    oldPrice: product.oldPrice != null ? String(product.oldPrice) : "",
    condition: product.condition,
    origin: product.origin,
    stock: String(product.stock),
    seller: product.seller,
    delivery: product.delivery,
    warranty: product.warranty,
    imageKey: key ?? CUSTOM_IMAGE,
    imageUrl: key ? "" : product.image,
    description: product.description,
    featured: product.featured ?? false,
    fits: product.fits.map((f) => ({
      gen: f.gen,
      from: String(f.from),
      to: String(f.to),
      engines: f.engines?.join(", ") ?? "",
    })),
  };
}

function toInput(f: FormState, id: string | undefined): ProductInput {
  const input: ProductInput = {
    name: f.name,
    category: f.category,
    brand: f.brand,
    partNumber: f.partNumber,
    oemNumber: f.oemNumber,
    price: Number(f.price),
    oldPrice: f.oldPrice.trim() ? Number(f.oldPrice) : null,
    condition: f.condition,
    origin: f.origin,
    stock: Number(f.stock),
    seller: f.seller,
    delivery: f.delivery,
    warranty: f.warranty,
    image: f.imageKey === CUSTOM_IMAGE ? f.imageUrl : f.imageKey,
    description: f.description,
    featured: f.featured,
    fits: f.fits.map((r) => {
      const engines = r.engines
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
      const fit = { gen: r.gen, from: Number(r.from), to: Number(r.to) };
      return engines.length ? { ...fit, engines } : fit;
    }),
  };
  if (id) input.id = id;
  return input;
}

export function ProductForm({
  product,
  saving,
  onSave,
  onCancel,
}: {
  product: Product | null;
  saving: boolean;
  onSave: (input: ProductInput) => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState(() => initialState(product));
  const set = (patch: Partial<FormState>) => setF((s) => ({ ...s, ...patch }));
  const setFit = (i: number, patch: Partial<FitRow>) =>
    setF((s) => ({ ...s, fits: s.fits.map((r, j) => (j === i ? { ...r, ...patch } : r)) }));

  const previewSrc = f.imageKey === CUSTOM_IMAGE ? f.imageUrl : PRODUCT_IMAGES[f.imageKey];

  return (
    <Panel className="mb-5 p-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(toInput(f, product?.id));
        }}
      >
        <h2 className="text-lg font-bold">{product ? `Edit: ${product.name}` : "New product"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Product name" value={f.name} onChange={(v) => set({ name: v })} required />
          <SelectField
            label="Category"
            value={f.category}
            onChange={(v) => set({ category: v })}
            options={CATEGORIES.map((c) => [c.slug, c.name])}
          />
          <Field label="Brand" value={f.brand} onChange={(v) => set({ brand: v })} required />
          <Field
            label="Part number"
            value={f.partNumber}
            onChange={(v) => set({ partNumber: v })}
            required
          />
          <Field label="OEM number" value={f.oemNumber} onChange={(v) => set({ oemNumber: v })} />
          <Field label="Seller" value={f.seller} onChange={(v) => set({ seller: v })} required />
          <Field
            label="Price (AMD)"
            type="number"
            value={f.price}
            onChange={(v) => set({ price: v })}
            required
          />
          <Field
            label="Old Price (AMD, optional)"
            type="number"
            value={f.oldPrice}
            onChange={(v) => set({ oldPrice: v })}
          />
          <Field
            label="Stock"
            type="number"
            value={f.stock}
            onChange={(v) => set({ stock: v })}
            required
          />
          <SelectField
            label="Condition"
            value={f.condition}
            onChange={(v) => set({ condition: v as FormState["condition"] })}
            options={[
              ["New", "New"],
              ["Used", "Used"],
            ]}
          />
          <SelectField
            label="OEM or Aftermarket"
            value={f.origin}
            onChange={(v) => set({ origin: v as FormState["origin"] })}
            options={[
              ["OEM", "OEM (original Mopar)"],
              ["Aftermarket", "Aftermarket"],
            ]}
          />
          <Field
            label="Warranty"
            value={f.warranty}
            onChange={(v) => set({ warranty: v })}
            required
          />
          <Field
            label="Delivery estimate"
            value={f.delivery}
            onChange={(v) => set({ delivery: v })}
            required
          />
          <SelectField
            label="Image"
            value={f.imageKey}
            onChange={(v) => set({ imageKey: v })}
            options={[
              ...Object.keys(PRODUCT_IMAGES).map((k): [string, string] => [k, `Stock photo: ${k}`]),
              [CUSTOM_IMAGE, "Image link (URL)"],
            ]}
          />
          {f.imageKey === CUSTOM_IMAGE ? (
            <Field
              label="Image link"
              type="url"
              value={f.imageUrl}
              onChange={(v) => set({ imageUrl: v })}
              placeholder="https://…"
              required
            />
          ) : null}
          {previewSrc ? (
            <img
              src={previewSrc}
              alt=""
              className="size-24 rounded-md border border-border object-cover"
            />
          ) : null}
        </div>

        <fieldset className="mt-4 rounded-md border border-border p-4">
          <legend className="px-1 text-sm font-bold uppercase">Fitment</legend>
          <div className="space-y-3">
            {f.fits.map((r, i) => (
              <div key={i} className="grid items-end gap-3 sm:grid-cols-[8rem_7rem_7rem_1fr_auto]">
                <SelectField
                  label="Generation"
                  value={r.gen}
                  onChange={(v) => setFit(i, { gen: v as FitRow["gen"] })}
                  options={GENERATIONS.map((g) => [g.code, g.code])}
                />
                <Field
                  label="Year from"
                  type="number"
                  value={r.from}
                  onChange={(v) => setFit(i, { from: v })}
                  required
                />
                <Field
                  label="Year to"
                  type="number"
                  value={r.to}
                  onChange={(v) => setFit(i, { to: v })}
                  required
                />
                <Field
                  label="Engines (optional, comma separated)"
                  value={r.engines}
                  onChange={(v) => setFit(i, { engines: v })}
                  placeholder={GENERATIONS.find((g) => g.code === r.gen)?.engines.join(", ")}
                />
                <button
                  type="button"
                  onClick={() => setF((s) => ({ ...s, fits: s.fits.filter((_, j) => j !== i) }))}
                  aria-label="Remove this fitment"
                  className="h-11 rounded-md border border-border px-3 hover:bg-secondary"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              setF((s) => ({
                ...s,
                fits: [...s.fits, { gen: "WK2", from: "2011", to: "2021", engines: "" }],
              }))
            }
            className="mt-3 inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-sm font-medium hover:bg-secondary"
          >
            <Plus className="size-4" aria-hidden="true" /> Add fitment
          </button>
        </fieldset>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium" htmlFor="product-description">
            Description
          </label>
          <textarea
            id="product-description"
            rows={3}
            value={f.description}
            onChange={(e) => set({ description: e.target.value })}
            className="w-full rounded-md border border-input bg-card p-3 text-sm"
          />
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={f.featured}
            onChange={(e) => set({ featured: e.target.checked })}
          />
          Show on the home page ("Popular right now")
        </label>

        <div className="mt-4 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="h-11 rounded-md bg-accent px-5 text-sm font-semibold text-accent-foreground disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save product"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-md border border-border px-5 text-sm font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    </Panel>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string | undefined;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        min={type === "number" ? 0 : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
      >
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}
