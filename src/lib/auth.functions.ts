import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  adminLoginConfigured,
  endAdminSession,
  isAdmin,
  passwordMatches,
  startAdminSession,
} from "@/server/auth.server";
import { getLang, tr } from "@/lib/i18n";

export const getAdminSession = createServerFn({ method: "GET" }).handler(async () => ({
  isAdmin: await isAdmin(),
  configured: adminLoginConfigured(),
}));

export const adminLogin = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ password: z.string().min(1).max(200) }).parse(data))
  .handler(async ({ data }) => {
    if (!adminLoginConfigured()) {
      return {
        ok: false as const,
        error: tr(getLang())(
          "Вход в админку не настроен на сервере.",
          "Admin login is not configured on the server.",
        ),
      };
    }
    if (!(await passwordMatches(data.password))) {
      // Slow down password guessing.
      await new Promise((r) => setTimeout(r, 800));
      return { ok: false as const, error: tr(getLang())("Неверный пароль.", "Wrong password.") };
    }
    await startAdminSession();
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  endAdminSession();
  return { ok: true as const };
});
