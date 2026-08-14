import { createFileRoute, Link } from "@tanstack/react-router";
import { PRODUCTS, formatAMD, fitmentLabel } from "@/data/catalog";
import { checkFit, useStore } from "@/lib/store";
import { FitBadge } from "@/components/shop/FitBadge";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare Grand Cherokee Parts | GC Parts" },
      { name: "description", content: "Compare price, condition, warranty and fitment side by side." },
      { property: "og:title", content: "Compare Grand Cherokee Parts | GC Parts" },
      { property: "og:description", content: "Side-by-side comparison of Grand Cherokee parts." },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const { compare, activeVehicle, toggleCompare } = useStore();
  const items = PRODUCTS.filter((p) => compare.includes(p.id));

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Nothing to compare yet</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use the compare icon on any product card to add up to four parts.
        </p>
        <Link to="/parts" className="mt-6 inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground">
          Browse parts
        </Link>
      </div>
    );
  }

  const rows: [string, (p: (typeof items)[number]) => React.ReactNode][] = [
    ["Price", (p) => <span className="font-display text-lg font-bold">{formatAMD(p.price)}</span>],
    ["Condition", (p) => p.condition],
    ["Brand", (p) => p.brand],
    ["Part number", (p) => p.partNumber],
    ["OEM number", (p) => p.oemNumber],
    ["Compatibility", (p) => <FitBadge result={checkFit(p, activeVehicle)} />],
    ["Fits", (p) => <span className="text-xs text-muted-foreground">{p.fits.map(fitmentLabel).join(" · ")}</span>],
    ["Warranty", (p) => p.warranty],
    ["Seller", (p) => p.seller],
    ["Rating", (p) => `${p.rating.toFixed(1)} (${p.reviews})`],
    ["Delivery", (p) => p.delivery],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">Compare parts</h1>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-3xl border-collapse text-sm">
          <thead>
            <tr>
              <th scope="col" className="w-40 p-3 text-left align-bottom text-xs uppercase text-muted-foreground">
                Product
              </th>
              {items.map((p) => (
                <th key={p.id} scope="col" className="p-3 text-left align-bottom">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    width={800}
                    height={800}
                    className="mb-2 size-24 rounded-md object-cover"
                  />
                  <Link to="/product/$slug" params={{ slug: p.slug }} className="font-semibold hover:text-primary">
                    {p.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleCompare(p.id)}
                    className="mt-1 block text-xs font-medium text-muted-foreground hover:text-destructive"
                  >
                    Remove
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, render]) => (
              <tr key={label} className="border-t border-border">
                <th scope="row" className="p-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                  {label}
                </th>
                {items.map((p) => (
                  <td key={p.id} className="p-3 align-top">
                    {render(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
