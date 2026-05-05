export type Events = '1' | '3' | '5' | '7+';
export type Guests = 'intimate' | 'classic' | 'grand' | 'epic';
export type Budget =
  | 'under-50k'
  | '50-100k'
  | '100-250k'
  | '250-500k'
  | '500k-plus'
  | 'unsure';
export type Vibe =
  | 'mughal'
  | 'modern'
  | 'garden'
  | 'bollywood'
  | 'coastal'
  | 'heritage';
export type Destination =
  | 'local'
  | 'us'
  | 'india'
  | 'international'
  | 'undecided';
export type Priority =
  | 'food'
  | 'photography'
  | 'decor'
  | 'music'
  | 'attire'
  | 'venue'
  | 'invitations'
  | 'beauty';
export type Timeline =
  | 'under-6m'
  | '6-12m'
  | '12-18m'
  | '18m-plus'
  | 'no-date';

export type BriefAnswers = {
  events: Events;
  guests: Guests;
  budget: Budget;
  vibe: Vibe;
  destination: Destination;
  priorities: [Priority, Priority, Priority];
  timeline: Timeline;
};

export type BriefRecord = BriefAnswers & {
  id: string;
  public_id: string;
  created_at: string;
};
