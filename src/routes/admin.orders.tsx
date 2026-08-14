import { createFileRoute } from "@tanstack/react-router";
import { ADMIN_ORDERS } from "@/data/admin";
import { formatAMD } from "@/data/catalog";
import { PageHeader, Panel, Pill, RowActions, Table, statusTone } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/orders")({ component: AdminOrders });

function AdminOrders() {
  return (
    <div>
      <PageHeader title="Orders" subtitle="Open an order to see customer, items and shipping." />
      <Panel>
        <Table head={["Order ID", "Customer", "Product", "Amount", "Payment", "Status", "Date", "Actions"]}>
          {ADMIN_ORDERS.map((o) => (
            <tr key={o.id} className="border-t border-border">
              <td className="p-3 font-medium">{o.id}</td>
              <td className="p-3">{o.customer}</td>
              <td className="p-3">{o.product}</td>
              <td className="p-3 whitespace-nowrap font-medium">{formatAMD(o.amount)}</td>
              <td className="p-3">
                <Pill tone={statusTone(o.payment)}>{o.payment}</Pill>
              </td>
              <td className="p-3">
                <Pill tone={statusTone(o.status)}>{o.status}</Pill>
              </td>
              <td className="p-3 whitespace-nowrap text-muted-foreground">{o.date}</td>
              <td className="p-3">
                <RowActions items={["Open", "Ship", "Refund"]} />
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
