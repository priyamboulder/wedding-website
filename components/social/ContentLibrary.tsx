"use client";

import { useState } from "react";
import { useSocialData } from "@/lib/social/SocialDataContext";
import type { SocialContentItem } from "@/lib/social/types";
import ContentCard from "./ContentCard";
import AddContentModal from "./AddContentModal";

export default function ContentLibrary() {
  const { contentItems } = useSocialData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SocialContentItem | null>(null);

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (item: SocialContentItem) => {
    setEditing(item);
    setModalOpen(true);
  };

  const sorted = [...contentItems].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
            Content Library
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            {contentItems.length === 0
              ? "Your weddings, shoots, and projects."
              : `${contentItems.length} ${contentItems.length === 1 ? "item" : "items"}`}
          </p>
        </div>
        {contentItems.length > 0 && (
          <button
            type="button"
            onClick={openNew}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            + Add Content
          </button>
        )}
      </div>

      {contentItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
          <div className="mb-4 text-neutral-300">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-neutral-900">No content yet</h3>
          <p className="mt-1.5 max-w-sm text-sm text-neutral-600">
            Add your first wedding, shoot, or project to start generating social media posts.
          </p>
          <button
            type="button"
            onClick={openNew}
            className="mt-5 rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
          >
            + Add Content
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((item) => (
            <ContentCard key={item.id} item={item} onEdit={openEdit} />
          ))}
        </div>
      )}

      <AddContentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
      />
    </section>
  );
}
