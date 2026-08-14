import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { CATEGORIES, PRODUCTS, categoryName, fitmentLabel, formatAMD } from "@/data/catalog";
import { PageHeader, Panel, Pill, RowActions, Table } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

function AdminProducts() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [form, setForm] = useState(false);

  const rows = PRODUCTS.filter((p) => {
    if (cat && p.category !== cat) return false;
    if (!q) return true;
    const t = q.toLowerCase();
    return [p.name, p.partNumber, p.oemNumber, p.brand].join(" ").toLowerCase().includes(t);
  });

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${PRODUCTS.length} listings · find any product in seconds`}
        action={
          <button
            type="button"
            onClick={() => setForm((v) => !v)}
            className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="size-4" aria-hidden="true" /> Add product
          </button>
        }
      />

      {form ? (
        <Panel className="mb-5 p-5">
          <h2 className="text-lg font-bold">New product</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input label="Product name" />
            <Select label="Category" options={CATEGORIES.map((c) => c.name)} />
            <Input label="Brand" />
            <Input label="Part number" />
            <Input label="OEM number" />
            <Input label="Price (AMD)" type="number" />
            <Input label="Sale price (AMD)" type="number" />
            <Select label="Condition" options={["New", "Used"]} />
            <Input label="Stock" type="number" />
            <Input label="Warranty" />
            <Input label="Shipping estimate" />
            <Input label="Images" type="file" />
          </div>
          <fieldset className="mt-4 rounded-md border border-border p-4">
            <legend className="px-1 text-sm font-bold uppercase">Compatibility</legend>
            <div className="grid gap-4 sm:grid-cols-4">
              <Input label="Model" defaultValue="Grand Cherokee" />
              <Input label="Year from" type="number" />
              <Input label="Year to" type="number" />
              <Select label="Generation" options={["WK", "WK2", "WL"]} />
            </div>
          </fieldset>
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium" htmlFor="desc">
              Description
            </label>
            <textarea id="desc" rows={3} className="w-full rounded-md border border-input bg-card p-3 text-sm" />
          </div>
          <div className="mt-4 flex gap-3">
            <button type="button" className="h-11 rounded-md bg-accent px-5 text-sm font-semibold text-accent-foreground">
              Save product
            </button>
            <button type="button" onClick={() => setForm(false)} className="h-11 rounded-md border border-border px-5 text-sm font-semibold">
              Cancel
            </button>
          </div>
        </Panel>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, part number, OEM number"
          aria-label="Search products"
          className="h-11 min-w-64 flex-1 rounded-md border border-input bg-card px-3 text-sm"
        />
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          aria-label="Filter by category"
          className="h-11 rounded-md border border-input bg-card px-3 text-sm"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <Panel>
        <Table head={["Image", "Product", "Part №", "Category", "Price", "Stock", "Compatibility", "Status", "Actions"]}>
          {rows.map((p) => (
            <tr key={p.id} className="border-t border-border align-top">
              <td className="p-3">
                <img src={p.image} alt="" loading="lazy" width={800} height={800} className="size-12 rounded-md object-cover" />
              </td>
              <td className="p-3">
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.brand} · {p.condition} · {p.origin}</p>
              </td>
              <td className="p-3 whitespace-nowrap">{p.partNumber}</td>
              <td className="p-3">{categoryName(p.category)}</td>
              <td className="p-3 whitespace-nowrap font-medium">{formatAMD(p.price)}</td>
              <td className="p-3">
                <Pill tone={p.stock <= 3 ? "warn" : "good"}>{p.stock}</Pill>
              </td>
              <td className="p-3 text-xs text-muted-foreground">{p.fits.map(fitmentLabel).join(" · ")}</td>
              <td className="p-3">
                <Pill tone="good">Published</Pill>
              </td>
              <td className="p-3">
                <RowActions items={["Edit", "View", "Duplicate", "Delete"]} />
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}

function Input({
  label,
  type = "text",
  defaultValue,
}: {
  label: string;
  type?: string;
  defaultValue?: string;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <input id={id} type={type} defaultValue={defaultValue} className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm" />
    </div>
  );
}

function Select({ label, options }: { label: string; options: string[] }) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <select id={id} className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
