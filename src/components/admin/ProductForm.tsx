import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { CATEGORIES, GENERATIONS, PRODUCT_IMAGES, type Product } from "@/data/catalog";
import { uploadProductImage, type ProductInput } from "@/lib/api/admin";
import { apiImageUrl, storedImagePath } from "@/lib/api/client";
import { errorText } from "@/lib/api/errors";
import { Panel } from "@/components/admin/ui";
import { useT } from "@/lib/i18n";

type FitRow = { gen: "WK" | "WK2" | "WL"; from: string; to: string; engines: string };

type FormState = {
  name: string;
  category: string;
  brand: string;
  partNumber: string;
  price: string;
  oldPrice: string;
  stock: string;
  imageKey: string;
  imageUrl: string;
  description: string;
  featured: boolean;
  fits: FitRow[];
};

const CUSTOM_IMAGE = "__upload";

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
      price: "",
      oldPrice: "",
      stock: "1",
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
    price: String(product.price),
    oldPrice: product.oldPrice != null ? String(product.oldPrice) : "",
    stock: String(product.stock),
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

function toInput(f: FormState): ProductInput {
  const input: ProductInput = {
    name: f.name,
    category: f.category,
    brand: f.brand,
    partNumber: f.partNumber,
    price: Number(f.price),
    oldPrice: f.oldPrice.trim() ? Number(f.oldPrice) : null,
    stock: Number(f.stock),
    image: f.imageKey === CUSTOM_IMAGE ? storedImagePath(f.imageUrl) : f.imageKey,
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
  const t = useT();
  const [f, setF] = useState(() => initialState(product));
  const set = (patch: Partial<FormState>) => setF((s) => ({ ...s, ...patch }));
  const setFit = (i: number, patch: Partial<FitRow>) =>
    setF((s) => ({ ...s, fits: s.fits.map((r, j) => (j === i ? { ...r, ...patch } : r)) }));

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function upload(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const { url } = await uploadProductImage(await resizeImage(file));
      set({ imageUrl: apiImageUrl(url) });
    } catch (err) {
      setUploadError(errorText(err));
    } finally {
      setUploading(false);
    }
  }

  const previewSrc = f.imageKey === CUSTOM_IMAGE ? f.imageUrl : PRODUCT_IMAGES[f.imageKey];

  return (
    <Panel className="mb-5 p-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (f.imageKey === CUSTOM_IMAGE && !f.imageUrl) {
            setUploadError(t("Сначала выберите фото", "Choose a photo first"));
            return;
          }
          onSave(toInput(f));
        }}
      >
        <h2 className="text-lg font-bold">
          {product
            ? `${t("Редактирование", "Edit")}: ${product.name}`
            : t("Новый товар", "New product")}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field
            label={t("Название товара (русский)", "Product name (Russian)")}
            value={f.name}
            onChange={(v) => set({ name: v })}
            required
          />
          <SelectField
            label={t("Категория", "Category")}
            value={f.category}
            onChange={(v) => set({ category: v })}
            options={CATEGORIES.map((c) => [c.slug, t(c.name)])}
          />
          <Field
            label={t("Бренд", "Brand")}
            value={f.brand}
            onChange={(v) => set({ brand: v })}
            required
          />
          <Field
            label={t("Артикул", "Part number")}
            value={f.partNumber}
            onChange={(v) => set({ partNumber: v })}
            required
          />
          <Field
            label={t("Цена (AMD)", "Price (AMD)")}
            type="number"
            value={f.price}
            onChange={(v) => set({ price: v })}
            required
          />
          <Field
            label={t("Старая цена (AMD, необязательно)", "Old Price (AMD, optional)")}
            type="number"
            value={f.oldPrice}
            onChange={(v) => set({ oldPrice: v })}
          />
          <Field
            label={t("Остаток", "Stock")}
            type="number"
            value={f.stock}
            onChange={(v) => set({ stock: v })}
            required
          />
          <SelectField
            label={t("Фото", "Image")}
            value={f.imageKey}
            onChange={(v) => set({ imageKey: v })}
            options={[
              ...Object.keys(PRODUCT_IMAGES).map((k): [string, string] => [
                k,
                `${t("Стандартное фото", "Stock photo")}: ${k}`,
              ]),
              [CUSTOM_IMAGE, t("Загрузить с компьютера", "Upload from computer")],
            ]}
          />
          {f.imageKey === CUSTOM_IMAGE ? (
            <label className="block">
              <span className="mb-1 block text-sm font-medium">{t("Файл фото", "Photo")}</span>
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void upload(file);
                }}
                className="block w-full text-sm file:mr-3 file:h-11 file:rounded-md file:border file:border-border file:bg-card file:px-4 file:text-sm file:font-medium"
              />
              <span className="mt-1 block text-xs text-muted-foreground">
                {uploading
                  ? t("Загрузка…", "Uploading…")
                  : (uploadError ?? (f.imageUrl ? "" : t("Выберите фото", "Choose a photo")))}
              </span>
            </label>
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
          <legend className="px-1 text-sm font-bold uppercase">
            {t("Совместимость", "Fitment")}
          </legend>
          <div className="space-y-3">
            {f.fits.map((r, i) => (
              <div key={i} className="grid items-end gap-3 sm:grid-cols-[8rem_7rem_7rem_1fr_auto]">
                <SelectField
                  label={t("Поколение", "Generation")}
                  value={r.gen}
                  onChange={(v) => setFit(i, { gen: v as FitRow["gen"] })}
                  options={GENERATIONS.map((g) => [g.code, g.code])}
                />
                <Field
                  label={t("Год с", "Year from")}
                  type="number"
                  value={r.from}
                  onChange={(v) => setFit(i, { from: v })}
                  required
                />
                <Field
                  label={t("Год по", "Year to")}
                  type="number"
                  value={r.to}
                  onChange={(v) => setFit(i, { to: v })}
                  required
                />
                <Field
                  label={t(
                    "Двигатели (необязательно, через запятую)",
                    "Engines (optional, comma separated)",
                  )}
                  value={r.engines}
                  onChange={(v) => setFit(i, { engines: v })}
                  placeholder={GENERATIONS.find((g) => g.code === r.gen)?.engines.join(", ")}
                />
                <button
                  type="button"
                  onClick={() => setF((s) => ({ ...s, fits: s.fits.filter((_, j) => j !== i) }))}
                  aria-label={t("Удалить эту строку", "Remove this fitment")}
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
            <Plus className="size-4" aria-hidden="true" />{" "}
            {t("Добавить совместимость", "Add fitment")}
          </button>
        </fieldset>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="product-description">
              {t("Описание (русский)", "Description (Russian)")}
            </label>
            <textarea
              id="product-description"
              rows={3}
              value={f.description}
              onChange={(e) => set({ description: e.target.value })}
              className="w-full rounded-md border border-input bg-card p-3 text-sm"
            />
          </div>
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={f.featured}
            onChange={(e) => set({ featured: e.target.checked })}
          />
          {t("Показывать на главной («Популярное»)", 'Show on the home page ("Popular right now")')}
        </label>

        <div className="mt-4 flex gap-3">
          <button
            type="submit"
            disabled={saving || uploading}
            className="h-11 rounded-md bg-accent px-5 text-sm font-semibold text-accent-foreground disabled:opacity-60"
          >
            {saving ? t("Сохранение…", "Saving…") : t("Сохранить товар", "Save product")}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-md border border-border px-5 text-sm font-semibold"
          >
            {t("Отмена", "Cancel")}
          </button>
        </div>
      </form>
    </Panel>
  );
}

const MAX_IMAGE_SIDE = 1200;

// Shrinks the photo to at most 1200px on the long side and re-encodes it as JPEG,
// so phone photos of several MB become ~200 KB before upload.
async function resizeImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not read the photo"))),
      "image/jpeg",
      0.85,
    ),
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
