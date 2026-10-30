import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Lock } from "lucide-react";
import { getMe, login } from "@/lib/api/admin";
import { errorText } from "@/lib/api/errors";
import { tr, useT } from "@/lib/i18n";

type Search = { redirect?: string | undefined };

// Only send the Admin back to an admin page, never to another site.
function safeRedirect(to: string | undefined) {
  return to && to.startsWith("/admin") && !to.startsWith("/admin/login") ? to : "/admin";
}

export const Route = createFileRoute("/admin_/login")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): Search => ({
    redirect: typeof search["redirect"] === "string" ? search["redirect"] : undefined,
  }),
  beforeLoad: async ({ search }) => {
    // Already signed in (or the refresh cookie is still good): skip the form.
    const user = await getMe().catch(() => null);
    if (user) throw redirect({ href: safeRedirect(search.redirect) });
  },
  head: ({ match }) => {
    const t = tr(match.context.lang);
    return {
      meta: [
        { title: t("Вход в админку | GC Parts", "Admin sign in | GC Parts") },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const t = useT();
  const search = Route.useSearch();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        className="card-surface w-full max-w-sm p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            await login(email, password, rememberMe);
            await router.navigate({ href: safeRedirect(search.redirect) });
          } catch (err) {
            setError(errorText(err));
            setPassword("");
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="flex items-center gap-2">
          <Lock className="size-5 text-primary" aria-hidden="true" />
          <h1 className="text-xl font-bold">{t("Вход в админку", "Admin sign in")}</h1>
        </div>
        <label htmlFor="admin-email" className="mt-5 mb-1 block text-sm font-medium">
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
        />
        <label htmlFor="admin-password" className="mt-4 mb-1 block text-sm font-medium">
          {t("Пароль", "Password")}
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
        />
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="size-4"
          />
          Keep me signed in for 30 days
        </label>
        {error ? (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="mt-5 h-11 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {busy ? t("Вход…", "Signing in…") : t("Войти", "Sign in")}
        </button>
        <Link
          to="/"
          className="mt-4 block text-center text-xs text-muted-foreground hover:text-primary"
        >
          {t("← Вернуться в магазин", "← Back to storefront")}
        </Link>
      </form>
    </div>
  );
}
