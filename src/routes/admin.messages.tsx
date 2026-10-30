import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, Panel, Pill, Table, statusLabel, statusTone } from "@/components/admin/ui";
import { listEnquiries, setEnquiryStatus } from "@/lib/api/admin";
import { errorText } from "@/lib/api/errors";
import { dateLocale, useLang, useT } from "@/lib/i18n";

export const Route = createFileRoute("/admin/messages")({
  loader: () => listEnquiries({ perPage: 200 }),
  component: AdminMessages,
});

function AdminMessages() {
  const t = useT();
  const lang = useLang();
  const { data: messages } = Route.useLoaderData();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const toggle = async (id: string, resolved: boolean) => {
    setBusyId(id);
    try {
      await setEnquiryStatus(id, resolved ? "New" : "Resolved");
      await router.invalidate();
    } catch (error) {
      toast.error(t("Не удалось обновить сообщение", "Could not update the message"), {
        description: errorText(error),
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title={t("Сообщения", "Messages")}
        subtitle={t(
          "Заявки из формы на странице «Контакты».",
          "Enquiries sent from the contact form.",
        )}
      />
      <Panel>
        {messages.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">
            {t("Сообщений пока нет.", "No messages yet.")}
          </p>
        ) : (
          <Table
            head={[
              t("Клиент", "Customer"),
              t("Деталь", "Part"),
              t("Сообщение", "Message"),
              t("Дата", "Date"),
              t("Статус", "Status"),
              t("Действия", "Actions"),
            ]}
          >
            {messages.map((m) => {
              const resolved = m.status === "Resolved";
              return (
                <tr key={m.id} className="border-t border-border align-top">
                  <td className="p-3">
                    <p className="font-medium">{m.name}</p>
                    <a
                      href={`tel:${m.phone.replace(/\s/g, "")}`}
                      className="block whitespace-nowrap text-primary hover:underline"
                    >
                      {m.phone}
                    </a>
                    <a
                      href={`mailto:${m.email}`}
                      className="block text-muted-foreground hover:underline"
                    >
                      {m.email}
                    </a>
                  </td>
                  <td className="p-3">{m.part || "—"}</td>
                  <td className="max-w-md p-3">
                    <p className="whitespace-pre-line">{m.message || "—"}</p>
                    {m.vehicle ? (
                      <p className="mt-1 text-xs text-muted-foreground">{m.vehicle}</p>
                    ) : null}
                  </td>
                  <td className="p-3 whitespace-nowrap text-muted-foreground">
                    {new Date(m.createdAt).toLocaleString(dateLocale(lang), {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="p-3">
                    <Pill tone={statusTone(m.status)}>{statusLabel(m.status, t)}</Pill>
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      disabled={busyId === m.id}
                      onClick={() => void toggle(m.id, resolved)}
                      className="whitespace-nowrap rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-secondary disabled:opacity-60"
                    >
                      {resolved ? t("Открыть снова", "Reopen") : t("Решено", "Mark resolved")}
                    </button>
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </Panel>
    </div>
  );
}
