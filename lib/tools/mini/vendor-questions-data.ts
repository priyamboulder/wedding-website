// Vendor question banks — South-Asian-aware where relevant.
// Each entry: the question + a one-line "why it matters."

export type VendorKey =
  | 'photographer'
  | 'videographer'
  | 'caterer'
  | 'dj'
  | 'decorator'
  | 'mehndi'
  | 'hmua'
  | 'planner'
  | 'venue'
  | 'pandit'
  | 'dhol'
  | 'transport';

export type VendorMeta = { key: VendorKey; label: string };

export const VENDORS: VendorMeta[] = [
  { key: 'photographer', label: 'Photographer' },
  { key: 'videographer', label: 'Videographer' },
  { key: 'caterer', label: 'Caterer' },
  { key: 'dj', label: 'DJ / music' },
  { key: 'decorator', label: 'Decorator / florist' },
  { key: 'mehndi', label: 'Mehndi artist' },
  { key: 'hmua', label: 'Hair & makeup' },
  { key: 'planner', label: 'Wedding planner' },
  { key: 'venue', label: 'Venue' },
  { key: 'pandit', label: 'Pandit / officiant' },
  { key: 'dhol', label: 'Dhol player' },
  { key: 'transport', label: 'Transportation' },
];

export type Question = { q: string; why: string };

export const QUESTIONS: Record<VendorKey, Question[]> = {
  photographer: [
    { q: 'Have you shot South Asian weddings before? How many?', why: 'Experience with baraat, pheras, and multi-day events matters.' },
    { q: 'How many shooters for multi-day coverage?', why: "One photographer can't cover a 3-day wedding alone." },
    { q: "What's your turnaround time for the full gallery?", why: 'Industry standard is 6–8 weeks. Some take 6 months.' },
    { q: "What happens if you're sick or have an emergency?", why: 'Backup plan is critical — ask who would cover.' },
    { q: 'How many hours are included? What is the overtime rate?', why: 'Indian weddings run long. Overtime adds up fast.' },
    { q: 'Do you provide prints and albums or is that separate?', why: 'Often a separate cost not included in the base package.' },
    { q: 'Can we see full galleries from past weddings, not just highlights?', why: 'Portfolio is curated. Full galleries show consistency.' },
    { q: 'Do you edit for diverse skin tones?', why: 'Critical question for South Asian clients.' },
    { q: "What's your cancellation and postponement policy?", why: 'Post-COVID essential — get this in writing.' },
    { q: 'Do you carry liability insurance?', why: 'Many venues require it from vendors.' },
  ],
  videographer: [
    { q: 'Will I get a teaser, full film, AND raw footage?', why: 'These are usually three separate deliverables.' },
    { q: 'How long is the final film and how is it structured?', why: 'Highlight reel vs. documentary cut — clarify upfront.' },
    { q: "What's the turnaround for each piece?", why: 'Teaser is 2–4 weeks, full film often 3–6 months.' },
    { q: 'How many videographers for a multi-day event?', why: 'You need at least two for ceremony coverage alone.' },
    { q: 'Do you use drones? Any restrictions at our venue?', why: 'FAA rules apply, and some venues forbid them.' },
    { q: 'Will the audio capture vows and toasts cleanly?', why: 'Lavalier mics and board feeds — ask about both.' },
    { q: 'Can we pick our own music for the highlight reel?', why: 'Some vendors lock you into a music library to avoid licensing issues.' },
    { q: "What's your overtime rate?", why: 'Same as photo — Indian weddings always run long.' },
    { q: 'Cancellation/postponement policy?', why: 'Get the financial terms in writing.' },
    { q: 'Can we see a full delivered film, not just highlights?', why: 'Highlight reels are misleading. Full cuts show consistency.' },
  ],
  caterer: [
    { q: 'Do you specialize in our regional cuisine?', why: 'Punjabi vs. Gujarati vs. South Indian are different kitchens entirely.' },
    { q: 'Can we do a full tasting before booking?', why: 'Never sign without tasting. Ever.' },
    { q: "What's your minimum guest count?", why: "Some won't book under 100. Others have premium tiers." },
    { q: 'Do you handle live stations, chaat counters, paan?', why: 'Indian weddings expect more than a buffet line.' },
    { q: 'How many staff per 100 guests?', why: 'Below 1:25 service starts breaking down.' },
    { q: "What's included beyond food — linens, serviceware, bar?", why: 'Some inclusive packages are great deals; others nickel-and-dime.' },
    { q: 'Can you accommodate Jain, vegan, gluten-free, nut allergies?', why: 'Indian cuisine has hidden cross-contamination — ask specifically.' },
    { q: 'Do you provide vendor meals?', why: '$25–$50 per vendor adds up. Confirm whose responsibility.' },
    { q: "What's the deposit and final payment schedule?", why: 'Catering is usually the largest single check.' },
    { q: 'Are there leftover/take-home options?', why: 'Some caterers insist on tossing extras. Ask the rule.' },
  ],
  dj: [
    { q: 'How extensive is your Bollywood and Punjabi catalog?', why: 'A "South Asian" DJ should have current Punjabi tracks AND classics.' },
    { q: 'Do you take requests during the night?', why: 'Some refuse — be sure your style matches theirs.' },
    { q: 'Can you MC in Hindi/Punjabi/English?', why: 'Bilingual MC ability matters for older relatives.' },
    { q: 'Do you provide ceremony sound separately?', why: 'Mandap mics and pheras audio is a different setup than reception.' },
    { q: 'Backup equipment if anything fails mid-event?', why: 'Critical — speakers and laptops do die.' },
    { q: 'Will you help build a do-not-play list?', why: "Don't let an ex's song surprise you on the dance floor." },
    { q: 'Can we share a must-play list and song-for-each-event mapping?', why: 'Different songs for entry vs. pheras vs. first dance.' },
    { q: 'Lighting included? Uplights, dance floor lights?', why: 'Often separate cost. Bundle if possible.' },
    { q: 'Overtime rate?', why: 'Indian receptions go past midnight regularly.' },
    { q: 'Cancellation and rescheduling policy?', why: 'Same as photo/video — get it written.' },
  ],
  decorator: [
    { q: 'Do you specialize in mandap, stage, or full event design?', why: 'Some only do florals; you may need a separate stage builder.' },
    { q: 'Can we see past mandaps and stages — full setups?', why: "Curated photos hide what doesn't translate to your venue." },
    { q: "What's included in setup and breakdown?", why: 'Late-night breakdown crews cost extra at many venues.' },
    { q: 'How many events can you decorate in one weekend?', why: 'If sangeet and ceremony are at different venues, logistics get tight.' },
    { q: 'Do you handle rentals — chairs, tables, linens?', why: 'Often the same vendor; consolidate if possible.' },
    { q: 'Can we do a mock-up of the mandap before the event?', why: 'Good vendors will. Ask if there is a fee.' },
    { q: 'Are flowers fresh or imported? Country of origin?', why: 'Imported flowers (Holland, Ecuador) need 5–7 days lead.' },
    { q: 'What happens if flowers are damaged in transit?', why: 'Substitution policy should be in the contract.' },
    { q: "What's the design revision policy after deposit?", why: 'Some lock you into the first design. Confirm freedom.' },
    { q: 'Insurance and venue compliance certifications?', why: 'Many luxury venues require COIs from decorators.' },
  ],
  mehndi: [
    { q: 'How many years of bridal mehndi specifically?', why: 'Bridal mehndi is a different skill than party mehndi.' },
    { q: 'Can we see your bridal portfolio? With names visible?', why: 'Some artists steal others\' work. Verified portfolios matter.' },
    { q: 'Do you make your own paste? Natural ingredients only?', why: 'Black "henna" with PPD causes burns. Pure henna only.' },
    { q: 'How long for full bridal coverage — front and back?', why: 'Typically 4–6 hours for elaborate bridal. Plan accordingly.' },
    { q: 'Can you bring extra artists for guest mehndi?', why: 'A bride and 30 guests need a team, not a soloist.' },
    { q: "What's your travel fee?", why: 'Top artists charge for travel; some include it.' },
    { q: 'Do you offer aftercare guidance?', why: 'Stain depth depends on aftercare. Ask what they recommend.' },
    { q: 'What is your cancellation and reschedule policy?', why: 'Usually less formal than other vendors — get it in writing.' },
  ],
  hmua: [
    { q: 'Have you done makeup for South Asian skin tones?', why: 'Foundation matching for medium-deep South Asian skin is a real skill.' },
    { q: 'Will you do a trial? Is it included or separate?', why: 'Always do a trial. Some include it, most charge extra.' },
    { q: 'How long for the bride? For each bridesmaid?', why: 'Bride: 90–120 min. Each bridesmaid: 30–45 min. Plan the morning.' },
    { q: 'Can you handle multiple looks across events?', why: 'Mehndi, sangeet, ceremony, reception are 4 different faces.' },
    { q: 'Do you bring your own kit including airbrush?', why: 'Airbrush vs. traditional — confirm which they use.' },
    { q: 'Touch-up service after ceremony?', why: 'Many brides want a refresh before the reception.' },
    { q: 'Do you travel to the venue or do we come to you?', why: 'Travel adds cost and complexity.' },
    { q: 'How early do you arrive on the day?', why: 'For a noon ceremony, expect a 6–7 AM start.' },
    { q: 'Can you suggest hairstyles compatible with bridal jewelry?', why: 'Tikka, jhumar, and dupatta interact with hair.' },
    { q: "What's your cancellation policy?", why: 'Same as everyone — get it in writing.' },
  ],
  planner: [
    { q: 'Have you planned weddings of our scale and tradition?', why: 'A 50-person Western wedding planner cannot do a 400-person Indian wedding.' },
    { q: 'How many weddings do you take per weekend?', why: 'If they take three, who is actually at yours?' },
    { q: 'Will the lead planner be on site, or a junior?', why: "Critical — you're paying for the senior person." },
    { q: 'Walk us through your day-of timeline process.', why: 'Their process tells you everything about how organized they are.' },
    { q: "What's your vendor referral commission setup?", why: "Some take kickbacks — confirm there's no hidden conflict of interest." },
    { q: 'How do you handle family conflicts during planning?', why: 'They will arise. Their playbook should be ready.' },
    { q: "What's included in different package tiers?", why: 'Full vs. partial vs. day-of — clarify with examples.' },
    { q: "What's your hourly rate for additional consultations?", why: 'Beyond what is in your package.' },
    { q: 'How do you handle vendor cancellations or no-shows?', why: 'Their crisis playbook matters more than their happy-path one.' },
    { q: 'Do you carry liability insurance?', why: 'Both for them and to satisfy venue requirements.' },
  ],
  venue: [
    { q: "What's your alcohol policy? In-house or BYOB?", why: 'In-house corkage often makes BYOB pointless. Ask the math.' },
    { q: 'Can we use outside Indian caterers? Any kitchen restrictions?', why: 'Critical — many venues only allow approved caterers.' },
    { q: 'Mandap setup, fire allowed (havan)?', why: 'Some venues prohibit open flame for ceremony. Plan around it.' },
    { q: 'Sound restrictions, noise curfew?', why: 'Outdoor venues often cap dB and end times.' },
    { q: 'Setup and breakdown windows? Charges if we run over?', why: 'Indian decor takes longer to install. Confirm hours.' },
    { q: 'Parking capacity? Valet available or required?', why: 'Critical for guest experience — and pricing.' },
    { q: 'How many bathrooms for our guest count?', why: 'Below 1 per 50 guests, lines get rough.' },
    { q: 'Bridal suite and getting-ready space?', why: 'Confirm size for HMUA team plus party of 8.' },
    { q: 'Backup plan for outdoor weather?', why: 'Tents, indoor option, decision deadline — get it in writing.' },
    { q: "What's the cancellation, postponement, and refund policy?", why: 'Read this clause specifically and slowly.' },
  ],
  pandit: [
    { q: 'How long have you officiated this style of ceremony?', why: 'A Gujarati pandit may not know Tamil rituals.' },
    { q: 'Will you walk us through every ritual in advance?', why: 'A pre-meeting prevents ceremony confusion.' },
    { q: 'Can you do bilingual narration for non-Hindi speakers?', why: 'Helps non-Indian guests feel included.' },
    { q: 'How long is the ceremony as you would perform it?', why: 'Pandit lengths vary wildly. Get a real estimate.' },
    { q: 'Can the ceremony be customized — added or skipped rituals?', why: 'Some are flexible, some are strict. Know which.' },
    { q: 'Do you provide all ritual items (samagri)?', why: 'Some bring everything; others give you a shopping list.' },
    { q: 'Will you confirm the muhurat with our birth charts?', why: 'Traditional pandits will. Modern ones may not.' },
    { q: "What's your fee — and is it a donation or invoice?", why: 'Different temples handle this differently.' },
  ],
  dhol: [
    { q: 'How many dhol players for our baraat size?', why: 'One dhol carries 30–40 dancers. More guests, more drums.' },
    { q: 'Do you bring your own sound amplification?', why: 'Acoustic dhol over a parking lot needs help.' },
    { q: 'Travel fee? Setup and breakdown time?', why: 'Some baraats pay them just to walk 5 minutes.' },
    { q: 'Can you coordinate with our DJ for transitions?', why: 'Dhol-to-DJ handoff at the venue entrance is the moment.' },
    { q: 'How long is the standard set?', why: 'Typically 30–60 min for the baraat itself.' },
    { q: 'Cultural fluency — do you know Punjabi vs. Gujarati style?', why: 'Different traditions = different rhythms.' },
  ],
  transport: [
    { q: "What's the bus capacity and how many trips will you make?", why: 'A 30-passenger bus over 3 trips needs 90 minutes.' },
    { q: 'Are drivers experienced with wedding events?', why: 'Wedding routing is different than airport routing.' },
    { q: "What's your pricing structure — flat or hourly?", why: 'Flat fees are easier to budget. Hourly can run away.' },
    { q: 'Cancellation policy if weather impacts the event?', why: 'Critical for outdoor venues.' },
    { q: 'Insurance coverage and licensing?', why: 'Confirm — venues will ask.' },
    { q: 'Will the same driver work the entire night?', why: 'Important for late returns to the hotel.' },
  ],
};
