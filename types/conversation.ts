import type { VendorCategory } from "./vendor-unified";
import type { MessageAttachment } from "./inquiry";

export type ParticipantRole = "couple" | "vendor" | "planner" | "other";

export interface Participant {
  id: string;
  role: ParticipantRole;
  name: string;
  vendor_category?: VendorCategory;
}

export interface ConversationMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: ParticipantRole;
  body: string;
  attachments: MessageAttachment[];
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  participants: Participant[];
  messages: ConversationMessage[];
  created_by: string;
  created_at: string;
  updated_at: string;
}
