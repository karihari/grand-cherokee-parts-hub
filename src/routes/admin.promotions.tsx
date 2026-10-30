import { createFileRoute } from "@tanstack/react-router";
import { ADMIN_PROMOTIONS } from "@/data/admin";
import {
  PageHeader,
  Panel,
  Pill,
  RowActions,
  Table,
  statusLabel,
  statusTone,
} from "@/components/admin/ui";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/admin/promotions")({ component: AdminPromotions });

function AdminPromotions() {
  const t = useT();
  return (
    <div>
      <PageHeader
        title={t("Акции", "Promotions")}
        subtitle={t(
          "Скидки, купоны, распродажи, избранные товары и баннеры на главной.",
          "Discounts, coupons, sales, featured products and homepage banners.",
        )}
        action={
          <button
            type="button"
            className="h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            {t("Создать акцию", "Create promotion")}
          </button>
        }
      />
      <Panel>
        <Table
          head={[
            t("Акция", "Promotion"),
            t("Скидка", "Discount"),
            t("Начало", "Start"),
            t("Конец", "End"),
            t("Применяется к", "Applies to"),
            t("Статус", "Status"),
            t("Действия", "Actions"),
          ]}
        >
          {ADMIN_PROMOTIONS.map((p) => (
            <tr key={p.name.en} className="border-t border-border">
              <td className="p-3 font-medium">{t(p.name)}</td>
              <td className="p-3">{p.discount}</td>
              <td className="p-3 whitespace-nowrap text-muted-foreground">{p.start}</td>
              <td className="p-3 whitespace-nowrap text-muted-foreground">{p.end}</td>
              <td className="p-3">{t(p.scope)}</td>
              <td className="p-3">
                <Pill tone={statusTone(p.status)}>{statusLabel(p.status, t)}</Pill>
              </td>
              <td className="p-3">
                <RowActions
                  items={[t("Изменить", "Edit"), t("Пауза", "Pause"), t("Удалить", "Delete")]}
                />
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
