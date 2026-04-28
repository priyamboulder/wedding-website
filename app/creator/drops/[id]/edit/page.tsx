"use client";

import { useParams } from "next/navigation";
import { DropEditor } from "@/components/creator-portal/DropEditor";

export default function EditDropPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  if (!id) return null;
  return <DropEditor dropId={id} />;
}
