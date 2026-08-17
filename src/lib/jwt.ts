interface JwtPayload {
  sub?: string;
  exp?: number;
}

/**
 * Decodes the JWT payload for display purposes only (e.g. showing the
 * logged-in email). Never trust this for authorization — the backend
 * is the only party that verifies the signature.
 */
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split(".");
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}
