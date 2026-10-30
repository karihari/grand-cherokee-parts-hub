// The one place the shop talks to the GC Parts API (gc-parts-api).
// Auth works like the LPMS frontend (cookies + refresh-and-retry), with a few fixes:
// - tokens live in httpOnly cookies set by the API; this code never sees them;
// - only one refresh runs at a time, other failed requests wait for it and retry;
// - it refreshes only when the access token is missing or expired, never on a wrong password;
// - "another tab refreshed just now" (409) is treated as success.

export const API_URL = (import.meta.env["VITE_API_URL"] ?? "http://localhost:4000/api").replace(
  /\/$/,
  "",
);

export type FieldError = { field: string; errors: string[] };

export class ApiError extends Error {
  constructor(
    readonly status: number,
    // Stable error code from the API, e.g. "ORDER_INSUFFICIENT_STOCK".
    readonly code: string,
    readonly details: Record<string, unknown> = {},
    readonly fieldErrors: FieldError[] = [],
  ) {
    super(code);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  // Sent as multipart/form-data instead of JSON (image upload).
  form?: FormData;
  query?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
};

// Codes that mean "no usable access token" — worth one refresh attempt.
const REFRESHABLE = new Set(["AUTH_ACCESS_TOKEN_EXPIRED", "AUTH_UNAUTHORIZED"]);

let refreshing: Promise<boolean> | null = null;
let onSessionLost: (() => void) | null = null;

// The admin layout registers this to send the user to the sign-in page.
export function setSessionLostHandler(handler: (() => void) | null) {
  onSessionLost = handler;
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(API_URL + path);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }
  return url.toString();
}

async function send(path: string, opts: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = { accept: "application/json" };
  let body: BodyInit | null = null;
  if (opts.form) {
    body = opts.form;
  } else if (opts.body !== undefined) {
    headers["content-type"] = "application/json";
    body = JSON.stringify(opts.body);
  }
  return fetch(buildUrl(path, opts.query), {
    method: opts.method ?? "GET",
    headers,
    body,
    // Sends and stores the API's auth cookies.
    credentials: "include",
    signal: opts.signal ?? null,
  });
}

async function toError(res: Response): Promise<ApiError> {
  let payload: Record<string, unknown> = {};
  try {
    payload = (await res.json()) as Record<string, unknown>;
  } catch {
    // Not JSON (proxy error page, network issue).
  }
  const { message, statusCode: _s, error: kind, ...details } = payload;
  if (kind === "DtoValidationError" && Array.isArray(message)) {
    return new ApiError(res.status, "VALIDATION_ERROR", details, message as FieldError[]);
  }
  return new ApiError(
    res.status,
    typeof message === "string" ? message : `HTTP_${res.status}`,
    details,
  );
}

// Single-flight: ten requests failing at once trigger one refresh, not ten.
function refreshSession(): Promise<boolean> {
  refreshing ??= (async () => {
    try {
      const res = await send("/auth/refresh", { method: "POST" });
      // 409: another tab refreshed a moment ago and the browser already has its new cookies.
      return res.ok || res.status === 409;
    } catch {
      return false;
    } finally {
      // Let the next expiry start a fresh refresh.
      setTimeout(() => (refreshing = null), 0);
    }
  })();
  return refreshing;
}

export async function api<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  let res = await send(path, opts);

  const isBrowser = typeof window !== "undefined";
  const isAuthRoute = path.startsWith("/auth/login") || path.startsWith("/auth/refresh");
  if (res.status === 401 && isBrowser && !isAuthRoute) {
    const error = await toError(res.clone());
    if (REFRESHABLE.has(error.code)) {
      if (await refreshSession()) {
        res = await send(path, opts);
      }
      if (res.status === 401) onSessionLost?.();
    }
  }

  if (!res.ok) throw await toError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// Images saved as "/images/<id>" are served by the API.
export function apiImageUrl(path: string) {
  return path.startsWith("/images/") ? `${API_URL}${path}` : path;
}

// The reverse, for saving: the API stores "/images/<id>", not the full URL.
export function storedImagePath(url: string) {
  return url.startsWith(`${API_URL}/images/`) ? url.slice(API_URL.length) : url;
}
