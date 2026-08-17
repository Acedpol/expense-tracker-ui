// Must run before anything else in setupFiles (as its own file, so its
// static imports can't be reordered ahead of this by the ES module
// hoisting rules — see setup.ts for why that matters).
//
// Node 22+ ships an experimental global `localStorage` backed by a
// --localstorage-file SQLite file. It shadows jsdom's real implementation
// (Vitest's global population step skips keys that already exist on
// `global`), and worse: MSW's CookieStore constructs itself against
// `localStorage` the moment `setupServer()` runs, so under CI's parallel
// test-file workers multiple processes hit the same SQLite file at once
// and throw "database is locked". A plain in-memory polyfill, scoped per
// worker process, sidesteps both problems — no flag, no shared file.
class MemoryStorage implements Storage {
  #store = new Map<string, string>();

  get length(): number {
    return this.#store.size;
  }

  clear(): void {
    this.#store.clear();
  }

  getItem(key: string): string | null {
    return this.#store.has(key) ? (this.#store.get(key) ?? null) : null;
  }

  key(index: number): string | null {
    return Array.from(this.#store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.#store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.#store.set(key, String(value));
  }
}

Object.defineProperty(globalThis, "localStorage", {
  value: new MemoryStorage(),
  writable: true,
  configurable: true,
});
