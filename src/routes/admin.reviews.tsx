import { createFileRoute } from "@tanstack/react-router";
import { ADMIN_REVIEWS } from "@/data/admin";
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

export const Route = createFileRoute("/admin/reviews")({ component: AdminReviews });

function AdminReviews() {
  const t = useT();
  return (
    <div>
      <PageHeader
        title={t("Отзывы", "Reviews")}
        subtitle={t(
          "Одобряйте, скрывайте или удаляйте отзывы клиентов.",
          "Approve, hide or delete customer reviews.",
        )}
      />
      <Panel>
        <Table
          head={[
            t("Клиент", "Customer"),
            t("Товар", "Product"),
            t("Оценка", "Rating"),
            t("Отзыв", "Review"),
            t("Дата", "Date"),
            t("Статус", "Status"),
            t("Действия", "Actions"),
          ]}
        >
          {ADMIN_REVIEWS.map((r) => (
            <tr key={`${r.customer}-${r.date}`} className="border-t border-border">
              <td className="p-3 font-medium">{r.customer}</td>
              <td className="p-3">{r.product}</td>
              <td className="p-3">{r.rating}/5</td>
              <td className="p-3 text-muted-foreground">{t(r.text)}</td>
              <td className="p-3 whitespace-nowrap text-muted-foreground">{r.date}</td>
              <td className="p-3">
                <Pill tone={statusTone(r.status)}>{statusLabel(r.status, t)}</Pill>
              </td>
              <td className="p-3">
                <RowActions
                  items={[t("Одобрить", "Approve"), t("Скрыть", "Hide"), t("Удалить", "Delete")]}
                />
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
