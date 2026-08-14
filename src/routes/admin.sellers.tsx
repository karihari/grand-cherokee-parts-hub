import { createFileRoute } from "@tanstack/react-router";
import { ADMIN_SELLERS } from "@/data/admin";
import { formatAMD } from "@/data/catalog";
import { PageHeader, Panel, Pill, RowActions, Table, statusTone } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/sellers")({ component: AdminSellers });

function AdminSellers() {
  return (
    <div>
      <PageHeader title="Sellers" subtitle="Approve sellers and monitor their performance." />
      <Panel>
        <Table head={["Seller", "Products", "Rating", "Sales", "Status", "Actions"]}>
          {ADMIN_SELLERS.map((s) => (
            <tr key={s.name} className="border-t border-border">
              <td className="p-3 font-medium">{s.name}</td>
              <td className="p-3">{s.products}</td>
              <td className="p-3">{s.rating}</td>
              <td className="p-3 whitespace-nowrap">{formatAMD(s.sales)}</td>
              <td className="p-3">
                <Pill tone={statusTone(s.status)}>{s.status}</Pill>
              </td>
              <td className="p-3">
                <RowActions items={["View", "Products", s.status === "Pending" ? "Approve" : "Suspend"]} />
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
