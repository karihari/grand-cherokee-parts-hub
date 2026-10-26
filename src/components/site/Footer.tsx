import { Link } from "@tanstack/react-router";
import { PHONE_DISPLAY } from "@/lib/contact";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-surface text-surface-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <p className="font-display text-xl font-bold uppercase">
            GC<span className="text-accent">Parts</span>
          </p>
          <p className="mt-2 text-sm text-surface-foreground/70">
            Spare parts and accessories for the Jeep Grand Cherokee only — WK, WK2 and WL. Genuine, OEM
            and aftermarket, checked for fitment before pickup.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <Link to="/parts" className="text-surface-foreground/80 hover:text-accent">
            All parts
          </Link>
          <Link to="/categories" className="text-surface-foreground/80 hover:text-accent">
            Categories
          </Link>
          <Link to="/models" className="text-surface-foreground/80 hover:text-accent">
            Models
          </Link>
          <Link to="/contact" className="text-surface-foreground/80 hover:text-accent">
            Contact
          </Link>
        </nav>
      </div>
      <div className="border-t border-sidebar-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 text-xs text-surface-foreground/60 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} GC Parts Marketplace. Not affiliated with Jeep or Stellantis.</p>
          <p>Support: {PHONE_DISPLAY}</p>
        </div>
      </div>
    </footer>
  );
}
