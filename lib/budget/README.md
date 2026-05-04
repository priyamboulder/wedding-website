# Marigold Tools — Budget data access layer

Schema lives in
[supabase/migrations/0022_marigold_budget_tools_schema.sql](../../supabase/migrations/0022_marigold_budget_tools_schema.sql).
Row types live in [`types/budget.ts`](../../types/budget.ts).

> **Vendor recommendations come from the unified vendors table.** The Budget
> tool's "tiers" are price templates that calculate cost — not a separate
> vendor inventory. To surface real vendors for a given category/tier/
> location/capacity, call `getVendorsForCategory` from
> `@/lib/vendors/tools-queries`.

## Files

| File | Purpose |
|---|---|
| `index.ts` | Re-exports for ergonomic imports. |
| `locations.ts` | `listBudgetLocations`, `getBudgetLocation` |
| `cultures.ts` | `listBudgetCultures`, `getBudgetCulture`, `getCultureEvents` |
| `tiers.ts` | `listBudgetVendorTiers`, `getTiersForCategory` |
| `addons.ts` | `listBudgetAddons`, `listBudgetAddonsByCategory` |
| `plans.ts` | Plan CRUD — authed table-level + anon RPC-backed. |
| `anonymous-token.ts` | Token mint/store/clear for anonymous plans. |

## Anonymous vs authed plans

A `budget_user_plans` row has either a `user_id` (authed) or an
`anonymous_token` (anon) — never both. The token is a 24-byte hex string
stored in `localStorage` under `marigold:budget:anon_token`.

### Authed flow

```ts
import { createAuthedPlan, getUserPlan } from "@/lib/budget";

const plan = (await getUserPlan(supabase, userId))
  ?? (await createAuthedPlan(supabase, { userId }));
```

RLS gates reads/writes by `user_id = auth.uid()`.

### Anonymous flow

```ts
import {
  ensureAnonymousToken,
  getAnonymousPlan,
  createAnonymousPlan,
} from "@/lib/budget";

const token = ensureAnonymousToken();             // mints + persists to localStorage
const plan  = (await getAnonymousPlan(supabase, token))
  ?? (await createAnonymousPlan(supabase, { anonymousToken: token }));
```

These RPCs are `SECURITY DEFINER` so they bypass RLS and verify the token
server-side. Direct table access for anon users is intentionally blocked.

### Reclaim on signup

Right after a Supabase `signUp` / `signInWithOTP` resolves with a session,
call `reclaimAnonymousPlan` to attach the in-flight plan to the new user
and drop the localStorage token:

```ts
import { reclaimAnonymousPlan, readAnonymousToken, clearAnonymousToken } from "@/lib/budget";

const token = readAnonymousToken();
if (token) {
  try {
    await reclaimAnonymousPlan(authedSupabase, token);
  } finally {
    clearAnonymousToken();
  }
}
```

If the user already has an authed plan, the reclaim still succeeds and
they end up with two plans — pick the most recent in the UI, or merge.
This module deliberately does not auto-merge: the user's existing plan
might be the one they want to keep.
