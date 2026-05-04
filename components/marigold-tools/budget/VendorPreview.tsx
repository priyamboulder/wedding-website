"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import type { BudgetTier } from "@/types/budget";
import type { RankedVendor } from "@/types/vendors";

import styles from "./VendorPreview.module.css";

type Props = {
  categorySlug: string;
  categoryName: string;
  locationSlug: string;
  tier: BudgetTier;
};

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=70";

const TIER_LABEL: Record<BudgetTier, string> = {
  essential: "Essential",
  elevated: "Elevated",
  luxury: "Luxury",
  ultra: "Ultra-Luxury",
};

// Continent slugs supported by the destinations route — used to deep-link
// "view →" into /tools/destinations/[continent]/[location]/vendors/[category]
const LOCATION_TO_CONTINENT: Record<string, string> = {
  // US metros
  dallas: "north-america",
  houston: "north-america",
  austin: "north-america",
  "bay-area": "north-america",
  "nyc-nj": "north-america",
  chicago: "north-america",
  atlanta: "north-america",
  "los-angeles": "north-america",
  // India
  udaipur: "asia",
  goa: "asia",
  jaipur: "asia",
  kerala: "asia",
  "mumbai-delhi": "asia",
  // Europe
  "lake-como": "europe",
  france: "europe",
  spain: "europe",
  uk: "europe",
  greece: "europe",
  portugal: "europe",
  turkey: "europe",
  // Middle East
  dubai: "middle-east",
  oman: "middle-east",
  // SE Asia
  thailand: "asia",
  bali: "asia",
  singapore: "asia",
  // Caribbean
  jamaica: "north-america",
  "turks-caicos": "north-america",
  // Africa
  "cape-town": "africa",
  morocco: "africa",
  kenya: "africa",
  // Oceania
  sydney: "oceania",
};

export function VendorPreview({
  categorySlug,
  categoryName,
  locationSlug,
  tier,
}: Props) {
  const [vendors, setVendors] = useState<RankedVendor[] | null>(null);
  const [loading, setLoading] = useState(false);
  const requestSeq = useRef(0);

  useEffect(() => {
    const seq = ++requestSeq.current;
    setLoading(true);
    const url = `/api/tools/budget/vendors?category=${encodeURIComponent(categorySlug)}&location=${encodeURIComponent(locationSlug)}&tier=${encodeURIComponent(tier)}&limit=3`;
    fetch(url)
      .then((res) => res.json())
      .then((json: { vendors?: RankedVendor[] }) => {
        if (seq !== requestSeq.current) return;
        setVendors(json.vendors ?? []);
        setLoading(false);
      })
      .catch(() => {
        if (seq !== requestSeq.current) return;
        setVendors([]);
        setLoading(false);
      });
  }, [categorySlug, locationSlug, tier]);

  const continent = LOCATION_TO_CONTINENT[locationSlug];
  const seeAllHref = continent
    ? `/tools/destinations/${continent}/${locationSlug}/vendors/${categorySlug}`
    : `/tools/destinations`;

  return (
    <div className={styles.preview}>
      <div className={styles.previewHead}>
        <span className={styles.previewLabel}>
          ✨ See {TIER_LABEL[tier]} {categoryName.toLowerCase()} in this location
        </span>
        {vendors && vendors.length > 0 && (
          <Link href={seeAllHref} className={styles.seeAll}>
            see all →
          </Link>
        )}
      </div>

      {loading && !vendors && (
        <div className={styles.loadingRow}>
          <span className={styles.skeleton} />
          <span className={styles.skeleton} />
          <span className={styles.skeleton} />
        </div>
      )}

      {vendors && vendors.length === 0 && !loading && (
        <p className={styles.empty}>
          No matching vendors yet — we're adding more here every week.
        </p>
      )}

      {vendors && vendors.length > 0 && (
        <div className={styles.cards}>
          {vendors.map((v) => (
            <Link
              key={v.id}
              href={v.slug ? seeAllHref : "/tools/destinations"}
              className={styles.card}
            >
              <div className={styles.cardImageWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className={styles.cardImage}
                  src={v.hero_image_url || PLACEHOLDER_IMAGE}
                  alt={v.name}
                  loading="lazy"
                />
                {v.rank_bucket === 1 && (
                  <span className={styles.partnerTag}>Partner ✦</span>
                )}
                {v.verified && v.rank_bucket > 1 && (
                  <span className={styles.verifiedTag}>✓ Verified</span>
                )}
              </div>
              <div className={styles.cardBody}>
                <span className={styles.cardName}>{v.name}</span>
                {v.tagline && (
                  <span className={styles.cardTagline}>{v.tagline}</span>
                )}
                <span className={styles.cardCta}>view →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
