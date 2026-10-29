import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, PackageCheck, Store, Wallet } from "lucide-react";
import heroImage from "@/assets/hero-grand-cherokee.jpg";
import { CATEGORIES } from "@/data/catalog";
import { VehicleSelector } from "@/components/shop/VehicleSelector";
import { ProductCard } from "@/components/shop/ProductCard";
import { MyGarage } from "@/components/shop/MyGarage";
import { useProducts } from "@/lib/products";
import { tr, useT } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: ({ match }) => {
    const t = tr(match.context.lang);
    return {
      meta: [
        {
          title: t(
            "Запчасти и аксессуары для Jeep Grand Cherokee | GC Parts",
            "Jeep Grand Cherokee Parts & Accessories | GC Parts",
          ),
        },
        {
          name: "description",
          content: t(
            "Подберите запчасти для Jeep Grand Cherokee за три шага. Оригинальные и неоригинальные детали тормозов, двигателя, подвески и освещения с проверкой совместимости.",
            "Find the right parts for your Jeep Grand Cherokee in three steps. OEM, genuine and aftermarket brakes, engine, suspension and lighting parts with verified fitment.",
          ),
        },
        {
          property: "og:title",
          content: t(
            "Запчасти и аксессуары для Jeep Grand Cherokee | GC Parts",
            "Jeep Grand Cherokee Parts & Accessories | GC Parts",
          ),
        },
        {
          property: "og:description",
          content: t(
            "Выберите год, поколение и двигатель — и смотрите только подходящие запчасти.",
            "Select your year, generation and engine — see only parts that fit your Grand Cherokee.",
          ),
        },
      ],
    };
  },
  component: Home,
});

function Home() {
  const t = useT();
  const products = useProducts();
  const featured = products.filter((p) => p.featured).slice(0, 4);

  return (
    <div>
      <section className="relative overflow-hidden bg-surface text-surface-foreground">
        <img
          src={heroImage}
          alt={t("Jeep Grand Cherokee в гараже", "Jeep Grand Cherokee in a studio garage")}
          width={1600}
          height={1000}
          className="absolute inset-0 size-full object-cover opacity-45"
        />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div className="max-w-xl self-center">
            <p className="eyebrow text-accent">
              {t("Только Grand Cherokee · WK · WK2 · WL", "Grand Cherokee only · WK · WK2 · WL")}
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
              {t(
                "Подберите запчасти для вашего Jeep Grand Cherokee",
                "Find the Right Parts for Your Jeep Grand Cherokee",
              )}
            </h1>
            <p className="mt-4 max-w-lg text-base text-surface-foreground/80 sm:text-lg">
              {t(
                "Оригинальные и неоригинальные запчасти для вашего Grand Cherokee.",
                "Shop genuine, OEM and aftermarket parts for your Grand Cherokee.",
              )}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#selector"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-accent px-6 text-base font-semibold text-accent-foreground transition-colors hover:brightness-95"
              >
                {t("Подобрать запчасть", "Find My Part")}{" "}
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
              <Link
                to="/parts"
                className="inline-flex h-12 items-center justify-center rounded-md border border-surface-foreground/30 px-6 text-base font-semibold transition-colors hover:bg-sidebar-accent"
              >
                {t("Все запчасти", "Shop All Parts")}
              </Link>
            </div>
            <ul className="mt-8 grid gap-3 text-sm text-surface-foreground/80 sm:grid-cols-2">
              <Feature icon={BadgeCheck}>
                {t("Совместимость проверена для каждой детали", "Fitment checked on every listing")}
              </Feature>
              <Feature icon={PackageCheck}>
                {t("Новые, б/у и оригинальные детали", "New, used and OEM stock")}
              </Feature>
              <Feature icon={Store}>
                {t("Заказ онлайн, самовывоз из магазина", "Order online, pick up at our shop")}
              </Feature>
              <Feature icon={Wallet}>
                {t("Оплата наличными или картой при получении", "Pay by cash or card at pickup")}
              </Feature>
            </ul>
          </div>

          <div id="selector" className="scroll-mt-24 self-center text-foreground">
            <VehicleSelector />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <MyGarage />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">{t("Категории", "Shop by category")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(
                "Все категории — только для Grand Cherokee.",
                "Every category is Grand Cherokee specific.",
              )}
            </p>
          </div>
          <Link to="/categories" className="text-sm font-semibold text-primary hover:underline">
            {t("Смотреть все", "View all")}
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.slice(0, 12).map((c) => (
            <Link
              key={c.slug}
              to="/parts"
              search={{ category: c.slug }}
              className="card-surface flex flex-col items-center gap-3 p-4 text-center transition-shadow hover:shadow-[var(--shadow-lift)]"
            >
              <img
                src={c.image}
                alt=""
                loading="lazy"
                width={800}
                height={800}
                className="size-16 rounded-md object-cover"
              />
              <span className="text-sm font-semibold">{t(c.name)}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold">{t("Популярное", "Popular right now")}</h2>
          <Link to="/deals" className="text-sm font-semibold text-primary hover:underline">
            {t("Смотреть акции", "See deals")}
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Feature({ icon: Icon, children }: { icon: typeof BadgeCheck; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <Icon className="size-4 shrink-0 text-accent" aria-hidden="true" />
      {children}
    </li>
  );
}
