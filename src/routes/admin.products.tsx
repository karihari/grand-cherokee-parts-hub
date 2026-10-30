import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import {
  CATEGORIES,
  categoryName,
  fitmentLabel,
  formatAMD,
  type Product,
  productName,
} from "@/data/catalog";
import { toast } from "sonner";
import { PageHeader, Panel, Pill, Table } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProduct, deleteProduct, updateProduct, type ProductInput } from "@/lib/api/admin";
import { errorText } from "@/lib/api/errors";
import { useProducts } from "@/lib/products";
import { useT, useLang } from "@/lib/i18n";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

function AdminProducts() {
  const t = useT();
  const lang = useLang();
  const products = useProducts();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const save = async (input: ProductInput) => {
    setSaving(true);
    const existing = editing !== "new" ? editing : null;
    try {
      if (existing) await updateProduct(existing.id, input);
      else await createProduct(input);
      await router.invalidate();
      toast.success(
        existing ? t("Товар обновлён", "Product updated") : t("Товар добавлен", "Product added"),
      );
      setEditing(null);
    } catch (error) {
      toast.error(t("Не удалось сохранить товар", "Could not save the product"), {
        description: errorText(error),
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: Product) => {
    if (
      !window.confirm(
        t(
          `Удалить «${productName(p, lang)}»? Это действие нельзя отменить.`,
          `Delete "${productName(p, lang)}"? This cannot be undone.`,
        ),
      )
    )
      return;
    try {
      await deleteProduct(p.id);
      await router.invalidate();
      toast.success(t("Товар удалён", "Product deleted"));
    } catch (error) {
      toast.error(t("Не удалось удалить товар", "Could not delete the product"), {
        description: errorText(error),
      });
    }
  };

  const rows = products.filter((p) => {
    if (cat && p.category !== cat) return false;
    if (!q) return true;
    const term = q.toLowerCase();
    return [p.name, p.nameEn, p.partNumber, p.brand].join(" ").toLowerCase().includes(term);
  });

  return (
    <div>
      <PageHeader
        title={t("Товары", "Products")}
        subtitle={`${t("Товаров", "Products")}: ${products.length}`}
        action={
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="size-4" aria-hidden="true" /> {t("Добавить товар", "Add product")}
          </button>
        }
      />

      {editing ? (
        <ProductForm
          key={editing === "new" ? "new" : editing.id}
          product={editing === "new" ? null : editing}
          saving={saving}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      ) : null}

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t(
            "Поиск по названию, артикулу, бренду",
            "Search name, part number, OEM number",
          )}
          aria-label={t("Поиск товаров", "Search products")}
          className="h-11 min-w-64 flex-1 rounded-md border border-input bg-card px-3 text-sm"
        />
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          aria-label={t("Фильтр по категории", "Filter by category")}
          className="h-11 rounded-md border border-input bg-card px-3 text-sm"
        >
          <option value="">{t("Все категории", "All categories")}</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {t(c.name)}
            </option>
          ))}
        </select>
      </div>

      <Panel>
        <Table
          head={[
            t("Фото", "Image"),
            t("Товар", "Product"),
            t("Артикул", "Part №"),
            t("Категория", "Category"),
            t("Цена", "Price"),
            t("Склад", "Stock"),
            t("Совместимость", "Compatibility"),
            t("Статус", "Status"),
            t("Действия", "Actions"),
          ]}
        >
          {rows.map((p) => (
            <tr key={p.id} className="border-t border-border align-top">
              <td className="p-3">
                <img
                  src={p.image}
                  alt=""
                  loading="lazy"
                  width={800}
                  height={800}
                  className="size-12 rounded-md object-cover"
                />
              </td>
              <td className="p-3">
                <p className="font-medium">{productName(p, lang)}</p>
                <p className="text-xs text-muted-foreground">{p.brand}</p>
              </td>
              <td className="p-3 whitespace-nowrap">{p.partNumber}</td>
              <td className="p-3">{categoryName(p.category, t)}</td>
              <td className="p-3 whitespace-nowrap font-medium">{formatAMD(p.price)}</td>
              <td className="p-3">
                <Pill tone={p.stock <= 3 ? "warn" : "good"}>{p.stock}</Pill>
              </td>
              <td className="p-3 text-xs text-muted-foreground">
                {p.fits.map(fitmentLabel).join(" · ")}
              </td>
              <td className="p-3">
                <Pill tone="good">{t("Опубликован", "Published")}</Pill>
              </td>
              <td className="p-3">
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" onClick={() => setEditing(p)} className={ACTION}>
                    {t("Изменить", "Edit")}
                  </button>
                  <Link
                    to="/product/$slug"
                    params={{ slug: p.slug }}
                    target="_blank"
                    className={ACTION}
                  >
                    {t("Открыть", "View")}
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(p)}
                    className={`${ACTION} text-destructive`}
                  >
                    {t("Удалить", "Delete")}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}

const ACTION = "rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-secondary";
