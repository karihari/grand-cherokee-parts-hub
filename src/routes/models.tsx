import { createFileRoute } from "@tanstack/react-router";
import { GENERATIONS } from "@/data/catalog";
import { VehicleSelector } from "@/components/shop/VehicleSelector";
import { MyGarage } from "@/components/shop/MyGarage";
import { tr, useT } from "@/lib/i18n";

export const Route = createFileRoute("/models")({
  head: ({ match }) => {
    const t = tr(match.context.lang);
    return {
      meta: [
        {
          title: t(
            "Модели Grand Cherokee: WK, WK2, WL | GC Parts",
            "Grand Cherokee Models: WK, WK2, WL | GC Parts",
          ),
        },
        {
          name: "description",
          content: t(
            "Поколения, годы выпуска и двигатели Grand Cherokee — WK 2005–2010, WK2 2011–2021 и WL с 2021 года.",
            "Grand Cherokee generations, model years and engines — WK 2005–2010, WK2 2011–2021 and WL 2021 onwards.",
          ),
        },
        {
          property: "og:title",
          content: t(
            "Модели Grand Cherokee: WK, WK2, WL | GC Parts",
            "Grand Cherokee Models: WK, WK2, WL | GC Parts",
          ),
        },
        {
          property: "og:description",
          content: t(
            "Выберите поколение и двигатель, чтобы увидеть совместимые запчасти.",
            "Pick your generation and engine to filter compatible parts.",
          ),
        },
      ],
    };
  },
  component: ModelsPage,
});

function ModelsPage() {
  const t = useT();
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">{t("Модели Grand Cherokee", "Grand Cherokee Models")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t(
          "Поддерживаются три поколения. Сохраните свой автомобиль — и совместимость будет проверяться везде.",
          "Three generations supported. Save your vehicle once and fitment is checked everywhere.",
        )}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {GENERATIONS.map((g) => (
            <article key={g.code} className="card-surface p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-xl font-bold">{g.name}</h2>
                <p className="text-sm font-medium text-muted-foreground">
                  {g.years[0]}–{g.years[g.years.length - 1]}
                </p>
              </div>
              <div className="mt-3">
                <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {t("Годы выпуска", "Model years")}
                </h3>
                <p className="mt-1 text-sm">{g.years.join(" · ")}</p>
              </div>
              <div className="mt-3">
                <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {t("Двигатели", "Engines")}
                </h3>
                <ul className="mt-1 flex flex-wrap gap-2">
                  {g.engines.map((e) => (
                    <li
                      key={e}
                      className="rounded-md border border-border px-2.5 py-1 text-xs font-medium"
                    >
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <div className="space-y-4">
          <VehicleSelector />
          <MyGarage />
        </div>
      </div>
    </div>
  );
}
