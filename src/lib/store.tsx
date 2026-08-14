import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { PRODUCTS, type Product, type Fitment } from "@/data/catalog";

export type Vehicle = { id: string; year: number; gen: "WK" | "WK2" | "WL"; engine: string };

export type CartLine = { productId: string; qty: number };

type StoreState = {
  vehicles: Vehicle[];
  activeVehicleId: string | null;
  cart: CartLine[];
  wishlist: string[];
  compare: string[];
  saved: string[];
  recent: string[];
};

const EMPTY: StoreState = {
  vehicles: [],
  activeVehicleId: null,
  cart: [],
  wishlist: [],
  compare: [],
  saved: [],
  recent: [],
};

const KEY = "gcparts.store.v1";

type StoreContextValue = StoreState & {
  activeVehicle: Vehicle | null;
  addVehicle: (v: Omit<Vehicle, "id">) => void;
  selectVehicle: (id: string | null) => void;
  removeVehicle: (id: string) => void;
  addToCart: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  toggleCompare: (productId: string) => void;
  toggleSaved: (productId: string) => void;
  trackView: (productId: string) => void;
  cartCount: number;
  cartSubtotal: number;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(EMPTY);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...EMPTY, ...(JSON.parse(raw) as StoreState) });
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore quota errors */
    }
  }, [state]);

  const toggle = useCallback((key: "wishlist" | "compare" | "saved", id: string) => {
    setState((s) => {
      const list = s[key];
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
      return { ...s, [key]: key === "compare" ? next.slice(-4) : next };
    });
  }, []);

  const value = useMemo<StoreContextValue>(() => {
    const activeVehicle = state.vehicles.find((v) => v.id === state.activeVehicleId) ?? null;
    const cartSubtotal = state.cart.reduce((sum, line) => {
      const product = PRODUCTS.find((p) => p.id === line.productId);
      return sum + (product ? product.price * line.qty : 0);
    }, 0);

    return {
      ...state,
      activeVehicle,
      cartCount: state.cart.reduce((n, l) => n + l.qty, 0),
      cartSubtotal,
      addVehicle: (v) =>
        setState((s) => {
          const id = `${v.year}-${v.gen}-${v.engine}`;
          const exists = s.vehicles.some((x) => x.id === id);
          return {
            ...s,
            vehicles: exists ? s.vehicles : [...s.vehicles, { ...v, id }],
            activeVehicleId: id,
          };
        }),
      selectVehicle: (id) => setState((s) => ({ ...s, activeVehicleId: id })),
      removeVehicle: (id) =>
        setState((s) => ({
          ...s,
          vehicles: s.vehicles.filter((v) => v.id !== id),
          activeVehicleId: s.activeVehicleId === id ? null : s.activeVehicleId,
        })),
      addToCart: (productId, qty = 1) =>
        setState((s) => {
          const line = s.cart.find((l) => l.productId === productId);
          return {
            ...s,
            cart: line
              ? s.cart.map((l) => (l.productId === productId ? { ...l, qty: l.qty + qty } : l))
              : [...s.cart, { productId, qty }],
          };
        }),
      setQty: (productId, qty) =>
        setState((s) => ({
          ...s,
          cart: s.cart
            .map((l) => (l.productId === productId ? { ...l, qty: Math.max(1, qty) } : l))
            .filter((l) => l.qty > 0),
        })),
      removeFromCart: (productId) =>
        setState((s) => ({ ...s, cart: s.cart.filter((l) => l.productId !== productId) })),
      clearCart: () => setState((s) => ({ ...s, cart: [] })),
      toggleWishlist: (id) => toggle("wishlist", id),
      toggleCompare: (id) => toggle("compare", id),
      toggleSaved: (id) => toggle("saved", id),
      trackView: (id) =>
        setState((s) => ({ ...s, recent: [id, ...s.recent.filter((x) => x !== id)].slice(0, 8) })),
    };
  }, [state, toggle]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export type FitResult = "fits" | "no-vehicle" | "verify";

export function checkFit(product: Product, vehicle: Vehicle | null): FitResult {
  if (!vehicle) return "no-vehicle";
  const match = product.fits.some(
    (f: Fitment) =>
      f.gen === vehicle.gen &&
      vehicle.year >= f.from &&
      vehicle.year <= f.to &&
      (!f.engines || f.engines.includes(vehicle.engine)),
  );
  return match ? "fits" : "verify";
}

export function vehicleLabel(v: Vehicle) {
  return `${v.year} Jeep Grand Cherokee ${v.gen} · ${v.engine}`;
}
