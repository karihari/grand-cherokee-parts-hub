import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { formatAMD } from "@/data/catalog";
import { useStore } from "@/lib/store";
import { MyGarage } from "@/components/shop/MyGarage";
import { cn } from "@/lib/utils";
import { useProducts } from "@/lib/products";
import { getOrderStatuses } from "@/lib/orders.functions";
import { Pill, statusTone } from "@/components/admin/ui";

export const Route = createFileRoute("/account")({
  validateSearch: (search: Record<string, unknown>): { tab?: "orders" | undefined } => ({
    tab: search["tab"] === "orders" ? "orders" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "My Account | GC Parts" },
      { name: "description", content: "Your Grand Cherokees, orders, wishlist and saved parts in one place." },
      { property: "og:title", content: "My Account | GC Parts" },
      { property: "og:description", content: "Manage your Grand Cherokee garage and orders." },
    ],
  }),
  component: AccountPage,
});

const TABS = [
  "My Profile",
  "My Grand Cherokees",
  "My Orders",
  "Wishlist",
  "Recently Viewed",
  "Saved Parts",
  "Messages",
  "Returns",
  "Addresses",
  "Settings",
] as const;

function AccountPage() {
  const search = Route.useSearch();
  const [tab, setTab] = useState<(typeof TABS)[number]>(
    search.tab === "orders" ? "My Orders" : "My Grand Cherokees",
  );
  const { wishlist, recent, saved } = useStore();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">My account</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav aria-label="Account sections" className="card-surface h-fit p-2">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              aria-current={tab === t}
              className={cn(
                "w-full rounded-md px-3 py-2.5 text-left text-sm font-medium",
                tab === t ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
              )}
            >
              {t}
            </button>
          ))}
        </nav>

        <section className="space-y-4">
          {tab === "My Grand Cherokees" && <MyGarage />}

          {tab === "My Profile" && (
            <div className="card-surface p-5">
              <h2 className="text-lg font-bold">Profile</h2>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <Info label="Name" value="Karine H." />
                <Info label="Phone" value="+374 55 050 602" />
                <Info label="Email" value="karine@example.com" />
                <Info label="Member since" value="March 2024" />
              </dl>
            </div>
          )}

          {tab === "My Orders" && <MyOrders />}

          {(tab === "Wishlist" || tab === "Recently Viewed" || tab === "Saved Parts") && (
            <ProductList
              title={tab}
              ids={tab === "Wishlist" ? wishlist : tab === "Recently Viewed" ? recent : saved}
            />
          )}

          {tab === "Messages" && (
            <div className="card-surface p-5 text-sm">
              <h2 className="text-lg font-bold">Messages</h2>
              <p className="mt-2 text-muted-foreground">
                Conversations you started on WhatsApp or Telegram continue in those apps. Website enquiries appear
                here once answered.
              </p>
            </div>
          )}

          {tab === "Returns" && (
            <div className="card-surface p-5 text-sm">
              <h2 className="text-lg font-bold">Returns</h2>
              <p className="mt-2 text-muted-foreground">
                No open returns. New parts can be returned within 14 days if unfitted.
              </p>
            </div>
          )}

          {tab === "Addresses" && (
            <div className="card-surface p-5 text-sm">
              <h2 className="text-lg font-bold">Addresses</h2>
              <p className="mt-2 font-medium">Home</p>
              <p className="text-muted-foreground">12 Baghramyan Ave, Yerevan 0019, Armenia</p>
            </div>
          )}

          {tab === "Settings" && (
            <div className="card-surface space-y-3 p-5 text-sm">
              <h2 className="text-lg font-bold">Settings</h2>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="size-4 accent-[var(--color-primary)]" />
                Notify me about price drops on wishlist parts
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="size-4 accent-[var(--color-primary)]" />
                Send order updates over WhatsApp
              </label>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function MyOrders() {
  const { orders } = useStore();
  const getStatuses = useServerFn(getOrderStatuses);
  const [statuses, setStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    if (orders.length === 0) return;
    getStatuses({ data: { ids: orders.map((o) => o.id) } })
      .then((rows) => setStatuses(Object.fromEntries(rows.map((r) => [r.id, r.status]))))
      .catch((error: unknown) => console.error(error));
  }, [orders, getStatuses]);

  if (orders.length === 0) {
    return (
      <div className="card-surface p-5 text-sm">
        <h2 className="text-lg font-bold">My Orders</h2>
        <p className="mt-2 text-muted-foreground">
          No orders from this device yet.{" "}
          <Link to="/parts" className="font-semibold text-primary underline">
            Browse parts
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="card-surface overflow-x-auto p-0">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th className="p-3">Order</th>
            <th className="p-3">Date</th>
            <th className="p-3">Items</th>
            <th className="p-3">Total</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const status = statuses[o.id] ?? "New";
            return (
              <tr key={o.id} className="border-t border-border">
                <td className="p-3 font-medium">{o.id}</td>
                <td className="p-3 whitespace-nowrap text-muted-foreground">{o.createdAt.slice(0, 10)}</td>
                <td className="p-3">{o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</td>
                <td className="p-3 whitespace-nowrap font-medium">{formatAMD(o.total)}</td>
                <td className="p-3">
                  <Pill tone={statusTone(status)}>{status}</Pill>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ProductList({ title, ids }: { title: string; ids: string[] }) {
  const products = useProducts();
  const items = products.filter((p) => ids.includes(p.id));
  if (items.length === 0) {
    return (
      <div className="card-surface p-5 text-sm">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mt-2 text-muted-foreground">
          Nothing here yet.{" "}
          <Link to="/parts" className="font-semibold text-primary underline">
            Browse parts
          </Link>
          .
        </p>
      </div>
    );
  }
  return (
    <div className="card-surface p-5">
      <h2 className="text-lg font-bold">{title}</h2>
      <ul className="mt-3 divide-y divide-border">
        {items.map((p) => (
          <li key={p.id} className="flex items-center gap-3 py-3">
            <img src={p.image} alt="" loading="lazy" width={800} height={800} className="size-14 rounded-md object-cover" />
            <div className="flex-1">
              <Link to="/product/$slug" params={{ slug: p.slug }} className="font-medium hover:text-primary">
                {p.name}
              </Link>
              <p className="text-xs text-muted-foreground">Part № {p.partNumber}</p>
            </div>
            <span className="font-semibold">{formatAMD(p.price)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-3">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
