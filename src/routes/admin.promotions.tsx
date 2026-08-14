import { createFileRoute } from "@tanstack/react-router";
import { ADMIN_PROMOTIONS } from "@/data/admin";
import { PageHeader, Panel, Pill, RowActions, Table, statusTone } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/promotions")({ component: AdminPromotions });

function AdminPromotions() {
  return (
    <div>
      <PageHeader
        title="Promotions"
        subtitle="Discounts, coupons, sales, featured products and homepage banners."
        action={
          <button type="button" className="h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">
            Create promotion
          </button>
        }
      />
      <Panel>
        <Table head={["Promotion", "Discount", "Start", "End", "Applies to", "Status", "Actions"]}>
          {ADMIN_PROMOTIONS.map((p) => (
            <tr key={p.name} className="border-t border-border">
              <td className="p-3 font-medium">{p.name}</td>
              <td className="p-3">{p.discount}</td>
              <td className="p-3 whitespace-nowrap text-muted-foreground">{p.start}</td>
              <td className="p-3 whitespace-nowrap text-muted-foreground">{p.end}</td>
              <td className="p-3">{p.scope}</td>
              <td className="p-3">
                <Pill tone={statusTone(p.status)}>{p.status}</Pill>
              </td>
              <td className="p-3">
                <RowActions items={["Edit", "Pause", "Delete"]} />
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
