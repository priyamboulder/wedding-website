# Ananya Full-Platform Field-Level Audit

**Date:** 2026-04-20
**Scope:** Complete codebase — types, stores, seeds, forms, API routes, popout templates, all four portals (couple, vendor, planner, marketplace).
**Persistence posture:** localStorage-only via Zustand (per project memory — no Supabase yet).

---

## 0. Executive Summary

The platform is a **local-first, type-heavy Zustand app** with ~14 primary entities × 4 portals. Core issues surfaced by this audit:

1. **Duplicate/fragmented entity schemas** — vendors have 3 incompatible shapes (couple-app Vendor, marketing Vendor, vendor-portal VENDOR); reviews split into `CoupleReview` vs portal `Review`; inquiries split into `InquiryRecord` + `Inquiry` (inquiries-store) + portal seed `Inquiry` with three different field sets.
2. **Broken lifecycle chains** — inquiries are written but never delivered; vendor inbox is a stub; comments are in-memory only; vendor-workspace permissions are defined but never enforced.
3. **No planner entity** — planners are hardcoded fixtures (`Urvashi` etc.) — not a typed model, no profile, no assignment flow.
4. **Dead fields** at scale — `partnerName`, `location`, `enriched_at`, `helpful_count`, `passport_valid`, `capacity_cocktail`, `must_capture`, coverage assignment state, many more (see §7).
5. **Popout templates are design toys, not forms** — color_palette, hashtag_picker, monogram_designer, vendor_comparison hold local state that evaporates on close.
6. **Cascade is one-directional** — aesthetic DNA → décor/stationery palette never propagates; guest count changes in events don't auto-resync catering/stationery.
7. **Hardcoded couple identity** — `{ person1: "Priya", person2: "Arjun" }` duplicated across [app/checklist/page.tsx](app/checklist/page.tsx), [app/(wedding)/[weddingId]/shopping/page.tsx](app/(wedding)/[weddingId]/shopping/page.tsx), workspace role fixtures. Real `WeddingProfile.partnerName` is captured in onboarding but never read.

---

## 1. Entity Index

| Entity | Type File | Store | Seed | Portals |
|---|---|---|---|---|
| Vendor | [types/vendor.ts](types/vendor.ts), [types/vendor-profile.ts](types/vendor-profile.ts) | [stores/vendors-store.ts](stores/vendors-store.ts) | [lib/vendor-seed.ts](lib/vendor-seed.ts), [lib/vendor-profile-seed.ts](lib/vendor-profile-seed.ts) | All |
| Vendor Package | [lib/vendor-portal/packages-seed.ts](lib/vendor-portal/packages-seed.ts) | [stores/vendor-packages-store.ts](stores/vendor-packages-store.ts) | Aurora-only | Vendor portal, marketplace |
| Review | [types/vendor-profile.ts](types/vendor-profile.ts) (CoupleReview); [lib/vendor-portal/seed.ts](lib/vendor-portal/seed.ts) (Review) | [stores/vendor-reviews-store.ts](stores/vendor-reviews-store.ts) | Both | Couple, vendor |
| VendorWorkspace | [types/vendor-workspace.ts](types/vendor-workspace.ts) | [stores/vendor-workspace-store.ts](stores/vendor-workspace-store.ts) | [lib/vendors/workspace-seed.ts](lib/vendors/workspace-seed.ts) | Couple only (vendor-side unwired) |
| Inquiry | [types/vendor-profile.ts](types/vendor-profile.ts) (InquiryRecord); [stores/inquiries-store.ts](stores/inquiries-store.ts); [lib/vendor-portal/seed.ts](lib/vendor-portal/seed.ts) | vendors-store + inquiries-store | Portal seed | Fragmented |
| Couple / User | [stores/auth-store.ts](stores/auth-store.ts) | [stores/auth-store.ts](stores/auth-store.ts) | Hardcoded | All |
| Planner | ❌ None | ❌ None | Hardcoded fixtures | N/A |
| Venue | [types/venue.ts](types/venue.ts) | [stores/venue-store.ts](stores/venue-store.ts) | [lib/venue-seed.ts](lib/venue-seed.ts) | Couple, venue-portal |
| Guests | ❌ No type | [app/guests/](app/guests/) | — | Couple |
| Events | [types/events.ts](types/events.ts) | [stores/events-store.ts](stores/events-store.ts) | [lib/events-seed.ts](lib/events-seed.ts) | Couple |
| Checklist / Tasks | [types/checklist.ts](types/checklist.ts) | [stores/checklist-store.ts](stores/checklist-store.ts) | [lib/checklist-seed.ts](lib/checklist-seed.ts) | Couple |
| Documents | [types/documents.ts](types/documents.ts) | [stores/documents-store.ts](stores/documents-store.ts) | [lib/documents-seed.ts](lib/documents-seed.ts) | Couple |
| Finance | [types/finance.ts](types/finance.ts) | [stores/finance-store.ts](stores/finance-store.ts) | [lib/finance-seed.ts](lib/finance-seed.ts) | Couple |
| Journal | [types/journal.ts](types/journal.ts), [types/journal-entries.ts](types/journal-entries.ts), [types/journal-links.ts](types/journal-links.ts) | [stores/journal-entries-store.ts](stores/journal-entries-store.ts), [stores/article-links-store.ts](stores/article-links-store.ts) | Partial | Couple |
| Files / Uploads | [types/files.ts](types/files.ts) | [stores/files-store.ts](stores/files-store.ts), [stores/uploads-store.ts](stores/uploads-store.ts) | — | All |
| Quiz | [types/quiz.ts](types/quiz.ts) | [stores/quiz-store.ts](stores/quiz-store.ts) | [lib/quiz/schemas/](lib/quiz/schemas/) | Couple |
| Aesthetic / Vision | [types/aesthetic.ts](types/aesthetic.ts) | [stores/aesthetic-store.ts](stores/aesthetic-store.ts), [stores/vision-store.ts](stores/vision-store.ts) | [lib/aesthetic-seed.ts](lib/aesthetic-seed.ts) | Couple |
| Décor | [types/decor.ts](types/decor.ts) | [stores/decor-store.ts](stores/decor-store.ts) | quiz-seeded | Couple |
| Music (×5 stores) | [types/music.ts](types/music.ts) | [stores/music-store.ts](stores/music-store.ts), music-{schedule,soundscape,sangeet,tech}-store | [lib/music*-seed.ts](lib/) | Couple, vendor |
| Monogram / Logo / Brand | [types/monogram.ts](types/monogram.ts), [types/logo.ts](types/logo.ts) | [stores/monogram-overrides-store.ts](stores/monogram-overrides-store.ts), [stores/brand-overrides-store.ts](stores/brand-overrides-store.ts) | Hardcoded templates | Couple |
| Stationery | [types/stationery.ts](types/stationery.ts) | [stores/stationery-store.ts](stores/stationery-store.ts) | [lib/stationery-seed.ts](lib/stationery-seed.ts) | Couple, marketplace |
| Wedding Site | [types/wedding-site.ts](types/wedding-site.ts) | (in vendor-workspace-store) | [lib/wedding-site-seed.ts](lib/wedding-site-seed.ts) | Couple |
| Recommendations | [types/recommendations.ts](types/recommendations.ts) | [stores/recommendations-store.ts](stores/recommendations-store.ts) | API | Couple |
| Catering | [types/catering.ts](types/catering.ts) | [stores/catering-store.ts](stores/catering-store.ts) | [lib/catering-seed.ts](lib/catering-seed.ts) | Couple, vendor |
| Photography | [types/photography.ts](types/photography.ts) | [stores/photography-store.ts](stores/photography-store.ts), hmua-store | [lib/photography-seed.ts](lib/photography-seed.ts) | Couple, vendor |
| Videography | [types/videography.ts](types/videography.ts) | [stores/videography-store.ts](stores/videography-store.ts) | [lib/videography-seed.ts](lib/videography-seed.ts) | Couple, vendor |
| Mehndi | [types/mehndi.ts](types/mehndi.ts) | [stores/mehndi-store.ts](stores/mehndi-store.ts) | — | Couple, vendor |
| Pandit | [types/pandit.ts](types/pandit.ts) | [stores/pandit-store.ts](stores/pandit-store.ts) | [lib/pandit-seed.ts](lib/pandit-seed.ts) | Couple, vendor |
| Comments | [types/popout-infrastructure.ts](types/popout-infrastructure.ts) | [stores/comments-store.ts](stores/comments-store.ts) (in-memory!) | — | All |
| Cart | — | [stores/cart-store.ts](stores/cart-store.ts) | — | Couple, marketplace |

---

## 2. Vendors — Field-Level Map

### 2.1 Type Definitions

**Canonical `Vendor` — [types/vendor.ts:66-92](types/vendor.ts#L66):**

| Field | Type | Tier | Notes |
|---|---|---|---|
| `id` | string | All | PK |
| `name` | string | All | — |
| `category` | `VendorCategory` (8 values) | All | photography, hmua, decor_florals, catering, entertainment, wardrobe, stationery, pandit_ceremony |
| `location` | `string \| null` | All | — |
| `price_range` | `string \| null` | All | Display-only string "₹1.2L – ₹2.5L" |
| `style_tags` | `string[]` | All | — |
| `rating` / `review_count` | `number \| null` / `number` | All | Aggregate |
| `images` | `VendorImage[]` | All | **Always empty in seeds; no upload UI** |
| `bio` / `contact` / `turnaround` | | All | `contact = {email, phone, website, instagram}` |
| `enriched_at` | `string \| null` | All | **Dead field — never read** |
| `created_at` | ISO string | All | — |
| `tier` | `"free" \| "select"` | All | Gates premium card layout |
| `is_verified` | boolean | Select | Rendered only if tier===select |
| `travel_level` | 4-value enum | All | local/regional/nationwide/destination |

**`VendorProfile` (extended) — [types/vendor-profile.ts:161](types/vendor-profile.ts#L161):** adds `extras`, `portfolio`, `weddings`, `planners`, `venues`, `couple_reviews`, `planner_endorsements`.

**`VendorProfileExtras` divergence:** `travel_radius` here has **5 values** (adds `worldwide`), vs Vendor's 4. `response_time_hours` (number) duplicates `avg_response_time` (string).

**Marketing `Vendor` — [lib/marketing/data.ts:216-249](lib/marketing/data.ts#L216):** Entirely **parallel schema**. Uses `slug`, `bg`/`fg` hex colors, `priceBand` enum (`$`/`$$`/`$$$`/`$$$$`), `yearsActive`, `teamSize`, `gallery[]`, `packages[]`, `reviews[]` — none of which convert cleanly to `/types/vendor.ts`.

**Vendor-portal `VENDOR` — [lib/vendor-portal/seed.ts](lib/vendor-portal/seed.ts):** Single hardcoded Aurora Studios record (`businessName`, `ownerName`, `profileCompleteness`, `responseRate`, `profileViews`, `inquiriesLastWeek`). Not a list; not typed.

### 2.2 Write Points

| File | Action | Fields Touched |
|---|---|---|
| [stores/vendors-store.ts:105](stores/vendors-store.ts#L105) `addVendors` / `updateVendor` | bulk import / patch | All |
| [stores/vendors-store.ts:185-221](stores/vendors-store.ts#L185) `addCustomVendor` | manual add | name, category, location, price_range, style_tags (empty), images (empty), bio, contact, turnaround, `enriched_at`, created_at, tier, is_verified, travel_level |
| [components/vendors/ExcelImportModal.tsx](components/vendors/ExcelImportModal.tsx) | CSV upload | All from parsed row |
| [components/vendors/AddVendorModal.tsx](components/vendors/AddVendorModal.tsx) | form submit | name, category, location, price_range, notes |
| Vendor portal profile page [app/vendor/profile/page.tsx](app/vendor/profile/page.tsx) | **local form state** | Does **not** write to any store — state lost on navigation |

### 2.3 Read Points

| File | Fields Displayed |
|---|---|
| [components/vendors/VendorCard.tsx](components/vendors/VendorCard.tsx) | images[0], name, price_range, rating, review_count, tier, is_verified, travel_level, category |
| [components/vendors/VendorTable.tsx](components/vendors/VendorTable.tsx) | All filterable |
| [components/vendors/VendorProfilePanel.tsx](components/vendors/VendorProfilePanel.tsx) | All Vendor.* + VendorProfile.* (portfolio, weddings, planners, venues, reviews, extras) |
| [components/vendors/VendorDrawer.tsx](components/vendors/VendorDrawer.tsx) | Base Vendor + ShortlistEntry + TaskVendorLink |
| [app/marketplace/page.tsx](app/marketplace/page.tsx) | Marketing-schema vendors (separate seed) |
| [app/marketplace/[slug]/page.tsx](app/marketplace/[slug]/page.tsx) | Full marketing Vendor |
| [app/vendor/page.tsx](app/vendor/page.tsx) | Hardcoded `VENDOR` seed KPIs |

### 2.4 Mismatches

| Issue | Severity | Evidence |
|---|---|---|
| Three parallel vendor schemas (Vendor / marketing Vendor / portal VENDOR) | 🔴 Critical | `/types/vendor.ts` vs `/lib/marketing/data.ts:216` vs `/lib/vendor-portal/seed.ts` |
| `travel_level` (4 values) vs `travel_radius` (5 values) | 🟡 Medium | Can't render `worldwide` on Vendor card |
| Price: string vs tagged union (`VendorPackage.priceDisplay`) vs `priceBand` "$"–"$$$$" | 🟡 Medium | No conversion utilities anywhere |
| `Vendor.images` never populated by any write path; always `[]` | 🔴 Critical | Placeholder on all cards |
| `enriched_at` defined + written in seed, **never read** | 🟢 Low | Dead field |
| `VendorProfileExtras.response_time_hours` / `avg_response_time` duplicates | 🟢 Low | Only one is displayed |
| `VendorProfileExtras.passport_valid`, `destination_booking_lead_months` never displayed | 🟢 Low | Dead |
| Vendor-portal profile page state not persisted | 🔴 Critical | Vendor can "edit" but changes evaporate |
| Planner recruitment page (`/for-vendors`) uses marketing data, but vendor claim flow doesn't map to `/types/vendor.ts` | 🟡 Medium | No path from marketing → couple-app record |

---

## 3. Vendor Packages

### 3.1 Definition — [lib/vendor-portal/packages-seed.ts:41-55](lib/vendor-portal/packages-seed.ts#L41)

Fields: `id`, `name`, `description`, `priceDisplay` (tagged union: exact/starting-from/range/contact), `currency`, `eventCategories[]`, `leadTime`, `capacityNotes`, `featured`, `order`, `seasonal?`, `selectionsCount`, `inquiriesCount`.

### 3.2 Write Points — [stores/vendor-packages-store.ts:53-96](stores/vendor-packages-store.ts#L53)

`addPackage`, `updatePackage`, `deletePackage`, `toggleFeatured`, `movePackage` — all from [components/vendor-portal/PackageEditor.tsx](components/vendor-portal/PackageEditor.tsx). Couple-side never writes.

### 3.3 Read Points

| File | Read |
|---|---|
| [app/vendor/services/page.tsx](app/vendor/services/page.tsx) | All fields |
| [app/marketplace/[slug]/page.tsx](app/marketplace/[slug]/page.tsx) | **Marketing VendorPackage** — different type |

### 3.4 Mismatches

- Packages seed covers **only Aurora Studios**. No other vendor has packages.
- Marketplace uses its own `VendorPackage` shape (marketing data.ts). No conversion.
- `selectionsCount` / `inquiriesCount` incremented by nothing — always seed values.
- Cart [stores/cart-store.ts](stores/cart-store.ts) holds package IDs but **no write path increments a package's counters**.

---

## 4. Reviews

### 4.1 Two Incompatible Shapes

| Field | `CoupleReview` [types/vendor-profile.ts:89](types/vendor-profile.ts#L89) | Vendor-portal `Review` [lib/vendor-portal/seed.ts:450](lib/vendor-portal/seed.ts#L450) |
|---|---|---|
| rating, body | ✅ | ✅ |
| couple name | `couple_names` | `coupleName` |
| date | `date` (ISO) | `postedAt` (relative: "2 weeks ago" ⚠️) |
| venue | `venue_name` | — |
| verified / helpful_count | ✅ | — |
| is_destination / destination_location | ✅ | — |
| title | — | ✅ |
| response | — | ✅ (vendor reply) |
| featured | — | ✅ |
| eventType / weddingDate | — | ✅ |

### 4.2 Lifecycle Trace

| Stage | State |
|---|---|
| Create (couple leaves review) | ❌ **No UI exists.** Both review arrays are seed-only. |
| Vendor responds | ✅ [stores/vendor-reviews-store.ts:35](stores/vendor-reviews-store.ts#L35) `setResponse` |
| Couple sees vendor response | ❌ `CoupleReview` has no `response` field; panel doesn't render it |
| Couple-side read | ✅ [components/vendors/VendorProfilePanel.tsx](components/vendors/VendorProfilePanel.tsx) reads `profile.couple_reviews` |
| Vendor-side read | ✅ [app/vendor/reviews/page.tsx](app/vendor/reviews/page.tsx) reads portal reviews |
| Review requests | ✅ CRUD in portal — but **no link** between ReviewRequest and the resulting Review |

### 4.3 Mismatches

- Review shapes **cannot merge**. Vendor replies are invisible to couples; destination/helpful_count invisible to vendors.
- `CoupleReview.helpful_count` stored, never displayed.
- `CoupleReview.is_destination` / `destination_location` never filtered or highlighted.
- No reviewer-identity verification (both sides free-text).

---

## 5. Vendor Workspaces (couple→vendor scoped config)

### 5.1 Definition — [types/vendor-workspace.ts:224-238](types/vendor-workspace.ts#L224)

Fields: id, vendor_id, wedding_id, discipline (9-value enum), created_at, updated_at, last_vendor_activity_at, invite_status ("not_invited"|"invited"|"active"|"revoked"), **`content`** (discriminated union per discipline), **`permissions`** (5 axes), invitation, activity[].

**Discipline ≠ Category mismatch:** `VendorCategory` (8 values) includes `decor_florals`; `WorkspaceDiscipline` (9 values) uses `florals` and adds `mehndi`. Cross-lookup requires a mapping that doesn't exist.

### 5.2 Permissions Matrix (defined but NOT ENFORCED)

| Axis | Options | Enforcement |
|---|---|---|
| guests | full_contact / names_and_dietary / counts_only / none | ❌ |
| other_vendors | all / schedule_only / none | ❌ |
| budget | their_line_item / full / none | ❌ |
| run_of_show | their_entries / their_plus_adjacent / full | ❌ |
| communications | direct_with_couple / couple_and_planner / planner_only | ❌ |

**No vendor-side UI exists that reads `permissions` before rendering.** The type is vestigial.

### 5.3 Write Points — [stores/vendor-workspace-store.ts:140-361](stores/vendor-workspace-store.ts#L140)

`createWorkspace`, `updateContent`, `updatePermissions`, `setDiscipline`, `sendInvitation`, `resendInvitation`, `revokeInvitation`, `markClaimed`, `logActivity`.

All called from [components/vendors/workspace/*.tsx](components/vendors/workspace/). All couple-side only.

### 5.4 Read Points

- [components/vendors/workspace/WorkspaceTab.tsx](components/vendors/workspace/WorkspaceTab.tsx)
- [components/vendors/workspace/PermissionsPanel.tsx](components/vendors/workspace/PermissionsPanel.tsx)
- [components/vendors/workspace/InvitationPanel.tsx](components/vendors/workspace/InvitationPanel.tsx)
- [components/vendors/workspace/ActivityLog.tsx](components/vendors/workspace/ActivityLog.tsx)

### 5.5 Chain Breaks

| Break | Evidence |
|---|---|
| No vendor claim UI | `markClaimed()` exists; no page under `/vendor/*` calls it |
| No vendor view of workspace content | Vendor never sees shot list, menu, timeline they were invited to configure |
| No email delivery | `sendInvitation()` sets `sent_at` but no mailer |
| Permissions never gate anything | Defined in type, ignored at render |
| `logActivity` never called automatically | Arrays always empty post-seed |
| `VendorWorkspaceActivity.detail` field never populated | Only `summary` used |

---

## 6. Inquiries — Lifecycle Chain is Fully Broken

### 6.1 Three Schemas

| System | File | Fields |
|---|---|---|
| A: Marketplace cart | [stores/inquiries-store.ts:6-19](stores/inquiries-store.ts#L6) | vendorSlug, vendorName, vendorCategory, coupleName, weddingDate, eventType, message, email, wantsAccount, packageIds, submittedAt |
| B: Vendor-profile panel | [types/vendor-profile.ts:174-185](types/vendor-profile.ts#L174) `InquiryRecord` | id, vendor_id, sent_at, wedding_date, venue_name, guest_count, events[], budget_min/max, message |
| C: Vendor portal seed | [lib/vendor-portal/seed.ts:50-70](lib/vendor-portal/seed.ts#L50) | id, coupleName, weddingDate, city, events[], budget (string), status (6-value enum), unread, lastMessageAt, preview, headcount, package?, subject?, eventType?, venue? |

**No two share the same field set.** Vendor-side can't even tell if an inquiry came from marketplace vs profile panel.

### 6.2 Write Points

| Source | Target | Side Effects |
|---|---|---|
| [components/vendors/VendorProfilePanel.tsx](components/vendors/VendorProfilePanel.tsx) inquiry form → `useVendorsStore.sendInquiry()` [stores/vendors-store.ts:69-99](stores/vendors-store.ts#L69) | `useVendorsStore.inquiries[]` (**not persisted** — no `persist` middleware) | Auto-shortlists + sets shortlist status→`contacted` |
| [components/vendors/AIRecommendationSection.tsx:92](components/vendors/AIRecommendationSection.tsx#L92) | Same as above | Same |
| [app/marketplace/[slug]/page.tsx:1087](app/marketplace/[slug]/page.tsx#L1087) InquiryModal → `useInquiriesStore.add()` | localStorage `ananya-inquiries` | Also adds `kind: "vendor-inquiry"` item to cart-store |

### 6.3 Read Points

| Consumer | Reads | Actual Behavior |
|---|---|---|
| Couple "My inquiries" history | — | **Does not exist** |
| Vendor inbox | [app/vendor/inbox/page.tsx](app/vendor/inbox/page.tsx) | Reads hardcoded `INQUIRIES` seed (5 rows) — never reads either real store |
| [app/vendor/inquiries/page.tsx](app/vendor/inquiries/page.tsx) | Renders `<ModulePlaceholder>` | Stubbed entirely |
| Vendor dashboard [app/vendor/page.tsx](app/vendor/page.tsx) | Reads seed | Shows fake inquiries |
| Cart [app/cart/](app/cart/) | Reads inquiries-store | Display only |

### 6.4 Chain Breaks

| Break | Impact |
|---|---|
| No notification/delivery layer | Vendor never sees couple's real inquiry |
| vendors-store.inquiries not persisted | Lost on refresh |
| Auto-shortlist side effect | User may not intend |
| No couple-side history | Couples can't review what they sent |
| Marketplace inquiry omits budget, guest count, venue | Vendor lacks logistics |
| Profile inquiry omits couple name | Vendor doesn't know who they are |
| Cart `packageIds` captured but never displayed to vendor | — |
| Portal inquiry status enum ("new"/"replied"/...) has no write point | — |

---

## 7. Couples / Users / Planners

### 7.1 `User` — [stores/auth-store.ts:14-29](stores/auth-store.ts#L14)

| Field | Written | Read | Notes |
|---|---|---|---|
| id, name, email, role, createdAt | signUp/signIn | TopNav, dashboard | ✅ |
| wedding.weddingDate | saveOnboarding | Checklist (deadline calc), Cart inquiry | ✅ |
| wedding.partnerName | saveOnboarding | ❌ **Never displayed** | Dead |
| wedding.location | saveOnboarding | ❌ **Never read** | Dead |
| wedding.guestCount | saveOnboarding | Catering, events, vendor workspace | ✅ |
| needsOnboarding | signUp / skipOnboarding | Onboarding modal gate | ✅ |

### 7.2 Hardcoded Couple Identity (Critical)

```
[app/checklist/page.tsx](app/checklist/page.tsx): const COUPLE = { person1: "Priya", person2: "Arjun" }
[app/(wedding)/[weddingId]/shopping/page.tsx](app/(wedding)/[weddingId]/shopping/page.tsx): same
[types/workspace.ts:391](types/workspace.ts#L391) WORKSPACE_ROLES: Urvashi/Priya/Arjun fixtures
Popout monogram_designer DEFAULT_CONFIG: "AR", "Ananya Rohan"
```

`WeddingProfile.partnerName` is entered during onboarding **but every UI surface ignores it** and renders the hardcoded demo couple.

### 7.3 Planner — No Entity Exists

- **No Planner type.** Planner "Urvashi" is a hardcoded role fixture in [types/workspace.ts:391-402](types/workspace.ts#L391).
- `PlannerConnection` (in vendor-profile) references planners by string `planner_id` / `name` / `company` — one-directional, vendor→planner, no back-reference.
- No planner assignment workflow, planner profile page, or planner-authored writes.
- Comment `author` union includes `"planner"` but no user with that role can be created (auth-store role = `"couple" | "vendor"` only).

---

## 8. Venue

### 8.1 `VenueProfile` — [types/venue.ts:33-62](types/venue.ts#L33)

~25 top-level fields + arrays of Spaces, Restrictions, Contacts, LoadIn, Parking, Restrooms, Kitchen, GettingReady, Emergency, DayOfFacts, ContractTerms.

### 8.2 Dead Fields

| Field | Issue |
|---|---|
| `total_capacity_cocktail` | Never checked (capacity validation uses ceremony/reception only) |
| `indoor` / `outdoor` booleans | Redundant with `venue_type` enum; never read |

### 8.3 Cross-Portal Flow

- Venue data is **couple-side only.** There's a `/app/venue/` path but no public venue-portal read flow equivalent to the vendor portal.
- Venue restrictions define `affected: AffectedWorkspace[]` (9 categories), meant to surface cross-workspace banners — **not wired to consumers.**

---

## 9. Events, Tasks/Checklist, Documents, Finance, Journal

### 9.1 Events — [types/events.ts](types/events.ts)

**`CoupleContext`** (traditions, partnerBackground, storyText, totalGuestCount, heroPaletteId, priorityRanking, nonNegotiable, dontCare, aiBudgetAllocation).

**`EventRecord`** per-event (~15 types: pithi, haldi, mehendi, sangeet, garba, baraat, ceremony, cocktail, reception, after_party, welcome_dinner, farewell_brunch, custom).

**Cascade notifications** — [types/events.ts:327-341](types/events.ts#L327). Defined but no UI surface renders them.

**Mismatches:**
- `heroPaletteId` (legacy global) still on type but replaced per-event; no cleanup.
- `paletteLockedPositions` written but not read by any palette-gen logic.
- `dontCare` captured, rarely referenced.

### 9.2 Checklist — [types/checklist.ts](types/checklist.ts)

Task items have optional `vendor_ids[]` linking to vendors, but:
- Couple side: `TaskVendorLink` CRUD exists in vendors-store
- Vendor side: vendors never see tasks assigned to them
- Planner side: no planner view

### 9.3 Documents — [types/documents.ts](types/documents.ts)

Documents module tracks contracts/invoices/proofs but:
- Contract files uploaded here are **not cross-linked** to `WorkspaceContract.file_refs` in workspace-store
- Music `MusicContract.pdf_url` also independent of documents store
- Photography `PhotoDeliverable.preview_url` / `download_url` independent

### 9.4 Finance — [types/finance.ts](types/finance.ts)

- Couple budget (contracts + payment milestones) tracked separately from vendor-portal billing (seed data in vendor-portal).
- `Contract.currency` hardcoded "INR" — no multi-currency.
- Per-partner countersign (`countersigned_by_priya_at`/`_arjun_at`) but no logic enforces both signatures.
- No reconciliation API between couple's contracts and vendor's invoices.

### 9.5 Journal — [types/journal*.ts](types/journal.ts)

Journal entries + article links + "Add to moodboard" source tracking via [components/journal/](components/journal/). Moodboard cross-link works (WorkspaceMoodboardItem.source). No vendor/planner visibility into journal.

---

## 10. Files / Uploads

### 10.1 `WorkspaceFile` — [types/files.ts](types/files.ts)

Fields: id, wedding_id, category, tab, filename, mime, storage_key (object URL — volatile!), uploaded_by, tags, linked_entities (vendor_ids, task_ids, decision_ids), contract flag, version chain, deleted_at.

### 10.2 Issues

| Issue | Severity |
|---|---|
| `storage_key` is an object URL → **all previews die on page reload** | 🔴 Critical |
| `linked_entities.vendor_ids` never validated; orphans accumulate | 🟡 Medium |
| Music/Photography/Video contracts and deliverables **bypass files-store entirely** — each stores its own `pdf_url`/`preview_url` | 🟡 Medium |
| Soft-delete `deleted_at` has no purge mechanism | 🟢 Low |
| [stores/uploads-store.ts](stores/uploads-store.ts) ephemeral by design, but many popout templates rely on it as if persistent | 🟡 Medium |

---

## 11. Quiz → Vision → Aesthetic Chain

### 11.1 Flow

```
lib/quiz/schemas/*.ts .apply()
  ├─ useVisionStore.setKeywords()
  ├─ useAestheticStore.addImages / setImageTags
  ├─ useDecorStore.setQuizAnswers
  ├─ useCateringStore.setEventSetup
  ├─ usePhotographyStore.addShots
  ├─ usePanditStore.setBrief
  └─ Raw answers in useQuizStore
```

### 11.2 Issues

| Issue | Evidence |
|---|---|
| No transactional boundary | Partial failure leaves stores inconsistent |
| `photography-vision-mood` quiz writes to a **non-store localStorage key** (`PHOTO_BRIEF_KEY`) | Must check both store and raw key |
| Aesthetic synthesis API stubbed | [app/api/aesthetic/synthesize/route.ts](app/api/aesthetic/synthesize/route.ts) returns mock |
| `AestheticDirection.is_locked` flag exists but unlocking doesn't cascade to Décor palette | No subscribers |
| `AestheticDNA.amendments[]` audit recorded but **never displayed** | Dead UI |
| `Recommendations` API takes `moodboard_summary` string — caller must manually assemble from aesthetic-store; no auto-generator | [app/api/workspace/recommendations/route.ts](app/api/workspace/recommendations/route.ts) |
| Recommendations cache by `context_hash` but **never invalidated** when aesthetic/vision change | Stale forever |

---

## 12. Comments / Collaboration

### 12.1 `Comment` — [types/popout-infrastructure.ts:43-54](types/popout-infrastructure.ts#L43)

id, entity_type (`item`/`decision`/`sub-decision`), entity_id, parent_id (1-level deep), author (`couple`/`planner`/`vendor` but no planner users exist), body, mentions[], attachment, created_at, updated_at.

### 12.2 Store — [stores/comments-store.ts](stores/comments-store.ts)

**In-memory only (no `persist` middleware).** Comments evaporate on refresh.

### 12.3 Parallel Comment Systems

Separate comment systems (not unified):
- Catering: dish comments in catering-store
- Music: song comments in music-store
- PopOut CommentThread: uses comments-store
- Decor: element discussions in decor-store

**Mentions extracted but never delivered** — no notification pipeline.

---

## 13. Music / Photography / Videography / Catering / Mehndi / Pandit

Summary table of domain-specific workspace entities:

| Domain | Canonical write path | Vendor-side read path | Cross-entity dead links |
|---|---|---|---|
| Music | [stores/music-store.ts](stores/music-store.ts) + 4 others | Vendor portal music pages exist but read seed | `MusicContract.pdf_url` ≠ files-store; `milestones.paid_at` ≠ finance-store |
| Photography | [stores/photography-store.ts](stores/photography-store.ts) | Vendor reads seeded `PHOTO_BRIEF_KEY` | `PhotoVIP.must_capture` never checked on day-of; `PhotoDeliverable.preview_url` ≠ files-store |
| Videography | [stores/videography-store.ts](stores/videography-store.ts) | Seeded | `VideoInterview.captured` boolean w/o timestamp |
| Catering | [stores/catering-store.ts](stores/catering-store.ts) | Vendor workspace content | `MenuEvent.guest_count` duplicates events-store; no sync |
| Mehndi | [stores/mehndi-store.ts](stores/mehndi-store.ts) | — | `GuestSlot.start_time` nullable; no auto-scheduling |
| Pandit | [stores/pandit-store.ts](stores/pandit-store.ts) | — | `CeremonyRitual.inclusion="discuss"` never promoted to Decision record |

---

## 14. Brand / Monogram / Logo / Stationery / Wedding Site

### 14.1 Brand Cascade (Broken)

```
useMonogramOverridesStore.select("rose")
  └─ Writes WeddingBrandState.monogramTemplateId, brandAutoApplied=true
  └─ ❌ No consumer reads this to apply across surfaces

useBrandOverridesStore (ink, surface, accent, fonts)
  └─ Works locally in brand studio
  └─ ❌ Wedding-site template renders hardcoded "P&A" initials regardless
  └─ ❌ Stationery proofs don't inherit brand tokens
  └─ ❌ Popout monogram_designer uses its own DEFAULT_CONFIG
```

### 14.2 Stationery — [types/stationery.ts](types/stationery.ts)

Guest count snapshot in stationery store — `resyncSuiteItemQuantity()` uses local `guestMetrics`, **not** events-store. Update events guest count → stationery silently stale.

### 14.3 Wedding Site — [types/wedding-site.ts](types/wedding-site.ts)

`SiteContent.events` manually maintained; no sync from events-store. `RenderBrand.monogramInitials` is a string — not validated against actual brand selection.

---

## 15. Popout Templates — State Persistence Audit

| Template | State | Persistence | Issue |
|---|---|---|---|
| [components/popout/templates/color_palette/](components/popout/templates/color_palette/index.tsx) | Local | ❌ | Lost on close |
| [components/popout/templates/hashtag_picker/](components/popout/templates/hashtag_picker/index.tsx) | Local | ❌ | Lost on close |
| [components/popout/templates/monogram_designer/](components/popout/templates/monogram_designer/index.tsx) | Local DEFAULT_CONFIG | ❌ | Hardcoded "AR"/"Ananya Rohan" |
| [components/popout/templates/vendor_booking/](components/popout/templates/vendor_booking/index.tsx) | useVendorsStore + useChecklistStore | Partial | Vendor note persisted; booking link not |
| [components/popout/templates/vendor_comparison/](components/popout/templates/vendor_comparison/index.tsx) | Local + useChecklistStore.decided_vendor_id | ❌ | Comparison matrix lost on close |
| catering_menu_builder | useCateringStore | ✅ | Works |

**User expectation**: "click away = saved". Actual: 4/6 templates discard state silently.

---

## 16. Cross-Portal Flow Summary

### 16.1 Couple → Vendor

| Data | Crosses? | How |
|---|---|---|
| Wedding date | ✅ | InquiryRecord.wedding_date |
| Guest count | ✅ (sometimes) | InquiryRecord.guest_count (profile panel only) |
| Budget | ✅ (sometimes) | InquiryRecord.budget_min/max |
| Events selected | ✅ (sometimes) | InquiryRecord.events[] |
| Moodboard / aesthetic | ❌ | Vendor never sees couple's aesthetic DNA or moodboard |
| Shot list / menu / timeline | ✅ in type | VendorWorkspace.content — but vendor has no UI to read it |
| Couple names | ❌ (profile panel) / ✅ (marketplace) | Inconsistent |
| Selected packages | Partial | Marketplace inquiry captures packageIds; vendor portal doesn't display |

### 16.2 Vendor → Couple

| Data | Crosses? | How |
|---|---|---|
| Vendor response to inquiry | ❌ | No backchannel |
| Review reply | ❌ | Type has no `response` on couple-side CoupleReview |
| Package updates | ❌ | Couple-side marketplace reads marketing seed, not vendor-portal packages |
| Availability | ❌ | No calendar sync |

### 16.3 Planner Anywhere

| Data | State |
|---|---|
| Planner profile | ❌ None |
| Planner assignment to couple | ❌ Hardcoded |
| Planner view of vendor workspaces | ❌ No UI |
| PlannerEndorsements on vendors | ✅ read-only, seed-populated |

---

## 17. Hardcoded Mock Data (Critical)

| Location | Hardcoded | Should Read From |
|---|---|---|
| [app/checklist/page.tsx](app/checklist/page.tsx) `COUPLE = {person1, person2}` | "Priya"/"Arjun" | auth-store.user.name + wedding.partnerName |
| [app/(wedding)/[weddingId]/shopping/page.tsx](app/(wedding)/[weddingId]/shopping/page.tsx) `COUPLE = ...` | Same | Same |
| [types/workspace.ts:391](types/workspace.ts#L391) `WORKSPACE_ROLES` | Urvashi planner fixture | Planner entity (doesn't exist) |
| [lib/vendor-portal/seed.ts](lib/vendor-portal/seed.ts) `VENDOR` / `INQUIRIES` / `REVIEWS` | Aurora Studios + 5 inquiries + 8 reviews | Real multi-vendor store |
| [app/vendor/page.tsx](app/vendor/page.tsx) dashboard KPIs | Seed values | Aggregated from real inquiries |
| popout color_palette `EVENT_META`, `ROLE_LABELS` | Constants | events-store, workspace-store |
| popout monogram_designer `DEFAULT_CONFIG` | "AR", "Ananya Rohan" | brand-overrides-store |
| popout hashtag_picker `STYLE_CHIPS` | Constants | aesthetic-store keywords |

---

## 18. Ghost Fields (Defined, Never Populated or Displayed)

| Field | File | Issue |
|---|---|---|
| `Vendor.images` | [types/vendor.ts:66](types/vendor.ts#L66) | Always `[]`; no upload |
| `Vendor.enriched_at` | Same | Never read |
| `VendorProfileExtras.response_time_hours` vs `avg_response_time` | [types/vendor-profile.ts:119](types/vendor-profile.ts#L119) | Duplicate |
| `VendorProfileExtras.passport_valid` | Same | Never displayed |
| `VendorProfileExtras.destination_booking_lead_months` | Same | Never displayed |
| `ShortlistEntry.personal_rating` | [types/vendor.ts:109](types/vendor.ts#L109) | No UI |
| `ShortlistEntry.package` | Same | Incomplete comparison feature |
| `CoupleReview.helpful_count` | [types/vendor-profile.ts:89](types/vendor-profile.ts#L89) | No voting UI |
| `VendorWorkspaceContent.*` (all discipline-specific) | [types/vendor-workspace.ts:32](types/vendor-workspace.ts#L32) | No edit forms |
| `VendorWorkspaceActivity.detail` | [types/vendor-workspace.ts](types/vendor-workspace.ts) | Never populated |
| `VendorWorkspacePermissions.*` (all 5 axes) | Same | Never enforced |
| `WeddingProfile.partnerName` | [stores/auth-store.ts:14](stores/auth-store.ts#L14) | Never displayed |
| `WeddingProfile.location` | Same | Never read |
| `VenueProfile.total_capacity_cocktail` | [types/venue.ts:33](types/venue.ts#L33) | Never checked |
| `VenueProfile.indoor`/`outdoor` | Same | Redundant with venue_type |
| `CoupleContext.heroPaletteId` | [types/events.ts](types/events.ts) | Deprecated to per-event |
| `EventRecord.paletteLockedPositions` | Same | Never read by palette-gen |
| `WorkspaceContract.currency` | [types/workspace.ts:470](types/workspace.ts#L470) | Hardcoded INR |
| `PhotoVIP.must_capture` | [types/photography.ts](types/photography.ts) | Never checked |
| `PhotoDeliverable.preview_url/download_url` | Same | No upload flow |
| `VideoInterview.captured` | [types/videography.ts](types/videography.ts) | No timestamp / no sync |
| `CeremonyFamilyRole.practice_needed` | [types/pandit.ts](types/pandit.ts) | No scheduling integration |
| `SamagriItem.due_date` | Same | No escalation |
| `DesignElement.confirmed` (mehndi) | [types/mehndi.ts](types/mehndi.ts) | Artist never sees |
| `CoverageAssignment.state="na"` | [types/workspace.ts](types/workspace.ts) | No UI sets it |
| `DecisionVetoFlags` | [types/workspace.ts](types/workspace.ts) | Toggles but no visual |
| `TaskVendorLink.status` | [types/vendor.ts](types/vendor.ts) | Defined, no UI |
| `CoupleReview.is_destination`/`destination_location` | [types/vendor-profile.ts:89](types/vendor-profile.ts#L89) | Never filtered |
| `AestheticDNA.amendments` audit | [types/aesthetic.ts](types/aesthetic.ts) | Written, never shown |
| `CascadeNotification.*` | [types/events.ts:327](types/events.ts#L327) | No UI consumer |

---

## 19. Consolidated Priority Recommendations

### 🔴 Critical (Lifecycle-Breaking)

1. **Wire inquiry delivery.** Merge the 3 inquiry schemas into one; make vendor inbox read from the unified store; make couple history visible; add a notification layer (even an in-app toast is better than nothing).
2. **Persist vendor-store.inquiries** via Zustand `persist` middleware.
3. **Build vendor view for VendorWorkspace content** so couples' menus/shot-lists/timelines actually reach vendors.
4. **Enforce VendorWorkspacePermissions** at render time, or remove the type.
5. **Stop hardcoding couple identity.** Replace every `COUPLE = {person1, person2}` with `auth-store.user.name` + `user.wedding.partnerName`.
6. **Model Planner as an entity** (auth-store role already exists in comment schema; extend user roles).
7. **Persist popout template state** (color_palette, hashtag_picker, monogram_designer, vendor_comparison) to their natural stores.
8. **File storage_key uses object URLs** → previews die on reload; need real storage or explicit warning.

### 🟡 Medium

9. Unify review schemas; render vendor `response` on couple side.
10. Brand cascade: make wedding-site, stationery, popout templates read from monogram/brand-overrides stores.
11. Invalidate recommendations cache on aesthetic/vision/feedback change.
12. Implement aesthetic synthesis API (currently stubbed).
13. Integrate Music/Photo/Video contracts + deliverables with files-store version chain.
14. Auto-sync guest count across events→catering→stationery.
15. Converge travel enums (4 vs 5 levels), price representations, `VendorCategory` vs `WorkspaceDiscipline`.
16. Finance reconciliation between couple contracts and vendor invoices.

### 🟢 Low

17. Delete ghost fields or build their UI (see §18 list).
18. Purge deleted files after N days.
19. Add transactional wrappers around quiz `apply()` multi-store writes.
20. Surface cascade notifications + amendment audits in the UI.

---

## 20. File Reference Index (for navigation)

**Types:** [types/](types/)
**Stores:** [stores/](stores/)
**Seeds:** [lib/](lib/) (*-seed.ts files), [lib/quiz/schemas/](lib/quiz/schemas/)
**Couple portal:** [app/app/](app/app/), [app/workspace/](app/workspace/), [app/dashboard/](app/dashboard/), [app/checklist/](app/checklist/), [app/events/](app/events/), [app/journal/](app/journal/)
**Vendor portal:** [app/vendor/](app/vendor/), [components/vendor-portal/](components/vendor-portal/), [app/seller/](app/seller/), [app/for-vendors/](app/for-vendors/)
**Marketplace:** [app/marketplace/](app/marketplace/), [lib/marketing/data.ts](lib/marketing/data.ts)
**Portal-hub:** [app/portal-hub/](app/portal-hub/), [components/portal-hub/](components/portal-hub/)
**Planner:** [app/planner/](app/planner/), [components/planner/](components/planner/) (shell only)
**Venue:** [app/venue/](app/venue/), [components/venue/](components/venue/)
**Popouts:** [components/popout/](components/popout/), [components/popout/templates/](components/popout/templates/)
**API routes:** [app/api/aesthetic/](app/api/aesthetic/), [app/api/catering/](app/api/catering/), [app/api/documents/](app/api/documents/), [app/api/finance/](app/api/finance/), [app/api/journal/](app/api/journal/), [app/api/link-preview/](app/api/link-preview/), [app/api/quiz/](app/api/quiz/), [app/api/workspace/](app/api/workspace/)

---

*End of audit.*
