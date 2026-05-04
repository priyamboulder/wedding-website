'use client';

import { useState } from 'react';
import type { RankedVendor } from '@/types/vendors';
import { LeadCaptureModal } from './LeadCaptureModal';
import styles from './VendorCard.module.css';

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80';

type VendorCardProps = {
  vendor: RankedVendor;
  // Pricing band shown if a vendor_pricing_indicators row exists for the
  // (vendor, category) shown by the surrounding panel. Pre-resolved by the
  // server component.
  priceLowUsd?: number | null;
  priceHighUsd?: number | null;
  // Editorial label on top of the card hero — e.g. "Palace Hotel" for
  // venues. Skipped on generic category pages.
  typeLabel?: string;
  // Filled in by parent: the {tool, location, category} that the inquiry
  // should be tagged with.
  sourceTool: string;
  inquiryContext: Record<string, unknown>;
  // When a card is rendered inside a "Sponsored ✦" / "Featured ✦" rail
  // we want a subtly larger card. Lifted to the parent so the visual
  // hierarchy is consistent across panels.
  emphasized?: boolean;
};

function formatPrice(value: number): string {
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${value}`;
}

function placementLabel(vendor: RankedVendor): {
  label: string;
  variant: 'sponsored' | 'featured' | 'verified' | null;
} {
  // rank_bucket reflects the actual context match for sponsored, falling
  // through to featured / verified / standard.
  if (vendor.rank_bucket === 1) {
    return { label: 'Partner ✦', variant: 'sponsored' };
  }
  if (vendor.rank_bucket === 2 || vendor.placement_tier === 'featured') {
    return { label: 'Featured ✦', variant: 'featured' };
  }
  if (vendor.verified) {
    return { label: '✓ Verified', variant: 'verified' };
  }
  return { label: '', variant: null };
}

export function VendorCard({
  vendor,
  priceLowUsd,
  priceHighUsd,
  typeLabel,
  sourceTool,
  inquiryContext,
  emphasized,
}: VendorCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const placement = placementLabel(vendor);

  const heroSrc = vendor.hero_image_url || PLACEHOLDER_IMAGE;
  const capacityBadge =
    vendor.capacity_min || vendor.capacity_max
      ? `${vendor.capacity_min ?? '—'}–${vendor.capacity_max ?? '—'} guests`
      : null;

  let priceBadge: string | null = null;
  if (priceLowUsd != null && priceHighUsd != null) {
    priceBadge = `${formatPrice(priceLowUsd)}–${formatPrice(priceHighUsd)}`;
  } else if (priceLowUsd != null) {
    priceBadge = `from ${formatPrice(priceLowUsd)}`;
  }

  return (
    <>
      <article
        className={[styles.card, emphasized ? styles.emphasized : '']
          .filter(Boolean)
          .join(' ')}
      >
        <div className={styles.heroWrap}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroSrc}
            alt={vendor.name}
            className={styles.hero}
            loading="lazy"
          />
          {placement.variant && (
            <span
              className={[styles.placement, styles[`placement-${placement.variant}`]]
                .filter(Boolean)
                .join(' ')}
            >
              {placement.label}
            </span>
          )}
          {typeLabel && <span className={styles.typeLabel}>{typeLabel}</span>}
        </div>

        <div className={styles.body}>
          <h3 className={styles.name}>{vendor.name}</h3>
          {vendor.tagline && (
            <p className={styles.tagline}>{vendor.tagline}</p>
          )}

          {(capacityBadge || priceBadge) && (
            <div className={styles.metaRow}>
              {capacityBadge && (
                <span className={styles.metaBadge}>{capacityBadge}</span>
              )}
              {priceBadge && (
                <span className={styles.metaBadge}>{priceBadge}</span>
              )}
            </div>
          )}

          {vendor.tier_match.length > 0 && (
            <div className={styles.tierRow}>
              {vendor.tier_match.slice(0, 4).map((tier) => (
                <span key={tier} className={styles.tierPill}>
                  {tier}
                </span>
              ))}
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.interestBtn}
              onClick={() => setModalOpen(true)}
            >
              I&apos;m interested
            </button>
            {vendor.slug ? (
              <span className={styles.viewLink}>View profile →</span>
            ) : null}
          </div>
        </div>
      </article>

      <LeadCaptureModal
        vendorId={vendor.id}
        vendorName={vendor.name}
        sourceTool={sourceTool}
        context={inquiryContext}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
