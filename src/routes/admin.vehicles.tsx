import { createFileRoute } from "@tanstack/react-router";
import { GENERATIONS } from "@/data/catalog";
import { PageHeader, Panel, RowActions, Table } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/vehicles")({ component: AdminVehicles });

function AdminVehicles() {
  const rows = GENERATIONS.flatMap((g) =>
    g.years.flatMap((y) => g.engines.map((e) => ({ key: `${y}-${g.code}-${e}`, year: y, gen: g.code, engine: e }))),
  );

  return (
    <div>
      <PageHeader
        title="Grand Cherokee Models"
        subtitle="Years, generations and engines that drive the compatibility system."
        action={
          <button type="button" className="h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">
            Add combination
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {GENERATIONS.map((g) => (
          <div key={g.code} className="card-surface p-4">
            <p className="font-display text-lg font-bold">{g.name}</p>
            <p className="text-sm text-muted-foreground">
              {g.years[0]}–{g.years[g.years.length - 1]} · {g.engines.length} engines
            </p>
          </div>
        ))}
      </div>

      <Panel>
        <Table head={["Year", "Generation", "Engine", "Trim", "Actions"]}>
          {rows.map((r) => (
            <tr key={r.key} className="border-t border-border">
              <td className="p-3 font-medium">{r.year}</td>
              <td className="p-3">Grand Cherokee {r.gen}</td>
              <td className="p-3">{r.engine}</td>
              <td className="p-3 text-muted-foreground">All trims</td>
              <td className="p-3">
                <RowActions items={["Edit", "Delete"]} />
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
