import { createFileRoute } from "@tanstack/react-router";
import { ADMIN_SELLERS } from "@/data/admin";
import { formatAMD } from "@/data/catalog";
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

export const Route = createFileRoute("/admin/sellers")({ component: AdminSellers });

function AdminSellers() {
  const t = useT();
  return (
    <div>
      <PageHeader
        title={t("Продавцы", "Sellers")}
        subtitle={t(
          "Одобряйте продавцов и следите за их показателями.",
          "Approve sellers and monitor their performance.",
        )}
      />
      <Panel>
        <Table
          head={[
            t("Продавец", "Seller"),
            t("Товары", "Products"),
            t("Рейтинг", "Rating"),
            t("Продажи", "Sales"),
            t("Статус", "Status"),
            t("Действия", "Actions"),
          ]}
        >
          {ADMIN_SELLERS.map((s) => (
            <tr key={s.name} className="border-t border-border">
              <td className="p-3 font-medium">{s.name}</td>
              <td className="p-3">{s.products}</td>
              <td className="p-3">{s.rating}</td>
              <td className="p-3 whitespace-nowrap">{formatAMD(s.sales)}</td>
              <td className="p-3">
                <Pill tone={statusTone(s.status)}>{statusLabel(s.status, t)}</Pill>
              </td>
              <td className="p-3">
                <RowActions
                  items={[
                    t("Открыть", "View"),
                    t("Товары", "Products"),
                    s.status === "Pending"
                      ? t("Одобрить", "Approve")
                      : t("Приостановить", "Suspend"),
                  ]}
                />
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
