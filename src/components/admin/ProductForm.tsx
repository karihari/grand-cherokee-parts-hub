import { useRef, useState } from "react";
import { ImagePlus, Plus, Star, Trash2, X } from "lucide-react";
import { CATEGORIES, GENERATIONS, PRODUCT_IMAGES, type Product } from "@/data/catalog";
import { deleteProductImage, uploadProductImage, type ProductInput } from "@/lib/api/admin";
import { apiImageUrl, storedImagePath } from "@/lib/api/client";
import { errorText } from "@/lib/api/errors";
import { Panel } from "@/components/admin/ui";
import { useT } from "@/lib/i18n";

type FitRow = { gen: "WK" | "WK2" | "WL"; from: string; to: string; engines: string };

type FormState = {
  name: string;
  nameEn: string;
  category: string;
  brand: string;
  partNumber: string;
  price: string;
  oldPrice: string;
  stock: string;
  // Stock picture, used only while the product has no photos of its own.
  imageKey: string;
  // Uploaded photos, cover first.
  photos: string[];
  description: string;
  descriptionEn: string;
  featured: boolean;
  fits: FitRow[];
};

// A cover plus up to ten more (the API allows ten in `gallery`).
const MAX_PHOTOS = 11;

const photoId = (url: string) => /\/images\/([a-f0-9]{32})$/.exec(url)?.[1];

function imageKeyOf(url: string) {
  return Object.keys(PRODUCT_IMAGES).find((k) => PRODUCT_IMAGES[k] === url);
}

function initialState(product: Product | null): FormState {
  if (!product) {
    return {
      name: "",
      nameEn: "",
      category: CATEGORIES[0]?.slug ?? "",
      brand: "",
      partNumber: "",
      price: "",
      oldPrice: "",
      stock: "1",
      imageKey: "engine",
      photos: [],
      description: "",
      descriptionEn: "",
      featured: false,
      fits: [{ gen: "WK2", from: "2011", to: "2021", engines: "" }],
    };
  }
  const key = imageKeyOf(product.image);
  const photos = [product.image, ...(product.gallery ?? [])].filter((url) => !imageKeyOf(url));
  return {
    name: product.name,
    nameEn: product.nameEn ?? "",
    category: product.category,
    brand: product.brand,
    partNumber: product.partNumber,
    price: String(product.price),
    oldPrice: product.oldPrice != null ? String(product.oldPrice) : "",
    stock: String(product.stock),
    imageKey: key ?? "engine",
    photos,
    description: product.description,
    descriptionEn: product.descriptionEn ?? "",
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
    nameEn: f.nameEn,
    category: f.category,
    brand: f.brand,
    partNumber: f.partNumber,
    price: Number(f.price),
    oldPrice: f.oldPrice.trim() ? Number(f.oldPrice) : null,
    stock: Number(f.stock),
    image: f.photos.length ? storedImagePath(f.photos[0]!) : f.imageKey,
    gallery: f.photos.slice(1).map(storedImagePath),
    description: f.description,
    descriptionEn: f.descriptionEn,
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
  // Photos uploaded while this form is open. If they are taken out again, or the form is
  // cancelled, they are not on any product yet, so they are deleted from the bucket.
  const fresh = useRef(new Set<string>());

  const dropFromBucket = (url: string) => {
    const id = photoId(url);
    if (id && fresh.current.delete(id)) void deleteProductImage(id).catch(() => undefined);
  };

  async function upload(files: File[]) {
    const room = MAX_PHOTOS - f.photos.length;
    if (room <= 0) return;
    setUploading(true);
    setUploadError(null);
    // Photos that made it up before an error are kept, so a retry only needs the rest.
    const added: string[] = [];
    try {
      for (const file of files.slice(0, room)) {
        const { id, url } = await uploadProductImage(await resizeImage(file));
        fresh.current.add(id);
        added.push(apiImageUrl(url));
      }
      if (files.length > room) {
        setUploadError(
          t(`Можно не больше ${MAX_PHOTOS} фото`, `At most ${MAX_PHOTOS} photos per product`),
        );
      }
    } catch (err) {
      setUploadError(errorText(err));
    } finally {
      if (added.length) setF((s) => ({ ...s, photos: [...s.photos, ...added] }));
      setUploading(false);
    }
  }

  const removePhoto = (i: number) => {
    dropFromBucket(f.photos[i]!);
    setF((s) => ({ ...s, photos: s.photos.filter((_, j) => j !== i) }));
  };

  const makeCover = (i: number) =>
    setF((s) => ({ ...s, photos: [s.photos[i]!, ...s.photos.filter((_, j) => j !== i)] }));

  const cancel = () => {
    for (const id of [...fresh.current]) dropFromBucket(`/images/${id}`);
    onCancel();
  };

  const stockSrc = PRODUCT_IMAGES[f.imageKey];

  return (
    <Panel className="mb-5 p-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
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
          <Field
            label={t("Название товара (английский)", "Product name (English)")}
            value={f.nameEn}
            onChange={(v) => set({ nameEn: v })}
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
            label={t("Стандартное фото", "Stock photo")}
            value={f.imageKey}
            onChange={(v) => set({ imageKey: v })}
            options={Object.keys(PRODUCT_IMAGES).map((k): [string, string] => [k, k])}
          />
          {!f.photos.length && stockSrc ? (
            <img
              src={stockSrc}
              alt=""
              className="size-24 rounded-md border border-border object-cover"
            />
          ) : null}
        </div>

        <fieldset className="mt-4 rounded-md border border-border p-4">
          <legend className="px-1 text-sm font-bold uppercase">{t("Фото", "Photos")}</legend>
          <p className="mb-3 text-xs text-muted-foreground">
            {t(
              "Первое фото — обложка в каталоге. Без своих фото показывается стандартное.",
              "The first photo is the cover in the catalogue. Without photos of its own, the stock photo is shown.",
            )}
          </p>
          <ul className="flex flex-wrap gap-3">
            {f.photos.map((url, i) => (
              <li key={url} className="w-28">
                <div className="relative">
                  <img
                    src={url}
                    alt=""
                    className="size-28 rounded-md border border-border object-cover"
                  />
                  {i === 0 ? (
                    <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
                      {t("Обложка", "Cover")}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    aria-label={t("Убрать фото", "Remove photo")}
                    className="absolute right-1 top-1 inline-flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
                {i > 0 ? (
                  <button
                    type="button"
                    onClick={() => makeCover(i)}
                    className="mt-1 inline-flex w-full items-center justify-center gap-1 rounded-md border border-border px-1 py-1 text-xs hover:bg-secondary"
                  >
                    <Star className="size-3" aria-hidden="true" />
                    {t("Сделать обложкой", "Make cover")}
                  </button>
                ) : null}
              </li>
            ))}
            {f.photos.length < MAX_PHOTOS ? (
              <li>
                <label
                  className={`flex size-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border text-xs text-muted-foreground hover:bg-secondary ${uploading ? "pointer-events-none opacity-60" : ""}`}
                >
                  <ImagePlus className="size-5" aria-hidden="true" />
                  {uploading ? t("Загрузка…", "Uploading…") : t("Добавить фото", "Add photos")}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploading}
                    className="sr-only"
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? []);
                      e.target.value = "";
                      if (files.length) void upload(files);
                    }}
                  />
                </label>
              </li>
            ) : null}
          </ul>
          {uploadError ? (
            <p role="alert" className="mt-2 text-xs text-destructive">
              {uploadError}
            </p>
          ) : null}
        </fieldset>
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
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="product-description-en">
              {t("Описание (английский)", "Description (English)")}
            </label>
            <textarea
              id="product-description-en"
              rows={3}
              value={f.descriptionEn}
              onChange={(e) => set({ descriptionEn: e.target.value })}
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
            onClick={cancel}
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
