// ── One Look blob storage (IndexedDB) ─────────────────────────────────────
// Audio/video recordings are too big for localStorage. We keep the Blobs in
// IndexedDB and reference them by key from the Zustand review record.
//
// API is a tiny subset of get/put/delete + "resolve to object URL" helper.
// Object URLs are created lazily on read and cached in memory for the lifetime
// of the page — when the page unloads the URLs are revoked automatically.

const DB_NAME = "ananya-one-look";
const STORE_BLOBS = "blobs";
const VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB not available"));
  }
  if (!dbPromise) {
    dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_BLOBS)) {
          db.createObjectStore(STORE_BLOBS);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error ?? new Error("IDB open failed"));
    });
  }
  return dbPromise;
}

function randomKey(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export async function putBlob(
  prefix: "audio" | "video",
  blob: Blob,
): Promise<string> {
  const db = await openDb();
  const key = randomKey(prefix);
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_BLOBS, "readwrite");
    tx.objectStore(STORE_BLOBS).put(blob, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IDB put failed"));
  });
  return key;
}

export async function getBlob(key: string): Promise<Blob | null> {
  const db = await openDb();
  return new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(STORE_BLOBS, "readonly");
    const req = tx.objectStore(STORE_BLOBS).get(key);
    req.onsuccess = () =>
      resolve((req.result as Blob | undefined) ?? null);
    req.onerror = () => reject(req.error ?? new Error("IDB get failed"));
  });
}

export async function deleteBlob(key: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_BLOBS, "readwrite");
    tx.objectStore(STORE_BLOBS).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IDB delete failed"));
  });
}

// ── Object URL cache ──
// Once we've resolved a blobKey to an object URL, hold onto it so multiple
// components playing the same recording share a single URL and don't have
// to hit IndexedDB repeatedly. Cleared on page unload.

const urlCache = new Map<string, string>();

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    urlCache.forEach((url) => URL.revokeObjectURL(url));
    urlCache.clear();
  });
}

export async function resolveBlobUrl(
  blobKey: string | null,
): Promise<string | null> {
  if (!blobKey) return null;
  const cached = urlCache.get(blobKey);
  if (cached) return cached;
  const blob = await getBlob(blobKey);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  urlCache.set(blobKey, url);
  return url;
}

export function revokeBlobUrl(blobKey: string): void {
  const url = urlCache.get(blobKey);
  if (url) {
    URL.revokeObjectURL(url);
    urlCache.delete(blobKey);
  }
}
