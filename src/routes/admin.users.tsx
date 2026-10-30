import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel, Pill, Table } from "@/components/admin/ui";
import {
  createAdminUser,
  listAdminUsers,
  resetAdminPassword,
  updateAdminUser,
  type AdminRole,
  type AdminUser,
} from "@/lib/api/admin";
import { errorText } from "@/lib/api/errors";

export const Route = createFileRoute("/admin/users")({
  // Staff never see this page; the API refuses them anyway (403).
  beforeLoad: ({ context }) => {
    if (context.user.role !== "admin") throw redirect({ to: "/admin" });
  },
  loader: () => listAdminUsers(),
  component: AdminUsers,
});

const ROLE_LABEL: Record<AdminRole, string> = {
  admin: "Admin — everything",
  staff: "Staff — products & orders",
};

function AdminUsers() {
  const users = Route.useLoaderData();
  const { user: me } = Route.useRouteContext();
  const router = useRouter();
  const [adding, setAdding] = useState(false);

  const run = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      toast.success(success);
      await router.invalidate();
    } catch (error) {
      toast.error("Could not save", { description: errorText(error) });
    }
  };

  const resetPassword = (u: AdminUser) => {
    const password = window.prompt(`New password for ${u.email} (at least 10 characters):`);
    if (!password) return;
    void run(
      () => resetAdminPassword(u.id, password),
      `Password reset; ${u.name} was signed out everywhere`,
    );
  };

  return (
    <div>
      <PageHeader
        title="Admin users"
        subtitle="Everyone who can sign in to this panel. Disabling someone signs them out at once."
        action={
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="size-4" aria-hidden="true" /> Add user
          </button>
        }
      />

      {adding ? (
        <NewUserForm
          onCancel={() => setAdding(false)}
          onSave={async (input) => {
            await run(() => createAdminUser(input), `${input.name} can now sign in`);
            setAdding(false);
          }}
        />
      ) : null}

      <Panel>
        <Table head={["Name", "Email", "Role", "Status", "Last sign-in", ""]}>
          {users.map((u) => {
            const self = u.id === me.id;
            return (
              <tr key={u.id} className="border-t border-border">
                <td className="p-3 font-medium">
                  {u.name} {self ? <Pill tone="info">You</Pill> : null}
                </td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <select
                    aria-label={`Role of ${u.email}`}
                    value={u.role}
                    disabled={self}
                    onChange={(e) =>
                      void run(
                        () => updateAdminUser(u.id, { role: e.target.value as AdminRole }),
                        "Role changed",
                      )
                    }
                    className="h-9 rounded-md border border-input bg-card px-2 text-sm"
                  >
                    {(Object.keys(ROLE_LABEL) as AdminRole[]).map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABEL[r]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3">
                  <Pill tone={u.isActive ? "good" : "muted"}>
                    {u.isActive ? "Active" : "Disabled"}
                  </Pill>
                </td>
                <td className="p-3 whitespace-nowrap text-muted-foreground">
                  {u.lastLoginAt
                    ? new Date(u.lastLoginAt).toLocaleString("en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "Never"}
                </td>
                <td className="p-3 whitespace-nowrap text-right">
                  {self ? null : (
                    <div className="flex justify-end gap-1">
                      <button type="button" onClick={() => resetPassword(u)} className={ACTION}>
                        Reset password
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          void run(
                            () => updateAdminUser(u.id, { isActive: !u.isActive }),
                            u.isActive
                              ? `${u.name} is disabled and signed out`
                              : `${u.name} can sign in again`,
                          )
                        }
                        className={ACTION}
                      >
                        {u.isActive ? "Disable" : "Enable"}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </Table>
      </Panel>
    </div>
  );
}

function NewUserForm({
  onSave,
  onCancel,
}: {
  onSave: (input: {
    email: string;
    name: string;
    role: AdminRole;
    password: string;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Panel className="mb-5 p-5">
      <form
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setBusy(true);
          await onSave({
            name: String(fd.get("name")),
            email: String(fd.get("email")),
            role: String(fd.get("role")) as AdminRole,
            password: String(fd.get("password")),
          });
          setBusy(false);
        }}
      >
        <Input name="name" label="Name" />
        <Input name="email" label="Email" type="email" />
        <div>
          <label htmlFor="new-role" className="mb-1 block text-sm font-medium">
            Role
          </label>
          <select
            id="new-role"
            name="role"
            defaultValue="staff"
            className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
          >
            {(Object.keys(ROLE_LABEL) as AdminRole[]).map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
        </div>
        <Input
          name="password"
          label="First password (min 10 characters)"
          type="password"
          minLength={10}
        />
        <div className="flex gap-2 sm:col-span-2">
          <button
            type="submit"
            disabled={busy}
            className="h-11 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Saving…" : "Create user"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-md border border-border px-5 text-sm font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    </Panel>
  );
}

function Input({
  name,
  label,
  type = "text",
  minLength,
}: {
  name: string;
  label: string;
  type?: string;
  minLength?: number;
}) {
  return (
    <div>
      <label htmlFor={`new-${name}`} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <input
        id={`new-${name}`}
        name={name}
        type={type}
        required
        minLength={minLength}
        autoComplete={type === "password" ? "new-password" : "off"}
        className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
      />
    </div>
  );
}

const ACTION = "rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-secondary";
