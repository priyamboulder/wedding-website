// ── Rishta Circle seed data ─────────────────────────────────────────────────
// Populates the directory on first visit so the feature never looks empty in
// local dev. Mix of self + family submissions across traditions and cities;
// photos are left null so the monogram placeholder renders.

import type { Member } from "./types";
import { getMembers, upsertMembers } from "./storage";

const ISO = (daysAgo: number) =>
  new Date(Date.now() - daysAgo * 86_400_000).toISOString();

export const SEED_MEMBERS: Member[] = [
  {
    id: "seed-ic-01",
    applicationId: "seed-ic-app-01",
    approvedAt: ISO(42),
    submittedBy: "self",
    fullName: "Ananya Mehta",
    age: 28,
    gender: "female",
    locationCity: "New York",
    locationState: "NY",
    locationCountry: "USA",
    hometown: "Mumbai, India",
    religion: "Hindu",
    profilePhoto: null,
    education: "MBA, Wharton School",
    profession: "Product Manager at a fintech startup",
    bio:
      "Curious, earnest, and always planning the next trip. Weekends split between pottery class, trying new restaurants in the Village, and long calls with my nani. Grew up between Mumbai and New York and carry both with me.",
    lookingFor:
      "Someone thoughtful and self-aware, with a strong sense of humor and a softer sense of home. Ambition is great — kindness is non-negotiable.",
    familyValues:
      "Close with my parents and younger brother. Traditional on festivals, modern on most other days.",
    contactEmail: "ananya.mehta@example.com",
    isActive: true,
  },
  {
    id: "seed-ic-02",
    applicationId: "seed-ic-app-02",
    approvedAt: ISO(38),
    submittedBy: "family",
    submitterName: "Kavita Singh",
    submitterRelationship: "Mother",
    submitterContact: "kavita.singh@example.com",
    fullName: "Arjun Singh",
    age: 31,
    gender: "male",
    locationCity: "San Francisco",
    locationState: "CA",
    locationCountry: "USA",
    hometown: "Chandigarh, India",
    religion: "Sikh",
    profilePhoto: null,
    education: "MS Computer Science, Stanford",
    profession: "Senior Engineer at a large tech company",
    bio:
      "My son is gentle, principled, and genuinely funny once he's comfortable. He reads widely, cooks better than I did at his age, and has a soft spot for old Punjabi music. He's grounded in our values and open to a partner who is too.",
    lookingFor:
      "A thoughtful life partner who values family, honesty, and a sense of adventure. Faith is important but flexibility matters more.",
    familyValues:
      "We are a close-knit Sikh family. Traditions matter, but so does letting our children build their own lives.",
    contactEmail: "kavita.singh@example.com",
    isActive: true,
  },
  {
    id: "seed-ic-03",
    applicationId: "seed-ic-app-03",
    approvedAt: ISO(31),
    submittedBy: "self",
    fullName: "Priya Rao",
    age: 29,
    gender: "female",
    locationCity: "London",
    locationState: "Greater London",
    locationCountry: "UK",
    hometown: "Bangalore, India",
    religion: "Hindu",
    profilePhoto: null,
    education: "MSc Economics, LSE",
    profession: "Strategy Consultant",
    bio:
      "Bangalore girl in London. Spend my mornings running along the Thames, evenings cooking new things badly, and Sundays with a book and filter coffee. Tamil and Kannada at home, English and bad French everywhere else.",
    lookingFor:
      "Someone kind, intellectually curious, and emotionally available. Bonus points if they make me laugh at myself.",
    familyValues:
      "Parents in Bangalore, brother in Boston. Family is the anchor, not the ceiling.",
    contactEmail: "priya.rao@example.com",
    isActive: true,
  },
  {
    id: "seed-ic-04",
    applicationId: "seed-ic-app-04",
    approvedAt: ISO(26),
    submittedBy: "self",
    fullName: "Zain Qureshi",
    age: 32,
    gender: "male",
    locationCity: "Toronto",
    locationState: "ON",
    locationCountry: "Canada",
    hometown: "Karachi, Pakistan",
    religion: "Muslim",
    profilePhoto: null,
    education: "MD, University of Toronto",
    profession: "Cardiologist",
    bio:
      "I grew up in Karachi, came to Toronto for medical school, and somehow never left. I care deeply about my work, my family back home, and the small rituals that make a week feel full — Friday dinners, long walks, a proper cup of chai.",
    lookingFor:
      "A partner who is warm, steady, and family-minded. Faith-observant but not rigid. Someone who wants to build a calm, loving home together.",
    familyValues:
      "Parents and two sisters in Karachi, uncle's family in Toronto. Close, supportive, and a little loud at gatherings.",
    contactEmail: "zain.qureshi@example.com",
    isActive: true,
  },
  {
    id: "seed-ic-05",
    applicationId: "seed-ic-app-05",
    approvedAt: ISO(22),
    submittedBy: "family",
    submitterName: "Rajiv Shah",
    submitterRelationship: "Father",
    submitterContact: "rajiv.shah@example.com",
    fullName: "Neha Shah",
    age: 27,
    gender: "female",
    locationCity: "Houston",
    locationState: "TX",
    locationCountry: "USA",
    hometown: "Ahmedabad, India",
    religion: "Jain",
    profilePhoto: null,
    education: "BS Finance, UT Austin",
    profession: "Associate, Private Equity",
    bio:
      "Our daughter is warm, capable, and quietly ambitious. She loves classical dance, volunteers at the local temple, and makes the best dal in the family. We are looking for a partner who will match her care with his own.",
    lookingFor:
      "A kind, well-settled young man who respects his parents and values ours. Vegetarian household preferred.",
    familyValues:
      "A traditional Jain family, but we believe in giving our children the freedom to choose. We simply want to meet the family alongside meeting the person.",
    contactEmail: "rajiv.shah@example.com",
    isActive: true,
  },
  {
    id: "seed-ic-06",
    applicationId: "seed-ic-app-06",
    approvedAt: ISO(18),
    submittedBy: "self",
    fullName: "Rohan Kapoor",
    age: 30,
    gender: "male",
    locationCity: "Delhi",
    locationState: "Delhi",
    locationCountry: "India",
    hometown: "Amritsar, India",
    religion: "Hindu",
    profilePhoto: null,
    education: "BTech IIT Bombay, MBA IIM Ahmedabad",
    profession: "Founder, D2C skincare brand",
    bio:
      "Builder by day, runner by morning, home-cook by night. I left the safe corporate path a few years ago and haven't looked back. I'm looking for a partner who'll back me as hard as I'll back her.",
    lookingFor:
      "Someone ambitious in her own right, grounded, and a little stubborn. Must tolerate my 6am alarm.",
    familyValues:
      "Parents in Amritsar, younger sister married in Delhi. Tight unit, high involvement, lots of laughter.",
    contactEmail: "rohan.kapoor@example.com",
    isActive: true,
  },
  {
    id: "seed-ic-07",
    applicationId: "seed-ic-app-07",
    approvedAt: ISO(15),
    submittedBy: "self",
    fullName: "Simran Gill",
    age: 26,
    gender: "female",
    locationCity: "Vancouver",
    locationState: "BC",
    locationCountry: "Canada",
    hometown: "Ludhiana, India",
    religion: "Sikh",
    profilePhoto: null,
    education: "JD, UBC Peter A. Allard School of Law",
    profession: "Corporate lawyer",
    bio:
      "I grew up in a big Punjabi family where the food is always too much and the opinions are louder. Now I live quietly in Vancouver, by the water, with a dog and a growing plant collection. Faith-rooted and open-hearted.",
    lookingFor:
      "Someone honest, family-oriented, and able to hold a real conversation. A good dance partner at weddings is a bonus.",
    familyValues:
      "Proud Sikh household. Tradition and kirtan on weekends, full support for career and choice.",
    contactEmail: "simran.gill@example.com",
    isActive: true,
  },
  {
    id: "seed-ic-08",
    applicationId: "seed-ic-app-08",
    approvedAt: ISO(11),
    submittedBy: "family",
    submitterName: "Suresh Iyer",
    submitterRelationship: "Father",
    submitterContact: "suresh.iyer@example.com",
    fullName: "Karthik Iyer",
    age: 33,
    gender: "male",
    locationCity: "Bengaluru",
    locationState: "Karnataka",
    locationCountry: "India",
    hometown: "Chennai, India",
    religion: "Hindu",
    profilePhoto: null,
    education: "MS, Carnegie Mellon",
    profession: "VP of Engineering",
    bio:
      "Karthik is the quiet one in any room until he finds the person he wants to talk to for three hours straight. Well-read, well-travelled, and rooted in our traditions. Based in Bengaluru, moved back from the US two years ago.",
    lookingFor:
      "A thoughtful, articulate partner — preferably Tamil-speaking, though what matters most is a shared sense of values.",
    familyValues:
      "South Indian Brahmin family, traditional but not rigid. Music, filter coffee, and long family phone calls.",
    contactEmail: "suresh.iyer@example.com",
    isActive: true,
  },
  {
    id: "seed-ic-09",
    applicationId: "seed-ic-app-09",
    approvedAt: ISO(8),
    submittedBy: "self",
    fullName: "Maya D'Souza",
    age: 29,
    gender: "female",
    locationCity: "Mumbai",
    locationState: "Maharashtra",
    locationCountry: "India",
    hometown: "Goa, India",
    religion: "Christian",
    profilePhoto: null,
    education: "MA Psychology, TISS",
    profession: "Clinical psychologist",
    bio:
      "Goan girl who ended up in Bombay and learned to love the chaos. I run a small private practice, read too much, and go home to the beach every month. Believer in slow conversations and fast text replies.",
    lookingFor:
      "Someone warm, self-aware, and a little silly. Faith matters to me; I'd love to meet someone who holds his with the same ease.",
    familyValues:
      "Catholic family, close to both parents and my brother. Sunday lunch is sacred.",
    contactEmail: "maya.dsouza@example.com",
    isActive: true,
  },
  {
    id: "seed-ic-10",
    applicationId: "seed-ic-app-10",
    approvedAt: ISO(4),
    submittedBy: "self",
    fullName: "Aarav Patel",
    age: 28,
    gender: "male",
    locationCity: "Chicago",
    locationState: "IL",
    locationCountry: "USA",
    hometown: "Surat, India",
    religion: "Interfaith",
    profilePhoto: null,
    education: "MD/PhD, Northwestern",
    profession: "Neuroscience researcher",
    bio:
      "Half Gujarati Hindu, half Parsi, fully Midwestern. I think of myself as curious more than smart — I'd rather ask one more question than have one more opinion. Love old films, weekend hikes, and trying (failing) to learn the tabla.",
    lookingFor:
      "Someone kind and intellectually restless. Traditions welcome, dogma less so. Let's build something thoughtful.",
    familyValues:
      "Small, warm family spread between Chicago and Surat. Interfaith upbringing taught me to hold both lightly.",
    contactEmail: "aarav.patel@example.com",
    isActive: true,
  },
];

export function ensureSeeded() {
  if (typeof window === "undefined") return;
  const existing = getMembers();
  if (existing.length > 0) return;
  upsertMembers(SEED_MEMBERS);
}
