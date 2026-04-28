"use client";

import { useParams } from "next/navigation";
import { GuideEditor } from "@/components/creator-portal/GuideEditor";

export default function EditGuidePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  if (!id) return null;
  return <GuideEditor guideId={id} />;
}
