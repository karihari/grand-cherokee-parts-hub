import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/admin/ui";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/admin/messages")({ component: AdminMessages });

function AdminMessages() {
  const t = useT();
  return (
    <div>
      <PageHeader
        title={t("Сообщения", "Messages")}
        subtitle={t(
          "Заявки из формы на странице «Контакты».",
          "Enquiries sent from the contact form.",
        )}
      />
      <Panel className="p-6 text-sm text-muted-foreground">
        {t(
          "Заявки не хранятся на сайте: они сразу приходят сотрудникам магазина в уведомлениях.",
          "Enquiries are not stored on the website: they are delivered straight to the shop team as notifications.",
        )}
      </Panel>
    </div>
  );
}
