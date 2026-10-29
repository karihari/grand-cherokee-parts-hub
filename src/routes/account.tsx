import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { formatAMD, priceLabel, productName } from "@/data/catalog";
import { useStore } from "@/lib/store";
import { MyGarage } from "@/components/shop/MyGarage";
import { cn } from "@/lib/utils";
import { useProducts } from "@/lib/products";
import { getOrderStatuses } from "@/lib/orders.functions";
import { orderStatusLabel } from "@/data/orders";
import { Pill, statusTone } from "@/components/admin/ui";
import { tr, useT, useLang } from "@/lib/i18n";

export const Route = createFileRoute("/account")({
  validateSearch: (search: Record<string, unknown>): { tab?: "orders" | undefined } => ({
    tab: search["tab"] === "orders" ? "orders" : undefined,
  }),
  head: ({ match }) => {
    const t = tr(match.context.lang);
    return {
      meta: [
        { title: t("Мой аккаунт | GC Parts", "My Account | GC Parts") },
        {
          name: "description",
          content: t(
            "Ваши автомобили, заказы, избранное и отложенные запчасти в одном месте.",
            "Your Grand Cherokees, orders, wishlist and saved parts in one place.",
          ),
        },
        { property: "og:title", content: t("Мой аккаунт | GC Parts", "My Account | GC Parts") },
        {
          property: "og:description",
          content: t(
            "Ваш гараж Grand Cherokee и заказы.",
            "Manage your Grand Cherokee garage and orders.",
          ),
        },
      ],
    };
  },
  component: AccountPage,
});

const TABS = [
  { id: "profile", label: { ru: "Мой профиль", en: "My Profile" } },
  { id: "garage", label: { ru: "Мои Grand Cherokee", en: "My Grand Cherokees" } },
  { id: "orders", label: { ru: "Мои заказы", en: "My Orders" } },
  { id: "wishlist", label: { ru: "Избранное", en: "Wishlist" } },
  { id: "recent", label: { ru: "Недавно просмотренные", en: "Recently Viewed" } },
  { id: "saved", label: { ru: "Отложенные", en: "Saved Parts" } },
  { id: "messages", label: { ru: "Сообщения", en: "Messages" } },
  { id: "returns", label: { ru: "Возвраты", en: "Returns" } },
  { id: "addresses", label: { ru: "Адреса", en: "Addresses" } },
  { id: "settings", label: { ru: "Настройки", en: "Settings" } },
] as const;

function AccountPage() {
  const t = useT();
  const search = Route.useSearch();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>(
    search.tab === "orders" ? "orders" : "garage",
  );
  const { wishlist, recent, saved } = useStore();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">{t("Мой аккаунт", "My account")}</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav
          aria-label={t("Разделы аккаунта", "Account sections")}
          className="card-surface h-fit p-2"
        >
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              aria-current={tab === item.id}
              className={cn(
                "w-full rounded-md px-3 py-2.5 text-left text-sm font-medium",
                tab === item.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
              )}
            >
              {t(item.label)}
            </button>
          ))}
        </nav>

        <section className="space-y-4">
          {tab === "garage" && <MyGarage />}

          {tab === "profile" && (
            <div className="card-surface p-5">
              <h2 className="text-lg font-bold">{t("Профиль", "Profile")}</h2>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <Info label={t("Имя", "Name")} value="Karine H." />
                <Info label={t("Телефон", "Phone")} value="+374 55 050 602" />
                <Info label="Email" value="karine@example.com" />
                <Info label={t("С нами с", "Member since")} value={t("марта 2024", "March 2024")} />
              </dl>
            </div>
          )}

          {tab === "orders" && <MyOrders />}

          {(tab === "wishlist" || tab === "recent" || tab === "saved") && (
            <ProductList
              title={t(TABS.find((item) => item.id === tab)!.label)}
              ids={tab === "wishlist" ? wishlist : tab === "recent" ? recent : saved}
            />
          )}

          {tab === "messages" && (
            <div className="card-surface p-5 text-sm">
              <h2 className="text-lg font-bold">{t("Сообщения", "Messages")}</h2>
              <p className="mt-2 text-muted-foreground">
                {t(
                  "Переписка в WhatsApp или Telegram продолжается в этих приложениях. Заявки с сайта появятся",
                  "Conversations you started on WhatsApp or Telegram continue in those apps. Website enquiries appear",
                )}
                {t("здесь после ответа.", "here once answered.")}
              </p>
            </div>
          )}

          {tab === "returns" && (
            <div className="card-surface p-5 text-sm">
              <h2 className="text-lg font-bold">{t("Возвраты", "Returns")}</h2>
              <p className="mt-2 text-muted-foreground">
                {t(
                  "Открытых возвратов нет. Новые запчасти можно вернуть в течение 14 дней, если они не устанавливались.",
                  "No open returns. New parts can be returned within 14 days if unfitted.",
                )}
              </p>
            </div>
          )}

          {tab === "addresses" && (
            <div className="card-surface p-5 text-sm">
              <h2 className="text-lg font-bold">{t("Адреса", "Addresses")}</h2>
              <p className="mt-2 font-medium">{t("Дом", "Home")}</p>
              <p className="text-muted-foreground">
                {t(
                  "пр. Баграмяна 12, Ереван 0019, Армения",
                  "12 Baghramyan Ave, Yerevan 0019, Armenia",
                )}
              </p>
            </div>
          )}

          {tab === "settings" && (
            <div className="card-surface space-y-3 p-5 text-sm">
              <h2 className="text-lg font-bold">{t("Настройки", "Settings")}</h2>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  defaultChecked
                  className="size-4 accent-[var(--color-primary)]"
                />
                {t(
                  "Сообщать о снижении цен на избранные запчасти",
                  "Notify me about price drops on wishlist parts",
                )}
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  defaultChecked
                  className="size-4 accent-[var(--color-primary)]"
                />
                {t("Присылать статус заказа в WhatsApp", "Send order updates over WhatsApp")}
              </label>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function MyOrders() {
  const t = useT();
  const { orders } = useStore();
  const getStatuses = useServerFn(getOrderStatuses);
  const [statuses, setStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    if (orders.length === 0) return;
    getStatuses({ data: { ids: orders.map((o) => o.id) } })
      .then((rows) => setStatuses(Object.fromEntries(rows.map((r) => [r.id, r.status]))))
      .catch((error: unknown) => console.error(error));
  }, [orders, getStatuses]);

  if (orders.length === 0) {
    return (
      <div className="card-surface p-5 text-sm">
        <h2 className="text-lg font-bold">{t("Мои заказы", "My Orders")}</h2>
        <p className="mt-2 text-muted-foreground">
          {t("С этого устройства заказов ещё не было.", "No orders from this device yet.")}{" "}
          <Link to="/parts" className="font-semibold text-primary underline">
            {t("Смотреть запчасти", "Browse parts")}
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="card-surface overflow-x-auto p-0">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th className="p-3">{t("Заказ", "Order")}</th>
            <th className="p-3">{t("Дата", "Date")}</th>
            <th className="p-3">{t("Товары", "Items")}</th>
            <th className="p-3">{t("Сумма", "Total")}</th>
            <th className="p-3">{t("Статус", "Status")}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const status = statuses[o.id] ?? "New";
            return (
              <tr key={o.id} className="border-t border-border">
                <td className="p-3 font-medium">{o.id}</td>
                <td className="p-3 whitespace-nowrap text-muted-foreground">
                  {o.createdAt.slice(0, 10)}
                </td>
                <td className="p-3">{o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</td>
                <td className="p-3 whitespace-nowrap font-medium">{formatAMD(o.total)}</td>
                <td className="p-3">
                  <Pill tone={statusTone(status)}>{orderStatusLabel(status, t)}</Pill>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ProductList({ title, ids }: { title: string; ids: string[] }) {
  const t = useT();
  const lang = useLang();
  const products = useProducts();
  const items = products.filter((p) => ids.includes(p.id));
  if (items.length === 0) {
    return (
      <div className="card-surface p-5 text-sm">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mt-2 text-muted-foreground">
          {t("Здесь пока пусто.", "Nothing here yet.")}{" "}
          <Link to="/parts" className="font-semibold text-primary underline">
            {t("Смотреть запчасти", "Browse parts")}
          </Link>
          .
        </p>
      </div>
    );
  }
  return (
    <div className="card-surface p-5">
      <h2 className="text-lg font-bold">{title}</h2>
      <ul className="mt-3 divide-y divide-border">
        {items.map((p) => (
          <li key={p.id} className="flex items-center gap-3 py-3">
            <img
              src={p.image}
              alt=""
              loading="lazy"
              width={800}
              height={800}
              className="size-14 rounded-md object-cover"
            />
            <div className="flex-1">
              <Link
                to="/product/$slug"
                params={{ slug: p.slug }}
                className="font-medium hover:text-primary"
              >
                {productName(p, lang)}
              </Link>
              <p className="text-xs text-muted-foreground">
                {t("Артикул", "Part №")} {p.partNumber}
              </p>
            </div>
            <span className="font-semibold">{priceLabel(p.price, t)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-3">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
