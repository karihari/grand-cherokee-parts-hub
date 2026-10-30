import { Link } from "@tanstack/react-router";
import { useT } from "@/lib/i18n";
import { Grid2x2, Home, Search, ShoppingCart, User } from "lucide-react";
import { useStore } from "@/lib/store";

export function MobileTabBar() {
  const t = useT();
  const { cartCount } = useStore();
  return (
    <nav
      aria-label={t("Навигация", "Mobile navigation")}
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-card md:hidden"
    >
      <Tab to="/" label={t("Главная", "Home")} exact>
        <Home className="size-5" aria-hidden="true" />
      </Tab>
      <Tab to="/categories" label={t("Категории", "Categories")}>
        <Grid2x2 className="size-5" aria-hidden="true" />
      </Tab>
      <Tab to="/parts" label={t("Поиск", "Search")}>
        <Search className="size-5" aria-hidden="true" />
      </Tab>
      <Tab to="/cart" label={t("Корзина", "Cart")} badge={cartCount}>
        <ShoppingCart className="size-5" aria-hidden="true" />
      </Tab>
      <Tab to="/account" label={t("Аккаунт", "Account")}>
        <User className="size-5" aria-hidden="true" />
      </Tab>
    </nav>
  );
}

function Tab({
  to,
  label,
  badge,
  exact,
  children,
}: {
  to: string;
  label: string;
  badge?: number;
  exact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: !!exact }}
      activeProps={{ className: "text-primary" }}
      className="relative flex min-h-14 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium text-muted-foreground"
    >
      {children}
      <span>{label}</span>
      {badge ? (
        <span className="absolute right-4 top-1.5 min-w-4 rounded-full bg-accent px-1 text-[10px] font-bold leading-4 text-accent-foreground">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
