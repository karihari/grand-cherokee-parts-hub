import { createFileRoute } from "@tanstack/react-router";
import { ADMIN_CUSTOMERS } from "@/data/admin";
import { formatAMD } from "@/data/catalog";
import { PageHeader, Panel, Pill, RowActions, Table, statusTone } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/customers")({ component: AdminCustomers });

function AdminCustomers() {
  return (
    <div>
      <PageHeader title="Customers" subtitle="Contact a customer or review their order history." />
      <Panel>
        <Table head={["Name", "Phone", "Email", "Orders", "Total spent", "Registered", "Status", "Actions"]}>
          {ADMIN_CUSTOMERS.map((c) => (
            <tr key={c.email} className="border-t border-border">
              <td className="p-3 font-medium">{c.name}</td>
              <td className="p-3 whitespace-nowrap">{c.phone}</td>
              <td className="p-3">{c.email}</td>
              <td className="p-3">{c.orders}</td>
              <td className="p-3 whitespace-nowrap">{formatAMD(c.spent)}</td>
              <td className="p-3 text-muted-foreground">{c.joined}</td>
              <td className="p-3">
                <Pill tone={statusTone(c.status)}>{c.status}</Pill>
              </td>
              <td className="p-3">
                <RowActions items={["View", "Orders", "Contact", c.status === "Blocked" ? "Unblock" : "Block"]} />
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
