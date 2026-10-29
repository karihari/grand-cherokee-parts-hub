import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ROLES } from "@/data/admin";
import { PHONE_DISPLAY, TELEGRAM_USERNAME } from "@/lib/contact";
import { PageHeader, Panel, Table } from "@/components/admin/ui";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/admin/settings")({ component: AdminSettings });

const TABS = [
  { id: "general", label: { ru: "Общие", en: "General" } },
  { id: "whatsapp", label: { ru: "WhatsApp", en: "WhatsApp" } },
  { id: "telegram", label: { ru: "Telegram", en: "Telegram" } },
  { id: "payment", label: { ru: "Оплата", en: "Payment" } },
  { id: "shipping", label: { ru: "Доставка", en: "Shipping" } },
  { id: "notifications", label: { ru: "Уведомления", en: "Notifications" } },
  { id: "roles", label: { ru: "Пользователи и роли", en: "Users & Roles" } },
  { id: "seo", label: { ru: "SEO", en: "SEO" } },
] as const;

function AdminSettings() {
  const t = useT();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("general");

  return (
    <div>
      <PageHeader
        title={t("Настройки", "Settings")}
        subtitle={t(
          "Магазин, каналы связи, оплата и права доступа.",
          "Store, channels, payments and permissions.",
        )}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            aria-current={tab === item.id}
            className={cn(
              "rounded-md border px-3 py-2 text-sm font-medium",
              tab === item.id ? "border-primary bg-primary/10 text-primary" : "border-border",
            )}
          >
            {t(item.label)}
          </button>
        ))}
      </div>

      {tab === "roles" ? (
        <Panel>
          <Table head={[t("Роль", "Role"), t("Сотрудники", "People"), t("Права", "Permissions")]}>
            {ROLES.map((r) => (
              <tr key={r.role.en} className="border-t border-border">
                <td className="p-3 font-medium">{t(r.role)}</td>
                <td className="p-3">{r.people}</td>
                <td className="p-3 text-muted-foreground">{t(r.permissions)}</td>
              </tr>
            ))}
          </Table>
        </Panel>
      ) : (
        <Panel className="p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {tab === "general" && (
              <>
                <Field label={t("Название магазина", "Store name")} value="GC Parts" />
                <Field label={t("Валюта", "Currency")} value="AMD (֏)" />
                <Field label={t("Телефон поддержки", "Support phone")} value={PHONE_DISPLAY} />
                <Field label={t("Email поддержки", "Support email")} value="support@gcparts.am" />
              </>
            )}
            {tab === "whatsapp" && (
              <>
                <Field label={t("Номер WhatsApp", "WhatsApp number")} value={PHONE_DISPLAY} />
                <Field
                  label={t("Сообщение по умолчанию", "Default message")}
                  value={t(
                    "Здравствуйте, меня интересует эта запчасть для Grand Cherokee.",
                    "Hello, I am interested in this Grand Cherokee part.",
                  )}
                />
              </>
            )}
            {tab === "telegram" && (
              <>
                <Field
                  label={t("Имя пользователя Telegram", "Telegram username")}
                  value={`@${TELEGRAM_USERNAME}`}
                />
                <Field
                  label={t("Сообщение по умолчанию", "Default message")}
                  value={t(
                    "Здравствуйте, у меня вопрос о запчасти для Grand Cherokee.",
                    "Hello, I have a question about a Grand Cherokee part.",
                  )}
                />
              </>
            )}
            {tab === "payment" && (
              <>
                <Field
                  label={t("Оплата картой", "Card payments")}
                  value={t("Включена", "Enabled")}
                />
                <Field
                  label={t("Оплата наличными", "Cash on delivery")}
                  value={t("Включена", "Enabled")}
                />
                <Field
                  label={t("Банковский перевод", "Bank transfer")}
                  value={t("Включён", "Enabled")}
                />
              </>
            )}
            {tab === "shipping" && (
              <>
                <Field label={t("Стоимость доставки", "Flat shipping rate")} value="֏4,500" />
                <Field label={t("Бесплатная доставка от", "Free shipping over")} value="֏250,000" />
              </>
            )}
            {tab === "notifications" && (
              <>
                <Field
                  label={t("Письма о заказах", "Order emails")}
                  value={t("Включены", "Enabled")}
                />
                <Field
                  label={t("Уведомления о малом остатке", "Low-stock alerts")}
                  value={t("При 3 шт.", "At 3 units")}
                />
              </>
            )}
            {tab === "seo" && (
              <>
                <Field
                  label={t("Мета-заголовок", "Meta title")}
                  value={t(
                    "GC Parts — запчасти для Jeep Grand Cherokee",
                    "GC Parts — Jeep Grand Cherokee Spare Parts",
                  )}
                />
                <Field
                  label={t("Мета-описание", "Meta description")}
                  value={t(
                    "Оригинальные и неоригинальные запчасти для Grand Cherokee.",
                    "Genuine, OEM and aftermarket Grand Cherokee parts.",
                  )}
                />
              </>
            )}
          </div>
          <button
            type="button"
            className="mt-5 h-11 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground"
          >
            {t("Сохранить настройки", "Save settings")}
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
      <input
        id={id}
        defaultValue={value}
        className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
      />
    </div>
  );
}
