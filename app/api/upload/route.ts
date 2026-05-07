import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import * as Sentry from "@sentry/nextjs";
import { supabase } from "@/lib/supabase/client";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import { ACCEPTED_MIME_TYPES, MAX_FILE_SIZE } from "@/types/popout-infrastructure";
import type { UploadedFile } from "@/types/popout-infrastructure";

const BUCKET = "ananya-uploads";

export async function POST(request: NextRequest) {
  const { response: authError } = await requireAuth(request);
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const results: UploadedFile[] = [];

    for (const file of files) {
      // Validate mime type
      if (!ACCEPTED_MIME_TYPES.includes(file.type as never)) {
        return NextResponse.json(
          { error: `Unsupported file type: ${file.type}` },
          { status: 400 },
        );
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File too large: ${file.name} (max 10 MB)` },
          { status: 400 },
        );
      }

      const id = uuid();
      const ext = file.name.includes(".")
        ? `.${file.name.split(".").pop()}`
        : "";
      const path = `uploads/${id}${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, buffer, { contentType: file.type, upsert: false });

      if (uploadError) {
        Sentry.captureException(uploadError);
        return NextResponse.json(
          { error: `Failed to upload file: ${file.name}` },
          { status: 500 },
        );
      }

      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(path);

      results.push({
        id,
        filename: file.name,
        url: publicUrl,
        mime_type: file.type,
        size: file.size,
        uploaded_at: new Date().toISOString(),
      });
    }

    return NextResponse.json(results);
  } catch (e) {
    Sentry.captureException(e);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 },
    );
  }
}
