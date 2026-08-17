import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { MessageCircle, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { PHONE_DISPLAY, telegramLink, whatsappLink } from "@/lib/contact";
import { sendEnquiry } from "@/lib/enquiry.functions";
import { useStore, vehicleLabel } from "@/lib/store";


export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact GC Parts — Grand Cherokee Specialists" },
      {
        name: "description",
        content:
          "Ask our Grand Cherokee specialists about fitment, availability or a part number. WhatsApp, Telegram or the enquiry form.",
      },
      { property: "og:title", content: "Contact GC Parts — Grand Cherokee Specialists" },
      { property: "og:description", content: "Fitment help for WK, WK2 and WL Grand Cherokee owners." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { activeVehicle } = useStore();
  const [sent, setSent] = useState(false);
  const message = `Hello, I have a question about Grand Cherokee parts.\nVehicle: ${
    activeVehicle ? vehicleLabel(activeVehicle) : "not selected yet"
  }`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold">Contact us</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Send us a part number or a photo — we confirm fitment before you buy.
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
          href={telegramLink(message)}
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
        <a href={`tel:+37455050602`} className="card-surface flex items-center gap-3 p-4 hover:shadow-[var(--shadow-lift)]">
          <Phone className="size-5 text-primary" aria-hidden="true" />
          <div>
            <p className="font-semibold">Call</p>
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
          const result = await submitEnquiry({
            data: {
              name: String(fd.get("name") ?? ""),
              phone: String(fd.get("phone") ?? ""),
              email: String(fd.get("email") ?? ""),
              part: String(fd.get("part") ?? ""),
              message: String(fd.get("msg") ?? ""),
              vehicle: activeVehicle ? vehicleLabel(activeVehicle) : "",
            },
          }).catch(() => ({ ok: false as const }));
          setSending(false);
          if (result.ok) {
            setSent(true);
            form.reset();
            toast.success("Message sent", { description: "We reply within one business hour." });
          } else {
            toast.error("Could not send", { description: "Please try WhatsApp or Telegram." });
          }
        }}
      >
        <h2 className="text-lg font-bold">Send an enquiry</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="name" label="Your name" required />
          <Field id="phone" label="Phone" type="tel" required />
        </div>
        <Field id="email" label="Email" type="email" required />
        <Field id="part" label="Part name or number" />
        <div>
          <label htmlFor="msg" className="mb-1 block text-sm font-medium">
            Message
          </label>
          <textarea
            id="msg"
            name="msg"
            rows={4}
            className="w-full rounded-md border border-input bg-card p-3 text-sm"
            defaultValue={activeVehicle ? `My vehicle: ${vehicleLabel(activeVehicle)}` : ""}
          />
        </div>
        <button
          type="submit"
          disabled={sending}
          className="h-12 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-60 sm:w-auto sm:px-8"
        >
          {sending ? "Sending…" : "Send enquiry"}
        </button>

        {sent ? (
          <p role="status" className="text-sm font-medium text-success">
            Thanks — your enquiry is with our Grand Cherokee team.
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
        type={type}
        required={required}
        className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
      />
    </div>
  );
}
