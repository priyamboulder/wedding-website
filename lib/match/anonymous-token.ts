// ──────────────────────────────────────────────────────────────────────────
// Match Me — anonymous-token plumbing.
//
// We share the SAME token namespace as the Budget tool. If a user runs
// Match Me first and later opens the Budget builder (or vice versa), the
// builder reclaim and the match-result reclaim attach to the same auth
// user on signup. The storage key matches `lib/budget/anonymous-token.ts`
// on purpose.
// ──────────────────────────────────────────────────────────────────────────

const TOKEN_STORAGE_KEY = "marigold:budget:anon_token";
const TOKEN_BYTE_LENGTH = 24;

function toHex(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 1) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}

function generate(): string {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(TOKEN_BYTE_LENGTH);
    crypto.getRandomValues(bytes);
    return toHex(bytes);
  }
  let out = "";
  for (let i = 0; i < TOKEN_BYTE_LENGTH * 2; i += 1) {
    out += Math.floor(Math.random() * 16).toString(16);
  }
  return out;
}

export function ensureMatchToken(): string {
  if (typeof window === "undefined") return generate();
  try {
    const existing = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (existing && existing.length >= 16) return existing;
    const fresh = generate();
    window.localStorage.setItem(TOKEN_STORAGE_KEY, fresh);
    return fresh;
  } catch {
    return generate();
  }
}
