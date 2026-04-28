import { NextResponse } from "next/server";
import { getShowcasesByVendor } from "@/lib/showcases/seed";

// GET /api/vendors/[id]/showcases
// Powers the "Real Wedding Reviews" panel on a vendor profile.
// Returns every published showcase that tagged the vendor in its
// vendorReviews list, with a slim projection tuned for the panel.

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const showcases = getShowcasesByVendor(id);
  const projected = showcases.map((s) => {
    const review = s.vendorReviews.find((r) => r.vendorId === id);
    return {
      id: s.id,
      slug: s.slug,
      title: s.title,
      brideName: s.brideName,
      partnerName: s.partnerName,
      weddingDate: s.weddingDate,
      locationCity: s.locationCity,
      coverImageUrl: s.coverImageUrl,
      review: review
        ? {
            role: review.role,
            rating: review.rating,
            reviewText: review.reviewText,
          }
        : null,
    };
  });
  return NextResponse.json({ showcases: projected, total: projected.length });
}
