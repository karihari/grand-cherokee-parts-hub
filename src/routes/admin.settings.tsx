import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ROLES } from "@/data/admin";
import { PHONE_DISPLAY, TELEGRAM_USERNAME } from "@/lib/contact";
import { PageHeader, Panel, Table } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/settings")({ component: AdminSettings });

const TABS = ["General", "WhatsApp", "Telegram", "Payment", "Shipping", "Notifications", "Users & Roles", "SEO"] as const;

function AdminSettings() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("General");

  return (
    <div>
      <PageHeader title="Settings" subtitle="Store, channels, payments and permissions." />
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            aria-current={tab === t}
            className={cn(
              "rounded-md border px-3 py-2 text-sm font-medium",
              tab === t ? "border-primary bg-primary/10 text-primary" : "border-border",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Users & Roles" ? (
        <Panel>
          <Table head={["Role", "People", "Permissions"]}>
            {ROLES.map((r) => (
              <tr key={r.role} className="border-t border-border">
                <td className="p-3 font-medium">{r.role}</td>
                <td className="p-3">{r.people}</td>
                <td className="p-3 text-muted-foreground">{r.permissions}</td>
              </tr>
            ))}
          </Table>
        </Panel>
      ) : (
        <Panel className="p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {tab === "General" && (
              <>
                <Field label="Store name" value="GC Parts" />
                <Field label="Currency" value="AMD (֏)" />
                <Field label="Support phone" value={PHONE_DISPLAY} />
                <Field label="Support email" value="support@gcparts.am" />
              </>
            )}
            {tab === "WhatsApp" && (
              <>
                <Field label="WhatsApp number" value={PHONE_DISPLAY} />
                <Field
                  label="Default message"
                  value="Hello, I am interested in this Grand Cherokee part."
                />
              </>
            )}
            {tab === "Telegram" && (
              <>
                <Field label="Telegram username" value={`@${TELEGRAM_USERNAME}`} />
                <Field label="Default message" value="Hello, I have a question about a Grand Cherokee part." />
              </>
            )}
            {tab === "Payment" && (
              <>
                <Field label="Card payments" value="Enabled" />
                <Field label="Cash on delivery" value="Enabled" />
                <Field label="Bank transfer" value="Enabled" />
              </>
            )}
            {tab === "Shipping" && (
              <>
                <Field label="Flat shipping rate" value="֏4,500" />
                <Field label="Free shipping over" value="֏250,000" />
              </>
            )}
            {tab === "Notifications" && (
              <>
                <Field label="Order emails" value="Enabled" />
                <Field label="Low-stock alerts" value="At 3 units" />
              </>
            )}
            {tab === "SEO" && (
              <>
                <Field label="Meta title" value="GC Parts — Jeep Grand Cherokee Spare Parts" />
                <Field label="Meta description" value="Genuine, OEM and aftermarket Grand Cherokee parts." />
              </>
            )}
          </div>
          <button type="button" className="mt-5 h-11 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground">
            Save settings
          </button>
        </Panel>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <input id={id} defaultValue={value} className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm" />
    </div>
  );
}
