# Marigold Tools — Vendor Surfacing Layer

This module is the **single entry point** every Marigold Tool uses to surface
real vendors. The Budget calculator, Destination explorer, and any future
tool we ship all read from the same tables and call the same ranking
function.

> **One vendors table. One placement model. Every tool filters/sorts the
> same source.** If you find yourself reaching for a tool-specific vendor
> table, stop and rethink — extend the canonical layer instead.

## Files

| File | Purpose |
|---|---|
| `tools-queries.ts` | The data access layer Tools call. Typed, RLS-aware. |
| `../../types/vendors.ts` | Row shapes + argument types. |
| `../../supabase/migrations/0021_marigold_tools_vendor_layer.sql` | Schema + seed. |

The other files in this directory (`discovery-ranking.ts`, `taxonomy.ts`, etc.)
power the **couple-facing** vendor directory inside the authenticated app.
That surface predates the Tools hub and uses a richer, couple-specific shape
(shortlists, AI matching, roulette). Tools should NOT import from those
files — they belong to the directory experience, not to public Tool pages.

## Tables at a glance

```
vendors                         ←  one row per business (extended in 0021)
vendor_categories               ←  the 27 canonical categories, shared with Budget
vendor_category_assignments     ←  M2M: a vendor can serve multiple categories
vendor_placements               ←  granular sponsorship per (category|location|tier)
vendor_pricing_indicators       ←  rough "from $X" signaling per category
vendor_inquiries                ←  lead capture from tool surfaces
```

The richer `inquiries` table that already exists (migration 0009) is the
in-product **booking** flow used after a couple is logged in. The
`vendor_inquiries` table here is the lighter top-of-funnel lead capture
from public Tools — anonymous submissions are allowed.

## Placement tiers

A vendor's surface presence has **two dimensions**:

### 1. `vendors.placement_tier` (the badge on their card)

This is a vendor-level property — what you see on the row itself.

| Tier | What it means | When to use it |
|---|---|---|
| `standard` | Default. No badge. | Every vendor starts here. |
| `featured` | Marigold-curated highlight. Badge shown. | Editorial picks, launch partners, vendors we want to show off. |
| `sponsored` | Paid placement. Badge shown. | Vendor paid for elevated positioning. |

`placement_expires_at` lets paid slots auto-revert to `standard` when their
window ends. Cron (or a periodic job) should null out the tier when the
date passes — until then, the rendering layer should respect the timestamp
and treat an expired sponsored vendor as `standard`.

### 2. `vendor_placements` (where they appear)

The vendor-level tier doesn't say *where* the elevated treatment applies.
A photographer can be:

- Featured **globally** (shows up first in every relevant tool surface), or
- Sponsored only in **Mumbai** (only when the user filters that destination), or
- Sponsored only for the **luxury** tier (only when Budget tool says
  $100k+), or
- Sponsored only inside the **photography** category page.

Each of those is a separate `vendor_placements` row. A vendor can hold
multiple placements at once.

| `placement_type`        | Required field   | Triggers when |
|-------------------------|------------------|---|
| `global_featured`       | (none)           | Always — vendor surfaces ahead of unranked peers in any context. |
| `category_sponsored`    | `category_slug`  | Tool query passes that `categorySlug`. |
| `destination_sponsored` | `location_slug`  | Tool query passes that `locationSlug`. |
| `tier_sponsored`        | `tier`           | Tool query passes that `tier` (e.g. `luxury`). |

`starts_at` / `ends_at` define the deal window. The ranking function
ignores any placement outside that window, so paid slots stop showing up
the instant the deal expires — no cleanup job needed for ranking
correctness.

## Ranking — `get_ranked_vendors()`

One Postgres function. Every tool calls it. The buckets:

1. **Sponsored placement matching the exact context** (category + location + tier as passed)
2. **Global featured placement**
3. **Verified vendor** (`vendors.verified = true`)
4. **Everyone else**

Within a bucket the order is `random()` — **not** alphabetical, **not** by
rating. Random within bucket prevents a vendor from gaming the surface by
renaming themselves "AAA Photography" and ensures fair rotation across
unranked peers on every page load.

### Filter behavior

| Argument          | Type    | Behavior |
|-------------------|---------|---|
| `p_category_slug` | text    | If non-null, vendor must have an assignment in `vendor_category_assignments` for that slug. |
| `p_location_slug` | text    | If non-null, vendor must (a) have `travels_globally = true`, OR (b) include the slug in `destinations_served`, OR (c) have a slugified `home_base_city` that matches. |
| `p_tier`          | text    | If non-null, the slug must appear in `vendors.tier_match` (jsonb array). |
| `p_capacity`      | integer | If non-null, must fall inside `[capacity_min, capacity_max]`. NULL bounds are treated as wild — vendor with no capacity declared still matches. |
| `p_limit`         | integer | Result cap. Default 24. |

Any argument left `NULL` skips that filter entirely.

## How to call from a Tool

```ts
import { createAnonClient } from "@/lib/supabase/server-client";
import { getVendorsForCategory } from "@/lib/vendors/tools-queries";

export async function PhotographySurface() {
  const supabase = createAnonClient();
  const vendors = await getVendorsForCategory(supabase, {
    categorySlug: "photography",
    locationSlug: "mumbai",
    tier: "luxury",
    capacity: 250,
    limit: 12,
  });
  // vendors[0].rank_bucket === 1 means this vendor was elevated by an
  // active sponsored placement matching exactly this query context.
}
```

For the Budget tool's "vendors for this category" rail:

```ts
const venueOptions = await getVendorsForCategory(supabase, {
  categorySlug: "venue",
  locationSlug: weddingCity,
  tier: budgetTier,
  capacity: guestCount,
});
```

For the Destination explorer's "vendors who'll travel here":

```ts
const localTalent = await getVendorsForLocation(supabase, {
  locationSlug: "tulum",
});
```

## How to add a sponsored vendor

> All examples assume the vendor row already exists in `vendors`. Importing
> vendors from the legacy database is a separate migration.

### Sponsor a vendor inside one category

```sql
insert into vendor_placements (
  vendor_id, placement_type, category_slug,
  starts_at, ends_at, notes
) values (
  '<vendor-uuid>',
  'category_sponsored',
  'photography',
  now(),
  now() + interval '90 days',
  'Q2 2026 photography category sponsorship — $X/mo'
);
```

This vendor will rank in bucket 1 of `getVendorsForCategory({ categorySlug: "photography" })`.

### Sponsor inside one destination

```sql
insert into vendor_placements (
  vendor_id, placement_type, location_slug,
  starts_at, ends_at, notes
) values (
  '<vendor-uuid>',
  'destination_sponsored',
  'goa',
  now(),
  now() + interval '6 months',
  'Goa destination sponsor — H1 2026'
);
```

### Mark a vendor as globally featured (editorial, not paid)

```sql
update vendors
   set placement_tier = 'featured'
 where id = '<vendor-uuid>';

insert into vendor_placements (vendor_id, placement_type, notes)
values ('<vendor-uuid>', 'global_featured', 'Editorial featured — Marigold pick');
```

### Award the verified badge (no ranking boost beyond bucket 3)

```sql
update vendors set verified = true where id = '<vendor-uuid>';
```

### End a sponsorship early

Don't delete the row — set `active = false` so the deal history stays
audit-able:

```sql
update vendor_placements
   set active = false
 where id = '<placement-uuid>';
```

## Categories: where the seed list comes from

The 27 categories seeded in migration 0021 are the canonical Indian wedding
buckets the Budget tool allocates against. Adding a new category:

1. Add a row to `vendor_categories` (use a unique slug — slugs are the
   join key for placements and pricing indicators).
2. If the new category is per-event (mehndi/sangeet/ceremony/reception),
   set `scope = 'per_event'`.
3. If pricing scales with guest count (catering, hotel block, gifting),
   set `per_guest = true`.
4. The Budget tool reads the categories via `listVendorCategories()` —
   nothing else needs to change.

## What this layer does NOT do

- **Couple-side shortlisting.** That lives in `couple_shortlist` + the
  Zustand store and is intentionally separate — Tools are public, and we
  don't want anonymous browsing to write user state.
- **Booking conversations.** The transactional `inquiries` table from
  migration 0009 handles the post-auth couple-vendor message thread.
  `vendor_inquiries` here is just lead capture.
- **AI matching, roulette, or style scoring.** Those are couple-app
  features and live in the other files in this directory.
