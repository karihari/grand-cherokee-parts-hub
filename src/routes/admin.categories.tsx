import { createFileRoute } from "@tanstack/react-router";
import { CATEGORIES, brandsOf } from "@/data/catalog";
import { PageHeader, Panel, RowActions, Table } from "@/components/admin/ui";
import { useProducts } from "@/lib/products";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/admin/categories")({ component: AdminCategories });

function AdminCategories() {
  const t = useT();
  const products = useProducts();
  return (
    <div>
      <PageHeader
        title={t("Категории и бренды", "Categories & Brands")}
        subtitle={t(
          "Меняйте порядок категорий, их фото и товары.",
          "Reorder categories, change images and assign products.",
        )}
        action={
          <button
            type="button"
            className="h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            {t("Создать категорию", "Create category")}
          </button>
        }
      />

      <Panel>
        <Table
          head={[
            t("Фото", "Image"),
            t("Категория", "Category"),
            t("Описание", "Description"),
            t("Товары", "Products"),
            t("Порядок", "Order"),
            t("Действия", "Actions"),
          ]}
        >
          {CATEGORIES.map((c, i) => (
            <tr key={c.slug} className="border-t border-border">
              <td className="p-3">
                <img
                  src={c.image}
                  alt=""
                  loading="lazy"
                  width={800}
                  height={800}
                  className="size-12 rounded-md object-cover"
                />
              </td>
              <td className="p-3 font-medium">{t(c.name)}</td>
              <td className="p-3 text-muted-foreground">{t(c.blurb)}</td>
              <td className="p-3">{products.filter((p) => p.category === c.slug).length}</td>
              <td className="p-3">{i + 1}</td>
              <td className="p-3">
                <RowActions
                  items={[
                    t("Изменить", "Edit"),
                    t("Фото", "Image"),
                    t("Выше", "Move up"),
                    t("Удалить", "Delete"),
                  ]}
                />
              </td>
            </tr>
          ))}
        </Table>
      </Panel>

      <Panel className="mt-5">
        <Table head={[t("Бренд", "Brand"), t("Товары", "Products"), t("Действия", "Actions")]}>
          {brandsOf(products).map((b) => (
            <tr key={b} className="border-t border-border">
              <td className="p-3 font-medium">{b}</td>
              <td className="p-3">{products.filter((p) => p.brand === b).length}</td>
              <td className="p-3">
                <RowActions items={[t("Изменить", "Edit"), t("Удалить", "Delete")]} />
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
