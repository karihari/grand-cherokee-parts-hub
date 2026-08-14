import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Car,
  Heart,
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { useStore, vehicleLabel } from "@/lib/store";
import { VehicleSelector } from "@/components/shop/VehicleSelector";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/parts", label: "Parts" },
  { to: "/categories", label: "Categories" },
  { to: "/models", label: "Grand Cherokee Models" },
  { to: "/deals", label: "Deals" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const navigate = useNavigate();
  const { cartCount, wishlist, activeVehicle } = useStore();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/parts", search: { q: query || undefined } });
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface text-surface-foreground">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-md hover:bg-sidebar-accent lg:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
        </button>

        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Car className="size-5" aria-hidden="true" />
          </span>
          <span className="font-display text-xl font-bold uppercase tracking-tight">
            GC<span className="text-accent">Parts</span>
          </span>
        </Link>

        <form onSubmit={submit} role="search" className="ml-2 hidden flex-1 md:block">
          <label htmlFor="site-search" className="sr-only">
            Search parts
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              id="site-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search parts, part numbers or OEM numbers"
              className="h-11 w-full rounded-md border border-transparent bg-card pl-9 pr-24 text-sm text-foreground placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 h-9 rounded-md bg-accent px-4 text-sm font-semibold text-accent-foreground"
            >
              Search
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1">
          <IconLink to="/wishlist" label="Wishlist" count={wishlist.length}>
            <Heart className="size-5" aria-hidden="true" />
          </IconLink>
          <IconLink to="/cart" label="Cart" count={cartCount}>
            <ShoppingCart className="size-5" aria-hidden="true" />
          </IconLink>
          <IconLink to="/account" label="Account">
            <User className="size-5" aria-hidden="true" />
          </IconLink>
        </div>
      </div>

      <div className="border-t border-sidebar-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2">
          <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-accent" }}
                className="text-sm font-medium text-surface-foreground/80 transition-colors hover:text-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setSelectorOpen((v) => !v)}
            className={cn(
              "ml-auto inline-flex items-center gap-2 rounded-md border border-sidebar-border px-3 py-1.5 text-sm font-medium",
              activeVehicle ? "bg-success/15 text-surface-foreground" : "bg-sidebar-accent",
            )}
            aria-expanded={selectorOpen}
          >
            <Car className="size-4" aria-hidden="true" />
            {activeVehicle ? vehicleLabel(activeVehicle) : "Select your Grand Cherokee"}
          </button>
        </div>

        {selectorOpen ? (
          <div className="border-t border-sidebar-border bg-background text-foreground">
            <div className="mx-auto max-w-3xl px-4 py-6">
              <VehicleSelector onDone={() => setSelectorOpen(false)} />
            </div>
          </div>
        ) : null}
      </div>

      {menuOpen ? (
        <div className="border-t border-sidebar-border bg-surface lg:hidden">
          <form onSubmit={submit} role="search" className="p-4 md:hidden">
            <label htmlFor="mobile-search" className="sr-only">
              Search parts
            </label>
            <input
              id="mobile-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search parts, part numbers or OEM numbers"
              className="h-11 w-full rounded-md bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground"
            />
          </form>
          <nav aria-label="Mobile" className="flex flex-col pb-2">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 text-sm font-medium text-surface-foreground/90 hover:bg-sidebar-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function IconLink({
  to,
  label,
  count,
  children,
}: {
  to: string;
  label: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="relative inline-flex size-11 items-center justify-center rounded-md hover:bg-sidebar-accent"
    >
      {children}
      {count ? (
        <span className="absolute right-1 top-1 min-w-4 rounded-full bg-accent px-1 text-[10px] font-bold leading-4 text-accent-foreground">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
