/**
 * expense-api's custom exception handlers return {"error": "..."} for
 * HTTPException/validation failures at runtime — but FastAPI's
 * auto-generated OpenAPI schema still documents the framework default
 * shape ({"detail": ...}), since custom handlers aren't reflected in
 * the spec. openapi-fetch's generated error type follows the (stale)
 * schema, so we can't trust it here — read the real runtime shape
 * defensively instead of trusting the type.
 */
export function extractErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "error" in error) {
    const value = (error as Record<string, unknown>).error;
    if (typeof value === "string") return value;
  }
  return fallback;
}
