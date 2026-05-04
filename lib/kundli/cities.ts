// ──────────────────────────────────────────────────────────────────────────
// Birthplace database for Kundli matching.
//
// Curated set of Indian metro areas, US/UK/Canada metros where the diaspora
// concentrates, and a few global capitals. Each entry includes lat/long
// (decimal) and the local standard timezone offset in hours. Tooling for a
// bigger dataset can be added later — for v1 this covers most users.
//
// Note on timezone: we use the standard (non-DST) offset and let the date
// math add DST on top via the runtime's Intl/Date when relevant. For a
// matching tool the small DST drift is rarely material — Moon traverses
// roughly 0.5° per hour, well within Nakshatra width.
// ──────────────────────────────────────────────────────────────────────────

export interface City {
  label: string; // "Mumbai, India"
  search: string; // lowercased aliases for matching
  lat: number;
  lng: number;
  tzOffsetHours: number; // e.g. 5.5 for IST, -6 for CST
}

export const CITIES: City[] = [
  // ── India ──
  { label: "Mumbai, India", search: "mumbai bombay", lat: 19.076, lng: 72.8777, tzOffsetHours: 5.5 },
  { label: "Delhi, India", search: "delhi new delhi", lat: 28.6139, lng: 77.209, tzOffsetHours: 5.5 },
  { label: "Bangalore, India", search: "bangalore bengaluru", lat: 12.9716, lng: 77.5946, tzOffsetHours: 5.5 },
  { label: "Hyderabad, India", search: "hyderabad", lat: 17.385, lng: 78.4867, tzOffsetHours: 5.5 },
  { label: "Chennai, India", search: "chennai madras", lat: 13.0827, lng: 80.2707, tzOffsetHours: 5.5 },
  { label: "Kolkata, India", search: "kolkata calcutta", lat: 22.5726, lng: 88.3639, tzOffsetHours: 5.5 },
  { label: "Pune, India", search: "pune", lat: 18.5204, lng: 73.8567, tzOffsetHours: 5.5 },
  { label: "Ahmedabad, India", search: "ahmedabad", lat: 23.0225, lng: 72.5714, tzOffsetHours: 5.5 },
  { label: "Jaipur, India", search: "jaipur", lat: 26.9124, lng: 75.7873, tzOffsetHours: 5.5 },
  { label: "Surat, India", search: "surat", lat: 21.1702, lng: 72.8311, tzOffsetHours: 5.5 },
  { label: "Lucknow, India", search: "lucknow", lat: 26.8467, lng: 80.9462, tzOffsetHours: 5.5 },
  { label: "Kanpur, India", search: "kanpur", lat: 26.4499, lng: 80.3319, tzOffsetHours: 5.5 },
  { label: "Nagpur, India", search: "nagpur", lat: 21.1458, lng: 79.0882, tzOffsetHours: 5.5 },
  { label: "Indore, India", search: "indore", lat: 22.7196, lng: 75.8577, tzOffsetHours: 5.5 },
  { label: "Bhopal, India", search: "bhopal", lat: 23.2599, lng: 77.4126, tzOffsetHours: 5.5 },
  { label: "Patna, India", search: "patna", lat: 25.5941, lng: 85.1376, tzOffsetHours: 5.5 },
  { label: "Vadodara, India", search: "vadodara baroda", lat: 22.3072, lng: 73.1812, tzOffsetHours: 5.5 },
  { label: "Ludhiana, India", search: "ludhiana", lat: 30.9, lng: 75.8573, tzOffsetHours: 5.5 },
  { label: "Amritsar, India", search: "amritsar", lat: 31.634, lng: 74.8723, tzOffsetHours: 5.5 },
  { label: "Chandigarh, India", search: "chandigarh", lat: 30.7333, lng: 76.7794, tzOffsetHours: 5.5 },
  { label: "Coimbatore, India", search: "coimbatore", lat: 11.0168, lng: 76.9558, tzOffsetHours: 5.5 },
  { label: "Visakhapatnam, India", search: "visakhapatnam vizag", lat: 17.6868, lng: 83.2185, tzOffsetHours: 5.5 },
  { label: "Kochi, India", search: "kochi cochin", lat: 9.9312, lng: 76.2673, tzOffsetHours: 5.5 },
  { label: "Thiruvananthapuram, India", search: "thiruvananthapuram trivandrum", lat: 8.5241, lng: 76.9366, tzOffsetHours: 5.5 },
  { label: "Madurai, India", search: "madurai", lat: 9.9252, lng: 78.1198, tzOffsetHours: 5.5 },
  { label: "Varanasi, India", search: "varanasi banaras kashi", lat: 25.3176, lng: 82.9739, tzOffsetHours: 5.5 },
  { label: "Udaipur, India", search: "udaipur", lat: 24.5854, lng: 73.7125, tzOffsetHours: 5.5 },
  { label: "Jodhpur, India", search: "jodhpur", lat: 26.2389, lng: 73.0243, tzOffsetHours: 5.5 },
  { label: "Goa, India", search: "goa panaji", lat: 15.4909, lng: 73.8278, tzOffsetHours: 5.5 },

  // ── Pakistan / Bangladesh / Sri Lanka / Nepal ──
  { label: "Karachi, Pakistan", search: "karachi", lat: 24.8607, lng: 67.0011, tzOffsetHours: 5 },
  { label: "Lahore, Pakistan", search: "lahore", lat: 31.5204, lng: 74.3587, tzOffsetHours: 5 },
  { label: "Islamabad, Pakistan", search: "islamabad", lat: 33.6844, lng: 73.0479, tzOffsetHours: 5 },
  { label: "Dhaka, Bangladesh", search: "dhaka", lat: 23.8103, lng: 90.4125, tzOffsetHours: 6 },
  { label: "Colombo, Sri Lanka", search: "colombo", lat: 6.9271, lng: 79.8612, tzOffsetHours: 5.5 },
  { label: "Kathmandu, Nepal", search: "kathmandu", lat: 27.7172, lng: 85.324, tzOffsetHours: 5.75 },

  // ── United States ──
  { label: "Dallas, TX, USA", search: "dallas dfw", lat: 32.7767, lng: -96.797, tzOffsetHours: -6 },
  { label: "Houston, TX, USA", search: "houston", lat: 29.7604, lng: -95.3698, tzOffsetHours: -6 },
  { label: "Austin, TX, USA", search: "austin", lat: 30.2672, lng: -97.7431, tzOffsetHours: -6 },
  { label: "New York, NY, USA", search: "new york nyc manhattan", lat: 40.7128, lng: -74.006, tzOffsetHours: -5 },
  { label: "Jersey City, NJ, USA", search: "jersey city", lat: 40.7178, lng: -74.0431, tzOffsetHours: -5 },
  { label: "Edison, NJ, USA", search: "edison", lat: 40.5187, lng: -74.4121, tzOffsetHours: -5 },
  { label: "Boston, MA, USA", search: "boston", lat: 42.3601, lng: -71.0589, tzOffsetHours: -5 },
  { label: "Chicago, IL, USA", search: "chicago", lat: 41.8781, lng: -87.6298, tzOffsetHours: -6 },
  { label: "Atlanta, GA, USA", search: "atlanta", lat: 33.749, lng: -84.388, tzOffsetHours: -5 },
  { label: "Washington, DC, USA", search: "washington dc", lat: 38.9072, lng: -77.0369, tzOffsetHours: -5 },
  { label: "Philadelphia, PA, USA", search: "philadelphia philly", lat: 39.9526, lng: -75.1652, tzOffsetHours: -5 },
  { label: "San Francisco, CA, USA", search: "san francisco sf bay area", lat: 37.7749, lng: -122.4194, tzOffsetHours: -8 },
  { label: "San Jose, CA, USA", search: "san jose", lat: 37.3382, lng: -121.8863, tzOffsetHours: -8 },
  { label: "Los Angeles, CA, USA", search: "los angeles la", lat: 34.0522, lng: -118.2437, tzOffsetHours: -8 },
  { label: "Seattle, WA, USA", search: "seattle", lat: 47.6062, lng: -122.3321, tzOffsetHours: -8 },
  { label: "Phoenix, AZ, USA", search: "phoenix", lat: 33.4484, lng: -112.074, tzOffsetHours: -7 },
  { label: "Denver, CO, USA", search: "denver", lat: 39.7392, lng: -104.9903, tzOffsetHours: -7 },
  { label: "Detroit, MI, USA", search: "detroit", lat: 42.3314, lng: -83.0458, tzOffsetHours: -5 },
  { label: "Minneapolis, MN, USA", search: "minneapolis", lat: 44.9778, lng: -93.265, tzOffsetHours: -6 },
  { label: "Charlotte, NC, USA", search: "charlotte", lat: 35.2271, lng: -80.8431, tzOffsetHours: -5 },
  { label: "Raleigh, NC, USA", search: "raleigh", lat: 35.7796, lng: -78.6382, tzOffsetHours: -5 },
  { label: "Orlando, FL, USA", search: "orlando", lat: 28.5383, lng: -81.3792, tzOffsetHours: -5 },
  { label: "Miami, FL, USA", search: "miami", lat: 25.7617, lng: -80.1918, tzOffsetHours: -5 },

  // ── Canada ──
  { label: "Toronto, ON, Canada", search: "toronto", lat: 43.6532, lng: -79.3832, tzOffsetHours: -5 },
  { label: "Vancouver, BC, Canada", search: "vancouver", lat: 49.2827, lng: -123.1207, tzOffsetHours: -8 },
  { label: "Brampton, ON, Canada", search: "brampton", lat: 43.7315, lng: -79.7624, tzOffsetHours: -5 },
  { label: "Mississauga, ON, Canada", search: "mississauga", lat: 43.589, lng: -79.6441, tzOffsetHours: -5 },
  { label: "Calgary, AB, Canada", search: "calgary", lat: 51.0447, lng: -114.0719, tzOffsetHours: -7 },
  { label: "Montreal, QC, Canada", search: "montreal", lat: 45.5017, lng: -73.5673, tzOffsetHours: -5 },

  // ── United Kingdom ──
  { label: "London, UK", search: "london", lat: 51.5074, lng: -0.1278, tzOffsetHours: 0 },
  { label: "Birmingham, UK", search: "birmingham", lat: 52.4862, lng: -1.8904, tzOffsetHours: 0 },
  { label: "Leicester, UK", search: "leicester", lat: 52.6369, lng: -1.1398, tzOffsetHours: 0 },
  { label: "Manchester, UK", search: "manchester", lat: 53.4808, lng: -2.2426, tzOffsetHours: 0 },

  // ── UAE / Singapore / Australia ──
  { label: "Dubai, UAE", search: "dubai", lat: 25.2048, lng: 55.2708, tzOffsetHours: 4 },
  { label: "Abu Dhabi, UAE", search: "abu dhabi", lat: 24.4539, lng: 54.3773, tzOffsetHours: 4 },
  { label: "Singapore", search: "singapore", lat: 1.3521, lng: 103.8198, tzOffsetHours: 8 },
  { label: "Sydney, Australia", search: "sydney", lat: -33.8688, lng: 151.2093, tzOffsetHours: 10 },
  { label: "Melbourne, Australia", search: "melbourne", lat: -37.8136, lng: 144.9631, tzOffsetHours: 10 },
];

export function searchCities(query: string, limit = 8): City[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const exact = CITIES.filter((c) =>
    c.search.split(/\s+/).some((s) => s === q),
  );
  const starts = CITIES.filter(
    (c) =>
      !exact.includes(c) &&
      c.search.split(/\s+/).some((s) => s.startsWith(q)),
  );
  const contains = CITIES.filter(
    (c) =>
      !exact.includes(c) && !starts.includes(c) && c.search.includes(q),
  );
  return [...exact, ...starts, ...contains].slice(0, limit);
}
