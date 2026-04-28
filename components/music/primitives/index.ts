// ── Music & Entertainment primitives — barrel ─────────────────────────────
// Central import point for every tab in the Music workspace. Tabs should
// import from this module rather than reach into individual files.

export { AttributionChip } from "./AttributionChip";
export type { AttributionChipProps } from "./AttributionChip";

export { StatePill } from "./StatePill";
export type { StatePillProps } from "./StatePill";

export {
  ReactionCluster,
  ReactionDetail,
  DEFAULT_CLUSTER_ORDER,
  nextReaction,
} from "./ReactionCluster";
export type { ReactionClusterProps } from "./ReactionCluster";

export { ReferenceEmbed } from "./ReferenceEmbed";
export type { ReferenceEmbedProps } from "./ReferenceEmbed";

export { CommentThread } from "./CommentThread";
export type { CommentThreadProps } from "./CommentThread";

export { WorkInProgressStrip } from "./WorkInProgressStrip";
export type { WorkInProgressStripProps } from "./WorkInProgressStrip";

export { EventFilterBar, matchesEventFilter } from "./EventFilterBar";
export type { EventFilterBarProps } from "./EventFilterBar";

export { PresenceIndicator } from "./PresenceIndicator";
export type { PresenceIndicatorProps } from "./PresenceIndicator";

// Re-export the lib helpers that tabs will need alongside the
// primitives, so a single import path covers "everything the tab needs
// to render shared UI".
export {
  ARJUN_ID,
  PRIYA_ID,
  URVASHI_ID,
  MUSIC_INTERNAL_PARTIES,
  buildMusicPartyMap,
  musicVendorParty,
  resolveMusicParty,
} from "@/lib/music/parties";

export { classifyUrl, firstUrl, isEmbeddable } from "@/lib/music/references";

export {
  MUSIC_EVENTS,
  MUSIC_REACTION_ORDER,
} from "@/types/music";

export type {
  MusicParty,
  MusicPartyId,
  MusicPartyRole,
  MusicPartyTone,
  MusicEntityState,
  MusicReaction,
  MusicReactionKind,
  MusicComment,
  MusicReference,
  MusicReferenceKind,
  MusicEventId,
  MusicEventOption,
  MusicPresenceSignal,
  MusicWipItem,
} from "@/types/music";
