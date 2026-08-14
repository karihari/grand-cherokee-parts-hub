import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { YEARS, enginesFor, generationsForYear } from "@/data/catalog";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type Props = { compact?: boolean; onDone?: () => void };

export function VehicleSelector({ compact = false, onDone }: Props) {
  const navigate = useNavigate();
  const { addVehicle } = useStore();
  const [year, setYear] = useState<number | null>(null);
  const [gen, setGen] = useState<"WK" | "WK2" | "WL" | null>(null);
  const [engine, setEngine] = useState<string | null>(null);

  const gens = year ? generationsForYear(year) : [];
  const engines = year && gen ? enginesFor(year, gen) : [];
  const ready = year && gen && engine;

  return (
    <div className={cn("space-y-4", compact ? "" : "card-surface p-5 sm:p-6")}>
      {!compact && (
        <div>
          <p className="eyebrow text-primary">Grand Cherokee selector</p>
          <h2 className="mt-1 text-2xl font-bold">Find parts that fit in 3 steps</h2>
        </div>
      )}

      <Step index={1} label="Select year" done={!!year}>
        <select
          aria-label="Select year"
          value={year ?? ""}
          onChange={(e) => {
            setYear(Number(e.target.value));
            setGen(null);
            setEngine(null);
          }}
          className="h-12 w-full rounded-md border border-input bg-card px-3 text-base"
        >
          <option value="">Choose a year</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </Step>

      <Step index={2} label="Select model / generation" done={!!gen}>
        <select
          aria-label="Select model or generation"
          disabled={!year}
          value={gen ?? ""}
          onChange={(e) => {
            setGen(e.target.value as "WK" | "WK2" | "WL");
            setEngine(null);
          }}
          className="h-12 w-full rounded-md border border-input bg-card px-3 text-base disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          <option value="">{year ? "Choose a generation" : "Select a year first"}</option>
          {gens.map((g) => (
            <option key={g.code} value={g.code}>
              {g.name}
            </option>
          ))}
        </select>
      </Step>

      <Step index={3} label="Select engine" done={!!engine}>
        <select
          aria-label="Select engine"
          disabled={!gen}
          value={engine ?? ""}
          onChange={(e) => setEngine(e.target.value)}
          className="h-12 w-full rounded-md border border-input bg-card px-3 text-base disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          <option value="">{gen ? "Choose an engine" : "Select a generation first"}</option>
          {engines.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </Step>

      <button
        type="button"
        disabled={!ready}
        onClick={() => {
          if (!ready) return;
          addVehicle({ year: year!, gen: gen!, engine: engine! });
          toast.success("Vehicle saved", { description: `${year} Grand Cherokee ${gen} · ${engine}` });
          onDone?.();
          navigate({ to: "/parts" });
        }}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent px-4 text-base font-semibold text-accent-foreground transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
      >
        Show compatible parts <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function Step({
  index,
  label,
  done,
  children,
}: {
  index: number;
  label: string;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex size-6 items-center justify-center rounded-full text-xs font-bold",
            done ? "bg-success text-success-foreground" : "bg-secondary text-secondary-foreground",
          )}
        >
          {done ? <Check className="size-3.5" aria-hidden="true" /> : index}
        </span>
        <span className="text-sm font-semibold uppercase tracking-wide">{label}</span>
      </div>
      {children}
    </div>
  );
}
