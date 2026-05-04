// Slug → component map for the 45 mini tools per the Ananya build spec.
// /tools/[slug] checks this first; falls back to ToolPlaceholderPage when a
// slug isn't registered here yet.
//
// To ship a new mini tool: build the component under components/marigold-tools/mini/,
// add the entry below, and flip its catalog entry to status: 'live' in
// lib/tools/catalog.ts.

import type { ComponentType } from 'react';
import { AuntyApproval } from './AuntyApproval';
import { AuspiciousColorFinder } from './AuspiciousColorFinder';
import { BaraatDurationEstimator } from './BaraatDurationEstimator';
import { BollywoodWedding } from './BollywoodWedding';
import { BridalEntrySong } from './BridalEntrySong';
import { CeremonyDurationEstimator } from './CeremonyDurationEstimator';
import { ColorPaletteGenerator } from './ColorPaletteGenerator';
import { CoupleNickname } from './CoupleNickname';
import { DayOfTimeline } from './DayOfTimeline';
import { EmergencyKit } from './EmergencyKit';
import { FamilyDramaPredictor } from './FamilyDramaPredictor';
import { GettingReadyTimeline } from './GettingReadyTimeline';
import { HotelRoomBlockEstimator } from './HotelRoomBlockEstimator';
import { HowExtra } from './HowExtra';
import { IndiaShoppingConverter } from './IndiaShoppingConverter';
import { InvitationTimeline } from './InvitationTimeline';
import { KidsOrNoKidsCalculator } from './KidsOrNoKidsCalculator';
import { LehengaCarryOn } from './LehengaCarryOn';
import { ManglikCheck } from './ManglikCheck';
import { MehendiTimeCalculator } from './MehendiTimeCalculator';
import { MercuryRetrogradeChecker } from './MercuryRetrogradeChecker';
import { MoonSignFinder } from './MoonSignFinder';
import { MuhuratWindowFinder } from './MuhuratWindowFinder';
import { NameToNakshatra } from './NameToNakshatra';
import { OpenBarVsCashBar } from './OpenBarVsCashBar';
import { OutfitChanges } from './OutfitChanges';
import { OvertimeCostEstimator } from './OvertimeCostEstimator';
import { ParkingShuttle } from './ParkingShuttle';
import { PerGuestCostCalculator } from './PerGuestCostCalculator';
import { PhotoShotList } from './PhotoShotList';
import { PlanetaryTransitAlert } from './PlanetaryTransitAlert';
import { PlateCountCalculator } from './PlateCountCalculator';
import { PlusOnePolicy } from './PlusOnePolicy';
import { RashiQuickCheck } from './RashiQuickCheck';
import { RsvpFollowup } from './RsvpFollowup';
import { SangeetTheme } from './SangeetTheme';
import { SeatingDifficulty } from './SeatingDifficulty';
import { ShaadiCountdown } from './ShaadiCountdown';
import { VendorBookingTimeline } from './VendorBookingTimeline';
import { VendorContactSheet } from './VendorContactSheet';
import { VendorQuestionGenerator } from './VendorQuestionGenerator';
import { VendorTipCalculator } from './VendorTipCalculator';
import { WeatherBackup } from './WeatherBackup';
import { WeddingAestheticQuiz } from './WeddingAestheticQuiz';
import { WeddingBingo } from './WeddingBingo';
import { WeddingHashtagGenerator } from './WeddingHashtagGenerator';
import { WeddingPartySize } from './WeddingPartySize';
import { WeddingROICalculator } from './WeddingROICalculator';
import { WeddingSeasonChecker } from './WeddingSeasonChecker';
import { WeddingWebsiteChecklist } from './WeddingWebsiteChecklist';
import { WeddingWeekendLite } from './WeddingWeekendLite';
import { WhoPaysForWhat } from './WhoPaysForWhat';
import { WhoWalksWhen } from './WhoWalksWhen';

export const MINI_TOOL_REGISTRY: Record<string, ComponentType> = {
  'aunty-approval': AuntyApproval,
  'auspicious-color': AuspiciousColorFinder,
  'baraat-duration': BaraatDurationEstimator,
  'bollywood-wedding': BollywoodWedding,
  'bridal-entry-song': BridalEntrySong,
  'ceremony-duration': CeremonyDurationEstimator,
  'color-palette': ColorPaletteGenerator,
  'couple-nickname': CoupleNickname,
  'day-of-timeline-lite': DayOfTimeline,
  'emergency-kit': EmergencyKit,
  'family-drama': FamilyDramaPredictor,
  'getting-ready-timeline': GettingReadyTimeline,
  'hotel-room-block': HotelRoomBlockEstimator,
  'how-extra': HowExtra,
  'india-shopping-budget': IndiaShoppingConverter,
  'invitation-timeline': InvitationTimeline,
  'kids-or-no-kids': KidsOrNoKidsCalculator,
  'lehenga-carryon': LehengaCarryOn,
  'manglik-quick-check': ManglikCheck,
  'mehendi-time': MehendiTimeCalculator,
  'mercury-retrograde': MercuryRetrogradeChecker,
  'moon-sign': MoonSignFinder,
  'muhurat-window': MuhuratWindowFinder,
  'name-to-nakshatra': NameToNakshatra,
  'open-vs-cash-bar': OpenBarVsCashBar,
  'outfit-changes': OutfitChanges,
  'overtime-cost': OvertimeCostEstimator,
  'parking-shuttle': ParkingShuttle,
  'per-guest-cost': PerGuestCostCalculator,
  'photo-shot-list': PhotoShotList,
  'planetary-transit-alert': PlanetaryTransitAlert,
  'plate-count': PlateCountCalculator,
  'plus-one-policy': PlusOnePolicy,
  'rashi-quick-match': RashiQuickCheck,
  'rsvp-followup': RsvpFollowup,
  'sangeet-theme': SangeetTheme,
  'seating-complexity': SeatingDifficulty,
  'shaadi-countdown': ShaadiCountdown,
  'vendor-booking-timeline': VendorBookingTimeline,
  'vendor-contact-sheet': VendorContactSheet,
  'vendor-question-generator': VendorQuestionGenerator,
  'vendor-tip': VendorTipCalculator,
  'weather-backup': WeatherBackup,
  'wedding-aesthetic-quiz': WeddingAestheticQuiz,
  'wedding-bingo': WeddingBingo,
  'wedding-hashtag': WeddingHashtagGenerator,
  'wedding-party-size': WeddingPartySize,
  'wedding-roi': WeddingROICalculator,
  'wedding-season': WeddingSeasonChecker,
  'wedding-website-checklist': WeddingWebsiteChecklist,
  'wedding-weekend-lite': WeddingWeekendLite,
  'who-pays': WhoPaysForWhat,
  'who-walks-when': WhoWalksWhen,
};

export function getMiniToolComponent(slug: string): ComponentType | null {
  return MINI_TOOL_REGISTRY[slug] ?? null;
}
