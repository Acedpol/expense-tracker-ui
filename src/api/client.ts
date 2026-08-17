import createClient from "openapi-fetch";
import type { paths } from "./schema";
import { getToken } from "../lib/token";

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export const apiClient = createClient<paths>({ baseUrl });

apiClient.use({
  onRequest({ request }) {
    const token = getToken();
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  },
});
