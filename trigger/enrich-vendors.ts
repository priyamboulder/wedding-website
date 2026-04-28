// @ts-nocheck — reference implementation; deps (@trigger.dev/sdk,
// @anthropic-ai/sdk, @supabase/supabase-js) are intentionally not installed
// in this repo yet. Type-check will resume once Supabase + Trigger.dev land.

// ──────────────────────────────────────────────────────────────────────────
// Trigger.dev job: enrich freshly-imported vendors via Claude Haiku 4.5
//
// Status: reference implementation — not wired in the current app build.
// The in-repo Vendors page (/app/vendors/page.tsx) runs on Zustand +
// localStorage. When Supabase + Trigger.dev come online, this job should
// replace the local stub in lib/vendors/csv-import.ts' post-import hook.
//
// What it does:
//   1. Finds vendors with enriched_at IS NULL (newly imported via Excel).
//   2. For each, calls Claude Haiku 4.5 with a prompt-cached system prompt
//      that produces structured fields (bio, style_tags, category, price).
//   3. Updates the row and stamps enriched_at.
//
// Rate limit: 300ms between calls — matches the Boulder n8n convention.
// Idempotency: enriched_at is stamped; re-running skips already-enriched rows.
// ──────────────────────────────────────────────────────────────────────────

import { logger, task } from "@trigger.dev/sdk/v3";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const anthropic = new Anthropic();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const EnrichmentSchema = z.object({
  bio: z.string().min(40).max(500),
  style_tags: z.array(z.string()).min(1).max(5),
  inferred_category: z.enum([
    "photography",
    "hmua",
    "decor_florals",
    "catering",
    "entertainment",
    "wardrobe",
    "stationery",
    "pandit_ceremony",
  ]),
  price_range: z.string().nullable(),
  confidence: z.number().min(0).max(1),
});

const SYSTEM_PROMPT = `You enrich sparse vendor directory rows for an Indian
wedding platform. Given raw fields (name, category, location, contact notes),
you return structured JSON with a polished bio (2–3 editorial sentences,
never marketing-speak), 2–5 style tags (lowercase, hyphen-separated), a
confident category classification, and an INR price_range estimate in the
format "₹XL – ₹YL" (or null if you truly cannot tell).

Editorial voice: restrained, specific, confident. Avoid superlatives. Never
invent facts — if you don't know something, omit it. Never quote a star
rating.`;

export const enrichVendors = task({
  id: "enrich-vendors",
  run: async (payload: { vendorIds?: string[]; batchSize?: number }) => {
    const batchSize = payload.batchSize ?? 20;

    const query = supabase
      .from("vendors")
      .select("*")
      .is("enriched_at", null)
      .limit(batchSize);

    if (payload.vendorIds && payload.vendorIds.length > 0) {
      query.in("id", payload.vendorIds);
    }

    const { data: vendors, error } = await query;
    if (error) throw error;
    if (!vendors || vendors.length === 0) {
      logger.info("no vendors to enrich");
      return { enriched: 0 };
    }

    let enriched = 0;
    for (const vendor of vendors) {
      try {
        const response = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 512,
          system: [
            {
              type: "text",
              text: SYSTEM_PROMPT,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: [
            {
              role: "user",
              content: `Raw vendor row:\n${JSON.stringify(
                {
                  name: vendor.name,
                  category: vendor.category,
                  location: vendor.location,
                  price_range: vendor.price_range,
                  bio: vendor.bio,
                  contact: vendor.contact,
                },
                null,
                2,
              )}\n\nReturn JSON matching the enrichment schema.`,
            },
          ],
        });

        const text =
          response.content[0].type === "text" ? response.content[0].text : "";
        const json = JSON.parse(extractJson(text));
        const enrichment = EnrichmentSchema.parse(json);

        const { error: updateError } = await supabase
          .from("vendors")
          .update({
            bio: enrichment.bio,
            style_tags: enrichment.style_tags,
            category: enrichment.inferred_category,
            price_range: enrichment.price_range ?? vendor.price_range,
            enriched_at: new Date().toISOString(),
          })
          .eq("id", vendor.id);

        if (updateError) throw updateError;
        enriched += 1;

        await sleep(300);
      } catch (err) {
        logger.error("enrichment failed", {
          vendorId: vendor.id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return { enriched };
  },
});

function extractJson(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("no JSON in response");
  return text.slice(start, end + 1);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
