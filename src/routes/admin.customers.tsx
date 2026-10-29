import { createFileRoute } from "@tanstack/react-router";
import { ADMIN_CUSTOMERS } from "@/data/admin";
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

export const Route = createFileRoute("/admin/customers")({ component: AdminCustomers });

function AdminCustomers() {
  const t = useT();
  return (
    <div>
      <PageHeader
        title={t("Клиенты", "Customers")}
        subtitle={t(
          "Свяжитесь с клиентом или посмотрите историю его заказов.",
          "Contact a customer or review their order history.",
        )}
      />
      <Panel>
        <Table
          head={[
            t("Имя", "Name"),
            t("Телефон", "Phone"),
            "Email",
            t("Заказы", "Orders"),
            t("Потрачено", "Total spent"),
            t("Регистрация", "Registered"),
            t("Статус", "Status"),
            t("Действия", "Actions"),
          ]}
        >
          {ADMIN_CUSTOMERS.map((c) => (
            <tr key={c.email} className="border-t border-border">
              <td className="p-3 font-medium">{c.name}</td>
              <td className="p-3 whitespace-nowrap">{c.phone}</td>
              <td className="p-3">{c.email}</td>
              <td className="p-3">{c.orders}</td>
              <td className="p-3 whitespace-nowrap">{formatAMD(c.spent)}</td>
              <td className="p-3 text-muted-foreground">{c.joined}</td>
              <td className="p-3">
                <Pill tone={statusTone(c.status)}>{statusLabel(c.status, t)}</Pill>
              </td>
              <td className="p-3">
                <RowActions
                  items={[
                    t("Открыть", "View"),
                    t("Заказы", "Orders"),
                    t("Связаться", "Contact"),
                    c.status === "Blocked"
                      ? t("Разблокировать", "Unblock")
                      : t("Заблокировать", "Block"),
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
