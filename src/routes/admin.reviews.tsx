import { createFileRoute } from "@tanstack/react-router";
import { ADMIN_REVIEWS } from "@/data/admin";
import { PageHeader, Panel, Pill, RowActions, Table, statusTone } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/reviews")({ component: AdminReviews });

function AdminReviews() {
  return (
    <div>
      <PageHeader title="Reviews" subtitle="Approve, hide or delete customer reviews." />
      <Panel>
        <Table head={["Customer", "Product", "Rating", "Review", "Date", "Status", "Actions"]}>
          {ADMIN_REVIEWS.map((r) => (
            <tr key={`${r.customer}-${r.date}`} className="border-t border-border">
              <td className="p-3 font-medium">{r.customer}</td>
              <td className="p-3">{r.product}</td>
              <td className="p-3">{r.rating}/5</td>
              <td className="p-3 text-muted-foreground">{r.text}</td>
              <td className="p-3 whitespace-nowrap text-muted-foreground">{r.date}</td>
              <td className="p-3">
                <Pill tone={statusTone(r.status)}>{r.status}</Pill>
              </td>
              <td className="p-3">
                <RowActions items={["Approve", "Hide", "Delete"]} />
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
