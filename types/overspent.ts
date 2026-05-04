// Types for "Overspent or Worth It?" — splurge submissions that appear as
// pull-quote cards interleaved with regular Editorial articles on /blog.

export type OverspentVerdict = "worth_it" | "overspent";
export type OverspentRole = "bride" | "groom" | "parent" | "other";
export type OverspentStatus = "pending" | "approved" | "rejected";
export type OverspentVote = "agree" | "disagree";

export interface OverspentSubmission {
  id: string;
  splurge_item: string;
  amount: number | null;
  amount_hidden: boolean;
  verdict: OverspentVerdict;
  explanation: string;
  role: OverspentRole | null;
  guest_count: number | null;
  city: string | null;
  created_at: string;
  published_at: string | null;
}

export interface OverspentSubmissionWithVotes extends OverspentSubmission {
  agree_count: number;
  disagree_count: number;
}

export const SPLURGE_ITEM_MAX = 200;
export const EXPLANATION_MAX = 250;

export const ROLE_LABEL: Record<OverspentRole, string> = {
  bride: "Bride",
  groom: "Groom",
  parent: "Parent",
  other: "Other",
};

export function formatAttribution(s: OverspentSubmission): string {
  const parts: string[] = [];
  if (s.role) parts.push(ROLE_LABEL[s.role]);
  if (s.guest_count) parts.push(`${s.guest_count}-guest wedding`);
  if (s.city) parts.push(s.city);
  return parts.length === 0 ? "" : `— ${parts.join(", ")}`;
}

export function formatAmount(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}
