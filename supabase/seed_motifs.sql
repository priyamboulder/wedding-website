-- ──────────────────────────────────────────────────────────────────────────
-- motif_library seed — cultural SVG motifs for the Studio canvas
--
-- 32 motifs across all five categories (border, corner, divider, icon,
-- frame) and all supported cultural / regional styles. Every motif:
--   - uses viewBox="0 0 200 200" for drop-in swap compatibility
--   - renders with fill="currentColor" / stroke="currentColor" so the
--     canvas can recolor it freely
--   - avoids hard-coded whites (uses fill-rule="evenodd" cutouts instead)
--
-- Run after 0008_design_engine.sql.
-- ──────────────────────────────────────────────────────────────────────────

insert into motif_library (name, svg_data, cultural_style, regional_style, category, tags, is_premium, color_configurable) values

-- ── Borders ───────────────────────────────────────────────────────────────

('Paisley Vine Border',
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><path d="M0 100 C 35 108 65 92 100 100 C 135 108 165 92 200 100" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M42 72 C 70 72 82 98 72 120 C 64 135 40 138 28 122 C 18 110 26 92 40 94 C 52 96 54 108 46 112 C 40 114 38 108 42 104"/><path d="M158 128 C 130 128 118 102 128 80 C 136 65 160 62 172 78 C 182 90 174 108 160 106 C 148 104 146 92 154 88 C 160 86 162 92 158 96"/><circle cx="50" cy="104" r="2"/><circle cx="150" cy="96" r="2"/><path d="M100 88 L 103 80 L 106 88 L 103 96 Z"/><path d="M10 104 L 14 98 L 18 104 L 14 110 Z"/><path d="M182 96 L 186 90 L 190 96 L 186 102 Z"/></svg>',
 'hindu_north', null, 'border',
 array['paisley','vine','traditional','wedding','repeatable'], false, true),

('Marigold Garland Chain',
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><defs><g id="mgf"><circle cx="0" cy="-10" r="5"/><circle cx="7" cy="-7" r="5"/><circle cx="10" cy="0" r="5"/><circle cx="7" cy="7" r="5"/><circle cx="0" cy="10" r="5"/><circle cx="-7" cy="7" r="5"/><circle cx="-10" cy="0" r="5"/><circle cx="-7" cy="-7" r="5"/><circle r="4"/></g></defs><path d="M10 100 Q 35 118 60 100 Q 85 82 110 100 Q 135 118 160 100 Q 185 82 200 100" fill="none" stroke="currentColor" stroke-width="1.5"/><use href="#mgf" x="30" y="100"/><use href="#mgf" x="100" y="100"/><use href="#mgf" x="170" y="100"/><circle cx="65" cy="104" r="1.5"/><circle cx="135" cy="104" r="1.5"/></svg>',
 'hindu_north', null, 'border',
 array['marigold','garland','flowers','traditional','auspicious'], false, true),

('Jali Lattice Border',
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><g fill="none" stroke="currentColor" stroke-width="2"><polygon points="50,80 60,95 77,95 63,105 68,122 50,112 32,122 37,105 23,95 40,95"/><polygon points="100,80 110,95 127,95 113,105 118,122 100,112 82,122 87,105 73,95 90,95"/><polygon points="150,80 160,95 177,95 163,105 168,122 150,112 132,122 137,105 123,95 140,95"/><line x1="0" y1="100" x2="200" y2="100"/><line x1="0" y1="70" x2="200" y2="70"/><line x1="0" y1="130" x2="200" y2="130"/><line x1="25" y1="70" x2="25" y2="130"/><line x1="75" y1="70" x2="75" y2="130"/><line x1="125" y1="70" x2="125" y2="130"/><line x1="175" y1="70" x2="175" y2="130"/></g></svg>',
 'muslim', null, 'border',
 array['jali','lattice','islamic','geometric','mughal','luxury'], true, true),

('Kolam Dot Border',
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><g><circle cx="20" cy="80" r="2.5"/><circle cx="60" cy="80" r="2.5"/><circle cx="100" cy="80" r="2.5"/><circle cx="140" cy="80" r="2.5"/><circle cx="180" cy="80" r="2.5"/><circle cx="20" cy="120" r="2.5"/><circle cx="60" cy="120" r="2.5"/><circle cx="100" cy="120" r="2.5"/><circle cx="140" cy="120" r="2.5"/><circle cx="180" cy="120" r="2.5"/><circle cx="40" cy="100" r="2.5"/><circle cx="80" cy="100" r="2.5"/><circle cx="120" cy="100" r="2.5"/><circle cx="160" cy="100" r="2.5"/></g><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 80 Q 40 70 60 80 Q 80 70 100 80 Q 120 70 140 80 Q 160 70 180 80"/><path d="M20 120 Q 40 130 60 120 Q 80 130 100 120 Q 120 130 140 120 Q 160 130 180 120"/><path d="M40 100 Q 50 85 60 100 Q 70 115 80 100 Q 90 85 100 100 Q 110 115 120 100 Q 130 85 140 100 Q 150 115 160 100"/></g></svg>',
 'hindu_south', 'tamil', 'border',
 array['kolam','dots','south_indian','tamil','traditional','minimal'], false, true),

('Phulkari Embroidery Strip',
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><path fill-rule="evenodd" d="M100 60 L 120 100 L 100 140 L 80 100 Z M100 75 L 110 100 L 100 125 L 90 100 Z M40 60 L 60 100 L 40 140 L 20 100 Z M40 75 L 50 100 L 40 125 L 30 100 Z M160 60 L 180 100 L 160 140 L 140 100 Z M160 75 L 170 100 L 160 125 L 150 100 Z"/><g fill="none" stroke="currentColor" stroke-width="2"><line x1="0" y1="40" x2="200" y2="40"/><line x1="0" y1="160" x2="200" y2="160"/></g><g><path d="M10 40 L 15 30 L 20 40 L 15 50 Z"/><path d="M100 20 L 105 10 L 110 20 L 105 30 Z"/><path d="M190 40 L 185 30 L 180 40 L 185 50 Z"/><path d="M10 160 L 15 150 L 20 160 L 15 170 Z"/><path d="M100 170 L 105 160 L 110 170 L 105 180 Z"/><path d="M190 160 L 185 150 L 180 160 L 185 170 Z"/></g></svg>',
 'sikh', 'punjabi', 'border',
 array['phulkari','embroidery','punjabi','sikh','geometric','vibrant'], false, true),

('Bengali Alpona Border',
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><g fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="100" cy="100" r="12"/><circle cx="100" cy="100" r="5"/><path d="M30 100 Q 50 80 70 100 Q 60 115 45 110"/><path d="M170 100 Q 150 80 130 100 Q 140 115 155 110"/></g><g><path d="M100 88 Q 105 80 110 88 Q 105 95 100 88 Z"/><path d="M112 100 Q 120 95 112 110 Q 105 105 112 100 Z"/><path d="M100 112 Q 95 120 90 112 Q 95 105 100 112 Z"/><path d="M88 100 Q 80 95 88 110 Q 95 105 88 100 Z"/><circle cx="30" cy="100" r="3"/><circle cx="170" cy="100" r="3"/><circle cx="50" cy="100" r="1.5"/><circle cx="150" cy="100" r="1.5"/><circle cx="10" cy="100" r="1.5"/><circle cx="190" cy="100" r="1.5"/></g></svg>',
 'hindu_north', 'bengali', 'border',
 array['alpona','bengali','traditional','floral','auspicious'], false, true),

('Marathi Toran Border',
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><line x1="0" y1="50" x2="200" y2="50" stroke="currentColor" stroke-width="2"/><g><g transform="translate(30 50)"><line x1="0" y1="0" x2="0" y2="40" stroke="currentColor" stroke-width="1"/><path d="M0 40 Q -10 50 -5 70 Q 0 75 5 70 Q 10 50 0 40 Z"/></g><g transform="translate(65 50)"><line x1="0" y1="0" x2="0" y2="50" stroke="currentColor" stroke-width="1"/><path d="M0 50 Q -12 60 -6 85 Q 0 92 6 85 Q 12 60 0 50 Z"/></g><g transform="translate(100 50)"><line x1="0" y1="0" x2="0" y2="60" stroke="currentColor" stroke-width="1"/><path d="M0 60 Q -14 72 -7 100 Q 0 108 7 100 Q 14 72 0 60 Z"/></g><g transform="translate(135 50)"><line x1="0" y1="0" x2="0" y2="50" stroke="currentColor" stroke-width="1"/><path d="M0 50 Q -12 60 -6 85 Q 0 92 6 85 Q 12 60 0 50 Z"/></g><g transform="translate(170 50)"><line x1="0" y1="0" x2="0" y2="40" stroke="currentColor" stroke-width="1"/><path d="M0 40 Q -10 50 -5 70 Q 0 75 5 70 Q 10 50 0 40 Z"/></g><circle cx="30" cy="78" r="3"/><circle cx="100" cy="118" r="4"/><circle cx="170" cy="78" r="3"/><circle cx="65" cy="100" r="3"/><circle cx="135" cy="100" r="3"/></g></svg>',
 'hindu_north', 'marathi', 'border',
 array['toran','marathi','mango_leaves','doorway','auspicious'], false, true),

-- ── Corners ───────────────────────────────────────────────────────────────

('Mandala Quarter Corner',
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M0 100 A 100 100 0 0 1 100 0"/><path d="M0 70 A 70 70 0 0 1 70 0"/><path d="M0 40 A 40 40 0 0 1 40 0"/></g><g><path d="M0 85 Q 20 70 30 60 Q 40 50 55 30 Q 45 70 0 100 Z"/><path d="M50 50 L 55 45 L 60 50 L 55 55 Z"/><path d="M80 20 L 85 15 L 90 20 L 85 25 Z"/><path d="M20 80 L 25 75 L 30 80 L 25 85 Z"/><path d="M35 35 L 40 30 L 45 35 L 40 40 Z"/><circle cx="0" cy="0" r="6"/></g><circle cx="0" cy="0" r="3" fill="none" stroke="currentColor" stroke-width="1"/></svg>',
 'hindu_north', null, 'corner',
 array['mandala','corner','sacred_geometry','rotational','luxury'], true, true),

('Peacock Corner Flourish',
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><path d="M0 0 C 40 10 65 35 75 75 C 80 100 70 130 50 150 C 35 165 15 170 0 165 L 0 0 Z" fill="none" stroke="currentColor" stroke-width="2"/><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 10 Q 40 30 50 60"/><path d="M10 30 Q 35 45 45 75"/><path d="M10 50 Q 30 60 40 90"/></g><ellipse cx="60" cy="55" rx="8" ry="12"/><ellipse cx="60" cy="55" rx="3" ry="4" fill="none" stroke="currentColor"/><circle cx="60" cy="55" r="1.5"/><ellipse cx="45" cy="85" rx="6" ry="9"/><ellipse cx="45" cy="85" rx="2" ry="3" fill="none" stroke="currentColor"/><ellipse cx="25" cy="115" rx="5" ry="7"/></svg>',
 'hindu_north', 'rajasthani', 'corner',
 array['peacock','corner','rajasthani','feathers','royal','luxury'], true, true),

('Lotus Corner Accent',
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><g><path d="M0 0 L 85 10 Q 70 40 40 40 Z"/><path d="M0 0 L 75 35 Q 55 55 35 55 Z"/><path d="M0 0 L 55 55 Q 45 70 25 75 Z"/><path d="M0 0 L 35 75 Q 20 85 10 85 Z"/><path d="M0 0 L 10 85 Q 0 90 0 70 Z"/></g><g fill="none" stroke="currentColor" stroke-width="1.2"><path d="M0 0 L 85 10"/><path d="M0 0 L 75 35"/><path d="M0 0 L 55 55"/><path d="M0 0 L 35 75"/><path d="M0 0 L 10 85"/></g><circle cx="0" cy="0" r="4"/></svg>',
 'hindu_north', null, 'corner',
 array['lotus','corner','petals','minimal','elegant'], false, true),

('Mehndi Vine Corner',
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><g fill="none" stroke="currentColor" stroke-width="2"><path d="M0 0 C 20 30 40 40 60 35 Q 80 30 90 50 Q 100 70 80 80 Q 60 90 50 75"/><path d="M30 20 Q 40 15 45 25 Q 50 35 40 40 Q 30 30 30 20 Z"/><path d="M70 60 Q 80 55 85 65 Q 90 75 80 80 Q 70 70 70 60 Z"/></g><g><circle cx="15" cy="15" r="2"/><circle cx="35" cy="45" r="2"/><circle cx="65" cy="35" r="2"/><circle cx="85" cy="70" r="2"/><path d="M20 35 Q 25 28 30 35 Q 25 42 20 35 Z"/><path d="M55 55 Q 60 48 65 55 Q 60 62 55 55 Z"/><path d="M75 25 Q 80 18 85 25 Q 80 32 75 25 Z"/></g></svg>',
 'hindu_north', null, 'corner',
 array['mehndi','henna','vine','corner','organic','bridal'], false, true),

('Art Deco Geometric Corner',
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><g><path d="M0 0 L 100 0 L 100 20 L 20 20 L 20 100 L 0 100 Z"/><path d="M0 30 L 70 30 L 70 40 L 40 40 L 40 70 L 30 70 L 30 30 Z"/><path d="M0 60 L 20 60 L 20 80 L 0 80 Z"/></g><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M50 50 L 80 80"/><path d="M60 50 L 80 70"/><path d="M50 60 L 70 80"/></g><circle cx="10" cy="10" r="3"/><circle cx="90" cy="10" r="2"/><circle cx="10" cy="90" r="2"/></svg>',
 'fusion', null, 'corner',
 array['art_deco','geometric','modern','fusion','angular','corner'], false, true),

-- ── Dividers ──────────────────────────────────────────────────────────────

('Ornate Scroll Divider',
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 100 L 80 100"/><path d="M120 100 L 190 100"/><path d="M80 100 C 70 85 55 85 55 100 C 55 115 70 115 80 100"/><path d="M120 100 C 130 85 145 85 145 100 C 145 115 130 115 120 100"/><circle cx="100" cy="100" r="18"/><circle cx="100" cy="100" r="10"/></g><circle cx="100" cy="100" r="4"/><path d="M92 92 L 100 82 L 108 92 L 100 102 Z" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="55" cy="100" r="2"/><circle cx="145" cy="100" r="2"/><circle cx="10" cy="100" r="2"/><circle cx="190" cy="100" r="2"/></svg>',
 'fusion', null, 'divider',
 array['scroll','ornate','divider','center_medallion','luxury'], true, true),

('Lotus Line Divider',
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><line x1="10" y1="100" x2="75" y2="100" stroke="currentColor" stroke-width="1.5"/><line x1="125" y1="100" x2="190" y2="100" stroke="currentColor" stroke-width="1.5"/><g transform="translate(100 100)"><path d="M0 -18 Q 8 -10 0 0 Q -8 -10 0 -18 Z"/><path d="M18 0 Q 10 -8 0 0 Q 10 8 18 0 Z"/><path d="M0 18 Q -8 10 0 0 Q 8 10 0 18 Z"/><path d="M-18 0 Q -10 -8 0 0 Q -10 8 -18 0 Z"/><path d="M13 -13 Q 4 -10 0 0 Q 10 -4 13 -13 Z"/><path d="M-13 -13 Q -4 -10 0 0 Q -10 -4 -13 -13 Z"/><path d="M13 13 Q 4 10 0 0 Q 10 4 13 13 Z"/><path d="M-13 13 Q -4 10 0 0 Q -10 4 -13 13 Z"/><circle r="3"/></g><circle cx="10" cy="100" r="2"/><circle cx="190" cy="100" r="2"/></svg>',
 'hindu_north', null, 'divider',
 array['lotus','divider','simple','elegant','minimal'], false, true),

('Diya Lamp Row Divider',
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><line x1="10" y1="115" x2="190" y2="115" stroke="currentColor" stroke-width="1.5"/><g transform="translate(40 100)"><path d="M-12 10 Q 0 20 12 10 L 10 15 L -10 15 Z"/><path d="M0 0 Q -3 -8 0 -12 Q 3 -8 0 0 Z"/></g><g transform="translate(100 100)"><path d="M-14 10 Q 0 22 14 10 L 12 16 L -12 16 Z"/><path d="M0 0 Q -4 -10 0 -14 Q 4 -10 0 0 Z"/></g><g transform="translate(160 100)"><path d="M-12 10 Q 0 20 12 10 L 10 15 L -10 15 Z"/><path d="M0 0 Q -3 -8 0 -12 Q 3 -8 0 0 Z"/></g><circle cx="20" cy="115" r="2"/><circle cx="70" cy="115" r="2"/><circle cx="130" cy="115" r="2"/><circle cx="180" cy="115" r="2"/></svg>',
 'hindu_north', null, 'divider',
 array['diya','lamp','divider','auspicious','festive'], false, true),

('Geometric Diamond Chain',
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><line x1="0" y1="100" x2="200" y2="100" stroke="currentColor" stroke-width="1"/><g fill-rule="evenodd"><path d="M30 100 L 40 90 L 50 100 L 40 110 Z M34 100 L 40 94 L 46 100 L 40 106 Z"/><path d="M70 100 L 80 90 L 90 100 L 80 110 Z M74 100 L 80 94 L 86 100 L 80 106 Z"/><path d="M110 100 L 120 90 L 130 100 L 120 110 Z M114 100 L 120 94 L 126 100 L 120 106 Z"/><path d="M150 100 L 160 90 L 170 100 L 160 110 Z M154 100 L 160 94 L 166 100 L 160 106 Z"/></g><circle cx="10" cy="100" r="2"/><circle cx="190" cy="100" r="2"/><circle cx="60" cy="100" r="1.5"/><circle cx="100" cy="100" r="1.5"/><circle cx="140" cy="100" r="1.5"/></svg>',
 'fusion', null, 'divider',
 array['diamonds','geometric','chain','modern','minimal'], false, true),

('Dots and Curves Divider',
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><g fill="none" stroke="currentColor" stroke-width="1.2"><path d="M10 100 Q 50 85 90 100 T 190 100"/></g><circle cx="10" cy="100" r="2.5"/><circle cx="50" cy="93" r="2"/><circle cx="90" cy="100" r="2.5"/><circle cx="130" cy="108" r="2"/><circle cx="170" cy="93" r="2"/><circle cx="190" cy="100" r="2.5"/><circle cx="100" cy="100" r="4" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="100" cy="100" r="1.5"/></svg>',
 'hindu_south', null, 'divider',
 array['dots','curves','minimal','south_indian','airy'], false, true),

-- ── Icons ─────────────────────────────────────────────────────────────────

('Om Symbol',
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><g fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"><path d="M55 75 C 40 75 35 95 50 105 C 65 115 85 105 80 85 C 78 75 70 72 62 76 C 75 80 90 95 85 125 C 82 145 55 150 45 135"/><path d="M85 125 C 110 120 125 140 115 155 C 105 165 90 160 88 150"/></g><g><circle cx="140" cy="65" r="5"/><path d="M118 82 Q 132 74 148 82 Q 140 78 133 78 Q 126 78 118 82 Z"/><path d="M115 95 Q 140 85 160 105" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round"/></g></svg>',
 'hindu_north', null, 'icon',
 array['om','sacred','hindu','religious','auspicious'], false, true),

('Ganesh Silhouette',
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><g><path d="M85 45 L 90 25 L 100 35 L 110 25 L 115 45 Z"/><circle cx="100" cy="20" r="3"/><ellipse cx="100" cy="90" rx="42" ry="38"/><path d="M58 75 Q 40 70 38 95 Q 40 115 58 110 Z"/><path d="M142 75 Q 160 70 162 95 Q 160 115 142 110 Z"/><path d="M100 120 C 105 135 120 142 132 132 C 138 126 134 118 126 122" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round"/><path d="M90 120 L 85 138" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M70 128 Q 100 160 130 128 L 148 182 L 52 182 Z"/></g><g fill="none" stroke-width="2" stroke="currentColor"><circle cx="84" cy="85" r="4"/><circle cx="116" cy="85" r="4"/></g><circle cx="100" cy="72" r="2"/></svg>',
 'hindu_north', null, 'icon',
 array['ganesh','god','hindu','sacred','auspicious','wedding_opener'], true, true),

('Kalash Sacred Pot',
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><g><path d="M60 175 L 140 175 L 130 165 L 70 165 Z"/><path d="M70 105 Q 55 130 70 165 L 130 165 Q 145 130 130 105 Z"/><rect x="85" y="90" width="30" height="15"/><rect x="80" y="85" width="40" height="8"/><ellipse cx="100" cy="58" rx="14" ry="18"/><path d="M88 85 Q 72 68 80 88 Z"/><path d="M112 85 Q 128 68 120 88 Z"/><path d="M92 85 Q 84 65 94 82 Z"/><path d="M108 85 Q 116 65 106 82 Z"/><circle cx="100" cy="38" r="2.5"/></g><g fill="none" stroke="currentColor" stroke-width="1.5"><line x1="72" y1="130" x2="128" y2="130"/><line x1="72" y1="145" x2="128" y2="145"/><path d="M92 120 Q 100 125 108 120"/></g></svg>',
 'hindu_north', null, 'icon',
 array['kalash','pot','sacred','auspicious','puja','wedding'], false, true),

('Diya Oil Lamp',
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><g><ellipse cx="100" cy="150" rx="70" ry="10"/><path d="M35 135 Q 50 160 100 165 Q 150 160 165 135 Q 155 120 100 120 Q 45 120 35 135 Z"/><path d="M100 120 L 115 105 L 85 105 Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M100 100 C 88 90 98 65 100 50 C 102 65 112 90 100 100 Z"/></g><g fill="none" stroke="currentColor" stroke-width="1"><path d="M100 85 C 96 80 100 72 100 66"/><path d="M55 140 Q 100 155 145 140"/></g><circle cx="45" cy="148" r="2"/><circle cx="155" cy="148" r="2"/></svg>',
 'hindu_north', null, 'icon',
 array['diya','lamp','flame','deepavali','auspicious','light'], false, true),

('Elephant Pair',
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><g><path d="M25 125 Q 25 105 42 98 Q 52 92 62 94 L 68 84 Q 75 78 80 90 L 80 102 Q 84 105 85 118 L 90 125 L 90 140 L 82 140 L 82 148 L 75 148 L 75 140 L 62 140 L 62 148 L 55 148 L 55 140 Q 42 140 38 132 Q 28 132 25 125 Z"/><path d="M90 125 Q 100 120 102 115 Q 98 115 95 118" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M175 125 Q 175 105 158 98 Q 148 92 138 94 L 132 84 Q 125 78 120 90 L 120 102 Q 116 105 115 118 L 110 125 L 110 140 L 118 140 L 118 148 L 125 148 L 125 140 L 138 140 L 138 148 L 145 148 L 145 140 Q 158 140 162 132 Q 172 132 175 125 Z"/><path d="M110 125 Q 100 120 98 115 Q 102 115 105 118" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M85 72 Q 100 52 115 72 L 110 78 L 100 68 L 90 78 Z"/><circle cx="100" cy="58" r="3"/><path d="M96 42 L 100 32 L 104 42 Z"/></g><g fill="none"><circle cx="55" cy="108" r="1.5" stroke="currentColor"/><circle cx="145" cy="108" r="1.5" stroke="currentColor"/></g></svg>',
 'hindu_north', 'rajasthani', 'icon',
 array['elephants','pair','rajasthani','royal','auspicious','wedding'], true, true),

('Peacock Full Display',
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M100 130 Q 30 100 30 50"/><path d="M100 130 Q 50 90 50 40"/><path d="M100 130 Q 75 85 75 30"/><path d="M100 130 Q 100 85 100 25"/><path d="M100 130 Q 125 85 125 30"/><path d="M100 130 Q 150 90 150 40"/><path d="M100 130 Q 170 100 170 50"/></g><g><ellipse cx="30" cy="50" rx="6" ry="9"/><ellipse cx="50" cy="40" rx="7" ry="10"/><ellipse cx="75" cy="30" rx="8" ry="11"/><ellipse cx="100" cy="25" rx="8" ry="12"/><ellipse cx="125" cy="30" rx="8" ry="11"/><ellipse cx="150" cy="40" rx="7" ry="10"/><ellipse cx="170" cy="50" rx="6" ry="9"/></g><g fill="none" stroke="currentColor" stroke-width="1"><circle cx="30" cy="50" r="3"/><circle cx="50" cy="40" r="3"/><circle cx="75" cy="30" r="3.5"/><circle cx="100" cy="25" r="4"/><circle cx="125" cy="30" r="3.5"/><circle cx="150" cy="40" r="3"/><circle cx="170" cy="50" r="3"/></g><g><ellipse cx="100" cy="140" rx="15" ry="20"/><path d="M95 125 Q 88 110 88 95 Q 95 85 105 85 Q 110 90 105 95 Q 100 105 100 120" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="100" cy="85" r="6"/><path d="M100 79 L 98 70 M100 79 L 102 70 M100 79 L 100 68" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M106 85 L 112 87 L 106 88 Z"/><path d="M95 160 L 92 175" stroke="currentColor" stroke-width="2" fill="none"/><path d="M105 160 L 108 175" stroke="currentColor" stroke-width="2" fill="none"/></g></svg>',
 'hindu_north', null, 'icon',
 array['peacock','national_bird','luxury','royal','feathers','bird'], true, true),

('Lotus Top View',
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><g transform="translate(100 100)"><g><path d="M0 -70 Q 15 -40 0 -10 Q -15 -40 0 -70 Z"/><path d="M50 -50 Q 35 -30 10 -10 Q 30 -35 50 -50 Z"/><path d="M70 0 Q 40 -15 10 0 Q 40 15 70 0 Z"/><path d="M50 50 Q 35 30 10 10 Q 30 35 50 50 Z"/><path d="M0 70 Q 15 40 0 10 Q -15 40 0 70 Z"/><path d="M-50 50 Q -35 30 -10 10 Q -30 35 -50 50 Z"/><path d="M-70 0 Q -40 -15 -10 0 Q -40 15 -70 0 Z"/><path d="M-50 -50 Q -35 -30 -10 -10 Q -30 -35 -50 -50 Z"/></g><g opacity="0.75"><path d="M0 -40 Q 8 -20 0 -5 Q -8 -20 0 -40 Z"/><path d="M28 -28 Q 14 -14 5 -5 Q 14 -14 28 -28 Z"/><path d="M40 0 Q 20 -8 5 0 Q 20 8 40 0 Z"/><path d="M28 28 Q 14 14 5 5 Q 14 14 28 28 Z"/><path d="M0 40 Q 8 20 0 5 Q -8 20 0 40 Z"/><path d="M-28 28 Q -14 14 -5 5 Q -14 14 -28 28 Z"/><path d="M-40 0 Q -20 -8 -5 0 Q -20 8 -40 0 Z"/><path d="M-28 -28 Q -14 -14 -5 -5 Q -14 -14 -28 -28 Z"/></g><circle r="7"/><circle r="3" fill="none" stroke="currentColor" stroke-width="0.8"/></g></svg>',
 'hindu_north', null, 'icon',
 array['lotus','flower','top_view','sacred','floral'], false, true),

('Khanda Sikh Symbol',
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><g><circle cx="100" cy="100" r="35" fill="none" stroke="currentColor" stroke-width="6"/><path d="M100 55 L 106 70 L 106 140 L 112 148 L 100 160 L 88 148 L 94 140 L 94 70 Z"/><path d="M96 45 L 100 30 L 104 45 Z"/><path d="M60 85 C 35 90 30 120 50 140 C 55 145 58 142 55 138 C 45 125 48 108 65 100 L 62 95 Z"/><path d="M140 85 C 165 90 170 120 150 140 C 145 145 142 142 145 138 C 155 125 152 108 135 100 L 138 95 Z"/></g></svg>',
 'sikh', 'punjabi', 'icon',
 array['khanda','sikh','religious','punjabi','sacred'], false, true),

('Crescent and Star',
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><g><path fill-rule="evenodd" d="M65 100 A 40 40 0 1 0 105 60 A 32 32 0 1 1 65 100 Z"/><path d="M140 85 L 146 100 L 162 100 L 149 110 L 154 126 L 140 117 L 126 126 L 131 110 L 118 100 L 134 100 Z"/></g></svg>',
 'muslim', null, 'icon',
 array['crescent','star','islamic','moon','religious'], false, true),

('Cross with Floral Frame',
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><g><rect x="94" y="45" width="12" height="110"/><rect x="65" y="85" width="70" height="12"/><path d="M100 35 Q 90 40 94 50 Q 100 42 106 50 Q 110 40 100 35 Z"/><path d="M100 165 Q 90 160 94 150 Q 100 158 106 150 Q 110 160 100 165 Z"/><path d="M55 91 Q 50 81 60 85 Q 52 91 60 97 Q 50 101 55 91 Z"/><path d="M145 91 Q 150 81 140 85 Q 148 91 140 97 Q 150 101 145 91 Z"/><circle cx="40" cy="40" r="4"/><circle cx="160" cy="40" r="4"/><circle cx="40" cy="160" r="4"/><circle cx="160" cy="160" r="4"/></g><g fill="none" stroke="currentColor" stroke-width="1"><path d="M40 50 Q 60 70 80 80"/><path d="M160 50 Q 140 70 120 80"/><path d="M40 150 Q 60 130 80 120"/><path d="M160 150 Q 140 130 120 120"/></g></svg>',
 'christian', null, 'icon',
 array['cross','christian','floral','religious','wedding'], false, true),

('Swastika Auspicious',
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><g fill="none" stroke="currentColor" stroke-width="14" stroke-linejoin="miter" stroke-linecap="butt"><path d="M100 100 L 100 40 L 140 40"/><path d="M100 100 L 160 100 L 160 140"/><path d="M100 100 L 100 160 L 60 160"/><path d="M100 100 L 40 100 L 40 60"/></g><g><circle cx="70" cy="70" r="4"/><circle cx="130" cy="70" r="4"/><circle cx="70" cy="130" r="4"/><circle cx="130" cy="130" r="4"/></g></svg>',
 'hindu_north', null, 'icon',
 array['swastik','auspicious','hindu','sacred','wedding_opener'], false, true),

-- ── Frames ────────────────────────────────────────────────────────────────

('Mughal Arch Frame',
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><g fill="none" stroke="currentColor" stroke-width="2.5"><path d="M30 180 L 30 80 Q 30 40 70 30 L 100 20 L 130 30 Q 170 40 170 80 L 170 180"/><path d="M40 180 L 40 85 Q 40 50 75 42 L 100 34 L 125 42 Q 160 50 160 85 L 160 180"/></g><g><path d="M95 15 L 100 5 L 105 15 L 100 25 Z"/><circle cx="30" cy="180" r="4"/><circle cx="170" cy="180" r="4"/><circle cx="100" cy="44" r="4"/></g><g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M70 60 Q 100 50 130 60"/><path d="M60 100 Q 100 95 140 100"/><path d="M55 140 Q 100 135 145 140"/></g></svg>',
 'muslim', null, 'frame',
 array['mughal','arch','islamic','jharokha','palace','luxury'], true, true),

('Double-Line Classic Frame',
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><g fill="none" stroke="currentColor" stroke-width="2"><rect x="20" y="20" width="160" height="160"/><rect x="28" y="28" width="144" height="144"/></g><g><g transform="translate(20 20)"><path d="M0 0 L 15 0 L 10 5 L 10 10 L 5 10 L 0 15 Z"/><circle cx="3" cy="3" r="2"/></g><g transform="translate(180 20) scale(-1 1)"><path d="M0 0 L 15 0 L 10 5 L 10 10 L 5 10 L 0 15 Z"/><circle cx="3" cy="3" r="2"/></g><g transform="translate(20 180) scale(1 -1)"><path d="M0 0 L 15 0 L 10 5 L 10 10 L 5 10 L 0 15 Z"/><circle cx="3" cy="3" r="2"/></g><g transform="translate(180 180) scale(-1 -1)"><path d="M0 0 L 15 0 L 10 5 L 10 10 L 5 10 L 0 15 Z"/><circle cx="3" cy="3" r="2"/></g><path d="M95 25 L 100 18 L 105 25 L 100 32 Z"/><path d="M95 175 L 100 168 L 105 175 L 100 182 Z"/><path d="M25 95 L 18 100 L 25 105 L 32 100 Z"/><path d="M175 95 L 168 100 L 175 105 L 182 100 Z"/></g></svg>',
 'fusion', null, 'frame',
 array['frame','classic','minimal','corner_motifs','editorial'], false, true),

('Mandala Circle Frame',
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><g fill="none" stroke="currentColor" stroke-width="2"><circle cx="100" cy="100" r="90"/><circle cx="100" cy="100" r="80"/><circle cx="100" cy="100" r="70"/></g><g transform="translate(100 100)"><g><path d="M0 -82 Q 5 -75 0 -70 Q -5 -75 0 -82 Z"/></g><g transform="rotate(30)"><path d="M0 -82 Q 5 -75 0 -70 Q -5 -75 0 -82 Z"/></g><g transform="rotate(60)"><path d="M0 -82 Q 5 -75 0 -70 Q -5 -75 0 -82 Z"/></g><g transform="rotate(90)"><path d="M0 -82 Q 5 -75 0 -70 Q -5 -75 0 -82 Z"/></g><g transform="rotate(120)"><path d="M0 -82 Q 5 -75 0 -70 Q -5 -75 0 -82 Z"/></g><g transform="rotate(150)"><path d="M0 -82 Q 5 -75 0 -70 Q -5 -75 0 -82 Z"/></g><g transform="rotate(180)"><path d="M0 -82 Q 5 -75 0 -70 Q -5 -75 0 -82 Z"/></g><g transform="rotate(210)"><path d="M0 -82 Q 5 -75 0 -70 Q -5 -75 0 -82 Z"/></g><g transform="rotate(240)"><path d="M0 -82 Q 5 -75 0 -70 Q -5 -75 0 -82 Z"/></g><g transform="rotate(270)"><path d="M0 -82 Q 5 -75 0 -70 Q -5 -75 0 -82 Z"/></g><g transform="rotate(300)"><path d="M0 -82 Q 5 -75 0 -70 Q -5 -75 0 -82 Z"/></g><g transform="rotate(330)"><path d="M0 -82 Q 5 -75 0 -70 Q -5 -75 0 -82 Z"/></g><g><circle cx="0" cy="-75" r="1.5"/></g><g transform="rotate(15)"><circle cx="0" cy="-75" r="1.5"/></g><g transform="rotate(45)"><circle cx="0" cy="-75" r="1.5"/></g><g transform="rotate(75)"><circle cx="0" cy="-75" r="1.5"/></g><g transform="rotate(105)"><circle cx="0" cy="-75" r="1.5"/></g><g transform="rotate(135)"><circle cx="0" cy="-75" r="1.5"/></g><g transform="rotate(165)"><circle cx="0" cy="-75" r="1.5"/></g><g transform="rotate(195)"><circle cx="0" cy="-75" r="1.5"/></g><g transform="rotate(225)"><circle cx="0" cy="-75" r="1.5"/></g><g transform="rotate(255)"><circle cx="0" cy="-75" r="1.5"/></g><g transform="rotate(285)"><circle cx="0" cy="-75" r="1.5"/></g><g transform="rotate(315)"><circle cx="0" cy="-75" r="1.5"/></g><g transform="rotate(345)"><circle cx="0" cy="-75" r="1.5"/></g></g></svg>',
 'hindu_north', null, 'frame',
 array['mandala','circle','sacred_geometry','frame','luxury','radial'], true, true),

('Rustic Vine Frame',
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor"><g fill="none" stroke="currentColor" stroke-width="2"><path d="M20 20 Q 60 15 100 20 T 180 20 Q 185 60 180 100 T 180 180 Q 140 185 100 180 T 20 180 Q 15 140 20 100 T 20 20 Z"/></g><g><path d="M50 15 Q 55 8 60 20 Q 55 25 50 15 Z"/><path d="M100 15 Q 105 5 110 20 Q 105 25 100 15 Z"/><path d="M150 15 Q 155 8 160 20 Q 155 25 150 15 Z"/><path d="M185 50 Q 195 55 180 60 Q 175 55 185 50 Z"/><path d="M185 100 Q 195 95 185 105 Q 175 100 185 100 Z"/><path d="M185 150 Q 195 145 180 155 Q 175 150 185 150 Z"/><path d="M150 185 Q 155 195 160 180 Q 155 175 150 185 Z"/><path d="M100 185 Q 95 195 110 180 Q 105 175 100 185 Z"/><path d="M50 185 Q 55 195 60 180 Q 55 175 50 185 Z"/><path d="M15 150 Q 5 145 20 155 Q 25 150 15 150 Z"/><path d="M15 100 Q 5 95 20 100 Q 25 105 15 100 Z"/><path d="M15 50 Q 5 55 20 60 Q 25 55 15 50 Z"/><circle cx="20" cy="20" r="4"/><circle cx="180" cy="20" r="4"/><circle cx="20" cy="180" r="4"/><circle cx="180" cy="180" r="4"/></g></svg>',
 'fusion', null, 'frame',
 array['vine','rustic','frame','bohemian','organic','floral'], false, true);
