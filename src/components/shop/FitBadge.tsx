import { AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FitResult } from "@/lib/store";

const COPY: Record<FitResult, { label: string; className: string }> = {
  fits: {
    label: "Fits your Grand Cherokee",
    className: "bg-success/12 text-success border-success/30",
  },
  verify: {
    label: "Compatibility needs verification",
    className: "bg-warning/15 text-warning-foreground border-warning/40",
  },
  "no-vehicle": {
    label: "Select your Grand Cherokee to check fit",
    className: "bg-muted text-muted-foreground border-border",
  },
};

export function FitBadge({
  result,
  size = "sm",
  className,
}: {
  result: FitResult;
  size?: "sm" | "lg";
  className?: string;
}) {
  const Icon = result === "fits" ? CheckCircle2 : result === "verify" ? AlertTriangle : HelpCircle;
  const copy = COPY[result];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-md border font-medium",
        size === "lg" ? "px-3 py-2 text-sm" : "px-2 py-1 text-xs",
        copy.className,
        className,
      )}
    >
      <Icon aria-hidden="true" className={size === "lg" ? "size-4 shrink-0" : "size-3.5 shrink-0"} />
      <span>{copy.label}</span>
    </span>
  );
}
