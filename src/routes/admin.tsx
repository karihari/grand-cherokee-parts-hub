import { createFileRoute, Link, Outlet, redirect, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  BarChart3,
  Boxes,
  Car,
  FolderTree,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Percent,
  Settings,
  ShoppingBag,
  Star,
  Store,
  Users,
} from "lucide-react";
import { adminLogout, getAdminSession } from "@/lib/auth.functions";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    const { isAdmin } = await getAdminSession();
    if (!isAdmin) throw redirect({ to: "/admin/login", search: { redirect: location.href } });
  },
  head: () => ({
    meta: [
      { title: "Admin | GC Parts" },
      { name: "description", content: "Manage Grand Cherokee products, orders, customers and compatibility." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin | GC Parts" },
      { property: "og:description", content: "GC Parts marketplace administration." },
    ],
  }),
  component: AdminLayout,
});

const LINKS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/sellers", label: "Sellers", icon: Store },
  { to: "/admin/vehicles", label: "Grand Cherokee Models", icon: Car },
  { to: "/admin/categories", label: "Categories & Brands", icon: FolderTree },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare },
  { to: "/admin/promotions", label: "Promotions", icon: Percent },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

function AdminLayout() {
  const router = useRouter();
  const logout = useServerFn(adminLogout);
  const signOut = async () => {
    await logout();
    await router.navigate({ to: "/admin/login", search: { redirect: undefined } });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <Link to="/" className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <span className="font-display text-lg font-bold uppercase">
            GC<span className="text-sidebar-primary">Parts</span> Admin
          </span>
        </Link>
        <nav aria-label="Admin" className="flex-1 space-y-1 overflow-auto p-3">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: "exact" in l ? l.exact : false }}
              activeProps={{ className: "bg-sidebar-accent text-sidebar-primary" }}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-sidebar-accent"
            >
              <l.icon className="size-4" aria-hidden="true" />
              {l.label}
            </Link>
          ))}
        </nav>
        <Link to="/" className="border-t border-sidebar-border px-5 py-4 text-xs text-sidebar-foreground/70 hover:text-sidebar-primary">
          ← Back to storefront
        </Link>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-3 border-b border-border bg-card px-4">
          <span className="font-display text-lg font-bold uppercase lg:hidden">GC Parts Admin</span>
          <nav aria-label="Admin sections" className="flex gap-2 overflow-x-auto lg:hidden">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: "exact" in l ? l.exact : false }}
                activeProps={{ className: "bg-primary text-primary-foreground" }}
                className="whitespace-nowrap rounded-md border border-border px-3 py-1.5 text-xs font-medium"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            onClick={signOut}
            className="ml-auto inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium hover:bg-secondary"
          >
            <LogOut className="size-4" aria-hidden="true" /> Sign out
          </button>
        </header>
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
