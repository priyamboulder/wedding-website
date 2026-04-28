// Seller reviews seed — 12 reviews for Divya Creations. Distribution matches
// the overall shop rating of 4.9 / 89 reviews: 10 five-star, 1 four-star,
// 1 three-star shown here. Two have seller responses, one is flagged needing
// response, and three include buyer photos.

export type BuyerPhoto = {
  id: string;
  label: string; // short caption used as alt/placeholder text
  tint: string; // soft bg tint for the placeholder tile
};

export type Review = {
  id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  date: string; // display string, e.g. "October 5, 2026"
  sortKey: number; // higher = more recent, drives "Most Recent" sort
  buyerName: string;
  productName: string;
  productQuantity?: number;
  body: string;
  photos?: BuyerPhoto[];
  sellerResponse?: {
    body: string;
    date: string;
  };
  needsResponse?: boolean; // flagged in the UI
};

export const RATING_DISTRIBUTION: { stars: 5 | 4 | 3 | 2 | 1; count: number }[] = [
  { stars: 5, count: 78 },
  { stars: 4, count: 9 },
  { stars: 3, count: 2 },
  { stars: 2, count: 0 },
  { stars: 1, count: 0 },
];

export const REVIEWS: Review[] = [
  {
    id: "rev-isha-rohan",
    rating: 5,
    date: "October 5, 2026",
    sortKey: 20261005,
    buyerName: "Isha & Rohan",
    productName: "Gold Foil Ganesh Wedding Invitation Suite",
    productQuantity: 200,
    body: "The invitations were absolutely breathtaking. Every guest commented on how beautiful they were. Priya was so patient with our revisions and the final product exceeded expectations. The gold foil is stunning in person.",
    photos: [
      { id: "p-ir-1", label: "Invitation on velvet table", tint: "#F5E6D0" },
    ],
    sellerResponse: {
      body: "Thank you so much, Isha & Rohan! It was a joy creating your invitations. Wishing you a lifetime of happiness.",
      date: "October 6, 2026",
    },
  },
  {
    id: "rev-maya-james",
    rating: 4,
    date: "September 28, 2026",
    sortKey: 20260928,
    buyerName: "Maya & James",
    productName: "Fusion Invitation Suite",
    productQuantity: 150,
    body: "Beautiful quality but shipping took longer than expected. Would order again but recommend ordering earlier.",
    needsResponse: true,
  },
  {
    id: "rev-priya-arjun",
    rating: 5,
    date: "September 22, 2026",
    sortKey: 20260922,
    buyerName: "Priya & Arjun",
    productName: "Custom Foil-Pressed Wedding Invitation Suite",
    productQuantity: 200,
    body: "We cannot recommend Divya Creations enough. Priya took the time to understand both our Gujarati and Bengali traditions and designed something that honored both. The hand-calligraphed addresses on the outer envelopes were the cherry on top.",
    photos: [
      { id: "p-pa-1", label: "Suite laid flat", tint: "#E8DEF5" },
      { id: "p-pa-2", label: "Envelope with wax seal", tint: "#F2DADA" },
    ],
    sellerResponse: {
      body: "Priya & Arjun — thank you for trusting us with something so personal. The wax seal was a fun addition, so glad you loved it!",
      date: "September 23, 2026",
    },
  },
  {
    id: "rev-riya-jay",
    rating: 5,
    date: "September 14, 2026",
    sortKey: 20260914,
    buyerName: "Riya & Jay",
    productName: "Velvet Invitation Box Set",
    productQuantity: 80,
    body: "The velvet boxes are incredibly luxe. Our parents keep telling us guests have been framing the invitations. Worth every penny for a wedding keepsake.",
  },
  {
    id: "rev-nikita-raj",
    rating: 5,
    date: "September 8, 2026",
    sortKey: 20260908,
    buyerName: "Nikita & Raj",
    productName: "Laser-Cut Mehndi Night Invitation Set",
    productQuantity: 120,
    body: "Intricate, gorgeous, and arrived a week earlier than quoted. The peacock cutouts are so detailed — several guests asked where they could get their own.",
    photos: [
      { id: "p-nr-1", label: "Mehndi invitation close-up", tint: "#D9E8E4" },
    ],
  },
  {
    id: "rev-aarushi-kabir",
    rating: 5,
    date: "August 30, 2026",
    sortKey: 20260830,
    buyerName: "Aarushi & Kabir",
    productName: "Sikh Wedding Invitation Suite",
    productQuantity: 175,
    body: "Priya's Gurmukhi typesetting is impeccable. Our elders (who are hard to please) were genuinely moved by the final result. Communication throughout was perfect.",
    needsResponse: true,
  },
  {
    id: "rev-shreya-nikhil",
    rating: 5,
    date: "August 21, 2026",
    sortKey: 20260821,
    buyerName: "Shreya & Nikhil",
    productName: "Custom Monogram Invitation Suite",
    productQuantity: 225,
    body: "We worked through four rounds of revisions and Priya never rushed us once. The final monogram is now framed above our bar cart. Feels like fine art, not just stationery.",
  },
  {
    id: "rev-tanvi-dev",
    rating: 3,
    date: "August 10, 2026",
    sortKey: 20260810,
    buyerName: "Tanvi & Dev",
    productName: "Gold Foil Ganesh Wedding Invitation Suite",
    productQuantity: 100,
    body: "The invitations themselves are beautiful but we had two rounds of proofs with small typos on our end that weren't caught before we approved. That's partially our fault, but a proofread pass from the designer would have saved us. Would still consider ordering again.",
    needsResponse: true,
  },
  {
    id: "rev-kavya-ansh",
    rating: 5,
    date: "July 30, 2026",
    sortKey: 20260730,
    buyerName: "Kavya & Ansh",
    productName: "Fusion Invitation Suite",
    productQuantity: 140,
    body: "Beautiful workmanship, thoughtful packaging, and a note tucked in from the studio. Felt like the kind of care you only get from a small business. We're obsessed.",
  },
  {
    id: "rev-diya-mihir",
    rating: 5,
    date: "July 18, 2026",
    sortKey: 20260718,
    buyerName: "Diya & Mihir",
    productName: "Laser-Cut Peacock Invitation Set",
    productQuantity: 160,
    body: "So intricate — you can see every feather detail. The ivory card stock has a beautiful weight to it and the envelopes are lined with a printed peacock motif that matches perfectly.",
  },
  {
    id: "rev-simran-arjun",
    rating: 5,
    date: "July 5, 2026",
    sortKey: 20260705,
    buyerName: "Simran & Arjun",
    productName: "Velvet Invitation Box Set",
    productQuantity: 90,
    body: "The emerald velvet with gold foil is even more stunning than the listing photos. Multiple guests have texted us photos of the boxes on their mantels. A truly memorable keepsake.",
  },
  {
    id: "rev-ananya-vikram",
    rating: 5,
    date: "June 24, 2026",
    sortKey: 20260624,
    buyerName: "Ananya & Vikram",
    productName: "Custom Foil-Pressed Wedding Invitation Suite",
    productQuantity: 260,
    body: "Priya accommodated a last-minute language addition (adding Telugu alongside Hindi and English) without flinching. The final suite is something we'll pass down. Thank you, thank you.",
  },
];

export const REVIEW_STATS = {
  totalReviews: 89, // canonical shop-level count from SELLER seed
  averageRating: 4.9,
  needsResponseCount: REVIEWS.filter((r) => r.needsResponse).length,
  withPhotosCount: REVIEWS.filter((r) => r.photos && r.photos.length > 0).length,
};
