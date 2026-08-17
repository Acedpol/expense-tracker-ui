const TOKEN_KEY = "expense_tracker_token";

// Reference window.localStorage explicitly, not the bare global: Node 22+
// ships an experimental global `localStorage` that shadows jsdom's real
// implementation in tests and throws without a --localstorage-file flag.
export function getToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}
