import { createFileRoute } from "@tanstack/react-router";
import { ADMIN_MESSAGES } from "@/data/admin";
import { PageHeader, Panel, Pill, RowActions, Table, statusTone } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/messages")({ component: AdminMessages });

function AdminMessages() {
  return (
    <div>
      <PageHeader title="Messages" subtitle="Every conversation shows the product the customer is asking about." />
      <Panel>
        <Table head={["Customer", "Product", "Channel", "Last message", "Date", "Status", "Actions"]}>
          {ADMIN_MESSAGES.map((m) => (
            <tr key={`${m.customer}-${m.date}`} className="border-t border-border">
              <td className="p-3 font-medium">{m.customer}</td>
              <td className="p-3">{m.product}</td>
              <td className="p-3">
                <Pill tone={m.channel === "WhatsApp" ? "good" : m.channel === "Telegram" ? "info" : "muted"}>
                  {m.channel}
                </Pill>
              </td>
              <td className="p-3 text-muted-foreground">{m.last}</td>
              <td className="p-3 whitespace-nowrap text-muted-foreground">{m.date}</td>
              <td className="p-3">
                <Pill tone={statusTone(m.status)}>{m.status}</Pill>
              </td>
              <td className="p-3">
                <RowActions items={["Reply", "Resolve"]} />
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
