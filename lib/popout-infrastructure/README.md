# Pop-out Infrastructure

Shared components and utilities that every bespoke pop-out in the Ananya checklist uses. Import from these modules rather than building one-off solutions.

---

## 1. File Uploads

### `<FileUploader />`

Drag-and-drop + click-to-browse multi-file uploader. Validates mime types and size (10 MB max). Uploads to `/api/upload` which writes to `/public/uploads/`.

```tsx
import { FileUploader } from "@/components/popout/FileUploader";

<FileUploader
  entityId={item.id}
  onUpload={(files) => console.log("Uploaded:", files)}
/>
```

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `entityId` | `string` | Groups uploaded files by entity |
| `onUpload` | `(files: UploadedFile[]) => void` | Optional callback after successful upload |
| `className` | `string` | Optional wrapper class |

### `<FileGallery />`

Displays uploaded files for an entity in a responsive grid with thumbnails. Hover to reveal a delete button. Renders nothing if no files exist.

```tsx
import { FileGallery } from "@/components/popout/FileGallery";

<FileGallery entityId={item.id} />
```

### Uploads Store

```tsx
import { useUploadsStore } from "@/stores/uploads-store";

const files = useUploadsStore((s) => s.getFiles(entityId));
const addFile = useUploadsStore((s) => s.addFile);
const removeFile = useUploadsStore((s) => s.removeFile);
```

---

## 2. Comments / Threads

### `<CommentThread />`

Attaches a comment thread to any entity. Supports one level of reply nesting, @mentions (highlighted in gold), and delete.

```tsx
import { CommentThread } from "@/components/popout/CommentThread";

<CommentThread
  entityType="item"        // "item" | "decision" | "sub-decision"
  entityId={item.id}
  author="Ananya"          // defaults to "You"
/>
```

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `entityType` | `CommentEntityType` | What this thread is attached to |
| `entityId` | `string` | The specific entity ID |
| `author` | `string` | Display name for new comments (default: "You") |
| `className` | `string` | Optional wrapper class |

### Comments Store

```tsx
import { useCommentsStore } from "@/stores/comments-store";

const topLevel = useCommentsStore((s) => s.getTopLevel("item", itemId));
const replies = useCommentsStore((s) => s.getReplies(commentId));
const addComment = useCommentsStore((s) => s.addComment);
```

---

## 3. AI Assistance

### `<AIAssistButton />`

Gold sparkle button that opens a popover with prompt input, generation, and accept/regenerate/edit actions. Calls `/api/ai-assist` (currently stubbed).

```tsx
import { AIAssistButton } from "@/components/popout/AIAssistButton";

<AIAssistButton
  contextPrompt="You are helping plan a Haldi ceremony for an Indian wedding..."
  entityId={item.id}
  onAccept={(content) => {
    // Use the generated content (e.g., set a field value)
    updateItem(item.id, { notes: content });
  }}
/>
```

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `contextPrompt` | `string` | System prompt context for the AI (pass domain-specific instructions) |
| `entityId` | `string` | Entity ID for tracking |
| `onAccept` | `(content: string) => void` | Called when user clicks "Use this" (or accepts edited version) |
| `className` | `string` | Optional wrapper class |

### API Route (`/api/ai-assist`)

Currently returns stub responses. To integrate with Anthropic:

1. Install `@anthropic-ai/sdk`
2. Set `ANTHROPIC_API_KEY` in `.env.local`
3. Replace the stub in `app/api/ai-assist/route.ts` with a real API call using `claude-sonnet-4-6`

---

## 4. PDF Export

### `exportToPDF(item, options)`

Generates a beautifully formatted PDF of a checklist item using jsPDF. Returns a `Blob`.

```tsx
import { exportToPDF } from "@/lib/popout-infrastructure/pdf-export";

const blob = await exportToPDF(item, {
  includeDecisions: true,
  includeNotes: true,
  includeComments: false,
  includeAttachments: false,
});
```

### `<ExportButton />`

Drop-in button for the pop-out header. Handles download automatically.

```tsx
import { ExportButton } from "@/components/popout/ExportButton";

<ExportButton item={item} />
```

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `item` | `ChecklistItem` | The item to export |
| `options` | `Partial<PDFExportOptions>` | Override default export options |
| `className` | `string` | Optional wrapper class |

---

## Types

All shared types live in `@/types/popout-infrastructure`. Key exports:

- `UploadedFile` — file metadata returned by the upload API
- `Comment` — comment with author, body, mentions, threading
- `CommentEntityType` — `"item" | "decision" | "sub-decision"`
- `AIAssistRequest` / `AIAssistResponse` — API contract
- `PDFExportOptions` / `DEFAULT_PDF_OPTIONS` — export configuration

---

## File Map

```
components/popout/
  FileUploader.tsx      — drag-and-drop uploader + FileThumbnail
  FileGallery.tsx       — grid display with hover-to-delete
  CommentThread.tsx     — threaded comments with @mentions
  AIAssistButton.tsx    — AI generation popover
  ExportButton.tsx      — PDF download button

stores/
  uploads-store.ts      — Zustand store for file uploads
  comments-store.ts     — Zustand store for comments

lib/popout-infrastructure/
  pdf-export.ts         — jsPDF export function
  README.md             — this file

types/
  popout-infrastructure.ts — all shared types

app/api/
  upload/route.ts       — file upload endpoint
  ai-assist/route.ts    — AI generation endpoint (stubbed)
```
