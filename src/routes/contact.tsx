import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessageCircle, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { PHONE_DISPLAY, telegramLink, whatsappLink } from "@/lib/contact";
import { sendEnquiry } from "@/lib/api/shop";
import { errorText } from "@/lib/api/errors";
import { useStore, vehicleLabel } from "@/lib/store";
import { tr, useT } from "@/lib/i18n";

export const Route = createFileRoute("/contact")({
  head: ({ match }) => {
    const t = tr(match.context.lang);
    return {
      meta: [
        {
          title: t(
            "Контакты GC Parts — специалисты по Grand Cherokee",
            "Contact GC Parts — Grand Cherokee Specialists",
          ),
        },
        {
          name: "description",
          content: t(
            "Спросите наших специалистов о совместимости, наличии или номере детали. WhatsApp, Telegram или форма заявки.",
            "Ask our Grand Cherokee specialists about fitment, availability or a part number. WhatsApp, Telegram or the enquiry form.",
          ),
        },
        {
          property: "og:title",
          content: t(
            "Контакты GC Parts — специалисты по Grand Cherokee",
            "Contact GC Parts — Grand Cherokee Specialists",
          ),
        },
        {
          property: "og:description",
          content: t(
            "Помощь с подбором для владельцев Grand Cherokee WK, WK2 и WL.",
            "Fitment help for WK, WK2 and WL Grand Cherokee owners.",
          ),
        },
      ],
    };
  },
  component: ContactPage,
});

function ContactPage() {
  const t = useT();
  const { activeVehicle } = useStore();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const vehicle = activeVehicle
    ? vehicleLabel(activeVehicle)
    : t("ещё не выбран", "not selected yet");
  const message = t(
    `Здравствуйте, у меня вопрос о запчастях для Grand Cherokee.\nАвтомобиль: ${vehicle}`,
    `Hello, I have a question about Grand Cherokee parts.\nVehicle: ${vehicle}`,
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold">{t("Свяжитесь с нами", "Contact us")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t(
          "Пришлите номер детали или фото — мы проверим совместимость до покупки.",
          "Send us a part number or a photo — we confirm fitment before you buy.",
        )}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <a
          href={whatsappLink(message)}
          target="_blank"
          rel="noopener noreferrer"
          className="card-surface flex items-center gap-3 p-4 hover:shadow-[var(--shadow-lift)]"
        >
          <MessageCircle className="size-5 text-whatsapp" aria-hidden="true" />
          <div>
            <p className="font-semibold">WhatsApp</p>
            <p className="text-xs text-muted-foreground">{PHONE_DISPLAY}</p>
          </div>
        </a>
        <a
          href={telegramLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="card-surface flex items-center gap-3 p-4 hover:shadow-[var(--shadow-lift)]"
        >
          <Send className="size-5 text-telegram" aria-hidden="true" />
          <div>
            <p className="font-semibold">Telegram</p>
            <p className="text-xs text-muted-foreground">@gcparts_support</p>
          </div>
        </a>
        <a
          href={`tel:+37455050602`}
          className="card-surface flex items-center gap-3 p-4 hover:shadow-[var(--shadow-lift)]"
        >
          <Phone className="size-5 text-primary" aria-hidden="true" />
          <div>
            <p className="font-semibold">{t("Позвонить", "Call")}</p>
            <p className="text-xs text-muted-foreground">{PHONE_DISPLAY}</p>
          </div>
        </a>
      </div>

      <form
        className="card-surface mt-6 space-y-4 p-5"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const fd = new FormData(form);
          setSending(true);
          try {
            await sendEnquiry({
              name: String(fd.get("name") ?? ""),
              phone: String(fd.get("phone") ?? ""),
              email: String(fd.get("email") ?? ""),
              part: String(fd.get("part") ?? ""),
              message: String(fd.get("msg") ?? ""),
              vehicle: activeVehicle ? vehicleLabel(activeVehicle) : "",
              website: String(fd.get("website") ?? ""),
            });
            setSent(true);
            form.reset();
            toast.success(t("Сообщение отправлено", "Message sent"), {
              description: t(
                "Мы ответим в течение рабочего часа.",
                "We reply within one business hour.",
              ),
            });
          } catch (error) {
            toast.error(t("Не удалось отправить", "Could not send"), {
              description: errorText(error),
            });
          } finally {
            setSending(false);
          }
        }}
      >
        <h2 className="text-lg font-bold">{t("Отправить заявку", "Send an enquiry")}</h2>
        {/* Spam trap: hidden from people, filled in by bots. */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="name" label={t("Ваше имя", "Your name")} required />
          <Field id="phone" label={t("Телефон", "Phone")} type="tel" required />
        </div>
        <Field id="email" label="Email" type="email" required />
        <Field id="part" label={t("Название или номер детали", "Part name or number")} />
        <div>
          <label htmlFor="msg" className="mb-1 block text-sm font-medium">
            {t("Сообщение", "Message")}
          </label>
          <textarea
            id="msg"
            name="msg"
            rows={4}
            className="w-full rounded-md border border-input bg-card p-3 text-sm"
            defaultValue={
              activeVehicle
                ? `${t("Мой автомобиль", "My vehicle")}: ${vehicleLabel(activeVehicle)}`
                : ""
            }
          />
        </div>
        <button
          type="submit"
          disabled={sending || !ready}
          className="h-12 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-60 sm:w-auto sm:px-8"
        >
          {sending ? t("Отправка…", "Sending…") : t("Отправить заявку", "Send enquiry")}
        </button>

        {sent ? (
          <p role="status" className="text-sm font-medium text-success">
            {t(
              "Спасибо — ваша заявка передана нашей команде.",
              "Thanks — your enquiry is with our Grand Cherokee team.",
            )}
          </p>
        ) : null}
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  type = "text",
  required,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
      />
    </div>
  );
}
