import createClient from "openapi-fetch";
import type { paths } from "./schema";
import { getToken } from "../lib/token";

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export const apiClient = createClient<paths>({ baseUrl });

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
