"use client";

// ── Build Session 4 · Family exchanges ────────────────────────────────────
// Mirrors Tab 6 of the Gifting workspace. Captures milni / vevai / vidaai /
// shagun exchanges (with reciprocal-pair support), bridal-party gifts, and
// vendor thank-yous. Empty state seeds 4–6 typical exchanges from Vision's
// family_gift_traditions selections; vendor thank-yous pre-seed from
// contracted vendors across all workspaces.

import { useEffect, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import {
  setSessionFormPath,
  useCategoryJourneyState,
} from "@/lib/guided-journey/storage";
import {
  BRIDAL_PARTY_DEFAULT_ROLES,
  BRIDAL_PARTY_ROLE_LABEL,
  DEFAULT_VENDOR_THANK_YOU_COST,
  DEFAULT_VENDOR_THANK_YOU_GIFT_IDEA,
  EXCHANGE_SOURCING_STATUS_LABEL,
  FAMILY_EXCHANGE_SUGGESTIONS,
  FAMILY_EXCHANGE_TYPE_LABEL,
  GIFTING_BUILD_CATEGORY,
  GIFTING_BUILD_JOURNEY_ID,
  type BridalPartyDeliveryPlan,
  type BridalPartyGift,
  type BridalPartyRole,
  type ExchangeSourcingStatus,
  type FamilyExchange,
  type FamilyExchangeType,
  type FamilyExchangesComputed,
  type FamilyExchangesFormData,
  type FamilySide,
  type GiftEvent,
  type VendorThankYou,
  type VendorThankYouDeliveryPlan,
} from "@/lib/guided-journeys/gifting-build";
import {
  bandLabel,
  bandTone,
  compareAgainstAnchor,
} from "@/lib/calculators/budget-anchor-comparison";
import { cn } from "@/lib/utils";
import type { WorkspaceCategory } from "@/types/workspace";

const EXCHANGE_TYPE_OPTIONS: FamilyExchangeType[] = [
  "milni",
  "vevai",
  "vidaai",
  "shagun",
  "mehendi_gifts",
  "other",
];

const SIDE_OPTIONS: FamilySide[] = ["bride_side", "groom_side", "mutual"];

const SOURCING_OPTIONS: ExchangeSourcingStatus[] = [
  "wishlist",
  "idea",
  "sourcing",
  "purchased",
  "wrapped",
];

const EVENT_OPTIONS: GiftEvent[] = [
  "mehendi",
  "haldi",
  "sangeet",
  "wedding",
  "reception",
  "milni",
  "vidaai",
  "pre_wedding",
  "other",
];

const BRIDAL_PARTY_DELIVERY_OPTIONS: BridalPartyDeliveryPlan[] = [
  "morning_of_wedding",
  "rehearsal_dinner",
  "reception",
  "mailed",
  "tbd",
];

const VENDOR_DELIVERY_OPTIONS: VendorThankYouDeliveryPlan[] = [
  "wedding_day_handoff",
  "after_event_thank_you",
  "tbd",
];

const BRIDAL_PARTY_ROLES_ALL: BridalPartyRole[] = [
  "maid_of_honor",
  "bridesmaid",
  "best_man",
  "groomsman",
  "flower_girl",
  "ring_bearer",
  "usher",
  "family_helper",
  "custom",
];

function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function FamilyExchangesSession({
  category,
}: {
  category: WorkspaceCategory;
}) {
  const [state, update] = useCategoryJourneyState(
    GIFTING_BUILD_CATEGORY,
    GIFTING_BUILD_JOURNEY_ID,
  );
  const allItems = useWorkspaceStore((s) => s.items);
  const visionPhilosophy = state.formData["gifting_philosophy"] as
    | {
        budget_anchors?: { family_exchanges_per_family?: string };
        family_gift_traditions?: string[];
      }
    | undefined;

  const sessionData =
    (state.formData["family_exchanges"] as unknown as
      | FamilyExchangesFormData
      | undefined) ?? {
      family_exchanges: [],
      bridal_party_gifts: [],
      vendor_thank_yous: [],
    };

  // Seed family exchanges from Vision's family_gift_traditions[] on first hydration.
  useEffect(() => {
    if (sessionData.family_exchanges.length > 0) return;
    const traditions = visionPhilosophy?.family_gift_traditions ?? [];
    if (traditions.length === 0) return;
    const seeded: FamilyExchange[] = [];
    for (const sugg of FAMILY_EXCHANGE_SUGGESTIONS) {
      if (traditions.includes(sugg.match_tradition)) {
        seeded.push({ id: newId("fx"), ...sugg.defaults });
      }
    }
    if (seeded.length > 0) {
      update((s) =>
        setSessionFormPath(s, "family_exchanges", "family_exchanges", seeded),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Seed bridal party gift drafts from default roles on first hydration.
  useEffect(() => {
    if (sessionData.bridal_party_gifts.length > 0) return;
    const seeded: BridalPartyGift[] = BRIDAL_PARTY_DEFAULT_ROLES.map(
      (role): BridalPartyGift => ({
        id: newId("bp"),
        recipient_name: "",
        recipient_role: role,
        sourcing_status: "idea",
        delivery_plan: "morning_of_wedding",
      }),
    );
    update((s) =>
      setSessionFormPath(s, "family_exchanges", "bridal_party_gifts", seeded),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Seed vendor thank-yous from any contracted vendor across the workspace.
  useEffect(() => {
    if (sessionData.vendor_thank_yous.length > 0) return;
    const contractedVendors = allItems
      .filter((it) => {
        const meta = it.meta as { contracted?: boolean; kind?: string };
        return meta.contracted === true && meta.kind !== "exchange";
      })
      .map((it) => it.title)
      .filter((t, i, arr) => Boolean(t) && arr.indexOf(t) === i)
      .slice(0, 12);
    if (contractedVendors.length === 0) return;
    const seeded: VendorThankYou[] = contractedVendors.map((name) => ({
      id: newId("vt"),
      vendor_label: name,
      gift_idea: DEFAULT_VENDOR_THANK_YOU_GIFT_IDEA,
      estimated_cost: DEFAULT_VENDOR_THANK_YOU_COST,
      delivery_plan: "wedding_day_handoff",
    }));
    update((s) =>
      setSessionFormPath(s, "family_exchanges", "vendor_thank_yous", seeded),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute summary.
  const computed: FamilyExchangesComputed = useMemo(() => {
    let total = 0;
    let unconfirmed = 0;
    for (const ex of sessionData.family_exchanges) {
      total += (ex.estimated_cost_total ?? 0) + (ex.vendor_tip_amount ?? 0);
      if (ex.sourcing_status === "wishlist" || ex.sourcing_status === "idea") {
        unconfirmed += 1;
      }
    }
    for (const bp of sessionData.bridal_party_gifts) {
      total += bp.estimated_cost ?? 0;
    }
    for (const v of sessionData.vendor_thank_yous) {
      total += v.estimated_cost ?? 0;
    }
    // Compare per-family avg against anchor.
    const familyCount = Math.max(
      1,
      sessionData.family_exchanges.filter((e) => e.exchange_type !== "other")
        .length,
    );
    const perFamily = total / familyCount;
    const cmp = compareAgainstAnchor(
      perFamily,
      visionPhilosophy?.budget_anchors?.family_exchanges_per_family,
    );
    const band: FamilyExchangesComputed["cost_vs_budget_anchor"] =
      cmp.band === "no_anchor" ? "on_target" : cmp.band;
    return {
      total_exchanges: sessionData.family_exchanges.length,
      total_bridal_party_gifts: sessionData.bridal_party_gifts.length,
      total_vendor_thank_yous: sessionData.vendor_thank_yous.length,
      total_estimated_cost: total,
      cost_vs_budget_anchor: band,
      exchanges_unconfirmed_count: unconfirmed,
    };
  }, [sessionData, visionPhilosophy?.budget_anchors?.family_exchanges_per_family]);

  useEffect(() => {
    update((s) =>
      setSessionFormPath(s, "family_exchanges", "computed", computed),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    computed.total_exchanges,
    computed.total_bridal_party_gifts,
    computed.total_vendor_thank_yous,
    computed.total_estimated_cost,
  ]);

  const writeExchanges = (next: FamilyExchange[]) => {
    update((s) =>
      setSessionFormPath(s, "family_exchanges", "family_exchanges", next),
    );
  };
  const writeBridalParty = (next: BridalPartyGift[]) => {
    update((s) =>
      setSessionFormPath(s, "family_exchanges", "bridal_party_gifts", next),
    );
  };
  const writeVendorThankYous = (next: VendorThankYou[]) => {
    update((s) =>
      setSessionFormPath(s, "family_exchanges", "vendor_thank_yous", next),
    );
  };

  const addExchange = () => {
    writeExchanges([
      ...sessionData.family_exchanges,
      {
        id: newId("fx"),
        exchange_type: "milni",
        event: "wedding",
        giver_family: "bride_side",
        receiver_family: "groom_side",
        quantity: 1,
        sourcing_status: "wishlist",
        is_reciprocal: false,
      },
    ]);
  };

  const patchExchange = (id: string, patch: Partial<FamilyExchange>) => {
    writeExchanges(
      sessionData.family_exchanges.map((ex) =>
        ex.id === id ? { ...ex, ...patch } : ex,
      ),
    );
  };

  const removeExchange = (id: string) => {
    writeExchanges(sessionData.family_exchanges.filter((ex) => ex.id !== id));
  };

  const addReciprocalFor = (sourceId: string) => {
    const src = sessionData.family_exchanges.find((ex) => ex.id === sourceId);
    if (!src) return;
    const reciprocalId = newId("fx");
    const flippedReceiver: Exclude<FamilySide, "guest"> =
      src.receiver_family === "guest"
        ? "groom_side"
        : (src.receiver_family as Exclude<FamilySide, "guest">);
    const reciprocal: FamilyExchange = {
      id: reciprocalId,
      exchange_type: src.exchange_type,
      exchange_label: src.exchange_label,
      event: src.event,
      giver_family: flippedReceiver,
      giver_specific_role: src.receiver_specific_role,
      receiver_family: src.giver_family,
      receiver_specific_role: src.giver_specific_role,
      quantity: src.quantity,
      sourcing_status: "wishlist",
      cultural_significance: src.cultural_significance,
      is_reciprocal: true,
      reciprocal_exchange_id: src.id,
    };
    writeExchanges([
      ...sessionData.family_exchanges.map((ex) =>
        ex.id === sourceId
          ? { ...ex, is_reciprocal: true, reciprocal_exchange_id: reciprocalId }
          : ex,
      ),
      reciprocal,
    ]);
  };

  const addBridalParty = () => {
    writeBridalParty([
      ...sessionData.bridal_party_gifts,
      {
        id: newId("bp"),
        recipient_name: "",
        recipient_role: "bridesmaid",
        sourcing_status: "idea",
        delivery_plan: "morning_of_wedding",
      },
    ]);
  };
  const patchBridalParty = (id: string, patch: Partial<BridalPartyGift>) => {
    writeBridalParty(
      sessionData.bridal_party_gifts.map((bp) =>
        bp.id === id ? { ...bp, ...patch } : bp,
      ),
    );
  };
  const removeBridalParty = (id: string) => {
    writeBridalParty(sessionData.bridal_party_gifts.filter((bp) => bp.id !== id));
  };

  const addVendorThankYou = () => {
    writeVendorThankYous([
      ...sessionData.vendor_thank_yous,
      {
        id: newId("vt"),
        vendor_label: "",
        gift_idea: DEFAULT_VENDOR_THANK_YOU_GIFT_IDEA,
        estimated_cost: DEFAULT_VENDOR_THANK_YOU_COST,
        delivery_plan: "wedding_day_handoff",
      },
    ]);
  };
  const patchVendorThankYou = (
    id: string,
    patch: Partial<VendorThankYou>,
  ) => {
    writeVendorThankYous(
      sessionData.vendor_thank_yous.map((v) =>
        v.id === id ? { ...v, ...patch } : v,
      ),
    );
  };
  const removeVendorThankYou = (id: string) => {
    writeVendorThankYous(
      sessionData.vendor_thank_yous.filter((v) => v.id !== id),
    );
  };

  return (
    <div className="space-y-6">
      <ExchangesBlock
        exchanges={sessionData.family_exchanges}
        onAdd={addExchange}
        onPatch={patchExchange}
        onRemove={removeExchange}
        onAddReciprocal={addReciprocalFor}
      />

      <BridalPartyBlock
        gifts={sessionData.bridal_party_gifts}
        onAdd={addBridalParty}
        onPatch={patchBridalParty}
        onRemove={removeBridalParty}
      />

      <VendorThankYouBlock
        items={sessionData.vendor_thank_yous}
        onAdd={addVendorThankYou}
        onPatch={patchVendorThankYou}
        onRemove={removeVendorThankYou}
      />

      <SummaryBlock
        computed={computed}
        anchorChip={visionPhilosophy?.budget_anchors?.family_exchanges_per_family}
      />
    </div>
  );
}

// ─── Family exchanges ────────────────────────────────────────────────────

function ExchangesBlock({
  exchanges,
  onAdd,
  onPatch,
  onRemove,
  onAddReciprocal,
}: {
  exchanges: FamilyExchange[];
  onAdd: () => void;
  onPatch: (id: string, patch: Partial<FamilyExchange>) => void;
  onRemove: (id: string) => void;
  onAddReciprocal: (sourceId: string) => void;
}) {
  return (
    <section className="rounded-md border border-ink/10 bg-paper p-5">
      <header className="mb-3 flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            Family-to-family exchanges
          </p>
          <h3 className="mt-1 font-serif text-xl text-ink">
            Milni, vevai, vidaai, shagun
          </h3>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] text-ivory hover:bg-ink-soft"
        >
          <Plus size={12} />
          Add exchange
        </button>
      </header>
      {exchanges.length === 0 ? (
        <p className="py-2 text-[12.5px] italic text-ink-muted">
          No exchanges seeded yet — pick traditions on Vision Session 1 and
          they'll appear here automatically.
        </p>
      ) : (
        <div className="space-y-3">
          {exchanges.map((ex) => (
            <ExchangeCard
              key={ex.id}
              exchange={ex}
              isPaired={Boolean(ex.reciprocal_exchange_id)}
              onPatch={(patch) => onPatch(ex.id, patch)}
              onRemove={() => onRemove(ex.id)}
              onAddReciprocal={() => onAddReciprocal(ex.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ExchangeCard({
  exchange,
  isPaired,
  onPatch,
  onRemove,
  onAddReciprocal,
}: {
  exchange: FamilyExchange;
  isPaired: boolean;
  onPatch: (patch: Partial<FamilyExchange>) => void;
  onRemove: () => void;
  onAddReciprocal: () => void;
}) {
  return (
    <div className="rounded-md border border-ink/10 bg-paper p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={exchange.exchange_type}
            onChange={(e) =>
              onPatch({
                exchange_type: e.target.value as FamilyExchangeType,
              })
            }
            className="rounded-full border border-ink/15 bg-ivory-soft px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink"
          >
            {EXCHANGE_TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {FAMILY_EXCHANGE_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
          {exchange.is_reciprocal && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-pale/60 px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-rose">
              Reciprocal pair
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove exchange"
          className="rounded-md p-1.5 text-ink-muted hover:bg-rose-pale/40 hover:text-rose"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <Field label="Event">
          <select
            value={exchange.event}
            onChange={(e) =>
              onPatch({ event: e.target.value as GiftEvent })
            }
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          >
            {EVENT_OPTIONS.map((ev) => (
              <option key={ev} value={ev}>
                {ev}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Quantity">
          <input
            type="number"
            min={1}
            value={exchange.quantity}
            onChange={(e) =>
              onPatch({ quantity: Math.max(1, Number(e.target.value) || 1) })
            }
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px] tabular-nums"
          />
        </Field>
        <Field label="Giver family">
          <select
            value={exchange.giver_family}
            onChange={(e) =>
              onPatch({
                giver_family: e.target.value as Exclude<FamilySide, "guest">,
              })
            }
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          >
            {SIDE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Giver role">
          <input
            type="text"
            value={exchange.giver_specific_role ?? ""}
            onChange={(e) =>
              onPatch({ giver_specific_role: e.target.value })
            }
            placeholder="Mamaji (bride's mother's brother)"
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          />
        </Field>
        <Field label="Receiver family">
          <select
            value={exchange.receiver_family}
            onChange={(e) =>
              onPatch({ receiver_family: e.target.value as FamilySide })
            }
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          >
            {(["bride_side", "groom_side", "mutual", "guest"] as FamilySide[]).map(
              (s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ),
            )}
          </select>
        </Field>
        <Field label="Receiver role">
          <input
            type="text"
            value={exchange.receiver_specific_role ?? ""}
            onChange={(e) =>
              onPatch({ receiver_specific_role: e.target.value })
            }
            placeholder="Groom's family elders"
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          />
        </Field>
        <Field label="Gift idea">
          <input
            type="text"
            value={exchange.gift_idea ?? ""}
            onChange={(e) => onPatch({ gift_idea: e.target.value })}
            placeholder="Gold coin sets · Cash envelopes ($101 each)"
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          />
        </Field>
        <Field label="Estimated cost (USD)">
          <input
            type="number"
            min={0}
            value={exchange.estimated_cost_total ?? ""}
            onChange={(e) =>
              onPatch({
                estimated_cost_total: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              })
            }
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px] tabular-nums"
          />
        </Field>
        <Field label="Status">
          <select
            value={exchange.sourcing_status}
            onChange={(e) =>
              onPatch({
                sourcing_status: e.target.value as ExchangeSourcingStatus,
              })
            }
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
          >
            {SOURCING_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {EXCHANGE_SOURCING_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Vendor tip (USD)">
          <input
            type="number"
            min={0}
            value={exchange.vendor_tip_amount ?? ""}
            onChange={(e) =>
              onPatch({
                vendor_tip_amount: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              })
            }
            className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px] tabular-nums"
          />
        </Field>
      </div>

      <Field label="Cultural significance" className="mt-3">
        <input
          type="text"
          value={exchange.cultural_significance ?? ""}
          onChange={(e) =>
            onPatch({ cultural_significance: e.target.value })
          }
          className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
        />
      </Field>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <label className="inline-flex items-center gap-2 text-[12.5px] text-ink">
          <input
            type="checkbox"
            checked={exchange.is_reciprocal}
            onChange={(e) =>
              onPatch({ is_reciprocal: e.target.checked })
            }
          />
          Has a paired reciprocal exchange
        </label>
        {exchange.is_reciprocal && !isPaired && (
          <button
            type="button"
            onClick={onAddReciprocal}
            className="inline-flex items-center gap-1.5 rounded-md border border-rose/40 bg-rose-pale/40 px-3 py-1.5 text-[12px] text-rose hover:bg-rose-pale/60"
          >
            <Plus size={12} />
            Auto-create the flipped pair
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Bridal party gifts ──────────────────────────────────────────────────

function BridalPartyBlock({
  gifts,
  onAdd,
  onPatch,
  onRemove,
}: {
  gifts: BridalPartyGift[];
  onAdd: () => void;
  onPatch: (id: string, patch: Partial<BridalPartyGift>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <section className="rounded-md border border-ink/10 bg-paper p-5">
      <header className="mb-3 flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            Bridal party gifts
          </p>
          <h3 className="mt-1 font-serif text-xl text-ink">
            For your maid of honor, best man, and the rest
          </h3>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] text-ivory hover:bg-ink-soft"
        >
          <Plus size={12} />
          Add gift
        </button>
      </header>
      {gifts.length === 0 ? (
        <p className="py-2 text-[12.5px] italic text-ink-muted">
          Defaults seed for MoH, best man, and bridesmaid/groomsman drafts.
        </p>
      ) : (
        <ul className="divide-y divide-ink/10">
          {gifts.map((bp) => (
            <li key={bp.id} className="py-3">
              <div className="grid gap-2 md:grid-cols-12">
                <div className="md:col-span-3">
                  <input
                    type="text"
                    value={bp.recipient_name}
                    onChange={(e) =>
                      onPatch(bp.id, { recipient_name: e.target.value })
                    }
                    placeholder="Recipient name"
                    className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
                  />
                </div>
                <div className="md:col-span-2">
                  <select
                    value={bp.recipient_role}
                    onChange={(e) =>
                      onPatch(bp.id, {
                        recipient_role: e.target.value as BridalPartyRole,
                      })
                    }
                    className="w-full rounded-md border border-ink/15 bg-paper px-2 py-1 text-[12px]"
                  >
                    {BRIDAL_PARTY_ROLES_ALL.map((r) => (
                      <option key={r} value={r}>
                        {BRIDAL_PARTY_ROLE_LABEL[r]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <input
                    type="text"
                    value={bp.gift_idea ?? ""}
                    onChange={(e) =>
                      onPatch(bp.id, { gift_idea: e.target.value })
                    }
                    placeholder="Personalized robe · Embroidered handkerchief"
                    className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
                  />
                </div>
                <div className="md:col-span-1">
                  <input
                    type="number"
                    min={0}
                    value={bp.estimated_cost ?? ""}
                    onChange={(e) =>
                      onPatch(bp.id, {
                        estimated_cost: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="$"
                    className="w-full rounded-md border border-ink/15 bg-paper px-2 py-1.5 text-[13px] tabular-nums"
                  />
                </div>
                <div className="md:col-span-2">
                  <select
                    value={bp.delivery_plan}
                    onChange={(e) =>
                      onPatch(bp.id, {
                        delivery_plan: e.target.value as BridalPartyDeliveryPlan,
                      })
                    }
                    className="w-full rounded-md border border-ink/15 bg-paper px-2 py-1 text-[12px]"
                  >
                    {BRIDAL_PARTY_DELIVERY_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-1 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => onRemove(bp.id)}
                    aria-label="Remove"
                    className="rounded-md p-1.5 text-ink-muted hover:bg-rose-pale/40 hover:text-rose"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ─── Vendor thank-yous ───────────────────────────────────────────────────

function VendorThankYouBlock({
  items,
  onAdd,
  onPatch,
  onRemove,
}: {
  items: VendorThankYou[];
  onAdd: () => void;
  onPatch: (id: string, patch: Partial<VendorThankYou>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <section className="rounded-md border border-ink/10 bg-paper p-5">
      <header className="mb-3 flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            Vendor thank-yous
          </p>
          <h3 className="mt-1 font-serif text-xl text-ink">
            The small thing that's easy to forget
          </h3>
          <p className="mt-1 text-[12.5px] italic text-ink-muted">
            Pre-seeds from contracted vendors across all your workspaces.
            Default: small mithai box + handwritten note.
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[12px] text-ivory hover:bg-ink-soft"
        >
          <Plus size={12} />
          Add vendor
        </button>
      </header>
      {items.length === 0 ? (
        <p className="py-2 text-[12.5px] italic text-ink-muted">
          Contract a vendor in any workspace and they'll seed here.
        </p>
      ) : (
        <ul className="divide-y divide-ink/10">
          {items.map((v) => (
            <li key={v.id} className="py-3">
              <div className="grid gap-2 md:grid-cols-12">
                <div className="md:col-span-3">
                  <input
                    type="text"
                    value={v.vendor_label}
                    onChange={(e) =>
                      onPatch(v.id, { vendor_label: e.target.value })
                    }
                    placeholder="Photographer · DJ · Mehendi artist"
                    className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
                  />
                </div>
                <div className="md:col-span-5">
                  <input
                    type="text"
                    value={v.gift_idea ?? ""}
                    onChange={(e) =>
                      onPatch(v.id, { gift_idea: e.target.value })
                    }
                    placeholder="Small mithai box + handwritten note"
                    className="w-full rounded-md border border-ink/15 bg-paper px-2.5 py-1.5 text-[13px]"
                  />
                </div>
                <div className="md:col-span-1">
                  <input
                    type="number"
                    min={0}
                    value={v.estimated_cost ?? ""}
                    onChange={(e) =>
                      onPatch(v.id, {
                        estimated_cost: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="$"
                    className="w-full rounded-md border border-ink/15 bg-paper px-2 py-1.5 text-[13px] tabular-nums"
                  />
                </div>
                <div className="md:col-span-2">
                  <select
                    value={v.delivery_plan}
                    onChange={(e) =>
                      onPatch(v.id, {
                        delivery_plan: e.target.value as VendorThankYouDeliveryPlan,
                      })
                    }
                    className="w-full rounded-md border border-ink/15 bg-paper px-2 py-1 text-[12px]"
                  >
                    {VENDOR_DELIVERY_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-1 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => onRemove(v.id)}
                    aria-label="Remove"
                    className="rounded-md p-1.5 text-ink-muted hover:bg-rose-pale/40 hover:text-rose"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ─── Summary ─────────────────────────────────────────────────────────────

function SummaryBlock({
  computed,
  anchorChip,
}: {
  computed: FamilyExchangesComputed;
  anchorChip?: string;
}) {
  return (
    <section className="rounded-md border border-ink/10 bg-ivory-soft p-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <Stat label="Exchanges" value={String(computed.total_exchanges)} />
        <Stat label="Bridal party" value={String(computed.total_bridal_party_gifts)} />
        <Stat label="Vendor thank-yous" value={String(computed.total_vendor_thank_yous)} />
        <Stat
          label="Total cost"
          value={`$${computed.total_estimated_cost.toFixed(0)}`}
        />
        <Stat
          label={`Anchor (${anchorChip ?? "—"})`}
          value={bandLabel(computed.cost_vs_budget_anchor)}
          tone={bandTone(computed.cost_vs_budget_anchor)}
        />
        <Stat
          label="Unconfirmed"
          value={String(computed.exchanges_unconfirmed_count)}
        />
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "warn" | "bad";
}) {
  const color =
    tone === "good"
      ? "text-sage"
      : tone === "warn"
        ? "text-saffron"
        : tone === "bad"
          ? "text-rose"
          : "text-ink";
  return (
    <div>
      <span className="block font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-faint">
        {label}
      </span>
      <span className={cn("mt-0.5 block font-serif text-[16px]", color)}>
        {value}
      </span>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
