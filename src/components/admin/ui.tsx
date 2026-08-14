import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("card-surface overflow-x-auto", className)}>{children}</div>;
}

export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-secondary text-left text-xs uppercase tracking-wide text-muted-foreground">
        <tr>
          {head.map((h) => (
            <th key={h} scope="col" className="whitespace-nowrap p-3 font-semibold">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

const TONE: Record<string, string> = {
  good: "bg-success/12 text-success",
  warn: "bg-warning/20 text-warning-foreground",
  bad: "bg-destructive/12 text-destructive",
  info: "bg-primary/10 text-primary",
  muted: "bg-secondary text-secondary-foreground",
};

export function Pill({ children, tone = "muted" }: { children: React.ReactNode; tone?: keyof typeof TONE }) {
  return (
    <span className={cn("inline-block whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold", TONE[tone])}>
      {children}
    </span>
  );
}

export function statusTone(status: string): keyof typeof TONE {
  if (["Delivered", "Paid", "Active", "Approved", "Published", "Resolved"].includes(status)) return "good";
  if (["Pending", "Waiting", "Scheduled", "Processing"].includes(status)) return "warn";
  if (["Cancelled", "Refunded", "Returned", "Blocked", "Hidden"].includes(status)) return "bad";
  if (["Shipped", "Confirmed", "New", "Open"].includes(status)) return "info";
  return "muted";
}

export function RowActions({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((a) => (
        <button
          key={a}
          type="button"
          className="rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-secondary"
        >
          {a}
        </button>
      ))}
    </div>
  );
}
