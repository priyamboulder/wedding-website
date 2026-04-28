# Ananya Checklist Module — Full Build Prompt Set

**55 prompts to build the complete checklist cockpit with bespoke pop-outs for every high-value decision.**

## How to use this document

1. Run prompts sequentially in Claude Code. Commit between each.
2. Review the UI after every prompt before moving on. Claude Code is good but not psychic.
3. The prompts assume your existing Ananya design system (Fraunces serif, Inter sans, JetBrains Mono, ivory/ink/gold palette). Adjust Prompt 1 if your tokens differ.
4. Cross-cutting features (file uploads, comments, AI, PDF export) are baked into Prompt 6 as shared infrastructure, then referenced by every bespoke pop-out prompt.
5. Drop `ananya-indian-wedding-checklist.md` into the project root before Prompt 2 so it can be parsed for seed data.

## Prompt structure

Prompts are grouped into 6 sections:

- **Section A** (Prompts 1–5): Foundation, data model, navigation, generic pop-out, polish
- **Section B** (Prompts 6–8): Shared infrastructure for bespoke pop-outs
- **Section C** (Prompts 9–18): Tier 1 bespoke pop-outs — highest-value items
- **Section D** (Prompts 19–35): Tier 2 bespoke pop-outs — medium-complexity items
- **Section E** (Prompts 36–50): Tier 3 bespoke pop-outs — specialized items
- **Section F** (Prompts 51–55): Integration, cross-module sync, final polish

---

# Section A — Foundation (Prompts 1–5)

## Prompt 1 — Foundation & Design System

```
I'm building the checklist module for Ananya, a luxury Indian wedding planning platform. This module will become the primary "cockpit" where the bride and groom work from — decisions made here will eventually sync to other modules (Venue, Transportation, Mehndi, etc.).

For this first pass, set up the foundation only. Do not build the checklist logic yet.

Requirements:
1. Create a new route at /checklist using Next.js App Router.
2. Establish the design system tokens in Tailwind config:
   - Fonts: Fraunces (serif, headings and editorial moments), Inter (sans, UI), JetBrains Mono (metadata, IDs, timestamps)
   - Colors: ivory (#FBF9F4) base, ink (#1A1A1A) primary text, warm gold (#B8860B) accent, soft sage (#9CAF88) for completed states, muted rose (#C97B63) for urgent/overdue, smoke (#6B6B6B) for secondary text
   - Spacing: generous, editorial — default padding should feel like a magazine, not a SaaS dashboard
3. Create a layout shell with:
   - Top bar: couple's names in Fraunces, countdown to wedding date, progress ring showing % complete
   - Left sidebar: 12 phases listed with item counts per phase
   - Main content area: empty placeholder for now
4. Use shadcn/ui as the component base, customized to match the tokens above.
5. Desktop-first responsive.

Aesthetic reference: Sabyasachi's website crossed with Linear. Editorial, confident, lots of white space, precise functional density where it matters. Avoid generic SaaS checklist aesthetics.

Commit: "feat(checklist): foundation and design system"
```

## Prompt 2 — Checklist Data Model & Seed Data

```
Continuing the Ananya checklist module. Set up the data layer.

Requirements:
1. Create TypeScript types in /types/checklist.ts:
   - Phase: id, title, description, order, icon, color
   - ChecklistItem: id, phase_id, title, description, status ('not_started' | 'in_progress' | 'blocked' | 'done' | 'not_applicable'), priority ('low' | 'medium' | 'high' | 'critical'), due_date, assigned_to ('bride' | 'groom' | 'both' | 'family' | 'planner'), module_link, decision_template ('generic' | specific template name), dependencies (item ids), tradition_profile_tags, notes, created_at, updated_at
   - DecisionField: id, label, type ('text' | 'textarea' | 'select' | 'multiselect' | 'date' | 'currency' | 'file_upload' | 'vendor_picker' | 'image_upload' | 'url'), options, value, required, helper_text
2. Parse the file `ananya-indian-wedding-checklist.md` from the project root and generate seed data with all 12 phases and ~400 items. For each item, infer 3-5 sensible decision fields based on the item's nature.
3. Mark items that will get bespoke pop-outs by setting `decision_template` to a specific template name (e.g., 'hashtag_picker', 'seating_chart', 'vendor_booking'). For all other items, set it to 'generic'. Use this list of bespoke templates: hashtag_picker, monogram_designer, color_palette, mood_board, vendor_booking, vendor_comparison, guest_list_manager, seating_chart, budget_allocator, muhurat_picker, puja_samagri_tracker, mandap_designer, attire_style_guide, jewelry_planner, beauty_timeline, mehndi_workspace, sangeet_run_of_show, choreography_planner, baraat_planner, ceremony_program_builder, catering_menu_builder, bar_program, lighting_designer, decor_florals, photography_shot_list, transportation_grid, accommodation_blocks, stationery_suite, welcome_bag_builder, registry_manager, honeymoon_planner, vidaai_planner, reception_planner, haldi_planner, gift_tracker, speech_planner, music_library, dress_code_builder, rehearsal_planner, day_of_emergency_kit, thank_you_tracker, tradition_profile_picker, family_role_assigner, tip_envelope_planner, contract_manager.
4. Store as TypeScript constant in /lib/checklist-seed.ts.
5. Create Zustand store at /stores/checklist-store.ts: getPhases(), getItemsByPhase(phaseId), getItemById(id), updateItem(id, updates), toggleItemStatus(id), updateDecisionField(itemId, fieldId, value).

No UI yet. Run `npm run build` to confirm types compile.

Commit: "feat(checklist): data model and seed data"
```

## Prompt 3 — Phase Navigation & Item List

```
Continuing the Ananya checklist module. Build the main content area.

Requirements:
1. Left sidebar (already built) becomes interactive — clicking a phase loads its items.
2. Main content area shows:
   - Phase header: title in Fraunces large, description in Inter, thin gold rule separator
   - Filter bar: status, priority, assigned-to, search — subtle, editorial
   - List of items for the phase
3. Each item row:
   - Custom checkbox (circle, fills with sage when done, subtle scale animation)
   - Item title in Fraunces
   - One-line preview of key decision fields if filled (e.g., "Blue Bottle Coffee • $4,500 • deposit paid")
   - Status pill, priority indicator, due date if set
   - Subtle chevron right indicating clickable
   - Hover: barely-there warm tint background
4. Clicking a row opens a side panel sliding from the right, ~45% viewport width, with close button. Main content remains visible and slightly dimmed (not a modal overlay).
5. Use Framer Motion for panel slide and checkbox animations.
6. Empty panel shell only — no content yet.

Commit: "feat(checklist): phase navigation and item list"
```

## Prompt 4 — Generic Item Detail Pop-Out

```
Continuing the Ananya checklist module. Build the GENERIC pop-out panel that handles items where decision_template === 'generic'. Bespoke templates will be added in later prompts.

Requirements:
1. Panel structure:
   - Top: breadcrumb (Phase → Item), close button, more-actions menu
   - Title: large Fraunces, editable inline on click
   - Below title row: status selector, priority selector, due date picker, assigned-to picker — all inline, subtle
   - Description: editable textarea
   - Horizontal gold rule
   - "Decisions" section: dynamically render decision_fields. Each field uses the correct input. Save on blur with subtle "saved" indicator.
   - "Dependencies" section: items this depends on, items depending on this. Clickable to navigate within panel.
   - "Linked Module" section: if item has module_link, show "Open in [Module] →" placeholder button.
   - "Notes" section: rich text area
   - "Activity" section: placeholder timeline
2. Feels like opening a well-designed index card, not a form. Generous spacing, editorial typography, distinct sections.
3. Edits update Zustand store, reflect immediately in list behind panel.
4. Marking item "done" triggers subtle gold shimmer animation.
5. Keyboard: Esc closes, Cmd+Enter marks done, Cmd+K stub for command palette.
6. Build a router component PopOutRouter that takes an item, checks decision_template, and renders the right pop-out. For now it only knows how to render 'generic'. Bespoke templates will be added later by extending this router.

Commit: "feat(checklist): generic item detail pop-out"
```

## Prompt 5 — Progress, Filters, and Polish

```
Final foundation pass on the Ananya checklist module.

Requirements:
1. Progress ring in top bar: connect to real completion data. Click opens popover with per-phase progress bars.
2. "Today" view in sidebar above phase list — items due this week across all phases.
3. "At Risk" view — overdue, blocked, or with unmet dependencies.
4. Empty states: thoughtful per view. No items in phase = small illustration + "Add item". No search results = gentle "No items match" in Fraunces italic.
5. Loading states: editorial skeleton loaders, no spinners.
6. Micro-interactions: checkbox spring animation, panel slide easing [0.32, 0.72, 0, 1], deliberate hover states.
7. Accessibility: keyboard nav, gold focus rings, proper labels, focus trap in panel.
8. Run `npm run build` and fix errors.

Take a final look — does it feel like a luxury product for an Indian wedding, or generic? Identify the 3 biggest issues and fix before committing.

Commit: "feat(checklist): progress, filters, and polish"
```

---

# Section B — Shared Infrastructure (Prompts 6–8)

## Prompt 6 — Cross-Cutting Pop-Out Infrastructure

```
Now building shared infrastructure that every bespoke pop-out in the Ananya checklist will use. This is critical foundation — get it right before building any specific pop-outs.

Requirements:

1. **File uploads**:
   - Component <FileUploader /> with drag-and-drop, click-to-browse, multi-file
   - Supports images, PDFs, docs, with thumbnail previews
   - Upload to local /public/uploads for now (Supabase Storage later)
   - Returns array of {id, filename, url, mime_type, size, uploaded_at}
   - Visual style: dashed gold border on drop zone, ivory background, Fraunces "Drop files here" text
   - Component <FileGallery /> displays uploaded files in a grid with hover-to-delete

2. **Comments / threads**:
   - Component <CommentThread /> attaches to any entity (item, decision, sub-decision)
   - Each comment: author, body, timestamp, optional @mention, optional attachment
   - Threading: replies nest one level deep
   - Visual: editorial like a literary magazine letters section, not Slack
   - Store comments in Zustand for now

3. **AI assistance**:
   - Component <AIAssistButton /> with a small sparkle icon in gold
   - Click opens a small popover with a textarea and "Generate" button
   - Calls a server action that hits the Anthropic API (claude-sonnet-4-6) with a context-specific prompt passed as a prop
   - Shows generated content with "Use this", "Regenerate", "Edit" actions
   - Loading state: subtle pulsing gold dots
   - Stub the API call with a placeholder for now — actual integration in a later prompt

4. **PDF export**:
   - Function exportToPDF(item, options) generates a beautifully formatted PDF of an item's current state
   - Use react-pdf or @react-pdf/renderer
   - PDF style matches the editorial aesthetic: Fraunces headings, generous spacing, gold accents
   - Returns a blob the user can download
   - Component <ExportButton /> in pop-out header

5. Document all four in /lib/popout-infrastructure/README.md so future bespoke pop-out prompts can reference them.

Commit: "feat(checklist): cross-cutting pop-out infrastructure"
```

## Prompt 7 — Pop-Out Layout Primitives

```
Build reusable layout primitives that every bespoke pop-out in the Ananya checklist will compose from. This ensures visual consistency across all 45+ bespoke pop-outs.

Requirements:

1. <PopOutShell /> — wraps every pop-out, provides header (breadcrumb, status, actions), footer (save state, last edited), Esc handling, focus trap
2. <PopOutSection title icon> — a labeled section with title in Fraunces, optional icon, optional helper text, gold rule below title
3. <PopOutSplit left right ratio> — two-column layout for pop-outs that need side-by-side panels (e.g., mood board + notes)
4. <PopOutTabs tabs> — editorial tabs at top of pop-out body (not Material-style; thin underline that's gold for active)
5. <PopOutGrid cols gap> — responsive grid for cards
6. <PopOutCard title interactive> — base card component with ivory background, subtle border, optional hover state
7. <PopOutEmpty illustration title body action /> — empty state for sub-sections
8. <PopOutInlineEdit value onChange placeholder type> — click-to-edit text/number/date that looks like static text until clicked
9. <PopOutTagInput tags onChange suggestions /> — for tradition profiles, dietary restrictions, etc.
10. <PopOutMoodBoard images onAdd onRemove /> — drag-droppable image grid with masonry layout, used by mood board pop-outs

Document every primitive in /components/popout/README.md with usage examples.

Commit: "feat(checklist): pop-out layout primitives"
```

## Prompt 8 — Bespoke Pop-Out Router & Registry

```
Extend the PopOutRouter built in Prompt 4 to support bespoke pop-out templates.

Requirements:
1. Create /components/popout/registry.ts that maps decision_template strings to React components
2. Each bespoke pop-out lives in /components/popout/templates/[template_name]/index.tsx
3. The router checks the item's decision_template, looks up the component in the registry, and renders it. Falls back to generic if not found.
4. Each bespoke pop-out receives: item (full ChecklistItem), onUpdate (callback), onClose (callback)
5. Bespoke pop-outs are responsible for their own state management — they read from and write to the Zustand store directly via the onUpdate callback
6. Add a development helper: a small dropdown in the pop-out header (only visible in dev mode) that lets you switch templates on the fly for testing

Create empty stub files for all 45 bespoke templates listed in Prompt 2 so the registry compiles. Each stub renders a placeholder "Pop-out template [name] coming soon" using PopOutShell.

Commit: "feat(checklist): bespoke pop-out router and registry"
```

---

# Section C — Tier 1 Bespoke Pop-Outs (Prompts 9–18)

These are the highest-value, most-used bespoke pop-outs. Build these first — they're what couples will touch every day.

## Prompt 9 — Hashtag Picker Pop-Out

```
Build the bespoke pop-out for the "Choose wedding hashtag" item in Ananya's checklist. Template name: hashtag_picker.

Requirements:
1. Three sections via PopOutTabs: Brainstorm, Shortlist, Final.
2. **Brainstorm tab**:
   - Two columns: bride's ideas and groom's ideas
   - Each column has an inline-add input and a list of hashtag candidates
   - Each candidate shows: the hashtag, character count, an "Instagram availability" indicator (stub for now — show green/yellow/red randomly), a heart-to-favorite button
   - <AIAssistButton /> with prompt context: "Generate 10 wedding hashtag ideas for [bride name] and [groom name], creative, playful, alliterative when possible"
3. **Shortlist tab**:
   - Drag-and-drop board where favorites from brainstorm appear as cards
   - Each card has voting buttons (bride heart, groom heart) — both must love it to advance
   - Sort by combined votes
4. **Final tab**:
   - The chosen hashtag in giant Fraunces
   - Below it: per-event hashtag variants (e.g., #PoojaAndRajSangeet, #PoojaAndRajMehndi) auto-generated, editable
   - "Generate hashtag graphics" button (stub) that would generate downloadable images
   - "Lock hashtag" button that marks the item done and freezes the choice
5. Comments thread at the bottom for family input.
6. Save to item's decision fields: brainstorm_list, shortlist, final_hashtag, event_variants, locked_at.

Commit: "feat(popout): hashtag picker"
```

## Prompt 10 — Vendor Booking Pop-Out

```
Build the bespoke pop-out for vendor booking items (photographer, videographer, DJ, decorator, caterer, etc.) in Ananya's checklist. Template name: vendor_booking. This template will be reused across ~30 vendor-related items.

Requirements:
1. Five sections via PopOutTabs: Shortlist, Comparison, Contract, Logistics, Communication.
2. **Shortlist tab**:
   - Grid of vendor cards, each showing: name, logo/photo, location, price range, rating, "viewed" badge
   - Add vendor button opens a form: name, contact, website, instagram, portfolio links, price quote, notes
   - Each card has favorite, contacted, quoted, booked status pills
3. **Comparison tab**:
   - Side-by-side comparison table of up to 3 vendors
   - Rows: price, deliverables, hours covered, team size, travel fees, deposit, payment terms, cancellation policy, what's included, what's extra
   - Editable cells, highlight differences in gold
4. **Contract tab**:
   - File uploader for contract PDF
   - Key terms extracted/manually entered: total cost, deposit amount, deposit due date, balance due date, cancellation terms, force majeure
   - Signature status with date
   - <AIAssistButton /> with prompt: "Review this contract for any unusual terms or red flags I should be aware of" (stub for now)
5. **Logistics tab**:
   - Day-of arrival time, setup time, breakdown time
   - Contact person on the day
   - Special requirements (meals, parking, power, AV)
   - Linked events (which events will this vendor cover)
6. **Communication tab**:
   - Email thread log (manual entry for now)
   - Next follow-up date
   - <AIAssistButton /> with prompt: "Draft a follow-up email to this vendor based on the conversation history" (stub)
7. Save all to item's decision fields. Use a vendor_booking sub-schema.

Commit: "feat(popout): vendor booking"
```

## Prompt 11 — Guest List Manager Pop-Out

```
Build the bespoke pop-out for the "Compile master guest list" item. Template name: guest_list_manager.

Requirements:
1. Top: stats bar — total guests, by side, by event, RSVP status counts
2. Main view: editable table with columns: name, side, relation, email, phone, address, dietary, accessibility, plus_one, kids count, events_invited (multi-checkbox: mehndi/sangeet/haldi/wedding/reception), rsvp status per event, notes
3. Bulk actions: import from CSV, export to CSV, send invites (stub), bulk update events
4. Filters: side, event, RSVP status, dietary, has_kids, age_group
5. Search by name
6. Click a row opens a guest detail mini-panel inside the pop-out with all fields editable + history
7. Categorization: tag system for VIPs, elderly, pregnant, traveling-from-far
8. Validation: flag duplicates, missing addresses, missing RSVPs as wedding approaches
9. Sub-tab "Counts" shows running totals per event for caterer/venue planning
10. Save to item's decision fields. Persist guest list as a structured array.

Commit: "feat(popout): guest list manager"
```

## Prompt 12 — Seating Chart Pop-Out

```
Build the bespoke pop-out for the "Build seating chart" items (one per event). Template name: seating_chart.

Requirements:
1. Drag-and-drop canvas as the main interface
2. Left sidebar: unseated guests pulled from the guest list (filtered by which event this seating chart is for)
3. Canvas: drag tables onto it, configure each table (round/rectangular, capacity, label)
4. Drag guests from sidebar onto table seats
5. Visual: tables look like top-down architectural drawings, gold borders, ivory fill, names in JetBrains Mono small caps
6. Right sidebar: table list with capacity used / total, warnings for over-capacity
7. Tools: auto-arrange by family, lock table position, duplicate table, delete table
8. Stage / dance floor / mandap as draggable special elements
9. Conflicts panel: shows guests not seated, families split across tables
10. Export: PDF of the seating chart, printable place cards generator
11. Versioning: save snapshots so you can iterate without losing arrangements
12. Save to item's decision fields: tables array, assignments map, version history

Commit: "feat(popout): seating chart"
```

## Prompt 13 — Budget Allocator Pop-Out

```
Build the bespoke pop-out for the "Set total budget ceiling" and "Allocate budget" items. Template name: budget_allocator.

Requirements:
1. Top: total budget input in large Fraunces, currency selector
2. Donut chart showing allocation by category, gold/sage/rose/smoke segments
3. Below chart: editable category list (Venue, Catering, Decor, Attire, Jewelry, Photo/Video, Music, Transport, Stationery, Gifts, Misc, Contingency)
4. Each category row: name, allocated amount, % of total, spent so far (manual entry), remaining, status pill (under/at/over)
5. Sub-allocations: each category expands to show per-event split (Mehndi, Sangeet, Wedding, Reception)
6. Drag a slider in any category to reallocate — other categories adjust proportionally
7. "Lock" button per category prevents auto-adjustment
8. Payment responsibility column: bride's family / groom's family / couple / split — with running totals per party
9. Contingency calculator: recommends 10-15% buffer
10. Forecast: projects final spend based on current trajectory
11. Export to PDF: clean budget summary for sharing with families
12. Save to item's decision fields: total_budget, currency, categories array, payment_split, locks

Commit: "feat(popout): budget allocator"
```

## Prompt 14 — Muhurat Picker Pop-Out

```
Build the bespoke pop-out for the "Receive list of auspicious dates" and "Confirm final dates" items. Template name: muhurat_picker.

Requirements:
1. Top section: birth details for bride and groom (date, time, place) — these inform muhurat calculations
2. <AIAssistButton /> with prompt: "Given these birth details, suggest auspicious wedding date windows in [year]" (stub for now — real integration would call an astrology API or formatted prompt)
3. Calendar view: months of the year with days color-coded — green for highly auspicious, yellow for acceptable, red for inauspicious (Shraddh, Chaturmas, Kharmas, eclipses)
4. Click a date to see: muhurat times for key ceremony moments (lagna, kanyadaan, pheras), planetary positions, why it's auspicious or not
5. Shortlist of 5 candidate dates with notes from priest
6. Cross-check panel: venue availability, key family availability, conflicts
7. Final selection: locked date with all ceremony muhurat times listed
8. Each ceremony moment becomes a row: time, duration, ritual name
9. Export to PDF: formal muhurat document for sharing with priest, decorator, photographer
10. Save to item's decision fields: candidate_dates, final_date, ceremony_times, priest_notes

Commit: "feat(popout): muhurat picker"
```

## Prompt 15 — Mandap Designer Pop-Out

```
Build the bespoke pop-out for the "Mandap design" item. Template name: mandap_designer.

Requirements:
1. Three sections via PopOutTabs: Inspiration, Specification, Approval.
2. **Inspiration tab**:
   - <PopOutMoodBoard /> for collecting reference images
   - Tag images by: structure type (4-pillar, 6-pillar, modern, traditional), florals, fabric, color
   - <AIAssistButton /> with prompt: "Suggest mandap design directions based on these inspiration images and our wedding palette" (stub)
3. **Specification tab**:
   - Structure: type, dimensions (width x depth x height), materials
   - Florals: primary flowers, color palette, density (lush/moderate/minimal), seasonal availability check
   - Fabric: drapes, ceiling treatment, color
   - Lighting: warm/cool, fairy lights, candles, GOBO
   - Seating: bride/groom chairs, parents' seating, agni placement
   - Backdrop: wall behind mandap, what's visible to guests
   - Sketch upload area for vendor's proposed design
4. **Approval tab**:
   - Vendor proposal with quote breakdown
   - Side-by-side: your spec vs vendor proposal
   - Approval status, deposit tracker, final walkthrough date
   - Day-of contact, install time, breakdown time
5. Comments thread for family input on design choices
6. Save to item's decision fields: inspiration array, spec object, vendor_proposal, approval_status

Commit: "feat(popout): mandap designer"
```

## Prompt 16 — Attire Style Guide Builder Pop-Out

```
Build the bespoke pop-out for the "Guest Attire Style Guide" item. Template name: attire_style_guide.

Requirements:
1. Top: cover preview that shows what guests will see when this is published
2. Editor sections accordion:
   - Welcome message (rich text)
   - General guidance (modesty, weather, footwear)
   - Per-event sections: Mehndi, Sangeet, Haldi, Wedding, Reception. Each event:
     - Color palette swatches (hex picker, name)
     - Recommended looks (image upload grid)
     - What to avoid (image upload + text)
     - Where to shop (link list with thumbnails)
     - Modesty notes
3. Special section for non-Indian guests:
   - "How to drape a saree" video embed area
   - "Kurta basics" guide
   - Sari-draping service contact
   - Recommended rental services
4. Per-event accent: footwear notes (removable shoes for temple, comfort for outdoor)
5. Live preview pane on the right showing how the published style guide will look
6. Publish toggle: when on, guide is accessible at /style-guide/[wedding-id]
7. <AIAssistButton /> per section with prompts like "Suggest color combinations for a Sangeet that pair well with our wedding palette" (stub)
8. Export to PDF for sharing
9. Save to item's decision fields: structured style guide schema with all event sub-sections

Commit: "feat(popout): attire style guide builder"
```

## Prompt 17 — Sangeet Run-of-Show Pop-Out

```
Build the bespoke pop-out for the "Build run-of-show with emcee" sangeet item. Template name: sangeet_run_of_show.

Requirements:
1. Vertical timeline as main view, time on left, items on right
2. Each item: time, duration, type (performance, speech, game, meal, transition, open dance), title, performer(s), song(s), notes
3. Drag to reorder, click to edit
4. Add item button opens a quick form
5. Performance items have sub-fields: choreographer, rehearsal status, music file upload, costume notes, props
6. Auto-calculate end times based on duration
7. Conflicts panel: warns about long stretches without breaks, performer back-to-back items, missing rehearsals
8. Export views: emcee script (formatted for printing), DJ cue sheet, performer call sheet
9. <AIAssistButton /> with prompt: "Draft an emcee script for the sangeet based on this run-of-show" (stub)
10. Comments thread per item for choreographers and performers
11. Final lock: when sangeet day approaches, lock the schedule
12. Save to item's decision fields: items array, lock status, last_modified

Commit: "feat(popout): sangeet run-of-show"
```

## Prompt 18 — Puja Samagri Tracker Pop-Out

```
Build the bespoke pop-out for the "Procure puja samagri" item. Template name: puja_samagri_tracker.

Requirements:
1. Visual checklist as main view: each samagri item is a card with photo, name (English + Sanskrit/Hindi), quantity needed, who's bringing it, status (need / sourced / packed / at venue)
2. Pre-populated with standard items: kalash, coconut, rice, haldi, kumkum, diya, ghee, wood, fruits, sweets, mangalsutra, sindoor, ring, silver/copper items, flowers, garlands
3. Add custom item button — couples can add tradition-specific items
4. Filter by: status, who's bringing, ceremony (some items are for ganesh puja, others for pheras)
5. Sourcing: each item can have a sourcing link, store, price, who paid
6. Packing checklist view: groups items by who's bringing them, generates a "to-pack" list per person
7. Day-of view: what needs to be at the mandap, what stays at home
8. Print: one-page visual checklist for the priest to verify
9. Photo upload per item so family members know what to look for
10. <AIAssistButton /> with prompt: "What samagri items are typically needed for a [tradition] wedding ceremony?" (stub)
11. Save to item's decision fields: items array with full sub-schema

Commit: "feat(popout): puja samagri tracker"
```

---

# Section D — Tier 2 Bespoke Pop-Outs (Prompts 19–35)

Medium-complexity items with custom needs.

## Prompt 19 — Monogram Designer

```
Build the bespoke pop-out for the "Choose wedding monogram/logo" item. Template name: monogram_designer.

Requirements:
1. Three sections via PopOutTabs: Style, Generate, Export.
2. **Style tab**: pick style direction (initials, mandala, peacock, paisley, lotus, modern minimal, royal crest), pick fonts, pick colors from wedding palette
3. **Generate tab**: <AIAssistButton /> generates SVG monogram concepts based on selections (stub — placeholder SVGs for now). Grid of generated options. Click to favorite.
4. **Export tab**: chosen monogram in multiple formats (SVG, PNG transparent, PNG white background, gold foil mockup), in multiple sizes for invites/website/welcome bags
5. Side-by-side: monogram on different backgrounds to test legibility
6. Save to item's decision fields: style_choices, generated_options, final_monogram_svg, export_assets

Commit: "feat(popout): monogram designer"
```

## Prompt 20 — Color Palette Builder

```
Build the bespoke pop-out for the "Pick primary color palette" item. Template name: color_palette.

Requirements:
1. Main view: large color swatches arranged as a poster
2. Add color: hex picker, name (e.g., "Deep Maroon," "Champagne Gold"), role (primary/secondary/accent/neutral)
3. Per-event palette tabs: Mehndi, Sangeet, Haldi, Wedding, Reception — each can have its own palette derived from the master
4. Inspiration upload: drop images and auto-extract dominant colors
5. <AIAssistButton /> with prompt: "Suggest a color palette for an Indian wedding inspired by [theme/season/aesthetic]" (stub)
6. Accessibility check: contrast ratios for any text-on-color combinations
7. Export: palette as PDF, as design tokens (CSS variables, JSON), shareable link for vendors
8. Save to item's decision fields: master_palette, event_palettes, inspiration_images

Commit: "feat(popout): color palette builder"
```

## Prompt 21 — Mood Board Builder

```
Build the bespoke pop-out for items that need visual inspiration boards (sangeet decor, mehndi setup, haldi setup, etc.). Template name: mood_board. Reusable across many items.

Requirements:
1. Use <PopOutMoodBoard /> as the main canvas
2. Multiple boards per item (e.g., "Mehndi setup" might have boards for floor seating, florals, color, lighting)
3. Drag images to rearrange, pinch to resize, double-click to add caption
4. Sources: upload, paste image URL, paste from Pinterest, screenshot
5. Tag each image with categories
6. Color extraction per image to feed into the palette pop-out
7. Share board: generate a shareable link for vendors
8. Export: PDF presentation of the board, image grid for vendor briefings
9. Comments thread for vendor feedback
10. Save to item's decision fields: boards array with images and metadata

Commit: "feat(popout): mood board builder"
```

## Prompt 22 — Vendor Comparison

```
Build the bespoke pop-out for items where comparing vendors is the main job. Template name: vendor_comparison. Used for items where multiple vendors are being evaluated before booking.

Requirements:
1. Side-by-side comparison table of 2-5 vendors
2. Rows are evaluation criteria — fully customizable, with sensible defaults per category (photographer vs caterer vs decorator have different criteria)
3. Each cell editable, supports text/number/rating (1-5 stars)/file
4. Weighted scoring: assign weights to criteria, auto-calculate weighted scores
5. Pros/cons section per vendor
6. Notes per vendor
7. Decision matrix view: which vendor wins on which criteria
8. "Convert to booking" button: takes the winning vendor and creates a vendor_booking item
9. Save to item's decision fields: vendors array, criteria, scores, decision

Commit: "feat(popout): vendor comparison"
```

## Prompt 23 — Jewelry Planner

```
Build the bespoke pop-out for the bride's jewelry items. Template name: jewelry_planner.

Requirements:
1. Body diagram of a bride showing jewelry placements: maang tikka, nath, earrings, necklace (short/long), choker, bangles, haath phool, rings, kamarbandh, payal, baajuband
2. Click a placement to add jewelry: type, material (kundan/polki/gold/diamond/temple), source (family heirloom / new purchase / rental), cost, status, photo
3. Per-event jewelry sets — different jewelry for mehndi vs wedding vs reception
4. Insurance tracker
5. Storage plan: where each piece is stored, who has access
6. Day-of checklist: what to wear when, who's responsible for handling
7. Family heirloom section with provenance notes
8. Photo gallery of all pieces
9. Total value calculator
10. Save to item's decision fields: pieces array with full sub-schema, per-event sets

Commit: "feat(popout): jewelry planner"
```

## Prompt 24 — Beauty Timeline

```
Build the bespoke pop-out for the bride's beauty regimen items. Template name: beauty_timeline.

Requirements:
1. Vertical timeline counting down from wedding date
2. Tracks: skincare, hair, body, nails, fitness, mental wellness
3. Each milestone: date, treatment, provider, cost, notes, completion status
4. Standard milestones pre-populated: 6mo facials start, 3mo hair treatment, 1mo final cut, 2wk no new products, 1wk hydration focus, 5d facial, 3d mehndi, day-of glam
5. Trial appointments tracked separately
6. Product list: what to use daily/weekly
7. <AIAssistButton /> with prompt: "Create a 6-month bridal beauty timeline for [skin type]" (stub)
8. Reminders integration: items can become calendar events (stub)
9. Photo log: weekly progress photos to track skin
10. Save to item's decision fields: timeline array, products, trials, photos

Commit: "feat(popout): beauty timeline"
```

## Prompt 25 — Mehndi Workspace

```
Build the bespoke pop-out for the "Mehndi Ceremony Planning" parent item. Template name: mehndi_workspace.

Requirements:
1. Five sections via PopOutTabs: Artists, Setup, Music, Menu, Logistics.
2. **Artists**: list of mehndi artists with portfolio, hourly rate, hours booked, total cost. Coverage calculator: 1 artist per 15-20 guests.
3. **Setup**: floor seating plan, cushions count, swings, floral installations, lighting plan, venue layout sketch
4. **Music**: playlist of geet, tappe, traditional songs; live singer booking
5. **Menu**: chaat stations, finger foods, beverages, lemon wedges and oil for mehndi setting
6. **Logistics**: bride's session start time, guest arrival window, food service times, dhol arrival, guest favors distribution
7. Bride's mehndi design upload: reference images, hidden initials/names, style preference (Rajasthani, Arabic, Indo-Arabic, modern)
8. Save to item's decision fields: full mehndi sub-schema

Commit: "feat(popout): mehndi workspace"
```

## Prompt 26 — Choreography Planner

```
Build the bespoke pop-out for the "Schedule choreography sessions" item. Template name: choreography_planner.

Requirements:
1. List of performances grouped by who's performing (bride's family, groom's family, friends, kids, couple)
2. Each performance: title, song(s), duration, performers list, choreographer, status (planning/learning/rehearsing/ready)
3. Rehearsal scheduler: dates, times, attendees, location
4. Music library: upload songs, mark cuts/edits needed
5. Costume notes per performance
6. Video upload: rehearsal videos, reference videos
7. Final order: drag-and-drop the show order (feeds into sangeet_run_of_show)
8. Performer roster: who's in which performance, conflicts, attendance tracking
9. Save to item's decision fields: performances array, rehearsal schedule, performer roster

Commit: "feat(popout): choreography planner"
```

## Prompt 27 — Baraat Planner

```
Build the bespoke pop-out for the "Baraat" items. Template name: baraat_planner.

Requirements:
1. Route view: map showing baraat start, route, venue arrival point
2. Vehicle selection: horse / elephant / vintage car / Rolls Royce / convertible — with photo, vendor, cost
3. Procession order: who walks where (groom on horse, family in front, friends behind, dhol leads)
4. Music: dhol player, baraat band, live musicians, song list
5. Special elements: nachaniyas, flag bearers, fire twirlers, LED dhols, sparklers
6. Timing: start time, expected duration, arrival window for milni
7. Logistics: who carries what (sehra, kalgi, garlands), backup vehicles, weather plan
8. Costume coordination for procession participants
9. Photography brief for the procession
10. Save to item's decision fields: route, vehicle, order, music, elements, timing

Commit: "feat(popout): baraat planner"
```

## Prompt 28 — Ceremony Program Builder

```
Build the bespoke pop-out for the "Ceremony programs explaining each ritual" item. Template name: ceremony_program_builder.

Requirements:
1. Visual editor that builds a printable program
2. Sections: cover, welcome message, ceremony order with ritual explanations, family acknowledgments, thank yous
3. Ritual library: pre-written explanations for baraat, milni, jaimala, ganesh puja, kanyadaan, pheras, saptapadi, sindoor, ashirwad, vidaai — editable
4. Add/remove rituals based on the couple's actual ceremony
5. Translation toggle: bilingual programs (English + Hindi/Sanskrit/regional)
6. Layout options: bifold, trifold, booklet, single card
7. Live preview as you edit
8. Print-ready PDF export with bleed marks
9. <AIAssistButton /> with prompt: "Write a guest-friendly explanation of [ritual name] for non-Indian attendees" (stub)
10. Save to item's decision fields: program structure, layout, language settings

Commit: "feat(popout): ceremony program builder"
```

## Prompt 29 — Catering Menu Builder

```
Build the bespoke pop-out for catering menu items (one per event). Template name: catering_menu_builder.

Requirements:
1. Menu builder by course: welcome drinks, appetizers, live stations, main course (veg/non-veg/jain), dals, breads, rice, accompaniments, chaat, desserts, paan, late-night snacks
2. Item library: searchable database of dishes, filter by cuisine (North Indian, South Indian, Indo-Chinese, Continental, regional), filter by dietary
3. Drag dishes into the menu
4. Per dish: notes, spice level, allergens, cost per head
5. Live stations with attendant cost
6. Dietary coverage check: ensures veg, vegan, jain, gluten-free, kid options are present
7. Cost calculator: per-head cost x guest count + service charges
8. Tasting notes section
9. Print: caterer's menu sheet, guest-facing menu card, allergen guide
10. <AIAssistButton /> with prompt: "Suggest a balanced [event] menu for [N] guests with these dietary requirements" (stub)
11. Save to item's decision fields: menu structure, costs, tasting notes

Commit: "feat(popout): catering menu builder"
```

## Prompt 30 — Bar Program

```
Build the bespoke pop-out for the bar planning items. Template name: bar_program.

Requirements:
1. Service style: open bar / limited / dry / cash / hosted-then-cash
2. Menu builder: wines, beers, spirits, cocktails, mocktails, non-alcoholic
3. Signature cocktails: name (tied to wedding brand), ingredients, recipe, garnish, glassware
4. Quantity calculator based on guest count, event duration, drinking patterns
5. Inventory tracker: what to buy, what to rent (glassware, ice, mixers)
6. Bartender booking: count, hours, hourly rate, tips
7. Bar setup diagram per event venue
8. Compliance: liquor license, insurance, age check policy
9. Cost calculator
10. Indian-specific: lassi bar, masala chai bar, fresh juice bar, paan bar
11. Save to item's decision fields: service style, menus, quantities, staffing, costs

Commit: "feat(popout): bar program"
```

## Prompt 31 — Decor & Florals Planner

```
Build the bespoke pop-out for decor items. Template name: decor_florals.

Requirements:
1. Per-event sub-tabs: each event has its own decor plan
2. Element checklist per event: stage, mandap, entrance, aisle, centerpieces, escort cards, signage, photo booth, ceiling, pathway, restrooms
3. Each element: design notes, vendor, cost, install time, breakdown time, photo references
4. Floral order sheet: flower types, quantities, colors, source, cost
5. Backup plan: weather contingency for outdoor elements
6. Vendor proposals: upload and review
7. Walkthrough scheduler: pre-event venue walkthrough with decorator
8. Save to item's decision fields: per-event decor plans

Commit: "feat(popout): decor and florals"
```

## Prompt 32 — Lighting Designer

```
Build the bespoke pop-out for the lighting items. Template name: lighting_designer.

Requirements:
1. Per-event lighting plans
2. Element checklist: uplighting, dance floor lights, fairy lights, pin spots, GOBO, candles, diyas, ceiling installations
3. Color and intensity per element
4. Vendor booking with quote
5. Power requirements check
6. Backup generator plan
7. Photographer coordination: lighting cues for key moments
8. Save to item's decision fields: per-event lighting plans

Commit: "feat(popout): lighting designer"
```

## Prompt 33 — Photography Shot List

```
Build the bespoke pop-out for the "Photography" items. Template name: photography_shot_list.

Requirements:
1. Shot list organized by event and moment
2. Pre-populated with must-have shots for Indian weddings: bridal portraits, getting ready, baraat arrival, milni, jaimala, individual ritual shots, family groupings, candid moments, vidaai
3. Add custom shots
4. Mark must-have vs nice-to-have
5. Family group shot list: every combination needed (bride's parents with bride, groom's family with both, grandparents, siblings)
6. Reference images per shot
7. Timing: when each shot will happen
8. Photographer brief: combine all into a printable PDF for the photographer
9. <AIAssistButton /> with prompt: "Suggest essential shots for a [tradition] wedding ceremony" (stub)
10. Save to item's decision fields: shots array per event

Commit: "feat(popout): photography shot list"
```

## Prompt 34 — Transportation Grid

```
Build the bespoke pop-out for transportation items. Template name: transportation_grid.

Requirements:
1. Grid view: rows are vehicles, columns are time slots across all event days
2. Vehicle types: shuttle, sedan, SUV, baraat vehicle, getaway car, airport pickup
3. Each booking: vehicle, driver, route, passenger list, departure time, arrival time, cost
4. Route visualizer on map
5. Capacity check: ensure all guests have transport
6. VIP routing: separate vehicles for elderly, immediate family
7. Driver contact sheet
8. Day-of dispatch view
9. Save to item's decision fields: vehicles array, schedule, routes

Commit: "feat(popout): transportation grid"
```

## Prompt 35 — Accommodation Blocks

```
Build the bespoke pop-out for hotel block items. Template name: accommodation_blocks.

Requirements:
1. Hotels list: each with name, distance from venue, price tier, rooms blocked, rooms booked, cutoff date
2. Room assignments: drag guests from guest list onto rooms
3. Room types: king, double, suite, family
4. Special assignments: bridal suite, getting-ready rooms, hospitality suite, family floors
5. Booking link generator
6. Cutoff alerts
7. Welcome bag delivery list per hotel
8. Check-in / check-out tracker
9. Save to item's decision fields: hotels array, assignments, special rooms

Commit: "feat(popout): accommodation blocks"
```

---

# Section E — Tier 3 Bespoke Pop-Outs (Prompts 36–50)

Specialized items.

## Prompt 36 — Stationery Suite Designer

```
Build the bespoke pop-out for the "Choose invitation designer" and related stationery items. Template name: stationery_suite.

Requirements:
1. Suite components: save-the-date, main invite, RSVP card, accommodation insert, travel insert, dress code insert, kids policy insert, registry insert
2. Per-component editor: design notes, copy, language, paper stock, print method, quantity, cost
3. Master copy library: shared text across pieces (couple names, parents, dates, venues)
4. Proof tracker: upload proofs from designer, mark approved or revisions needed
5. Print order tracker: quantity, vendor, lead time, cost, delivery date
6. Mailing list integration with guest list
7. Postage calculator
8. International mailing alerts
9. Save to item's decision fields: full suite spec

Commit: "feat(popout): stationery suite designer"
```

## Prompt 37 — Welcome Bag Builder

```
Build the bespoke pop-out for the welcome bag items. Template name: welcome_bag_builder.

Requirements:
1. Bag contents checklist: itinerary, map, water, snacks, survival kit, welcome note, local specialty, hashtag card
2. Per-item: vendor, quantity, cost per bag, photo
3. Total cost per bag x bag count
4. Bag styles: tote, box, basket — with monogram options
5. Distribution plan: which hotels, room delivery vs front desk
6. Welcome note editor with rich text
7. Map editor: highlight key venues and recommendations
8. Print-ready files for itinerary card and welcome note
9. Save to item's decision fields: contents array, distribution plan

Commit: "feat(popout): welcome bag builder"
```

## Prompt 38 — Registry Manager

```
Build the bespoke pop-out for the registry items. Template name: registry_manager.

Requirements:
1. Multi-registry support: Crate & Barrel, Amazon, Zola, honeymoon fund, charity
2. Add registry: name, link, logo
3. Item tracker: items added, items received, who gave what
4. Thank you note status per gift
5. Wishlist editor: target price points distribution
6. Public registry page: shareable URL
7. Honeymoon fund: contribution tracker, milestones
8. Save to item's decision fields: registries array, gifts received, thank you log

Commit: "feat(popout): registry manager"
```

## Prompt 39 — Honeymoon Planner

```
Build the bespoke pop-out for honeymoon items. Template name: honeymoon_planner.

Requirements:
1. Destination shortlist with comparison
2. Itinerary builder by day
3. Flight tracker: confirmation, dates, seats, frequent flyer
4. Accommodation: hotels per stop, confirmations, rates
5. Activity bookings: tours, restaurants, experiences
6. Packing list
7. Documents: passports, visas, insurance, vaccinations
8. Budget tracker
9. Currency and language notes
10. Save to item's decision fields: full honeymoon sub-schema

Commit: "feat(popout): honeymoon planner"
```

## Prompt 40 — Vidaai Planner

```
Build the bespoke pop-out for the vidaai item. Template name: vidaai_planner.

Requirements:
1. Timing: when in the event flow
2. Location: where it happens
3. Participants: who walks the bride out
4. Traditional elements: rice throwing, doli, car decoration
5. Music: traditional vidaai songs
6. Bride's farewell outfit (often different from wedding attire)
7. Emotional preparation notes
8. Photography brief for the moment
9. Save to item's decision fields: vidaai spec

Commit: "feat(popout): vidaai planner"
```

## Prompt 41 — Reception Planner

```
Build the bespoke pop-out for the "Reception Planning" parent item. Template name: reception_planner.

Requirements:
1. Run-of-show: grand entrance, first dance, speeches, cake cutting, dinner, open dance floor, send-off
2. Each moment with timing and details
3. Outfit change tracker: what bride/groom wear for reception
4. Music: first dance song, parent dances, playlist
5. Speeches: who speaks, order, duration, draft notes
6. Cake details: vendor, design, flavors, delivery
7. Send-off concept: sparklers, petals, cars
8. Save to item's decision fields: reception sub-schema

Commit: "feat(popout): reception planner"
```

## Prompt 42 — Haldi Planner

```
Build the bespoke pop-out for the haldi items. Template name: haldi_planner.

Requirements:
1. Paste recipe: turmeric, sandalwood, rose water, milk, oil — quantities
2. Setup: plastic sheets, towels, old clothes
3. Order of application: who applies first, then in what order
4. Music: traditional folk songs
5. Flower shower concept
6. Photography brief
7. Cleanup plan
8. Menu (light, traditional)
9. Save to item's decision fields: haldi spec

Commit: "feat(popout): haldi planner"
```

## Prompt 43 — Gift Tracker

```
Build the bespoke pop-out for the gift items (gifts to give and receive). Template name: gift_tracker.

Requirements:
1. Two views: gifts giving, gifts receiving
2. Giving: list of gifts to give (parents, siblings, bridal party, partner, priest, vendors), each with description, source, cost, status, when to give
3. Receiving: gifts received, from whom, thank you note status
4. Shagun envelopes: who needs an envelope, amount
5. Tip envelopes: vendor tipping plan
6. Total spend on gifts
7. Save to item's decision fields: giving array, receiving array

Commit: "feat(popout): gift tracker"
```

## Prompt 44 — Speech Planner

```
Build the bespoke pop-out for speech items. Template name: speech_planner.

Requirements:
1. List of speakers: parents (both sides), siblings, best man, maid of honor, friends, couple
2. Per speech: speaker, event, slot, duration, draft text, status (not started / drafting / reviewed / final)
3. Speech writer/editor
4. <AIAssistButton /> with prompt: "Help me write a [type] speech for [event], [tone], [duration]" (stub)
5. Speaker prep notes
6. Practice scheduler
7. Save to item's decision fields: speeches array

Commit: "feat(popout): speech planner"
```

## Prompt 45 — Music Library

```
Build the bespoke pop-out for music items. Template name: music_library.

Requirements:
1. Master library of all songs across all events
2. Per song: title, artist, event, moment, duration, file (upload), notes
3. Tag system: genre, mood, language, traditional/modern
4. DJ export: cue sheet for the DJ
5. Do-not-play list
6. Live musician set lists
7. Karaoke list for sangeet
8. Save to item's decision fields: songs array

Commit: "feat(popout): music library"
```

## Prompt 46 — Dress Code Builder

```
Build the bespoke pop-out for the per-event dress code items. Template name: dress_code_builder.

Requirements:
1. Quick decision: formal / semi-formal / festive / traditional / theme
2. Color recommendations
3. What to avoid
4. Cultural notes for non-Indian guests
5. Image references
6. Auto-publishes to the attire style guide
7. Save to item's decision fields: dress code spec per event

Commit: "feat(popout): dress code builder"
```

## Prompt 47 — Rehearsal Planner

```
Build the bespoke pop-out for ceremony rehearsal items. Template name: rehearsal_planner.

Requirements:
1. Rehearsal date, time, location
2. Attendees: priest, couple, parents, siblings, bridal party
3. Walkthrough sequence: arrival, processional order, ceremony movements, recessional
4. Notes per ritual
5. Rehearsal dinner planning (separate from rehearsal itself)
6. Save to item's decision fields: rehearsal spec

Commit: "feat(popout): rehearsal planner"
```

## Prompt 48 — Day-of Emergency Kit

```
Build the bespoke pop-out for the "Pack emergency kit" item. Template name: day_of_emergency_kit.

Requirements:
1. Comprehensive checklist organized by category: sewing, beauty, medical, snacks, tech, ceremony backup, weather
2. Pre-populated with 100+ standard items (safety pins, double-sided tape, stain remover, deodorant, hairspray, bobby pins, lipstick, blotting papers, Advil, Band-Aids, tissues, mints, granola bars, water, phone chargers, extra cash, copies of contracts, backup rings, backup mangalsutra, umbrellas, fans, sunscreen)
3. Add custom items
4. Pack assignments: who carries what
5. Print: one-page checklist
6. Save to item's decision fields: kit contents

Commit: "feat(popout): day-of emergency kit"
```

## Prompt 49 — Thank You Tracker

```
Build the bespoke pop-out for the thank you note item. Template name: thank_you_tracker.

Requirements:
1. List of all gifts received
2. Per gift: giver, gift, value (optional), thank you status, sent date
3. Bulk note generator with personalization
4. <AIAssistButton /> with prompt: "Draft a thank you note for [giver] who gave [gift]" (stub)
5. Print-ready output
6. Address verification from guest list
7. Save to item's decision fields: notes array, send tracking

Commit: "feat(popout): thank you tracker"
```

## Prompt 50 — Tradition Profile Picker

```
Build the bespoke pop-out for the "Decide on tradition profile" item. Template name: tradition_profile_picker.

Requirements:
1. List of traditions: North Indian Hindu, Punjabi Sikh, Gujarati, Marwari, Tamil Brahmin, Tamil Iyer, Tamil Iyengar, Telugu, Malayali, Bengali, Kashmiri, Sindhi, Jain, Marathi, Konkani, interfaith
2. Multi-select for couples blending traditions
3. Per tradition: short description, key rituals, typical events, attire notes
4. Selection drives the rest of the checklist: items get filtered/added based on tradition
5. Custom traditions: add your own
6. Save to item's decision fields: selected traditions, custom additions
7. CRITICAL: this pop-out updates the global tradition_profile_tags filter applied to the entire checklist

Commit: "feat(popout): tradition profile picker"
```

---

# Section F — Final Polish & Integration (Prompts 51–55)

## Prompt 51 — Family Role Assigner

```
Build the bespoke pop-out for the "Identify key decision-makers" and "Assign family point people" items. Template name: family_role_assigner.

Requirements:
1. Family tree visualization
2. Roles list: kanyadaan performer, mama (uncle), mami, chacha, chachi, primary decision-maker per side, financial point, logistics point, ceremony participant
3. Drag people from guest list into role slots
4. Each role has a description and responsibilities
5. Contact sheet export
6. Save to item's decision fields: role assignments

Commit: "feat(popout): family role assigner"
```

## Prompt 52 — Tip Envelope Planner

```
Build the bespoke pop-out for the "Pre-pay tips" item. Template name: tip_envelope_planner.

Requirements:
1. Auto-pull list of all vendors and service staff from across the checklist
2. Per recipient: suggested tip amount, actual amount, envelope label, who delivers, when
3. Tipping etiquette guide for Indian weddings
4. Total tip budget calculator
5. Print: envelope labels
6. Save to item's decision fields: tip plan

Commit: "feat(popout): tip envelope planner"
```

## Prompt 53 — Contract Manager

```
Build the bespoke pop-out for contract-heavy items. Template name: contract_manager.

Requirements:
1. Vendor contract repository
2. Per contract: vendor, upload, key terms (extracted manually for now), signed status, deposit paid, balance due dates, cancellation terms
3. Calendar of payment due dates
4. Alert system for upcoming payments
5. <AIAssistButton /> with prompt: "Review this contract for any concerning terms" (stub)
6. Save to item's decision fields: contracts array

Commit: "feat(popout): contract manager"
```

## Prompt 54 — Cross-Module Sync & Module Deep Links

```
Wire up the bidirectional sync between the checklist and other Ananya modules. This is the cockpit pattern from the original architecture conversation.

Requirements:
1. For each pop-out template, define which Ananya module(s) it syncs with:
   - guest_list_manager → Guest Management module
   - seating_chart → Venue & Room Assignments
   - vendor_booking → Vendors module (if exists) or stays in checklist
   - mehndi_workspace → Mehndi Workspace module
   - sangeet_run_of_show → Entertainment Workspace
   - transportation_grid → Transportation & Logistics
   - accommodation_blocks → Venue & Room Assignments
   - stationery_suite → Stationery & Invitations
   - All event timelines → Master Timeline
2. When data is updated in a checklist pop-out, write to the corresponding module's data store
3. When data is updated in a module, mark the corresponding checklist item as in_progress or done as appropriate
4. Add "Open in [Module]" buttons that deep-link from the pop-out to the full module workspace
5. Add "Quick Decide" buttons in modules that link back to the simpler checklist pop-out for fast decisions
6. Build a sync status indicator: shows when data is flowing between checklist and modules
7. For now, mock the module stores if they don't exist yet — the pattern matters more than the actual modules being built

Commit: "feat(checklist): cross-module sync and deep links"
```

## Prompt 55 — Final Polish, AI Wiring, and Quality Pass

```
Final pass on the entire Ananya checklist module. Goal: ship-ready quality.

Requirements:
1. AI integration: replace all <AIAssistButton /> stubs with real Anthropic API calls. Use claude-sonnet-4-6. Each call should pass the relevant context (item details, related items, wedding details). Cache responses to avoid redundant calls.
2. PDF export polish: every pop-out should produce a beautifully formatted PDF. Use the editorial design system. Test all 45 templates' export.
3. Empty states: every pop-out should have thoughtful empty states — never a blank screen.
4. Loading states: skeleton loaders that match each pop-out's specific layout.
5. Error states: graceful error messages with retry actions.
6. Keyboard shortcuts: full keyboard navigation across all pop-outs. Cmd+K command palette that searches items, decisions, vendors, guests.
7. Accessibility audit: WCAG AA compliance, screen reader testing, focus management.
8. Performance: pop-outs should open in <100ms. Lazy-load heavy components (mood boards, seating charts).
9. Mobile responsive: pop-outs should work on tablets at minimum (iPad-sized). Phone is best-effort.
10. Bug sweep: click through every pop-out, every interaction, every edge case.
11. Visual QA: take screenshots of all 45 pop-outs and review for consistency. Fix any that drift from the editorial aesthetic.
12. Documentation: update /components/popout/README.md with the final list of templates and their purposes.
13. Run `npm run build`, fix all errors and warnings.

Take a final pass with fresh eyes: does this feel like the most sophisticated wedding planning product on the market, or does it feel like a generic checklist app with custom forms? Be ruthlessly honest. Identify the 5 biggest issues and fix them before declaring done.

Commit: "feat(checklist): final polish, AI wiring, and quality pass"
```

---

# Build Order Summary

| # | Prompt | Section | Est. Complexity |
|---|--------|---------|-----------------|
| 1 | Foundation & Design System | A | Medium |
| 2 | Data Model & Seed Data | A | Medium |
| 3 | Phase Navigation & Item List | A | Medium |
| 4 | Generic Pop-Out | A | Medium |
| 5 | Progress, Filters, Polish | A | Low |
| 6 | Cross-Cutting Infrastructure | B | High |
| 7 | Layout Primitives | B | Medium |
| 8 | Pop-Out Router & Registry | B | Low |
| 9 | Hashtag Picker | C | Medium |
| 10 | Vendor Booking | C | High |
| 11 | Guest List Manager | C | High |
| 12 | Seating Chart | C | High |
| 13 | Budget Allocator | C | High |
| 14 | Muhurat Picker | C | Medium |
| 15 | Mandap Designer | C | High |
| 16 | Attire Style Guide | C | High |
| 17 | Sangeet Run-of-Show | C | High |
| 18 | Puja Samagri Tracker | C | Medium |
| 19 | Monogram Designer | D | Medium |
| 20 | Color Palette Builder | D | Medium |
| 21 | Mood Board Builder | D | Medium |
| 22 | Vendor Comparison | D | Medium |
| 23 | Jewelry Planner | D | High |
| 24 | Beauty Timeline | D | Medium |
| 25 | Mehndi Workspace | D | High |
| 26 | Choreography Planner | D | Medium |
| 27 | Baraat Planner | D | Medium |
| 28 | Ceremony Program Builder | D | High |
| 29 | Catering Menu Builder | D | High |
| 30 | Bar Program | D | Medium |
| 31 | Decor & Florals | D | High |
| 32 | Lighting Designer | D | Medium |
| 33 | Photography Shot List | D | Medium |
| 34 | Transportation Grid | D | High |
| 35 | Accommodation Blocks | D | Medium |
| 36 | Stationery Suite | E | High |
| 37 | Welcome Bag Builder | E | Medium |
| 38 | Registry Manager | E | Medium |
| 39 | Honeymoon Planner | E | Medium |
| 40 | Vidaai Planner | E | Low |
| 41 | Reception Planner | E | Medium |
| 42 | Haldi Planner | E | Low |
| 43 | Gift Tracker | E | Medium |
| 44 | Speech Planner | E | Medium |
| 45 | Music Library | E | Medium |
| 46 | Dress Code Builder | E | Low |
| 47 | Rehearsal Planner | E | Low |
| 48 | Day-of Emergency Kit | E | Low |
| 49 | Thank You Tracker | E | Low |
| 50 | Tradition Profile Picker | E | Medium |
| 51 | Family Role Assigner | F | Medium |
| 52 | Tip Envelope Planner | F | Low |
| 53 | Contract Manager | F | Medium |
| 54 | Cross-Module Sync | F | High |
| 55 | Final Polish & AI Wiring | F | High |

**Realistic timeline**: At Claude Code's pace with a developer reviewing each commit, expect 3–5 prompts per working day for medium-complexity ones, 1–2 per day for high-complexity ones. Full build is roughly 3–4 weeks of focused work.

**Do not skip review between prompts.** The temptation will be strong; resist it. Each pop-out is an independent surface and bugs compound.
