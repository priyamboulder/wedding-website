// ── Supabase DB sync helpers ──────────────────────────────────────────────────
// Shared utilities used by all Zustand stores to sync data to/from Supabase.
// Strategy: localStorage is the primary fast state; Supabase is synced in the
// background (fire-and-forget writes) or loaded on login (reads).
// All helpers are no-ops when Supabase is unavailable (dev / no key).

// Security note:
// - db-sync.ts uses the BROWSER anon client (supabaseBrowser) — correct for client-side writes
// - API routes should use createUserClient(token) from lib/supabase/server-client.ts for RLS-enforced reads
// - Only use lib/supabase/client.ts (service role) for admin operations that legitimately bypass RLS

export async function getSupabaseBrowser() {
  if (typeof window === "undefined") return null;
  try {
    const { supabaseBrowser } = await import("@/lib/supabase/browser-client");
    return supabaseBrowser;
  } catch {
    return null;
  }
}

export function getCurrentCoupleId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("ananya-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.user?.id ?? null;
  } catch {
    return null;
  }
}

// Upsert a single row. Silently swallows errors.
export async function dbUpsert(table: string, row: Record<string, unknown>) {
  const sb = await getSupabaseBrowser();
  if (!sb) return;
  try { await sb.from(table).upsert(row); } catch { /* no-op */ }
}

// Delete rows matching a filter. Silently swallows errors.
export async function dbDelete(
  table: string,
  filters: Record<string, unknown>,
) {
  const sb = await getSupabaseBrowser();
  if (!sb) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = sb.from(table).delete();
    for (const [col, val] of Object.entries(filters)) {
      q = q.eq(col, val);
    }
    await q;
  } catch { /* no-op */ }
}

// Load all rows for a couple from a table.
export async function dbLoadAll(
  table: string,
  coupleId: string,
): Promise<Record<string, unknown>[]> {
  const sb = await getSupabaseBrowser();
  if (!sb) return [];
  try {
    const { data } = await sb
      .from(table)
      .select("*")
      .eq("couple_id", coupleId);
    return (data ?? []) as Record<string, unknown>[];
  } catch {
    return [];
  }
}

// Upsert many rows in one call (Supabase upsert accepts arrays).
export async function dbUpsertMany(
  table: string,
  rows: Record<string, unknown>[],
) {
  if (rows.length === 0) return;
  const sb = await getSupabaseBrowser();
  if (!sb) return;
  try { await sb.from(table).upsert(rows); } catch { /* no-op */ }
}

// Replace all rows for a couple in a table (delete then insert).
export async function dbReplaceAll(
  table: string,
  coupleId: string,
  rows: Record<string, unknown>[],
) {
  const sb = await getSupabaseBrowser();
  if (!sb) return;
  try { await sb.from(table).delete().eq("couple_id", coupleId); } catch { /* no-op */ }
  if (rows.length > 0) {
    try { await sb.from(table).insert(rows); } catch { /* no-op */ }
  }
}

// Load a single JSONB blob row keyed by couple_id.
// Used by all stores that use the `couple_id PK, data jsonb` pattern.
export async function dbLoadBlob<T extends object>(
  table: string,
  coupleId: string,
): Promise<T | null> {
  const sb = await getSupabaseBrowser();
  if (!sb) return null;
  try {
    const { data } = await sb
      .from(table)
      .select("data")
      .eq("couple_id", coupleId)
      .single();
    if (!data?.data) return null;
    return data.data as T;
  } catch {
    return null;
  }
}

// Save a single JSONB blob row keyed by couple_id.
export async function dbSaveBlob(
  table: string,
  coupleId: string,
  payload: object,
) {
  const sb = await getSupabaseBrowser();
  if (!sb) return;
  try {
    await sb.from(table).upsert({ couple_id: coupleId, data: payload });
  } catch { /* no-op */ }
}

// Load the `data` column from a `couple_id PK, data jsonb` table.
// Returns null if no row exists or on error.
export async function dbLoadData<T extends object>(
  table: string,
  coupleId: string,
): Promise<T | null> {
  const sb = await getSupabaseBrowser();
  if (!sb) return null;
  try {
    const { data } = await sb
      .from(table)
      .select("data")
      .eq("couple_id", coupleId)
      .maybeSingle();
    if (!data?.data) return null;
    return data.data as T;
  } catch {
    return null;
  }
}

// Load all columns from a `couple_id PK` table (for stores with named columns).
export async function dbLoadRow<T extends object>(
  table: string,
  coupleId: string,
): Promise<T | null> {
  const sb = await getSupabaseBrowser();
  if (!sb) return null;
  try {
    const { data } = await sb
      .from(table)
      .select("*")
      .eq("couple_id", coupleId)
      .maybeSingle();
    return (data ?? null) as T | null;
  } catch {
    return null;
  }
}
