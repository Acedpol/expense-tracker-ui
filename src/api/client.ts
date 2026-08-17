import createClient from "openapi-fetch";
import type { paths } from "./schema";
import { getToken } from "../lib/token";

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

// openapi-fetch resolves `fetch: globalThis.fetch` once, as a default
// parameter, at createClient() call time. In tests that means it captures
// the real fetch before MSW's server.listen() (in a later beforeAll) gets a
// chance to patch globalThis.fetch — so mocks silently never intercept.
// Wrapping it forces a fresh globalThis.fetch lookup on every request.
export const apiClient = createClient<paths>({
  baseUrl,
  fetch: (...args: Parameters<typeof fetch>) => globalThis.fetch(...args),
});

// AuthProvider registers its logout() here so a 401 from any call (token
// expired or revoked mid-session) clears the stale token and reactively
// redirects to /login via ProtectedRoute — instead of every page having to
// handle "session died while I was looking at it" individually.
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void): void {
  unauthorizedHandler = handler;
}

apiClient.use({
  onRequest({ request }) {
    const token = getToken();
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  },
  onResponse({ response }) {
    if (response.status === 401) {
      unauthorizedHandler?.();
    }
    return response;
  },
});
