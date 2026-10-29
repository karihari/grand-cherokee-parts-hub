import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, Panel, Pill, Table } from "@/components/admin/ui";
import { useProducts } from "@/lib/products";
import { productName } from "@/data/catalog";
import { useT, useLang } from "@/lib/i18n";

export const Route = createFileRoute("/admin/inventory")({ component: AdminInventory });

function AdminInventory() {
  const t = useT();
  const lang = useLang();
  const products = useProducts();
  const low = products.filter((p) => p.stock <= 3);

  return (
    <div>
      <PageHeader
        title={t("Склад", "Inventory")}
        subtitle={t(
          `Товаров с остатком 3 шт. и меньше: ${low.length}.`,
          `${low.length} products are at or below the low-stock threshold of 3.`,
        )}
      />
      <Panel>
        <Table
          head={[
            t("Товар", "Product"),
            t("Код", "SKU"),
            t("Остаток", "Stock"),
            t("В резерве", "Reserved"),
            t("Доступно", "Available"),
            t("Статус", "Status"),
            t("Изменить", "Update"),
          ]}
        >
          {products.map((p) => {
            const reserved = p.stock > 5 ? 2 : 0;
            return (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3 font-medium">{productName(p, lang)}</td>
                <td className="p-3 whitespace-nowrap">{p.id}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">{reserved}</td>
                <td className="p-3">{p.stock - reserved}</td>
                <td className="p-3">
                  <Pill tone={p.stock === 0 ? "bad" : p.stock <= 3 ? "warn" : "good"}>
                    {p.stock === 0
                      ? t("Нет в наличии", "Out of stock")
                      : p.stock <= 3
                        ? t("Заканчивается", "Low stock")
                        : t("В норме", "Healthy")}
                  </Pill>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <label className="sr-only" htmlFor={`stock-${p.id}`}>
                      {t("Новый остаток для", "New stock for")} {productName(p, lang)}
                    </label>
                    <input
                      id={`stock-${p.id}`}
                      type="number"
                      defaultValue={p.stock}
                      className="h-9 w-20 rounded-md border border-input bg-card px-2 text-sm"
                    />
                    <button
                      type="button"
                      className="h-9 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground"
                    >
                      {t("Сохранить", "Save")}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </Table>
      </Panel>
    </div>
  );
}
