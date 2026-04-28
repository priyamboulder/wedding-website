// ── Bachelor destination pool + scoring ───────────────────────────────────
// Curated destination library for the discovery phase of the Bachelor
// module. Same scoring shape as bachelorette but with a bachelor-party
// pool: golf towns, fishing spots, ski mountains, bourbon country, event
// cities, and the usual nightlife suspects — plus a few under-the-radar
// picks the crew wouldn't have thought of.

import type {
  BudgetTier,
  CrewBracket,
  Destination,
  DestinationScore,
  DestinationWeatherMonth,
  GroomInterest,
  VibeProfile,
} from "@/types/bachelor";

function w(
  high: number,
  low: number,
  score: number,
  flag?: string,
): DestinationWeatherMonth {
  return flag ? { high, low, score, flag } : { high, low, score };
}

export const DESTINATIONS: Destination[] = [
  {
    id: "scottsdale",
    name: "Scottsdale, AZ",
    hook: "Golf by day, Old Town by night, zero regrets",
    region: "domestic",
    palette: ["#C4766E", "#E8C4A0", "#F5E6D3"],
    drivableWeekend: false,
    vibeAffinity: {
      guys_trip: 95,
      go_big: 80,
      event_anchored: 70,
      lowkey: 55,
      get_after_it: 50,
      beach_bars: 35,
    },
    interestStrengths: ["golf", "bourbon", "sports_watching", "cigars"],
    budgetFit: ["600_1000", "1000_2000", "sky"],
    crewFit: ["4_6", "7_10", "11_15", "16_plus"],
    activityHighlights: [
      "TPC Stadium Course",
      "Old Town bar crawl",
      "Spring training",
      "Desert ATV",
    ],
    estPerPersonUsd: {
      "600_1000": [700, 980],
      "1000_2000": [1200, 1800],
      sky: [2000, 3500],
    },
    avoidSignals: ["extreme_heat"],
    weather: {
      january: w(67, 44, 85, "Warm days, cool nights"),
      february: w(71, 47, 90, "Prime — spring training in town"),
      march: w(77, 53, 95, "Peak — book golf 60 days out"),
      april: w(85, 60, 90),
      may: w(94, 68, 65, "Pool time from 1-4 mandatory"),
      june: w(104, 77, 30, "Brutal — locals hide indoors"),
      july: w(106, 83, 25, "Monsoon + extreme heat"),
      august: w(104, 82, 30, "Still brutal"),
      september: w(100, 76, 50, "Cooling but still hot"),
      october: w(89, 63, 85),
      november: w(76, 51, 90, "Ideal"),
      december: w(67, 44, 80),
      flexible: w(85, 60, 85),
    },
  },
  {
    id: "nashville",
    name: "Nashville, TN",
    hook: "Broadway, hot chicken, and honky-tonks 'til last call",
    region: "domestic",
    palette: ["#D4A853", "#8B4513", "#F5E6D3"],
    drivableWeekend: true,
    vibeAffinity: {
      go_big: 95,
      guys_trip: 75,
      event_anchored: 80,
      beach_bars: 40,
      lowkey: 40,
      get_after_it: 35,
    },
    interestStrengths: [
      "live_music",
      "bourbon",
      "sports_watching",
      "bbq_cooking",
    ],
    budgetFit: ["300_600", "600_1000", "1000_2000"],
    crewFit: ["4_6", "7_10", "11_15", "16_plus"],
    activityHighlights: [
      "Broadway bar crawl",
      "Pedal tavern",
      "Titans or Preds game",
      "Hot chicken trail",
    ],
    estPerPersonUsd: {
      "300_600": [380, 560],
      "600_1000": [620, 900],
      "1000_2000": [1100, 1600],
    },
    avoidSignals: ["big_crowds"],
    weather: {
      january: w(48, 30, 45, "Cold and drizzly"),
      february: w(53, 33, 55),
      march: w(61, 41, 75),
      april: w(71, 49, 95, "Peak spring"),
      may: w(78, 58, 90),
      june: w(86, 67, 75, "Hot, humid, patio weather"),
      july: w(89, 71, 65, "Hot, thunderstorms"),
      august: w(88, 70, 65, "Hot, thunderstorms"),
      september: w(83, 63, 90, "Football season kickoff"),
      october: w(72, 51, 95, "Peak fall, Titans season"),
      november: w(60, 40, 70),
      december: w(51, 34, 55, "Holiday crowds"),
      flexible: w(70, 50, 85),
    },
  },
  {
    id: "vegas",
    name: "Las Vegas, NV",
    hook: "The original — go big, skip sleep, settle up later",
    region: "domestic",
    palette: ["#8B1A1A", "#D4A853", "#1A1A1A"],
    drivableWeekend: false,
    vibeAffinity: {
      go_big: 100,
      event_anchored: 90,
      guys_trip: 55,
      beach_bars: 40,
      lowkey: 20,
      get_after_it: 25,
    },
    interestStrengths: [
      "poker",
      "golf",
      "sports_watching",
      "live_music",
      "cars_racing",
    ],
    budgetFit: ["300_600", "600_1000", "1000_2000", "sky"],
    crewFit: ["4_6", "7_10", "11_15", "16_plus"],
    activityHighlights: [
      "Dayclub / nightclub combo",
      "Bottle service",
      "Poker room",
      "UFC / fights / F1",
    ],
    estPerPersonUsd: {
      "300_600": [420, 590],
      "600_1000": [650, 950],
      "1000_2000": [1200, 1900],
      sky: [2200, 4500],
    },
    avoidSignals: ["extreme_heat", "big_crowds"],
    yellowFlag: "Pace yourself",
    weather: {
      january: w(58, 39, 75, "Cool, great for outdoor stuff"),
      february: w(63, 43, 80),
      march: w(71, 50, 90, "Prime — fights, March Madness"),
      april: w(80, 57, 95),
      may: w(89, 66, 80),
      june: w(100, 75, 55, "Hot — pool or indoors only"),
      july: w(106, 82, 35, "Dangerous heat"),
      august: w(104, 81, 40, "Still brutal"),
      september: w(95, 71, 65),
      october: w(82, 58, 90, "F1 weekend in Nov — book early"),
      november: w(68, 46, 85, "F1 race week"),
      december: w(58, 39, 75),
      flexible: w(80, 60, 85),
    },
  },
  {
    id: "austin",
    name: "Austin, TX",
    hook: "Breakfast tacos, Rainey Street, and lake days",
    region: "domestic",
    palette: ["#4A3B2A", "#D4A853", "#F5E6D3"],
    drivableWeekend: true,
    vibeAffinity: {
      go_big: 85,
      guys_trip: 75,
      beach_bars: 60,
      event_anchored: 80,
      lowkey: 45,
      get_after_it: 55,
    },
    interestStrengths: [
      "live_music",
      "bbq_cooking",
      "sports_watching",
      "water_sports",
    ],
    budgetFit: ["300_600", "600_1000", "1000_2000"],
    crewFit: ["4_6", "7_10", "11_15", "16_plus"],
    activityHighlights: [
      "Lake Travis boat day",
      "Rainey Street bars",
      "BBQ crawl (Franklin, la Barbecue)",
      "Longhorns game",
    ],
    estPerPersonUsd: {
      "300_600": [400, 580],
      "600_1000": [650, 920],
      "1000_2000": [1100, 1700],
    },
    avoidSignals: ["extreme_heat", "big_crowds"],
    weather: {
      january: w(62, 42, 65),
      february: w(66, 45, 75),
      march: w(73, 52, 85, "SXSW week is chaos — avoid mid-March"),
      april: w(80, 60, 95, "Peak — lake opens"),
      may: w(86, 67, 85),
      june: w(93, 73, 70, "Hot but bearable at night"),
      july: w(97, 75, 55, "Brutal heat"),
      august: w(98, 76, 50, "Brutal heat"),
      september: w(91, 71, 75),
      october: w(82, 61, 95, "ACL crowds but peak weather"),
      november: w(71, 51, 90, "Football weekends are prime"),
      december: w(63, 44, 70),
      flexible: w(80, 60, 85),
    },
  },
  {
    id: "miami",
    name: "Miami, FL",
    hook: "Dayclubs, ocean drives, and dinners that turn into nights",
    region: "domestic",
    palette: ["#00A6D6", "#E8A895", "#F5E6D3"],
    drivableWeekend: false,
    vibeAffinity: {
      go_big: 95,
      beach_bars: 95,
      event_anchored: 75,
      guys_trip: 55,
      lowkey: 20,
      get_after_it: 35,
    },
    interestStrengths: [
      "sports_watching",
      "water_sports",
      "live_music",
      "cigars",
    ],
    budgetFit: ["600_1000", "1000_2000", "sky"],
    crewFit: ["4_6", "7_10", "11_15"],
    activityHighlights: [
      "Yacht charter",
      "Dayclubs (LIV Beach, Nikki)",
      "Wynwood dinner",
      "Heat game",
    ],
    estPerPersonUsd: {
      "600_1000": [750, 980],
      "1000_2000": [1200, 1900],
      sky: [2100, 4000],
    },
    avoidSignals: ["big_crowds"],
    weather: {
      january: w(76, 62, 90, "Dry season — ideal"),
      february: w(78, 63, 95, "Peak"),
      march: w(80, 66, 90, "Spring break crowds mid-month"),
      april: w(83, 69, 85),
      may: w(86, 73, 75),
      june: w(88, 76, 60, "Humid, afternoon storms"),
      july: w(89, 77, 55, "Hurricane season ramps"),
      august: w(90, 77, 50, "Peak hurricane risk"),
      september: w(88, 76, 45, "Hurricane peak"),
      october: w(85, 73, 65),
      november: w(80, 68, 85, "Dry season starting"),
      december: w(77, 64, 90),
      flexible: w(83, 70, 85),
    },
  },
  {
    id: "bozeman",
    name: "Bozeman, MT",
    hook: "Fly fishing, big sky, and steaks the size of your head",
    region: "domestic",
    palette: ["#4A6548", "#8B4513", "#F5E6D3"],
    drivableWeekend: false,
    vibeAffinity: {
      get_after_it: 95,
      guys_trip: 90,
      lowkey: 70,
      event_anchored: 40,
      go_big: 25,
      beach_bars: 5,
    },
    interestStrengths: [
      "fishing",
      "hiking",
      "hunting",
      "bourbon",
      "bbq_cooking",
    ],
    budgetFit: ["600_1000", "1000_2000"],
    crewFit: ["4_6", "7_10", "11_15"],
    activityHighlights: [
      "Yellowstone day",
      "Fly fishing guide",
      "Downtown Main Street",
      "Hot springs soak",
    ],
    estPerPersonUsd: {
      "600_1000": [700, 950],
      "1000_2000": [1150, 1650],
    },
    avoidSignals: ["cold_weather"],
    weather: {
      january: w(34, 14, 35, "Ski-trip cold"),
      february: w(39, 17, 40),
      march: w(46, 23, 55),
      april: w(56, 30, 70),
      may: w(66, 38, 85),
      june: w(74, 45, 95, "Rivers open, prime"),
      july: w(83, 50, 95, "Peak — book lodging early"),
      august: w(82, 49, 95, "Peak"),
      september: w(71, 40, 90, "Shoulder season steal"),
      october: w(58, 31, 75),
      november: w(42, 22, 45),
      december: w(34, 15, 35, "Big Sky skiing nearby"),
      flexible: w(65, 35, 80),
    },
  },
  {
    id: "park_city",
    name: "Park City, UT",
    hook: "Ski by day, hot tub and whiskey by night",
    region: "domestic",
    palette: ["#6B8E9C", "#F5F5F5", "#2E3B4E"],
    drivableWeekend: false,
    vibeAffinity: {
      get_after_it: 95,
      guys_trip: 80,
      lowkey: 75,
      event_anchored: 45,
      go_big: 50,
      beach_bars: 5,
    },
    interestStrengths: ["skiing", "bourbon", "poker", "hiking"],
    budgetFit: ["600_1000", "1000_2000", "sky"],
    crewFit: ["4_6", "7_10", "11_15"],
    activityHighlights: [
      "Deer Valley / Canyons",
      "Main Street bars",
      "High West distillery",
      "Cat-skiing day",
    ],
    estPerPersonUsd: {
      "600_1000": [750, 980],
      "1000_2000": [1200, 1850],
      sky: [2100, 3800],
    },
    avoidSignals: ["cold_weather"],
    weather: {
      january: w(33, 15, 90, "Peak powder"),
      february: w(36, 17, 95, "Deep snow, Sundance early Feb"),
      march: w(44, 22, 90, "Sunny spring skiing"),
      april: w(53, 29, 65, "Mud season starts"),
      may: w(63, 36, 45, "Between seasons"),
      june: w(74, 44, 70, "Hiking + biking opens"),
      july: w(82, 51, 85, "Summer — surprising steal"),
      august: w(81, 50, 85),
      september: w(72, 42, 80, "Aspen season"),
      october: w(60, 32, 55, "Pre-season"),
      november: w(46, 24, 65, "Early-season soft opens"),
      december: w(34, 17, 85, "Holiday crowds"),
      flexible: w(55, 30, 80),
    },
  },
  {
    id: "louisville",
    name: "Louisville, KY",
    hook: "Bourbon trail, steakhouses, and Derby-day energy",
    region: "domestic",
    palette: ["#8B4513", "#D4A853", "#F5E6D3"],
    drivableWeekend: true,
    vibeAffinity: {
      guys_trip: 95,
      event_anchored: 85,
      lowkey: 70,
      go_big: 55,
      get_after_it: 25,
      beach_bars: 15,
    },
    interestStrengths: ["bourbon", "sports_watching", "cigars", "bbq_cooking"],
    budgetFit: ["300_600", "600_1000", "1000_2000"],
    crewFit: ["4_6", "7_10", "11_15"],
    activityHighlights: [
      "Bourbon trail day (Buffalo Trace, Maker's)",
      "Churchill Downs",
      "Whiskey Row bars",
      "Louisville Slugger tour",
    ],
    estPerPersonUsd: {
      "300_600": [400, 570],
      "600_1000": [630, 890],
      "1000_2000": [1100, 1600],
    },
    avoidSignals: [],
    weather: {
      january: w(43, 27, 50),
      february: w(48, 30, 55),
      march: w(59, 39, 75),
      april: w(69, 48, 90),
      may: w(78, 58, 95, "Derby week — prices spike"),
      june: w(86, 66, 85),
      july: w(89, 70, 75),
      august: w(88, 69, 75),
      september: w(82, 62, 90),
      october: w(71, 49, 95, "Peak — bourbon harvest"),
      november: w(58, 39, 70),
      december: w(46, 30, 55),
      flexible: w(70, 50, 85),
    },
  },
  {
    id: "charleston",
    name: "Charleston, SC",
    hook: "Oysters on the rooftop, golf on Kiawah, steaks downtown",
    region: "domestic",
    palette: ["#E8D4B0", "#A8876D", "#F5E6D3"],
    drivableWeekend: true,
    vibeAffinity: {
      guys_trip: 85,
      go_big: 60,
      lowkey: 65,
      beach_bars: 70,
      event_anchored: 55,
      get_after_it: 40,
    },
    interestStrengths: ["golf", "bourbon", "fishing", "water_sports"],
    budgetFit: ["600_1000", "1000_2000"],
    crewFit: ["4_6", "7_10", "11_15"],
    activityHighlights: [
      "Kiawah Island golf",
      "Inshore fishing charter",
      "King Street bar crawl",
      "Rooftop oyster dinner",
    ],
    estPerPersonUsd: {
      "600_1000": [720, 960],
      "1000_2000": [1150, 1650],
    },
    avoidSignals: ["extreme_heat", "bugs"],
    weather: {
      january: w(59, 40, 60),
      february: w(62, 43, 65),
      march: w(69, 50, 85),
      april: w(77, 57, 95, "Peak spring"),
      may: w(84, 65, 85),
      june: w(89, 72, 65, "Humid, bugs"),
      july: w(92, 75, 55, "Muggy"),
      august: w(90, 74, 55, "Muggy"),
      september: w(85, 69, 70, "Hurricane season peak"),
      october: w(77, 59, 95, "Peak fall"),
      november: w(69, 50, 85),
      december: w(61, 43, 65),
      flexible: w(76, 58, 85),
    },
  },
  {
    id: "bend",
    name: "Bend, OR",
    hook: "Brewery bike trail, Deschutes float, and mountain air",
    region: "domestic",
    palette: ["#6B8E9C", "#A8876D", "#F5E6D3"],
    drivableWeekend: true,
    vibeAffinity: {
      get_after_it: 95,
      guys_trip: 80,
      lowkey: 65,
      event_anchored: 35,
      go_big: 35,
      beach_bars: 15,
    },
    interestStrengths: [
      "craft_beer",
      "hiking",
      "fishing",
      "skiing",
      "hunting",
    ],
    budgetFit: ["300_600", "600_1000", "1000_2000"],
    crewFit: ["4_6", "7_10"],
    activityHighlights: [
      "Deschutes River float",
      "Brewery bike trail",
      "Smith Rock hike",
      "Hot springs soak",
    ],
    estPerPersonUsd: {
      "300_600": [420, 580],
      "600_1000": [640, 900],
      "1000_2000": [1100, 1550],
    },
    avoidSignals: ["cold_weather"],
    weather: {
      january: w(41, 23, 40, "Mt. Bachelor is stacked"),
      february: w(45, 24, 45),
      march: w(52, 28, 55),
      april: w(59, 32, 70),
      may: w(67, 37, 85),
      june: w(75, 43, 90, "River opens"),
      july: w(83, 47, 95, "Peak — float days"),
      august: w(83, 46, 95, "Peak"),
      september: w(76, 40, 90),
      october: w(63, 32, 70),
      november: w(48, 27, 50),
      december: w(41, 23, 40),
      flexible: w(67, 37, 80),
    },
  },
  {
    id: "tahoe",
    name: "Lake Tahoe",
    hook: "Lakefront rental, boat day, poker till sunrise",
    region: "domestic",
    palette: ["#2C5F8D", "#4A6548", "#F5E6D3"],
    drivableWeekend: true,
    vibeAffinity: {
      get_after_it: 85,
      guys_trip: 90,
      lowkey: 85,
      beach_bars: 55,
      go_big: 45,
      event_anchored: 35,
    },
    interestStrengths: [
      "water_sports",
      "fishing",
      "skiing",
      "poker",
      "hiking",
    ],
    budgetFit: ["600_1000", "1000_2000", "sky"],
    crewFit: ["4_6", "7_10", "11_15"],
    activityHighlights: [
      "Boat charter day",
      "Lakefront rental + grill",
      "Heavenly or Palisades",
      "Reno casinos if you're bored",
    ],
    estPerPersonUsd: {
      "600_1000": [700, 970],
      "1000_2000": [1150, 1750],
      sky: [1900, 3500],
    },
    avoidSignals: ["cold_weather"],
    weather: {
      january: w(40, 20, 85, "Ski-trip mode"),
      february: w(41, 21, 85),
      march: w(47, 24, 75),
      april: w(55, 28, 60, "Mud season"),
      may: w(64, 33, 60),
      june: w(74, 39, 85),
      july: w(82, 44, 95, "Peak summer — boat days"),
      august: w(82, 43, 95, "Peak"),
      september: w(74, 37, 90),
      october: w(62, 29, 70),
      november: w(48, 24, 50),
      december: w(41, 21, 80),
      flexible: w(60, 30, 80),
    },
  },
  {
    id: "new_orleans",
    name: "New Orleans, LA",
    hook: "French Quarter, Bourbon Street, po'boys at 3am",
    region: "domestic",
    palette: ["#5D3A9B", "#D4A853", "#F5E6D3"],
    drivableWeekend: true,
    vibeAffinity: {
      go_big: 90,
      event_anchored: 80,
      beach_bars: 45,
      guys_trip: 55,
      lowkey: 35,
      get_after_it: 25,
    },
    interestStrengths: [
      "live_music",
      "bourbon",
      "sports_watching",
      "bbq_cooking",
    ],
    budgetFit: ["300_600", "600_1000", "1000_2000"],
    crewFit: ["4_6", "7_10", "11_15", "16_plus"],
    activityHighlights: [
      "Frenchmen St live music",
      "Commander's Palace dinner",
      "Swamp tour",
      "Saints game",
    ],
    estPerPersonUsd: {
      "300_600": [400, 580],
      "600_1000": [650, 920],
      "1000_2000": [1100, 1650],
    },
    avoidSignals: ["extreme_heat", "big_crowds"],
    yellowFlag: "Avoid Mardi Gras unless that IS the plan",
    weather: {
      january: w(62, 45, 65),
      february: w(66, 47, 70, "Mardi Gras madness"),
      march: w(72, 54, 85),
      april: w(78, 60, 90, "Peak — Jazz Fest prime"),
      may: w(85, 68, 80),
      june: w(90, 73, 70, "Humid"),
      july: w(91, 75, 60, "Brutal + storms"),
      august: w(91, 75, 55, "Hurricane season"),
      september: w(87, 72, 60),
      october: w(80, 63, 90, "Saints season"),
      november: w(72, 53, 85),
      december: w(64, 47, 70),
      flexible: w(78, 60, 85),
    },
  },
  {
    id: "asheville",
    name: "Asheville, NC",
    hook: "Breweries, Blue Ridge hikes, cabin with a hot tub",
    region: "domestic",
    palette: ["#4A6548", "#C89B7B", "#F5E6D3"],
    drivableWeekend: true,
    vibeAffinity: {
      get_after_it: 85,
      lowkey: 85,
      guys_trip: 75,
      go_big: 30,
      event_anchored: 40,
      beach_bars: 10,
    },
    interestStrengths: [
      "craft_beer",
      "hiking",
      "bourbon",
      "live_music",
      "bbq_cooking",
    ],
    budgetFit: ["300_600", "600_1000", "1000_2000"],
    crewFit: ["4_6", "7_10", "11_15"],
    activityHighlights: [
      "Brewery crawl (Wicked Weed, Burial)",
      "Blue Ridge Parkway drive",
      "Cabin + hot tub rental",
      "Zip line / whitewater",
    ],
    estPerPersonUsd: {
      "300_600": [400, 570],
      "600_1000": [620, 880],
      "1000_2000": [1050, 1500],
    },
    avoidSignals: ["cold_weather"],
    weather: {
      january: w(47, 27, 40, "Cold — cabin weather"),
      february: w(51, 29, 45),
      march: w(59, 36, 70),
      april: w(67, 43, 85),
      may: w(74, 52, 90),
      june: w(80, 60, 85),
      july: w(83, 64, 80),
      august: w(82, 63, 80),
      september: w(76, 57, 90),
      october: w(67, 45, 95, "Peak fall foliage"),
      november: w(57, 36, 75),
      december: w(49, 30, 50),
      flexible: w(70, 48, 85),
    },
  },
  {
    id: "broken_bow",
    name: "Broken Bow, OK",
    hook: "The cabin weekend — Texas crew's favorite under-the-radar spot",
    region: "domestic",
    palette: ["#4A6548", "#8B4513", "#F5E6D3"],
    drivableWeekend: true,
    vibeAffinity: {
      lowkey: 95,
      guys_trip: 85,
      get_after_it: 65,
      event_anchored: 20,
      go_big: 15,
      beach_bars: 15,
    },
    interestStrengths: ["fishing", "hunting", "bbq_cooking", "bourbon", "poker"],
    budgetFit: ["under_300", "300_600", "600_1000"],
    crewFit: ["4_6", "7_10", "11_15"],
    activityHighlights: [
      "Giant cabin with hot tub",
      "Fly fishing Mountain Fork",
      "Lake day",
      "Cigars on the porch",
    ],
    estPerPersonUsd: {
      under_300: [220, 290],
      "300_600": [320, 540],
      "600_1000": [620, 880],
    },
    avoidSignals: [],
    weather: {
      january: w(52, 30, 55),
      february: w(57, 33, 60),
      march: w(66, 42, 80),
      april: w(74, 50, 90),
      may: w(81, 59, 85),
      june: w(87, 67, 80),
      july: w(92, 71, 75),
      august: w(91, 69, 75),
      september: w(84, 62, 90),
      october: w(74, 49, 95),
      november: w(62, 39, 80),
      december: w(53, 31, 60),
      flexible: w(73, 52, 85),
    },
  },
  {
    id: "cabo",
    name: "Cabo San Lucas, Mexico",
    hook: "Beach clubs, deep sea fishing, and margaritas at Mando's",
    region: "international",
    palette: ["#E8A895", "#2C5F8D", "#F5E6D3"],
    drivableWeekend: false,
    vibeAffinity: {
      go_big: 85,
      beach_bars: 95,
      guys_trip: 75,
      event_anchored: 50,
      lowkey: 40,
      get_after_it: 50,
    },
    interestStrengths: [
      "fishing",
      "water_sports",
      "golf",
      "sports_watching",
    ],
    budgetFit: ["600_1000", "1000_2000", "sky"],
    crewFit: ["4_6", "7_10", "11_15"],
    activityHighlights: [
      "Deep sea fishing charter",
      "Medano Beach club day",
      "Diamante golf",
      "Arch boat sunset",
    ],
    estPerPersonUsd: {
      "600_1000": [750, 980],
      "1000_2000": [1200, 1900],
      sky: [2100, 3900],
    },
    avoidSignals: ["extreme_heat"],
    weather: {
      january: w(77, 58, 90, "Dry season prime"),
      february: w(78, 58, 95, "Peak"),
      march: w(81, 59, 95),
      april: w(84, 61, 90),
      may: w(87, 64, 85),
      june: w(92, 69, 75),
      july: w(94, 73, 70),
      august: w(96, 76, 65, "Hurricane season ramps"),
      september: w(95, 76, 55, "Peak hurricane risk"),
      october: w(91, 73, 70),
      november: w(85, 67, 85),
      december: w(79, 60, 90),
      flexible: w(87, 67, 85),
    },
  },
  {
    id: "iceland",
    name: "Iceland (Reykjavik)",
    hook: "Glaciers, hot springs, and nightlife that surprises everyone",
    region: "international",
    palette: ["#2C5F8D", "#4A6548", "#F5F5F5"],
    drivableWeekend: false,
    vibeAffinity: {
      get_after_it: 95,
      guys_trip: 70,
      lowkey: 55,
      event_anchored: 30,
      go_big: 60,
      beach_bars: 10,
    },
    interestStrengths: ["hiking", "craft_beer", "fishing"],
    budgetFit: ["1000_2000", "sky"],
    crewFit: ["4_6", "7_10"],
    activityHighlights: [
      "Blue Lagoon / Sky Lagoon",
      "Golden Circle drive",
      "Glacier hike",
      "Laugavegur bar crawl",
    ],
    estPerPersonUsd: {
      "1000_2000": [1400, 1950],
      sky: [2200, 3800],
    },
    avoidSignals: ["cold_weather", "red_eye"],
    weather: {
      january: w(36, 28, 60, "Northern lights prime"),
      february: w(38, 28, 65),
      march: w(41, 29, 70),
      april: w(45, 33, 80),
      may: w(50, 39, 90, "Midnight sun starts"),
      june: w(55, 45, 95, "Peak — 20+ hr daylight"),
      july: w(58, 48, 95, "Peak"),
      august: w(56, 47, 90),
      september: w(51, 42, 85, "Northern lights return"),
      october: w(44, 36, 75),
      november: w(38, 30, 65),
      december: w(36, 28, 60),
      flexible: w(48, 38, 80),
    },
  },
];

// ── Scoring ───────────────────────────────────────────────────────────────

interface ScoringWeights {
  vibe: number;
  budget: number;
  weather: number;
  travel: number;
  crew: number;
  interests: number;
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  vibe: 0.26,
  budget: 0.22,
  weather: 0.18,
  interests: 0.16,
  travel: 0.12,
  crew: 0.06,
};

const BUDGET_ORDER: BudgetTier[] = [
  "under_300",
  "300_600",
  "600_1000",
  "1000_2000",
  "sky",
];

const CREW_ORDER: CrewBracket[] = ["4_6", "7_10", "11_15", "16_plus"];

function scoreBudget(tier: BudgetTier | null, fits: BudgetTier[]): number {
  if (!tier) return 60;
  if (fits.includes(tier)) return 100;
  const userIdx = BUDGET_ORDER.indexOf(tier);
  const nearestDist = fits.reduce((best, f) => {
    const d = Math.abs(BUDGET_ORDER.indexOf(f) - userIdx);
    return d < best ? d : best;
  }, Infinity);
  if (nearestDist === 1) return 70;
  if (nearestDist === 2) return 40;
  return 20;
}

function scoreCrew(bracket: CrewBracket | null, fits: CrewBracket[]): number {
  if (!bracket) return 70;
  if (fits.includes(bracket)) return 100;
  const userIdx = CREW_ORDER.indexOf(bracket);
  const nearestDist = fits.reduce((best, f) => {
    const d = Math.abs(CREW_ORDER.indexOf(f) - userIdx);
    return d < best ? d : best;
  }, Infinity);
  if (nearestDist === 1) return 75;
  if (nearestDist === 2) return 50;
  return 30;
}

function scoreTravel(profile: VibeProfile, dest: Destination): number {
  if (profile.travelMode === "drive_only") {
    return dest.drivableWeekend ? 100 : 20;
  }
  if (profile.travelMode === "fly_open") {
    return dest.region === "international"
      ? 95
      : dest.drivableWeekend
        ? 80
        : 100;
  }
  return 90;
}

function scoreWeather(
  profile: VibeProfile,
  dest: Destination,
): { score: number; note: string | null } {
  if (!profile.month) return { score: 70, note: null };
  const entry = dest.weather[profile.month];
  if (!entry) return { score: 70, note: null };
  if (profile.month === "flexible") {
    return { score: entry.score, note: null };
  }
  const note = entry.flag
    ? `${entry.flag} · ${entry.high}°/${entry.low}°F`
    : `${entry.high}°/${entry.low}°F average`;
  return { score: entry.score, note };
}

function scoreInterests(
  profile: VibeProfile,
  dest: Destination,
): number {
  if (profile.groomInterests.length === 0) return 65;
  const hits = profile.groomInterests.filter((i) =>
    dest.interestStrengths.includes(i as GroomInterest),
  ).length;
  if (hits === 0) return 35;
  // Full credit at 2+ overlapping interests.
  if (hits >= 2) return 100;
  return 75;
}

function applyAvoidPenalty(
  profile: VibeProfile,
  dest: Destination,
): number {
  if (profile.avoidTags.length === 0) return 0;
  const hits = profile.avoidTags.filter((t) => dest.avoidSignals.includes(t));
  return hits.length * 12;
}

function pickMatchTag(
  breakdown: DestinationScore["breakdown"],
  profile: VibeProfile,
): string {
  const entries = Object.entries(breakdown) as [
    keyof typeof breakdown,
    number,
  ][];
  entries.sort((a, b) => b[1] - a[1]);
  const [topKey, topValue] = entries[0]!;
  if (topValue < 70) return "Worth considering";
  switch (topKey) {
    case "vibe":
      return "Dialed in for your crew";
    case "budget":
      return "Solid budget fit";
    case "weather":
      return profile.month && profile.month !== "flexible"
        ? `Prime in ${profile.month.charAt(0).toUpperCase() + profile.month.slice(1)}`
        : "Great weather window";
    case "travel":
      return profile.travelMode === "drive_only"
        ? "Drive-to friendly"
        : "Easy to get to";
    case "crew":
      return "Scales to your crew";
    case "interests":
      return "Matches what the groom loves";
  }
}

export function scoreDestination(
  dest: Destination,
  profile: VibeProfile,
  weights: ScoringWeights = DEFAULT_WEIGHTS,
): DestinationScore {
  const vibe = profile.energy ? (dest.vibeAffinity[profile.energy] ?? 30) : 55;
  const budget = scoreBudget(profile.budgetTier, dest.budgetFit);
  const { score: weather, note: weatherNote } = scoreWeather(profile, dest);
  const travel = scoreTravel(profile, dest);
  const crew = scoreCrew(profile.crew, dest.crewFit);
  const interests = scoreInterests(profile, dest);

  const rawScore =
    vibe * weights.vibe +
    budget * weights.budget +
    weather * weights.weather +
    travel * weights.travel +
    crew * weights.crew +
    interests * weights.interests;

  const penalty = applyAvoidPenalty(profile, dest);
  const finalScore = Math.max(0, Math.min(100, Math.round(rawScore - penalty)));

  const breakdown = { vibe, budget, weather, travel, crew, interests };

  return {
    destinationId: dest.id,
    score: finalScore,
    breakdown,
    weatherNote,
    matchTag: pickMatchTag(breakdown, profile),
  };
}

export function rankDestinations(
  profile: VibeProfile,
  pool: Destination[] = DESTINATIONS,
): { destination: Destination; score: DestinationScore }[] {
  return pool
    .map((d) => ({ destination: d, score: scoreDestination(d, profile) }))
    .sort((a, b) => b.score.score - a.score.score);
}

export function getDestination(id: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.id === id);
}
