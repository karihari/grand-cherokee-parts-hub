import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SALES_SERIES } from "@/data/admin";
import { CATEGORIES, formatAMD } from "@/data/catalog";
import { PageHeader, Panel, Table } from "@/components/admin/ui";
import { useProducts } from "@/lib/products";

export const Route = createFileRoute("/admin/reports")({ component: AdminReports });

function AdminReports() {
  const products = useProducts();
  const revenue = SALES_SERIES.reduce((s, d) => s + d.sales, 0);
  const orders = SALES_SERIES.reduce((s, d) => s + d.orders, 0);

  return (
    <div>
      <PageHeader title="Reports" subtitle="Revenue, orders and catalogue coverage for the last 7 days." />
      <div className="grid gap-3 sm:grid-cols-3">
        <Card label="Revenue" value={formatAMD(revenue)} />
        <Card label="Orders" value={String(orders)} />
        <Card label="Average order" value={formatAMD(Math.round(revenue / orders))} />
      </div>
      <Panel className="mt-5 p-4">
        <h2 className="mb-3 font-bold">Revenue trend</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={SALES_SERIES}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} width={60} />
              <Tooltip formatter={(v: number) => formatAMD(v)} />
              <Area type="monotone" dataKey="sales" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>
      <Panel className="mt-5">
        <Table head={["Category", "Products", "Average price"]}>
          {CATEGORIES.map((c) => {
            const items = products.filter((p) => p.category === c.slug);
            const avg = items.length ? Math.round(items.reduce((s, p) => s + p.price, 0) / items.length) : 0;
            return (
              <tr key={c.slug} className="border-t border-border">
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3">{items.length}</td>
                <td className="p-3">{avg ? formatAMD(avg) : "—"}</td>
              </tr>
            );
          })}
        </Table>
      </Panel>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-surface p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
    </div>
  );
}
