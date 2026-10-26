import { createFileRoute } from "@tanstack/react-router";
import { CATEGORIES, brandsOf } from "@/data/catalog";
import { PageHeader, Panel, RowActions, Table } from "@/components/admin/ui";
import { useProducts } from "@/lib/products";

export const Route = createFileRoute("/admin/categories")({ component: AdminCategories });

function AdminCategories() {
  const products = useProducts();
  return (
    <div>
      <PageHeader
        title="Categories & Brands"
        subtitle="Reorder categories, change images and assign products."
        action={
          <button type="button" className="h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">
            Create category
          </button>
        }
      />

      <Panel>
        <Table head={["Image", "Category", "Description", "Products", "Order", "Actions"]}>
          {CATEGORIES.map((c, i) => (
            <tr key={c.slug} className="border-t border-border">
              <td className="p-3">
                <img src={c.image} alt="" loading="lazy" width={800} height={800} className="size-12 rounded-md object-cover" />
              </td>
              <td className="p-3 font-medium">{c.name}</td>
              <td className="p-3 text-muted-foreground">{c.blurb}</td>
              <td className="p-3">{products.filter((p) => p.category === c.slug).length}</td>
              <td className="p-3">{i + 1}</td>
              <td className="p-3">
                <RowActions items={["Edit", "Image", "Move up", "Delete"]} />
              </td>
            </tr>
          ))}
        </Table>
      </Panel>

      <Panel className="mt-5">
        <Table head={["Brand", "Products", "Actions"]}>
          {brandsOf(products).map((b) => (
            <tr key={b} className="border-t border-border">
              <td className="p-3 font-medium">{b}</td>
              <td className="p-3">{products.filter((p) => p.brand === b).length}</td>
              <td className="p-3">
                <RowActions items={["Edit", "Delete"]} />
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
