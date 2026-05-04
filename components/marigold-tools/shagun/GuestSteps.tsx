"use client";

// ──────────────────────────────────────────────────────────────────────────
// GuestSteps — the five-step guest flow.
//
// 1. Relationship + attendingAs
// 2. Wedding context (scale + style + event count)
// 3. Tradition + location
// 4. Reciprocity (status + amount input when applicable)
// 5. Budget reality (optional, skippable)
// ──────────────────────────────────────────────────────────────────────────

import type {
  AttendingAs,
  BudgetComfort,
  EventCount,
  Location,
  RelationshipTier,
  Tradition,
  WeddingScale,
  WeddingStyle,
  ReciprocityStatus,
} from "@/types/shagun";

import {
  AmountField,
  ChoiceList,
  Subgroup,
  StepShell,
  type ChoiceOption,
} from "./StepCard";

// ── Option lists ───────────────────────────────────────────────────────────

const RELATIONSHIP_OPTS: ChoiceOption<RelationshipTier>[] = [
  {
    value: "immediate-family",
    label: "Immediate family",
    sub: "parent, sibling, grandparent",
  },
  {
    value: "close-extended-family",
    label: "Close extended family",
    sub: "aunt/uncle, first cousin",
  },
  {
    value: "outer-extended-family",
    label: "Outer extended family",
    sub: "second cousin, distant relative",
  },
  {
    value: "close-friend",
    label: "Close friend",
    sub: "inner circle, college roommate, ride-or-die",
  },
  {
    value: "good-friend",
    label: "Good friend",
    sub: "see them a few times a year",
  },
  {
    value: "acquaintance-colleague",
    label: "Acquaintance / colleague",
    sub: "work friend, friend-of-a-friend, neighbor",
  },
  {
    value: "parents-friend-family-friend",
    label: "Parent's friend / family friend",
    sub: "your parents are close to them",
  },
  {
    value: "business-relationship",
    label: "Business relationship",
    sub: "client, vendor, professional contact",
  },
  {
    value: "non-indian-friend",
    label: "I'm a non-Indian friend",
    sub: "no idea what's expected",
  },
];

const ATTENDING_AS_OPTS: ChoiceOption<AttendingAs>[] = [
  { value: "solo", label: "Solo" },
  { value: "couple", label: "As a couple", sub: "one envelope covers both" },
  {
    value: "on-behalf-of-parents",
    label: "On behalf of my parents",
    sub: "they can't attend",
  },
];

const WEDDING_SCALE_OPTS: ChoiceOption<WeddingScale>[] = [
  { value: "intimate", label: "Intimate", sub: "under 100 guests" },
  { value: "standard", label: "Standard", sub: "100 – 250 guests" },
  { value: "grand", label: "Grand", sub: "250 – 500 guests" },
  { value: "mega", label: "Mega", sub: "500+ guests" },
];

const WEDDING_STYLE_OPTS: ChoiceOption<WeddingStyle>[] = [
  {
    value: "traditional-banquet",
    label: "Traditional banquet hall or temple",
    sub: "the standard for most weddings",
  },
  {
    value: "upscale-hotel",
    label: "Upscale hotel or resort",
    sub: "ballroom-tier celebration",
  },
  {
    value: "luxury-destination",
    label: "Luxury / destination wedding",
    sub: "significant travel involved",
  },
  {
    value: "casual-backyard",
    label: "Backyard / casual / low-key",
    sub: "small, intimate, home-feeling",
  },
  {
    value: "destination-travel",
    label: "Destination — I'm flying for it",
    sub: "you're traveling to be there",
  },
];

const EVENT_COUNT_OPTS: ChoiceOption<EventCount>[] = [
  {
    value: "1-event",
    label: "Just the ceremony / reception",
    sub: "1 event",
  },
  {
    value: "2-3-events",
    label: "2 – 3 events",
    sub: "sangeet + ceremony + reception",
  },
  {
    value: "full-week",
    label: "Full wedding week",
    sub: "4+ events",
  },
];

const TRADITION_OPTS: ChoiceOption<Tradition>[] = [
  { value: "north-indian", label: "North Indian", sub: "UP, Rajasthani, etc." },
  { value: "punjabi", label: "Punjabi", sub: "trends slightly higher" },
  { value: "gujarati", label: "Gujarati" },
  {
    value: "south-indian",
    label: "South Indian",
    sub: "Tamil, Telugu, Kannada, Malayalam",
  },
  { value: "bengali", label: "Bengali" },
  { value: "marathi", label: "Marathi" },
  { value: "muslim", label: "Muslim", sub: "any region" },
  { value: "sikh", label: "Sikh" },
  { value: "jain", label: "Jain" },
  { value: "mixed-fusion", label: "Mixed / Fusion" },
  {
    value: "general",
    label: "Not sure / General Indian",
    sub: "we'll use a balanced average",
  },
];

const LOCATION_OPTS: ChoiceOption<Location>[] = [
  { value: "both-us", label: "Both of us in the US" },
  {
    value: "us-guest-india-wedding",
    label: "I'm in the US, wedding's in India",
    sub: "amounts in India run lower",
  },
  {
    value: "india-guest-us-wedding",
    label: "I'm in India, wedding's in the US",
  },
  { value: "both-india", label: "Both of us in India" },
];

const RECIPROCITY_OPTS: ChoiceOption<ReciprocityStatus>[] = [
  {
    value: "yes-known",
    label: "Yes — and I know the amount",
    sub: "we'll factor it in",
  },
  {
    value: "yes-unknown",
    label: "Yes, but I don't remember the amount",
  },
  {
    value: "no-first-exchange",
    label: "No — this is the first exchange",
    sub: "between our families",
  },
  {
    value: "not-applicable",
    label: "Not applicable",
    sub: "I'm attending as a friend, not family",
  },
];

const BUDGET_OPTS: ChoiceOption<BudgetComfort>[] = [
  { value: "under-100", label: "Under $100" },
  { value: "100-200", label: "$100 – $200" },
  { value: "200-500", label: "$200 – $500" },
  { value: "500-1000", label: "$500 – $1,000" },
  { value: "1000-plus", label: "$1,000+" },
  { value: "skip", label: "I'd rather not say" },
];

// ── Step components ────────────────────────────────────────────────────────

const TOTAL = 5;

interface Step1Props {
  relationship: RelationshipTier | null;
  attendingAs: AttendingAs;
  onRelationship: (v: RelationshipTier) => void;
  onAttendingAs: (v: AttendingAs) => void;
  onNext: () => void;
}

export function Step1Relationship({
  relationship,
  attendingAs,
  onRelationship,
  onAttendingAs,
  onNext,
}: Step1Props) {
  return (
    <StepShell
      step={1}
      total={TOTAL}
      heading={
        <>
          how do you know <em>the couple?</em>
        </>
      }
      sub="Pick the closest description — we'll calibrate the amount from there."
      onNext={onNext}
      primaryDisabled={!relationship}
    >
      <Subgroup
        title="Your relationship"
        options={RELATIONSHIP_OPTS}
        value={relationship}
        onChange={onRelationship}
        twoCol
      />
      <Subgroup
        title="And you're attending…"
        options={ATTENDING_AS_OPTS}
        value={attendingAs}
        onChange={onAttendingAs}
        twoCol
      />
    </StepShell>
  );
}

interface Step2Props {
  weddingScale: WeddingScale | null;
  weddingStyle: WeddingStyle | null;
  eventCount: EventCount | null;
  onWeddingScale: (v: WeddingScale) => void;
  onWeddingStyle: (v: WeddingStyle) => void;
  onEventCount: (v: EventCount) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step2WeddingContext({
  weddingScale,
  weddingStyle,
  eventCount,
  onWeddingScale,
  onWeddingStyle,
  onEventCount,
  onNext,
  onBack,
}: Step2Props) {
  return (
    <StepShell
      step={2}
      total={TOTAL}
      heading={
        <>
          tell us about <em>the wedding</em>
        </>
      }
      sub="Bigger weddings, fancier venues, and destinations all push amounts up. One shagun covers all events — you don't give separately for each."
      onNext={onNext}
      onBack={onBack}
      primaryDisabled={!weddingScale || !weddingStyle || !eventCount}
    >
      <Subgroup
        title="Wedding scale"
        options={WEDDING_SCALE_OPTS}
        value={weddingScale}
        onChange={onWeddingScale}
        twoCol
      />
      <Subgroup
        title="Wedding style"
        options={WEDDING_STYLE_OPTS}
        value={weddingStyle}
        onChange={onWeddingStyle}
        twoCol
      />
      <Subgroup
        title="How many events are you attending?"
        options={EVENT_COUNT_OPTS}
        value={eventCount}
        onChange={onEventCount}
      />
    </StepShell>
  );
}

interface Step3Props {
  tradition: Tradition | null;
  location: Location | null;
  onTradition: (v: Tradition) => void;
  onLocation: (v: Location) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step3Cultural({
  tradition,
  location,
  onTradition,
  onLocation,
  onNext,
  onBack,
}: Step3Props) {
  return (
    <StepShell
      step={3}
      total={TOTAL}
      heading={
        <>
          what's the <em>cultural context?</em>
        </>
      }
      sub="Different traditions have different shagun norms. US-based amounts are significantly higher than India-based amounts — this matters."
      onNext={onNext}
      onBack={onBack}
      primaryDisabled={!tradition || !location}
    >
      <Subgroup
        title="The couple's tradition"
        options={TRADITION_OPTS}
        value={tradition}
        onChange={onTradition}
        twoCol
      />
      <Subgroup
        title="Where are you both?"
        options={LOCATION_OPTS}
        value={location}
        onChange={onLocation}
      />
    </StepShell>
  );
}

interface Step4Props {
  reciprocityStatus: ReciprocityStatus | null;
  reciprocityAmount: number | null;
  onReciprocityStatus: (v: ReciprocityStatus) => void;
  onReciprocityAmount: (v: number | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step4Reciprocity({
  reciprocityStatus,
  reciprocityAmount,
  onReciprocityStatus,
  onReciprocityAmount,
  onNext,
  onBack,
}: Step4Props) {
  const showAmount = reciprocityStatus === "yes-known";
  const canContinue =
    reciprocityStatus !== null &&
    (reciprocityStatus !== "yes-known" ||
      (reciprocityAmount !== null && reciprocityAmount > 0));

  return (
    <StepShell
      step={4}
      total={TOTAL}
      heading={
        <>
          has the couple's family given <em>you</em> shagun before?
        </>
      }
      sub="In many South Asian traditions, shagun is reciprocal. If they gave $251 at your wedding, giving less than that at theirs would be noticed."
      onNext={onNext}
      onBack={onBack}
      primaryDisabled={!canContinue}
    >
      <ChoiceList
        options={RECIPROCITY_OPTS}
        value={reciprocityStatus}
        onChange={onReciprocityStatus}
      />
      {showAmount && (
        <AmountField
          label="They gave us…"
          value={reciprocityAmount}
          onChange={onReciprocityAmount}
        />
      )}
    </StepShell>
  );
}

interface Step5Props {
  budgetComfort: BudgetComfort;
  onBudgetComfort: (v: BudgetComfort) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step5Budget({
  budgetComfort,
  onBudgetComfort,
  onNext,
  onBack,
}: Step5Props) {
  return (
    <StepShell
      step={5}
      total={TOTAL}
      heading={
        <>
          what feels <em>comfortable</em> for you?
        </>
      }
      sub="Optional. Stays between us — we'll never push an amount that puts you in a difficult position. If the expected amount is above your comfort zone, we'll tell you that and offer graceful options."
      onNext={onNext}
      onBack={onBack}
      onSkip={onNext}
      skipLabel="skip — show me anyway"
      primaryLabel="Calculate my shagun ✿"
    >
      <ChoiceList
        options={BUDGET_OPTS}
        value={budgetComfort === "skip" ? null : budgetComfort}
        onChange={onBudgetComfort}
        twoCol
      />
    </StepShell>
  );
}
