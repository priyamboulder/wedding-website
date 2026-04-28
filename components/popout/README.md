# Pop-Out Layout Primitives

Reusable layout components that every bespoke pop-out in the Ananya checklist composes from. These ensure visual consistency across all 45+ pop-outs while keeping each bespoke pop-out focused on its domain logic.

## Design tokens used

| Token | Value | Usage |
|-------|-------|-------|
| `font-serif` | Fraunces | Section titles, tab labels, card titles |
| `font-sans` | Inter | Body text, inputs, helper text |
| `gold` / `gold-light` / `gold-pale` | `#B8860B` / `#D4A843` / `#F0E4C8` | Active states, rules, accents |
| `ivory-warm` | `#F5F1E8` | Input backgrounds, hover states |
| `ink-soft` / `ink-muted` / `ink-faint` | `#2E2E2E` / `#6B6B6B` / `#A3A3A3` | Text hierarchy |
| `border` | `rgba(26,26,26,0.08)` | Subtle dividers |

---

## Components

### `<PopOutShell />`

Wraps every pop-out. Provides header (breadcrumb, status, action buttons), scrollable body with editorial padding, footer (save state, last edited), Escape handling, and focus trap.

```tsx
import { PopOutShell } from "@/components/popout";

<PopOutShell
  breadcrumbs={[
    { label: "Pre-Wedding", onClick: () => goBack() },
    { label: "Venue Selection" },
  ]}
  status={<StatusBadge status="in_progress" />}
  actions={[
    { icon: <Download size={15} />, label: "Export", onClick: handleExport },
  ]}
  lastEdited="2 hours ago"
  saveState="saved"
  onClose={() => setSelectedItem(null)}
  shortcuts={{ "mod+enter": () => markDone() }}
>
  {/* pop-out body */}
</PopOutShell>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `breadcrumbs` | `{ label, onClick? }[]` | required | Navigation path |
| `status` | `ReactNode` | — | Badge beside breadcrumbs |
| `actions` | `{ icon, label, onClick }[]` | `[]` | Header buttons (first 2 inline, rest in overflow menu) |
| `lastEdited` | `string` | — | Footer timestamp |
| `saveState` | `"saved" \| "saving" \| "unsaved"` | — | Footer save indicator |
| `onClose` | `() => void` | required | Close handler (also Escape) |
| `shortcuts` | `Record<string, (e) => void>` | `{}` | Extra keyboard shortcuts (`"mod+enter"`, `"mod+shift+s"`) |

---

### `<PopOutSection />`

A labeled section with Fraunces title, optional icon, optional helper text, and gold rule below the title.

```tsx
import { PopOutSection } from "@/components/popout";
import { MapPin } from "lucide-react";

<PopOutSection
  title="Venue Details"
  icon={<MapPin size={14} />}
  helperText="Primary ceremony and reception location"
>
  <p>Content goes here</p>
</PopOutSection>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | required | Section heading (Fraunces) |
| `icon` | `ReactNode` | — | Icon before the title |
| `helperText` | `string` | — | Muted helper below title |
| `noRule` | `boolean` | `false` | Hide the gold gradient rule |

---

### `<PopOutSplit />`

Two-column layout for pop-outs that need side-by-side panels. Stacks to single column on mobile.

```tsx
import { PopOutSplit } from "@/components/popout";

<PopOutSplit
  ratio="2:1"
  gap="lg"
  left={<MoodBoardPanel />}
  right={<NotesPanel />}
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `left` | `ReactNode` | required | Left panel content |
| `right` | `ReactNode` | required | Right panel content |
| `ratio` | `"1:1" \| "2:1" \| "1:2" \| "3:2" \| "2:3"` | `"1:1"` | Column ratio |
| `gap` | `"sm" \| "md" \| "lg"` | `"md"` | Gap between panels |

---

### `<PopOutTabs />`

Editorial tabs with a thin gold underline for the active tab. Supports controlled and uncontrolled modes.

```tsx
import { PopOutTabs } from "@/components/popout";
import { Palette, FileText } from "lucide-react";

<PopOutTabs
  tabs={[
    { id: "mood", label: "Mood Board", icon: <Palette size={14} />, content: <MoodBoard /> },
    { id: "notes", label: "Notes", icon: <FileText size={14} />, content: <Notes /> },
  ]}
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | `{ id, label, icon?, content }[]` | required | Tab definitions |
| `activeTab` | `string` | — | Controlled active tab ID |
| `onTabChange` | `(id: string) => void` | — | Tab change callback |

---

### `<PopOutGrid />`

Responsive grid for cards. Stacks to single column on mobile.

```tsx
import { PopOutGrid, PopOutCard } from "@/components/popout";

<PopOutGrid cols={3} gap="md">
  <PopOutCard title="Option A" interactive onClick={() => select("a")}>
    <p className="text-sm text-ink-muted">Description here</p>
  </PopOutCard>
  <PopOutCard title="Option B" interactive onClick={() => select("b")}>
    <p className="text-sm text-ink-muted">Description here</p>
  </PopOutCard>
</PopOutGrid>
```

**Props (Grid):**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cols` | `2 \| 3 \| 4` | `3` | Number of columns |
| `gap` | `"sm" \| "md" \| "lg"` | `"md"` | Grid gap |

---

### `<PopOutCard />`

Base card with ivory background, subtle border, optional hover state with lift effect.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | Card heading (Fraunces) |
| `interactive` | `boolean` | `false` | Enable hover lift + pointer |
| `onClick` | `() => void` | — | Click handler (also makes interactive) |

---

### `<PopOutEmpty />`

Empty state for sub-sections. Centers an illustration, title, description, and optional CTA button.

```tsx
import { PopOutEmpty } from "@/components/popout";
import { Camera, Plus } from "lucide-react";

<PopOutEmpty
  illustration={<Camera size={32} strokeWidth={1} />}
  title="No photos yet"
  body="Upload inspiration photos for your photographer to reference."
  action={{
    label: "Add Photos",
    icon: <Plus size={14} />,
    onClick: () => setUploading(true),
  }}
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `illustration` | `ReactNode` | — | Icon or SVG illustration |
| `title` | `string` | required | Empty state heading |
| `body` | `string` | — | Descriptive text |
| `action` | `{ label, onClick, icon? }` | — | CTA button |

---

### `<PopOutInlineEdit />`

Click-to-edit field that looks like static text until clicked. Supports text, number, date, and textarea.

```tsx
import { PopOutInlineEdit } from "@/components/popout";

<PopOutInlineEdit
  value={venue.name}
  onChange={(name) => updateVenue({ name })}
  placeholder="Enter venue name"
  type="text"
/>

<PopOutInlineEdit
  value={venue.capacity}
  onChange={(cap) => updateVenue({ capacity: cap })}
  type="number"
  format={(v) => `${v} guests`}
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | required | Current value |
| `onChange` | `(value: string) => void` | required | Value change handler |
| `placeholder` | `string` | `"Click to edit…"` | Placeholder text |
| `type` | `"text" \| "number" \| "date" \| "textarea"` | `"text"` | Input type |
| `format` | `(value: string) => string` | — | Display formatter for static view |

**Keyboard:** Enter commits (Cmd+Enter for textarea), Escape cancels.

---

### `<PopOutTagInput />`

Tag input with auto-complete suggestions. Used for tradition profiles, dietary restrictions, vendor tags, etc.

```tsx
import { PopOutTagInput } from "@/components/popout";

<PopOutTagInput
  tags={item.traditions}
  onChange={(traditions) => updateItem({ traditions })}
  suggestions={["Haldi", "Mehndi", "Sangeet", "Baraat", "Pheras", "Vidaai"]}
  placeholder="Add tradition…"
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tags` | `string[]` | required | Current tags |
| `onChange` | `(tags: string[]) => void` | required | Tags change handler |
| `suggestions` | `string[]` | `[]` | Auto-complete suggestions |
| `placeholder` | `string` | `"Add tag…"` | Input placeholder |

**Keyboard:** Enter adds tag (or selects highlighted suggestion), Backspace removes last tag, Arrow keys navigate suggestions, Escape closes dropdown.

---

### `<PopOutMoodBoard />`

Drag-and-drop image grid with masonry-like layout. Used by mood board pop-outs for visual inspiration.

```tsx
import { PopOutMoodBoard } from "@/components/popout";

<PopOutMoodBoard
  images={moodImages}
  onAdd={(files) => uploadImages(files)}
  onRemove={(id) => removeImage(id)}
  onReorder={(reordered) => setMoodImages(reordered)}
  maxImages={12}
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `images` | `{ id, url, alt? }[]` | required | Current images |
| `onAdd` | `(files: File[]) => void` | required | New file(s) selected/dropped |
| `onRemove` | `(id: string) => void` | required | Remove an image |
| `onReorder` | `(images[]) => void` | — | Drag reorder callback |
| `maxImages` | `number` | `20` | Maximum image count |

**Features:**
- Drag files from desktop to add images
- Drag images within the grid to reorder (when `onReorder` provided)
- Masonry-like layout: every 5th image spans 2 columns
- Hover overlay with delete button

---

## Composition Example

A typical bespoke pop-out composes these primitives:

```tsx
import {
  PopOutShell,
  PopOutTabs,
  PopOutSection,
  PopOutSplit,
  PopOutInlineEdit,
  PopOutTagInput,
  PopOutMoodBoard,
  PopOutEmpty,
  CommentThread,
} from "@/components/popout";

export function VenuePopOut({ item, phase, onClose }) {
  return (
    <PopOutShell
      breadcrumbs={[{ label: phase.title }, { label: item.title }]}
      onClose={onClose}
      saveState="saved"
      lastEdited="3 hours ago"
    >
      <div className="space-y-6">
        <PopOutSection title="Venue Name" icon={<MapPin size={14} />}>
          <PopOutInlineEdit
            value={item.venueName}
            onChange={(v) => update({ venueName: v })}
          />
        </PopOutSection>

        <PopOutTabs
          tabs={[
            {
              id: "mood",
              label: "Mood Board",
              content: (
                <PopOutMoodBoard
                  images={images}
                  onAdd={handleAdd}
                  onRemove={handleRemove}
                />
              ),
            },
            {
              id: "details",
              label: "Details",
              content: (
                <PopOutSplit
                  ratio="2:1"
                  left={<VenueDetails />}
                  right={
                    <PopOutSection title="Tags">
                      <PopOutTagInput
                        tags={item.tags}
                        onChange={(tags) => update({ tags })}
                      />
                    </PopOutSection>
                  }
                />
              ),
            },
          ]}
        />

        <PopOutSection title="Correspondence" icon={<MessageSquare size={14} />}>
          <CommentThread entityType="item" entityId={item.id} />
        </PopOutSection>
      </div>
    </PopOutShell>
  );
}
```
