import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { formatAMD } from "@/data/catalog";
import { ORDER_STATUSES, type OrderStatus } from "@/data/orders";
import { PageHeader, Panel, Pill, Table, statusLabel, statusTone } from "@/components/admin/ui";
import { listOrders, setOrderStatus } from "@/lib/api/admin";
import { errorText } from "@/lib/api/errors";
import { dateLocale, useLang, useT } from "@/lib/i18n";

export const Route = createFileRoute("/admin/orders")({
  loader: () => listOrders({ perPage: 200 }),
  component: AdminOrders,
});

const PAYMENT_LABEL = {
  cash: { ru: "Наличными при получении", en: "Cash at pickup" },
  card: { ru: "Картой при получении", en: "Card at pickup" },
} as const;

function AdminOrders() {
  const t = useT();
  const lang = useLang();
  const { data: orders, meta } = Route.useLoaderData();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const changeStatus = async (id: string, status: OrderStatus) => {
    if (
      status === "Cancelled" &&
      !window.confirm(
        t(
          `Отменить заказ ${id}? Его товары вернутся на склад.`,
          `Cancel order ${id}? Its parts go back into stock.`,
        ),
      )
    )
      return;
    setBusyId(id);
    try {
      await setOrderStatus(id, status);
      // Cancelling changes stock, so reload Products too.
      await router.invalidate();
      toast.success(`${t("Заказ", "Order")} ${id}: ${statusLabel(status, t)}`);
    } catch (error) {
      toast.error(t("Не удалось обновить заказ", "Could not update the order"), {
        description: errorText(error),
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title={t("Заказы", "Orders")}
        subtitle={`${t(
          "Заказы с сайта. Клиенты забирают и оплачивают их в магазине.",
          "Orders placed on the website. Customers pick up and pay at the shop.",
        )}${
          meta.total > orders.length
            ? t(
                ` Показаны последние ${orders.length} из ${meta.total}.`,
                ` Showing the newest ${orders.length} of ${meta.total}.`,
              )
            : ""
        }`}
      />
      <Panel>
        {orders.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">
            {t("Заказов пока нет.", "No orders yet.")}
          </p>
        ) : (
          <Table
            head={[
              t("Номер заказа", "Order ID"),
              t("Клиент", "Customer"),
              t("Товары", "Items"),
              t("Сумма", "Total"),
              t("Оплата", "Payment"),
              t("Статус", "Status"),
              t("Дата", "Date"),
            ]}
          >
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-border align-top">
                <td className="p-3 font-medium whitespace-nowrap">{o.id}</td>
                <td className="p-3">
                  <p className="font-medium">{o.name}</p>
                  <a
                    href={`tel:${o.phone.replace(/\s/g, "")}`}
                    className="block whitespace-nowrap text-primary hover:underline"
                  >
                    {o.phone}
                  </a>
                  <a
                    href={`mailto:${o.email}`}
                    className="block text-muted-foreground hover:underline"
                  >
                    {o.email}
                  </a>
                </td>
                <td className="p-3">
                  <ul className="space-y-0.5">
                    {o.items.map((i) => (
                      <li key={i.productId}>
                        {i.name} ×{i.qty}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="p-3 whitespace-nowrap font-medium">{formatAMD(o.total)}</td>
                <td className="p-3 whitespace-nowrap">{t(PAYMENT_LABEL[o.payment])}</td>
                <td className="p-3">
                  {o.status === "Cancelled" ? (
                    <Pill tone={statusTone(o.status)}>{statusLabel(o.status, t)}</Pill>
                  ) : (
                    <select
                      aria-label={`${t("Статус заказа", "Status of order")} ${o.id}`}
                      value={o.status}
                      disabled={busyId === o.id}
                      onChange={(e) => void changeStatus(o.id, e.target.value as OrderStatus)}
                      className="h-9 rounded-md border border-input bg-card px-2 text-sm"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {statusLabel(s, t)}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="p-3 whitespace-nowrap text-muted-foreground">
                  {new Date(o.createdAt).toLocaleString(dateLocale(lang), {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>
    </div>
  );
}
