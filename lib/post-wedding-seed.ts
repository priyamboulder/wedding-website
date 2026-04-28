// ── Name Change checklist seed ────────────────────────────────────────────
// Inserted once the user first opens the Name Change tab (tracked by the
// `nameChangeSeeded` flag in the post-wedding store). Order matters — the
// UI groups by category and sorts by sortOrder within each category.

import type { NameChangeItem } from "@/types/post-wedding";

type SeedRow = Omit<NameChangeItem, "id" | "status" | "notes" | "completedAt">;

const ROWS: SeedRow[] = [
  // GOVERNMENT & LEGAL
  {
    category: "government",
    label: "Social Security card",
    description:
      "Visit your local SSA office with marriage certificate. Free, takes 2-4 weeks.",
    sortOrder: 10,
  },
  {
    category: "government",
    label: "Driver's license",
    description:
      "Visit DMV with updated Social Security card and marriage certificate.",
    sortOrder: 20,
  },
  {
    category: "government",
    label: "Passport",
    description:
      "Apply for a name change at the passport office. Need marriage certificate, current passport, and new photos.",
    sortOrder: 30,
  },
  {
    category: "government",
    label: "Voter registration",
    description: "Update online or at your local election office.",
    sortOrder: 40,
  },
  {
    category: "government",
    label: "Aadhaar card (India)",
    description:
      "Update at any Aadhaar enrollment center with marriage certificate.",
    sortOrder: 50,
  },
  {
    category: "government",
    label: "PAN card (India)",
    description: "Apply for correction online at NSDL/UTIITSL portal.",
    sortOrder: 60,
  },

  // FINANCIAL
  {
    category: "financial",
    label: "Bank accounts",
    description:
      "Visit your bank branch with marriage certificate and updated ID.",
    sortOrder: 10,
  },
  {
    category: "financial",
    label: "Credit cards",
    description: "Call each credit card company to request a name change.",
    sortOrder: 20,
  },
  {
    category: "financial",
    label: "Investment accounts",
    description: "Contact your brokerage or investment platform.",
    sortOrder: 30,
  },
  {
    category: "financial",
    label: "Insurance policies",
    description:
      "Health, auto, life, renters/homeowners — update all of them.",
    sortOrder: 40,
  },
  {
    category: "financial",
    label: "Tax accounts",
    description: "Update with IRS (US) or Income Tax department (India).",
    sortOrder: 50,
  },
  {
    category: "financial",
    label: "Retirement accounts",
    description: "Update 401(k), IRA, PPF, EPF as applicable.",
    sortOrder: 60,
  },

  // EMPLOYMENT
  {
    category: "employment",
    label: "Employer / HR records",
    description: "Submit name change to HR with supporting documents.",
    sortOrder: 10,
  },
  {
    category: "employment",
    label: "Business cards & email signature",
    description: "Update your professional materials.",
    sortOrder: 20,
  },
  {
    category: "employment",
    label: "LinkedIn & professional profiles",
    description: "Update your profile name and certifications.",
    sortOrder: 30,
  },

  // PERSONAL & DIGITAL
  {
    category: "personal",
    label: "Email accounts",
    description:
      "Create a new email or update the name on existing accounts.",
    sortOrder: 10,
  },
  {
    category: "personal",
    label: "Social media profiles",
    description:
      "Instagram, Facebook, Twitter — update as desired.",
    sortOrder: 20,
  },
  {
    category: "personal",
    label: "Subscriptions & memberships",
    description: "Gym, streaming services, loyalty programs, etc.",
    sortOrder: 30,
  },
  {
    category: "personal",
    label: "Utilities",
    description:
      "Electric, water, gas, internet — update account names.",
    sortOrder: 40,
  },
  {
    category: "personal",
    label: "Phone plan",
    description: "Contact your carrier to update the account name.",
    sortOrder: 50,
  },
  {
    category: "personal",
    label: "Medical records",
    description:
      "Notify your doctor, dentist, pharmacy, and insurance.",
    sortOrder: 60,
  },
  {
    category: "personal",
    label: "Vehicle registration & title",
    description: "Visit your DMV or RTO with updated documents.",
    sortOrder: 70,
  },
  {
    category: "personal",
    label: "Property records",
    description: "If you own property, update the deed.",
    sortOrder: 80,
  },
  {
    category: "personal",
    label: "Will & estate documents",
    description: "Update beneficiaries and legal name.",
    sortOrder: 90,
  },
];

export function buildNameChangeSeed(): NameChangeItem[] {
  return ROWS.map((row, idx) => ({
    ...row,
    id: `nc_${row.category}_${idx}`,
    status: "not_started",
    notes: "",
    completedAt: null,
  }));
}
