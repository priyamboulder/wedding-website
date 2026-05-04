// Seed posts for The Confessional (the /blog → Confessional tab).
//
// Each seed includes a small, fixed reaction count per type so the feed has
// social proof on first load. The seeder is idempotent: rows are matched
// by exact `content` text and updated in place, so editing this file and
// re-running won't create duplicates.

import type { MarigoldConfessionSeed } from "@/types/marigold-confessional";

export const CONFESSIONAL_SEEDS: MarigoldConfessionSeed[] = [
  {
    post_type: "rant",
    persona_tag: "Bride, 3 months out",
    content:
      "My MIL just invited 47 people I've never met. I found out from the caterer. THE CATERER.",
    reactions: { same: 842, aunty_disapproves: 12, fire: 320, sending_chai: 156 },
  },
  {
    post_type: "confession",
    persona_tag: "Bride, 6 months out",
    content:
      "I secretly hate my lehenga. It cost more than my first car and I feel nothing when I look at it.",
    reactions: { same: 612, fire: 88, sending_chai: 411 },
  },
  {
    post_type: "hot_take",
    persona_tag: "Groom, just nodding along",
    content:
      "Nobody's sangeet performance is as good as they think it is. Nobody's.",
    reactions: { same: 1340, fire: 902, aunty_disapproves: 18 },
  },
  {
    post_type: "would_you_believe",
    persona_tag: "Bride, 1 month out",
    content:
      "My florist asked if marigolds were 'too ethnic' for my Indian wedding. MARIGOLDS. AT AN INDIAN WEDDING.",
    reactions: { same: 220, fire: 1820, aunty_disapproves: 540 },
  },
  {
    post_type: "rant",
    persona_tag: "Momzilla, proudly",
    content:
      "My daughter wants 150 guests. I have 150 people just on my side. We haven't started the groom's list.",
    reactions: { same: 92, aunty_disapproves: 30, sending_chai: 480 },
  },
  {
    post_type: "confession",
    persona_tag: "Bridesmaid, exhausted",
    content:
      "I've spent more on being a bridesmaid than my entire vacation last year. I love her but my bank account doesn't.",
    reactions: { same: 1610, sending_chai: 642, fire: 88 },
  },
  {
    post_type: "hot_take",
    persona_tag: "Aunty ji, concerned",
    content: "If the ceremony is under 2 hours, did you even get married?",
    reactions: { aunty_disapproves: 1240, fire: 412, same: 220 },
  },
  {
    post_type: "would_you_believe",
    persona_tag: "Planner, seen it all",
    content:
      "A guest RSVP'd no, showed up anyway, brought 4 extra people, then complained about seating.",
    reactions: { fire: 980, aunty_disapproves: 340, same: 612 },
  },
  {
    post_type: "rant",
    persona_tag: "Bride, 2 months out",
    content:
      "Every vendor adds 30% when they hear the word 'wedding.' Same flowers, same food, same venue. Just more expensive because love, apparently.",
    reactions: { same: 2140, fire: 612, sending_chai: 88 },
  },
  {
    post_type: "confession",
    persona_tag: "Groom, just nodding along",
    content:
      "I genuinely do not care about centerpieces. I have never cared about centerpieces. I will never care about centerpieces. But I said 'that one's nice' and now we're going with hydrangeas.",
    reactions: { same: 920, fire: 412, sending_chai: 220 },
  },
  {
    post_type: "hot_take",
    persona_tag: "Bride, 8 months out",
    content:
      "Engagement shoots in a field at golden hour all look the same. Every single one.",
    reactions: { same: 612, fire: 1240, aunty_disapproves: 22 },
  },
  {
    post_type: "would_you_believe",
    persona_tag: "Bride, 1 week out",
    content:
      "My cousin asked if she could do a gender reveal at my sangeet. AT MY SANGEET.",
    reactions: { fire: 1810, aunty_disapproves: 920, same: 88 },
  },
  {
    post_type: "rant",
    persona_tag: "Momzilla, proudly",
    content:
      "I've been planning this wedding since she was born. She gets an opinion, not a veto.",
    reactions: { aunty_disapproves: 612, same: 320, fire: 480 },
  },
  {
    post_type: "confession",
    persona_tag: "Bride, 4 months out",
    content:
      "I picked my venue because of how it looks on Instagram, not because I actually liked it in person. I regret it daily.",
    reactions: { same: 820, sending_chai: 612, fire: 88 },
  },
  {
    post_type: "hot_take",
    persona_tag: "Planner, seen it all",
    content:
      "90% of 'wedding emergencies' are just things the couple didn't communicate to their vendors.",
    reactions: { same: 1410, fire: 920, aunty_disapproves: 18 },
  },
  {
    post_type: "would_you_believe",
    persona_tag: "Groom, just nodding along",
    content:
      "My dad wants to enter the reception on a Segway. He's 62. I don't know how to have this conversation.",
    reactions: { fire: 2140, sending_chai: 612, same: 220 },
  },
  {
    post_type: "rant",
    persona_tag: "Bridesmaid, exhausted",
    content:
      "We've had 14 group calls about bridesmaid outfits. FOURTEEN. I'm wearing whatever she picks. I surrendered after call 3.",
    reactions: { same: 1820, sending_chai: 412, fire: 320 },
  },
  {
    post_type: "confession",
    persona_tag: "Aunty ji, concerned",
    content:
      "I go to weddings primarily for the food. The ceremony is just the wait time.",
    reactions: { same: 2210, aunty_disapproves: 88, fire: 612 },
  },
  {
    post_type: "hot_take",
    persona_tag: "Bride, 5 months out",
    content:
      "If your wedding hashtag is a pun on your last name, you're not being creative. You're being every other couple on Instagram.",
    reactions: { same: 920, fire: 1410, aunty_disapproves: 220 },
  },
  {
    post_type: "would_you_believe",
    persona_tag: "Bride, 2 months out",
    content: "My photographer charges extra for 'smile coaching.' SMILE COACHING.",
    reactions: { fire: 1610, aunty_disapproves: 320, same: 412 },
  },
  {
    post_type: "rant",
    persona_tag: "Bride, 10 months out",
    content:
      "I asked for a simple mehendi design and my MUA said 'simple doesn't photograph well.' Ma'am, it's MY hand.",
    reactions: { same: 1240, fire: 612, sending_chai: 220 },
  },
  {
    post_type: "confession",
    persona_tag: "Groom, just nodding along",
    content:
      "I told my friends the wedding costs $50K. It costs $120K. I will take this to my grave.",
    reactions: { same: 1810, sending_chai: 612, fire: 88 },
  },
  {
    post_type: "hot_take",
    persona_tag: "Momzilla, proudly",
    content:
      "Destination weddings are just a way to have a small guest list without having to say no to anyone's face.",
    reactions: { same: 1340, aunty_disapproves: 412, fire: 920 },
  },
  {
    post_type: "would_you_believe",
    persona_tag: "Planner, seen it all",
    content:
      "A mother of the bride asked me to coordinate the bride's dupatta color with the napkins. The napkins.",
    reactions: { fire: 1410, aunty_disapproves: 612, same: 220 },
  },
  {
    post_type: "rant",
    persona_tag: "Bride, 1 month out",
    content:
      "I have been asked 'but what will the aunties think?' exactly 47 times during this planning process. I started counting in month two.",
    reactions: { same: 2410, aunty_disapproves: 88, fire: 612, sending_chai: 320 },
  },
];
