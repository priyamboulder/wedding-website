export type PollCategory =
  | "ceremony_traditions"
  | "guest_experience"
  | "food_drinks"
  | "fashion_beauty"
  | "photography_video"
  | "music_entertainment"
  | "decor_venue"
  | "budget_planning"
  | "family_dynamics"
  | "honeymoon_post_wedding"
  | "invitations_communication"
  | "modern_vs_traditional"
  | "spicy_hot_takes"
  | "would_you_ever"
  | "this_or_that";

export type PollType = "binary" | "three_way" | "settle_this" | "would_you";

export type VoterType = "bride" | "groom" | "mom" | "other";

export interface Poll {
  id: string;
  question: string;
  category: PollCategory;
  options: string[];
  poll_type: PollType;
  is_featured: boolean;
  featured_date: string | null;
  created_at: string;
  zilla_zone_eligible?: boolean;
}

export interface PollSeed {
  question: string;
  category: PollCategory;
  options: string[];
  poll_type: PollType;
  is_featured?: boolean;
  featured_date?: string | null;
}

export interface PollVote {
  id: string;
  poll_id: string;
  user_id: string | null;
  option_index: number;
  voter_type: VoterType | null;
  city: string | null;
  context: string | null;
  fingerprint: string | null;
  created_at: string;
}

export interface PollVoteCount {
  poll_id: string;
  option_index: number;
  option_label: string | null;
  vote_count: number;
}
