import type { VendorCategory } from "./vendor-unified";

export type InquiryStatus =
  | "submitted"
  | "viewed"
  | "responded"
  | "booked"
  | "declined"
  | "expired";

export type InquirySource =
  | "marketplace"
  | "profile_panel"
  | "recommendation"
  | "planner_referral";

export type MessageAttachment = {
  id: string;
  name: string;
  kind: "pdf" | "image";
  size: string;
};

export interface InquiryMessage {
  id: string;
  sender: "couple" | "vendor";
  sender_name: string;
  body: string;
  attachments: MessageAttachment[];
  created_at: string;
}

export interface Inquiry {
  id: string;
  status: InquiryStatus;
  couple_id: string;
  couple_name: string;
  vendor_id: string;
  vendor_name: string;
  vendor_category: VendorCategory;
  planner_id: string | null;
  source: InquirySource;
  package_ids: string[];
  wedding_date: string;
  guest_count: number;
  venue_name: string | null;
  events: string[];
  budget_min: number | null;
  budget_max: number | null;
  messages: InquiryMessage[];
  created_at: string;
  updated_at: string;
  viewed_at: string | null;
}
