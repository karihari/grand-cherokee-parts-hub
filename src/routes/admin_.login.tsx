import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Lock } from "lucide-react";
import { adminLogin, getAdminSession } from "@/lib/auth.functions";

type Search = { redirect?: string | undefined };

// Only send the Admin back to an admin page, never to another site.
function safeRedirect(to: string | undefined) {
  return to && to.startsWith("/admin") && !to.startsWith("/admin/login") ? to : "/admin";
}

export const Route = createFileRoute("/admin_/login")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    redirect: typeof search["redirect"] === "string" ? search["redirect"] : undefined,
  }),
  beforeLoad: async ({ search }) => {
    const session = await getAdminSession();
    if (session.isAdmin) throw redirect({ href: safeRedirect(search.redirect) });
    return { configured: session.configured };
  },
  head: () => ({
    meta: [{ title: "Admin sign in | GC Parts" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { configured } = Route.useRouteContext();
  const search = Route.useSearch();
  const router = useRouter();
  const login = useServerFn(adminLogin);
  const [password, setPassword] = useState("");
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
            const res = await login({ data: { password } });
            if (res.ok) {
              await router.navigate({ href: safeRedirect(search.redirect) });
            } else {
              setError(res.error);
            }
          } catch {
            setError("Could not sign in. Please try again.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="flex items-center gap-2">
          <Lock className="size-5 text-primary" aria-hidden="true" />
          <h1 className="text-xl font-bold">Admin sign in</h1>
        </div>
        {!configured ? (
          <p className="mt-3 rounded-md bg-warning/20 p-3 text-sm">
            Admin login is not set up yet: ADMIN_PASSWORD and SESSION_SECRET are missing on the
            server.
          </p>
        ) : null}
        <label htmlFor="admin-password" className="mt-5 mb-1 block text-sm font-medium">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
        />
        {error ? (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={busy || !configured}
          className="mt-5 h-11 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <Link
          to="/"
          className="mt-4 block text-center text-xs text-muted-foreground hover:text-primary"
        >
          ← Back to storefront
        </Link>
      </form>
    </div>
  );
}
