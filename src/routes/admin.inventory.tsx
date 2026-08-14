import { createFileRoute } from "@tanstack/react-router";
import { PRODUCTS } from "@/data/catalog";
import { PageHeader, Panel, Pill, Table } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/inventory")({ component: AdminInventory });

function AdminInventory() {
  const low = PRODUCTS.filter((p) => p.stock <= 3);

  return (
    <div>
      <PageHeader title="Inventory" subtitle={`${low.length} products are at or below the low-stock threshold of 3.`} />
      <Panel>
        <Table head={["Product", "SKU", "Stock", "Reserved", "Available", "Status", "Update"]}>
          {PRODUCTS.map((p) => {
            const reserved = p.stock > 5 ? 2 : 0;
            return (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3 whitespace-nowrap">{p.id}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">{reserved}</td>
                <td className="p-3">{p.stock - reserved}</td>
                <td className="p-3">
                  <Pill tone={p.stock === 0 ? "bad" : p.stock <= 3 ? "warn" : "good"}>
                    {p.stock === 0 ? "Out of stock" : p.stock <= 3 ? "Low stock" : "Healthy"}
                  </Pill>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <label className="sr-only" htmlFor={`stock-${p.id}`}>
                      New stock for {p.name}
                    </label>
                    <input
                      id={`stock-${p.id}`}
                      type="number"
                      defaultValue={p.stock}
                      className="h-9 w-20 rounded-md border border-input bg-card px-2 text-sm"
                    />
                    <button type="button" className="h-9 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground">
                      Save
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </Table>
      </Panel>
    </div>
  );
}
