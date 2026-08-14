import { Link } from "@tanstack/react-router";
import { Car, Check, Trash2 } from "lucide-react";
import { useStore, vehicleLabel } from "@/lib/store";
import { cn } from "@/lib/utils";

export function MyGarage() {
  const { vehicles, activeVehicleId, selectVehicle, removeVehicle, activeVehicle } = useStore();

  if (vehicles.length === 0) {
    return (
      <div className="card-surface flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-md bg-secondary">
            <Car className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold">My Grand Cherokee</p>
            <p className="text-sm text-muted-foreground">
              No vehicle saved yet — pick your year, generation and engine once and we filter everything for you.
            </p>
          </div>
        </div>
        <Link
          to="/models"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          Select vehicle
        </Link>
      </div>
    );
  }

  return (
    <div className="card-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold uppercase tracking-wide">My Grand Cherokee</h2>
        <Link to="/models" className="text-sm font-semibold text-primary hover:underline">
          Change vehicle
        </Link>
      </div>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {vehicles.map((v) => {
          const active = v.id === activeVehicleId;
          return (
            <li
              key={v.id}
              className={cn(
                "flex items-center justify-between gap-3 rounded-md border p-3",
                active ? "border-success bg-success/8" : "border-border",
              )}
            >
              <div>
                <p className="font-semibold">{vehicleLabel(v)}</p>
                <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                  {active ? (
                    <span className="inline-flex items-center gap-1 text-success">
                      <Check className="size-3.5" aria-hidden="true" /> Vehicle selected
                    </span>
                  ) : (
                    "Saved vehicle"
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!active && (
                  <button
                    type="button"
                    onClick={() => selectVehicle(v.id)}
                    className="h-9 rounded-md border border-border px-3 text-sm font-medium hover:bg-secondary"
                  >
                    Use
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeVehicle(v.id)}
                  aria-label={`Remove ${vehicleLabel(v)}`}
                  className="inline-flex size-9 items-center justify-center rounded-md border border-border hover:bg-secondary"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {activeVehicle ? (
        <Link
          to="/parts"
          className="mt-4 inline-flex h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-semibold text-accent-foreground"
        >
          View parts for this vehicle
        </Link>
      ) : null}
    </div>
  );
}
