import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatAMD } from "@/data/catalog";
import { ADMIN_CUSTOMERS, ADMIN_SELLERS, SALES_SERIES } from "@/data/admin";
import { PageHeader, Panel, Pill, Table, statusTone } from "@/components/admin/ui";
import { useProducts } from "@/lib/products";
import { listOrders } from "@/lib/api/admin";

export const Route = createFileRoute("/admin/")({
  loader: async () => (await listOrders({ perPage: 200 })).data,
  component: AdminDashboard,
});

function AdminDashboard() {
  const products = useProducts();
  const orders = Route.useLoaderData();
  const open = orders.filter((o) => o.status === "New" || o.status === "Ready for pickup").length;
  const lowStock = products.filter((p) => p.stock <= 3);
  const today = new Date().toDateString();
  const todaySales = orders
    .filter((o) => o.status !== "Cancelled" && new Date(o.createdAt).toDateString() === today)
    .reduce((s, o) => s + o.total, 0);
  const totalSales = SALES_SERIES.reduce((s, d) => s + d.sales, 0);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Everything that needs your attention today." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Today's sales" value={formatAMD(todaySales)} />
        <Stat label="Total sales (7 days)" value={formatAMD(totalSales)} />
        <Stat label="Orders" value={String(orders.length)} />
        <Stat label="Open orders" value={String(open)} tone />
        <Stat label="Products" value={String(products.length)} />
        <Stat label="Customers" value={String(ADMIN_CUSTOMERS.length)} />
        <Stat label="Sellers" value={String(ADMIN_SELLERS.length)} />
        <Stat label="Low stock products" value={String(lowStock.length)} tone />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Panel className="p-4">
          <h2 className="mb-3 font-bold">Revenue this week</h2>
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
          <h2 className="mb-3 font-bold">Orders this week</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SALES_SERIES}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} width={30} />
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="var(--color-accent)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Panel>
          <h2 className="p-4 pb-0 font-bold">Recent orders</h2>
          <Table head={["Order", "Customer", "Amount", "Status"]}>
            {orders.slice(0, 5).map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="p-3 font-medium">{o.id}</td>
                <td className="p-3">{o.name}</td>
                <td className="p-3">{formatAMD(o.total)}</td>
                <td className="p-3">
                  <Pill tone={statusTone(o.status)}>{o.status}</Pill>
                </td>
              </tr>
            ))}
          </Table>
        </Panel>

        <Panel>
          <h2 className="p-4 pb-0 font-bold">Needs attention</h2>
          <Table head={["Item", "Issue", "Action"]}>
            {lowStock.slice(0, 4).map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3">{p.name}</td>
                <td className="p-3">
                  <Pill tone="warn">Low stock · {p.stock}</Pill>
                </td>
                <td className="p-3 text-muted-foreground">Restock</td>
              </tr>
            ))}
            {ADMIN_SELLERS.filter((s) => s.status === "Pending").map((s) => (
              <tr key={s.name} className="border-t border-border">
                <td className="p-3">{s.name}</td>
                <td className="p-3">
                  <Pill tone="warn">Seller approval</Pill>
                </td>
                <td className="p-3 text-muted-foreground">Review</td>
              </tr>
            ))}
          </Table>
        </Panel>
      </div>

      <Panel className="mt-5">
        <h2 className="p-4 pb-0 font-bold">Recent customers</h2>
        <Table head={["Name", "Phone", "Orders", "Total spent", "Joined"]}>
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
      <p className={`mt-1 font-display text-2xl font-bold ${tone ? "text-warning-foreground" : ""}`}>{value}</p>
    </div>
  );
}
