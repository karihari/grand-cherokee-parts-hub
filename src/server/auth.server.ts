import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";
import { getLang, tr } from "@/lib/i18n";

// The Admin signs in with ADMIN_PASSWORD. The session is a cookie holding an
// expiry time signed with SESSION_SECRET (HMAC-SHA256), so no session table is needed.

const COOKIE = "gc_admin";
const SESSION_DAYS = 7;

const encoder = new TextEncoder();

function secrets() {
  const password = process.env["ADMIN_PASSWORD"];
  const sessionSecret = process.env["SESSION_SECRET"];
  if (!password || !sessionSecret || sessionSecret.length < 32) return null;
  return { password, sessionSecret };
}

export function adminLoginConfigured() {
  return secrets() !== null;
}

async function hmac(key: string, value: string) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Compares two strings without returning early, so timing reveals nothing.
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function passwordMatches(input: string) {
  const s = secrets();
  if (!s) return false;
  // Hash both sides first so the comparison is over equal-length strings.
  const [a, b] = await Promise.all([
    hmac(s.sessionSecret, `pw:${input}`),
    hmac(s.sessionSecret, `pw:${s.password}`),
  ]);
  return safeEqual(a, b);
}

export async function startAdminSession() {
  const s = secrets();
  if (!s) throw new Error("Admin login is not configured");
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const sig = await hmac(s.sessionSecret, `admin:${expires}`);
  setCookie(COOKIE, `${expires}.${sig}`, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export function endAdminSession() {
  deleteCookie(COOKIE, { path: "/" });
}

export async function isAdmin() {
  const s = secrets();
  const token = getCookie(COOKIE);
  if (!s || !token) return false;
  const [expires, sig] = token.split(".");
  if (!expires || !sig || Number(expires) < Date.now()) return false;
  return safeEqual(sig, await hmac(s.sessionSecret, `admin:${expires}`));
}

export async function requireAdmin() {
  if (!(await isAdmin()))
    throw new Error(tr(getLang())("Вы не вошли как администратор", "Not signed in as Admin"));
}
