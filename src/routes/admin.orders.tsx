import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { formatAMD } from "@/data/catalog";
import { ORDER_STATUSES, type OrderStatus } from "@/data/orders";
import { PageHeader, Panel, Pill, Table, statusTone } from "@/components/admin/ui";
import { listOrders, setOrderStatus } from "@/lib/orders.functions";

export const Route = createFileRoute("/admin/orders")({
  loader: () => listOrders(),
  component: AdminOrders,
});

const PAYMENT_LABEL = { cash: "Cash at pickup", card: "Card at pickup" } as const;

function AdminOrders() {
  const orders = Route.useLoaderData();
  const router = useRouter();
  const setStatusFn = useServerFn(setOrderStatus);
  const [busyId, setBusyId] = useState<string | null>(null);

  const changeStatus = async (id: string, status: OrderStatus) => {
    if (status === "Cancelled" && !window.confirm(`Cancel order ${id}? Its parts go back into stock.`)) return;
    setBusyId(id);
    try {
      await setStatusFn({ data: { id, status } });
      // Cancelling changes stock, so reload Products too.
      await router.invalidate();
      toast.success(`Order ${id}: ${status}`);
    } catch (error) {
      toast.error("Could not update the order", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader title="Orders" subtitle="Orders placed on the website. Customers pick up and pay at the shop." />
      <Panel>
        {orders.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <Table head={["Order ID", "Customer", "Items", "Total", "Payment", "Status", "Date"]}>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-border align-top">
                <td className="p-3 font-medium whitespace-nowrap">{o.id}</td>
                <td className="p-3">
                  <p className="font-medium">{o.name}</p>
                  <a href={`tel:${o.phone.replace(/\s/g, "")}`} className="block whitespace-nowrap text-primary hover:underline">
                    {o.phone}
                  </a>
                  <a href={`mailto:${o.email}`} className="block text-muted-foreground hover:underline">
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
                <td className="p-3 whitespace-nowrap">{PAYMENT_LABEL[o.payment]}</td>
                <td className="p-3">
                  {o.status === "Cancelled" ? (
                    <Pill tone={statusTone(o.status)}>{o.status}</Pill>
                  ) : (
                    <select
                      aria-label={`Status of order ${o.id}`}
                      value={o.status}
                      disabled={busyId === o.id}
                      onChange={(e) => void changeStatus(o.id, e.target.value as OrderStatus)}
                      className="h-9 rounded-md border border-input bg-card px-2 text-sm"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="p-3 whitespace-nowrap text-muted-foreground">
                  {new Date(o.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>
    </div>
  );
}
