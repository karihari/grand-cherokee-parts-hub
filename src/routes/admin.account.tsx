import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, Panel, Pill, Table } from "@/components/admin/ui";
import { changePassword, listSessions, logoutEverywhere, revokeSession } from "@/lib/api/admin";
import { errorText } from "@/lib/api/errors";

export const Route = createFileRoute("/admin/account")({
  loader: () => listSessions(),
  component: AdminAccount,
});

const MIN_PASSWORD = 10;

function describeDevice(userAgent: string | null) {
  if (!userAgent) return "Unknown device";
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /Chrome\//.test(userAgent)
      ? "Chrome"
      : /Firefox\//.test(userAgent)
        ? "Firefox"
        : /Safari\//.test(userAgent)
          ? "Safari"
          : "Browser";
  const os = /iPhone|iPad/.test(userAgent)
    ? "iOS"
    : /Android/.test(userAgent)
      ? "Android"
      : /Mac OS X/.test(userAgent)
        ? "macOS"
        : /Windows/.test(userAgent)
          ? "Windows"
          : /Linux/.test(userAgent)
            ? "Linux"
            : "";
  return os ? `${browser} on ${os}` : browser;
}

const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—";

function AdminAccount() {
  const { user } = Route.useRouteContext();
  const sessions = Route.useLoaderData();
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) {
      toast.error("The new passwords do not match");
      return;
    }
    setBusy(true);
    try {
      await changePassword(current, next);
      setCurrent("");
      setNext("");
      setConfirm("");
      toast.success("Password changed", { description: "Your other devices were signed out." });
      await router.invalidate();
    } catch (error) {
      toast.error("Could not change the password", { description: errorText(error) });
    } finally {
      setBusy(false);
    }
  };

  const signOutDevice = async (id: string) => {
    try {
      await revokeSession(id);
      toast.success("Device signed out");
      await router.invalidate();
    } catch (error) {
      toast.error("Could not sign out the device", { description: errorText(error) });
    }
  };

  const signOutEverywhere = async () => {
    if (!window.confirm("Sign out on every device, including this one?")) return;
    await logoutEverywhere().catch(() => undefined);
    await router.navigate({ to: "/admin/login", search: { redirect: undefined } });
  };

  return (
    <div>
      <PageHeader title="My account" subtitle={`${user.name} · ${user.email}`} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <Panel className="p-5">
          <h2 className="font-bold">Change password</h2>
          <form className="mt-3 space-y-3" onSubmit={submitPassword}>
            <PasswordField
              label="Current password"
              value={current}
              onChange={setCurrent}
              autoComplete="current-password"
            />
            <PasswordField
              label="New password"
              value={next}
              onChange={setNext}
              autoComplete="new-password"
              minLength={MIN_PASSWORD}
            />
            <PasswordField
              label="Repeat new password"
              value={confirm}
              onChange={setConfirm}
              autoComplete="new-password"
              minLength={MIN_PASSWORD}
            />
            <p className="text-xs text-muted-foreground">
              At least {MIN_PASSWORD} characters. A short sentence is easier to remember and harder
              to guess.
            </p>
            <button
              type="submit"
              disabled={busy}
              className="h-11 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {busy ? "Saving…" : "Change password"}
            </button>
          </form>
        </Panel>

        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-2 p-4 pb-2">
            <h2 className="font-bold">Signed-in devices</h2>
            <button
              type="button"
              onClick={signOutEverywhere}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
            >
              Sign out everywhere
            </button>
          </div>
          <Table head={["Device", "IP", "Signed in", "Last active", ""]}>
            {sessions.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="p-3">
                  {describeDevice(s.userAgent)}{" "}
                  {s.current ? <Pill tone="good">This device</Pill> : null}
                </td>
                <td className="p-3 text-muted-foreground">{s.ip ?? "—"}</td>
                <td className="p-3 whitespace-nowrap">{when(s.createdAt)}</td>
                <td className="p-3 whitespace-nowrap">{when(s.lastUsedAt)}</td>
                <td className="p-3 text-right">
                  {s.current ? null : (
                    <button
                      type="button"
                      onClick={() => void signOutDevice(s.id)}
                      className="rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-secondary"
                    >
                      Sign out
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        </Panel>
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  minLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  minLength?: number;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type="password"
        required
        minLength={minLength}
        maxLength={128}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
      />
    </div>
  );
}
