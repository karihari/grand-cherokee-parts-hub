import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatAMD, productName } from "@/data/catalog";
import { ADMIN_CUSTOMERS, ADMIN_SELLERS, SALES_SERIES } from "@/data/admin";
import { PageHeader, Panel, Pill, Table, statusLabel, statusTone } from "@/components/admin/ui";
import { useProducts } from "@/lib/products";
import { listOrders } from "@/lib/orders.functions";
import { useT, useLang } from "@/lib/i18n";

export const Route = createFileRoute("/admin/")({
  loader: () => listOrders(),
  component: AdminDashboard,
});

function AdminDashboard() {
  const t = useT();
  const lang = useLang();
  const products = useProducts();
  const orders = Route.useLoaderData();
  const open = orders.filter((o) => o.status === "New").length;
  const lowStock = products.filter((p) => p.stock <= 3);
  const today = new Date().toDateString();
  const todaySales = orders
    .filter((o) => o.status !== "Cancelled" && new Date(o.createdAt).toDateString() === today)
    .reduce((s, o) => s + o.total, 0);
  const totalSales = SALES_SERIES.reduce((s, d) => s + d.sales, 0);

  return (
    <div>
      <PageHeader
        title={t("Обзор", "Dashboard")}
        subtitle={t(
          "Всё, что требует вашего внимания сегодня.",
          "Everything that needs your attention today.",
        )}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t("Продажи сегодня", "Today's sales")} value={formatAMD(todaySales)} />
        <Stat
          label={t("Продажи за 7 дней", "Total sales (7 days)")}
          value={formatAMD(totalSales)}
        />
        <Stat label={t("Заказы", "Orders")} value={String(orders.length)} />
        <Stat label={t("Открытые заказы", "Open orders")} value={String(open)} tone />
        <Stat label={t("Товары", "Products")} value={String(products.length)} />
        <Stat label={t("Клиенты", "Customers")} value={String(ADMIN_CUSTOMERS.length)} />
        <Stat label={t("Продавцы", "Sellers")} value={String(ADMIN_SELLERS.length)} />
        <Stat
          label={t("Заканчиваются на складе", "Low stock products")}
          value={String(lowStock.length)}
          tone
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Panel className="p-4">
          <h2 className="mb-3 font-bold">{t("Выручка за неделю", "Revenue this week")}</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SALES_SERIES}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} width={60} />
                <Tooltip formatter={(v: number) => formatAMD(v)} />
                <Bar dataKey="sales" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel className="p-4">
          <h2 className="mb-3 font-bold">{t("Заказы за неделю", "Orders this week")}</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SALES_SERIES}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} width={30} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Panel>
          <h2 className="p-4 pb-0 font-bold">{t("Последние заказы", "Recent orders")}</h2>
          <Table
            head={[
              t("Заказ", "Order"),
              t("Клиент", "Customer"),
              t("Сумма", "Amount"),
              t("Статус", "Status"),
            ]}
          >
            {orders.slice(0, 5).map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="p-3 font-medium">{o.id}</td>
                <td className="p-3">{o.name}</td>
                <td className="p-3">{formatAMD(o.total)}</td>
                <td className="p-3">
                  <Pill tone={statusTone(o.status)}>{statusLabel(o.status, t)}</Pill>
                </td>
              </tr>
            ))}
          </Table>
        </Panel>

        <Panel>
          <h2 className="p-4 pb-0 font-bold">{t("Требует внимания", "Needs attention")}</h2>
          <Table head={[t("Позиция", "Item"), t("Проблема", "Issue"), t("Действие", "Action")]}>
            {lowStock.slice(0, 4).map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3">{productName(p, lang)}</td>
                <td className="p-3">
                  <Pill tone="warn">
                    {t("Мало на складе", "Low stock")} · {p.stock}
                  </Pill>
                </td>
                <td className="p-3 text-muted-foreground">{t("Пополнить", "Restock")}</td>
              </tr>
            ))}
            {ADMIN_SELLERS.filter((s) => s.status === "Pending").map((s) => (
              <tr key={s.name} className="border-t border-border">
                <td className="p-3">{s.name}</td>
                <td className="p-3">
                  <Pill tone="warn">{t("Одобрение продавца", "Seller approval")}</Pill>
                </td>
                <td className="p-3 text-muted-foreground">{t("Проверить", "Review")}</td>
              </tr>
            ))}
          </Table>
        </Panel>
      </div>

      <Panel className="mt-5">
        <h2 className="p-4 pb-0 font-bold">{t("Новые клиенты", "Recent customers")}</h2>
        <Table
          head={[
            t("Имя", "Name"),
            t("Телефон", "Phone"),
            t("Заказы", "Orders"),
            t("Потрачено", "Total spent"),
            t("Регистрация", "Joined"),
          ]}
        >
          {ADMIN_CUSTOMERS.slice(0, 5).map((c) => (
            <tr key={c.email} className="border-t border-border">
              <td className="p-3 font-medium">{c.name}</td>
              <td className="p-3">{c.phone}</td>
              <td className="p-3">{c.orders}</td>
              <td className="p-3">{formatAMD(c.spent)}</td>
              <td className="p-3 text-muted-foreground">{c.joined}</td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: boolean }) {
  return (
    <div className="card-surface p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={`mt-1 font-display text-2xl font-bold ${tone ? "text-warning-foreground" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
