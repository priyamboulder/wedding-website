"use client";

import { useParams } from "next/navigation";
import { CollectionEditor } from "@/components/creator-portal/CollectionEditor";

export default function EditCollectionPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  if (!id) return null;
  return <CollectionEditor collectionId={id} />;
}
