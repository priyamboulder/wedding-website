// ──────────────────────────────────────────────────────────────────────────
// Anonymous-token plumbing for the Budget tool.
//
// Anonymous plans are gated by a 32-byte random token stored in
// localStorage. The token never leaves the browser except as a parameter
// to the SECURITY DEFINER RPCs in migration 0022. Treat it as a bearer
// token for the underlying plan row — losing it loses access.
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

export function generateAnonymousToken(): string {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(TOKEN_BYTE_LENGTH);
    crypto.getRandomValues(bytes);
    return toHex(bytes);
  }
  // Fallback for environments without WebCrypto. Tokens minted here are
  // weaker — the budget tool only renders client-side, so this branch
  // should never run in practice.
  let out = "";
  for (let i = 0; i < TOKEN_BYTE_LENGTH * 2; i += 1) {
    out += Math.floor(Math.random() * 16).toString(16);
  }
  return out;
}

export function readAnonymousToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeAnonymousToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // Storage may be disabled (private browsing, quota) — fail open. The
    // user keeps planning; the plan just isn't persisted.
  }
}

export function clearAnonymousToken(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Same as writeAnonymousToken — best-effort.
  }
}

/** Gets the existing token or mints+stores a fresh one. */
export function ensureAnonymousToken(): string {
  const existing = readAnonymousToken();
  if (existing && existing.length >= 16) return existing;
  const fresh = generateAnonymousToken();
  writeAnonymousToken(fresh);
  return fresh;
}
