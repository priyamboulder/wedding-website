-- ──────────────────────────────────────────────────────────────────────────
-- design_templates seed — 24 starter marketplace templates
--
-- 12 surface types × 2 variants (one traditional/ornate, one modern/minimal).
-- Cultural styles span hindu_north, hindu_south, sikh, muslim, christian,
-- and fusion; regional styles cover rajasthani, gujarati, tamil, bengali,
-- malayali, and punjabi.
--
-- Canvas dimensions are 300-DPI print pixels except for IG/WhatsApp which
-- are screen pixels. Welcome Sign / Seating Chart (24x36") use a 1200×1800
-- / 1800×1200 proxy so the editor stays responsive; export upscales.
--
-- Pricing: 8 free · 8 @ $1.49 · 4 @ $1.99 · 4 @ $2.99. 8 trending.
--
-- Run after 0008_design_engine.sql.
-- ──────────────────────────────────────────────────────────────────────────

insert into design_templates (name, description, surface_type, cultural_style, regional_style, canvas_width, canvas_height, canvas_data, colors, fonts, tags, price_cents, is_trending, is_featured, is_published, category_tags) values

-- ═══ Wedding Invitation (5×7, 1500×2100) ═══════════════════════════════════

('Royal Rajasthani',
 'Palace-inspired heritage invitation with devanagari header, double border, and marigold-gold accents.',
 'invitation', 'hindu_north', 'rajasthani', 1500, 2100,
 '{"version":"5.3.0","background":"#FDF8EF","objects":[{"type":"rect","left":60,"top":60,"width":1380,"height":1980,"fill":"","stroke":"#8B1A2B","strokeWidth":4},{"type":"rect","left":90,"top":90,"width":1320,"height":1920,"fill":"","stroke":"#D4AF37","strokeWidth":1.5},{"type":"textbox","text":"शुभ विवाह","left":750,"top":280,"width":900,"fontSize":54,"fontFamily":"Noto Serif Devanagari","fill":"#8B1A2B","textAlign":"center","originX":"center","originY":"center","charSpacing":200},{"type":"textbox","text":"Together with their families","left":750,"top":440,"width":900,"fontSize":24,"fontFamily":"Cormorant Garamond","fill":"#5A4634","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"textbox","text":"Your Names","left":750,"top":720,"width":1300,"fontSize":110,"fontFamily":"Playfair Display","fill":"#8B1A2B","textAlign":"center","originX":"center","originY":"center","fontWeight":"bold","charSpacing":120},{"type":"textbox","text":"Request the honour of your presence at their wedding","left":750,"top":960,"width":1000,"fontSize":24,"fontFamily":"Cormorant Garamond","fill":"#5A4634","textAlign":"center","originX":"center","originY":"center"},{"type":"textbox","text":"Date","left":750,"top":1180,"width":1000,"fontSize":52,"fontFamily":"Playfair Display","fill":"#8B1A2B","textAlign":"center","originX":"center","originY":"center","charSpacing":300},{"type":"textbox","text":"Venue","left":750,"top":1360,"width":1000,"fontSize":30,"fontFamily":"Cormorant Garamond","fill":"#5A4634","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"circle","left":750,"top":1500,"radius":8,"fill":"#D4AF37","originX":"center","originY":"center"},{"type":"textbox","text":"Reception to follow","left":750,"top":1700,"width":1000,"fontSize":22,"fontFamily":"Cormorant Garamond","fill":"#5A4634","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"}]}'::jsonb,
 '["#8B1A2B","#D4AF37","#FDF8EF","#5A4634"]'::jsonb,
 '["Playfair Display","Cormorant Garamond","Noto Serif Devanagari"]'::jsonb,
 array['luxury','traditional','gold_foil','royal','rajasthani','devanagari','trending'],
 199, true, true, true,
 array['wedding_invite','engagement']),

('Mumbai Modern',
 'Editorial minimalist invitation with tall serif display and generous negative space.',
 'invitation', 'fusion', null, 1500, 2100,
 '{"version":"5.3.0","background":"#F8F6F1","objects":[{"type":"textbox","text":"WEDDING","left":750,"top":260,"width":1000,"fontSize":18,"fontFamily":"Inter","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","charSpacing":800,"fontWeight":"500"},{"type":"line","x1":600,"y1":340,"x2":900,"y2":340,"stroke":"#2C2C2C","strokeWidth":1},{"type":"textbox","text":"Your Names","left":750,"top":800,"width":1300,"fontSize":130,"fontFamily":"Playfair Display","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","fontWeight":"300","charSpacing":-20},{"type":"textbox","text":"are getting married","left":750,"top":1020,"width":1000,"fontSize":22,"fontFamily":"Inter","fill":"#5A5A5A","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"textbox","text":"Date","left":750,"top":1280,"width":900,"fontSize":28,"fontFamily":"Inter","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","charSpacing":400,"fontWeight":"500"},{"type":"textbox","text":"Venue","left":750,"top":1380,"width":900,"fontSize":22,"fontFamily":"Inter","fill":"#5A5A5A","textAlign":"center","originX":"center","originY":"center"},{"type":"line","x1":650,"y1":1600,"x2":850,"y2":1600,"stroke":"#B08968","strokeWidth":1.5},{"type":"textbox","text":"please join us","left":750,"top":1700,"width":900,"fontSize":18,"fontFamily":"Inter","fill":"#B08968","textAlign":"center","originX":"center","originY":"center","charSpacing":300}]}'::jsonb,
 '["#2C2C2C","#B08968","#F8F6F1","#5A5A5A"]'::jsonb,
 '["Playfair Display","Inter"]'::jsonb,
 array['minimalist','modern','editorial','typographic','trending'],
 149, true, false, true,
 array['wedding_invite','engagement']),

-- ═══ Save the Date (5×7, 1500×2100) ════════════════════════════════════════

('South Indian Silk',
 'Kanchipuram-silk inspired save-the-date with Tamil header and deep pomegranate banding.',
 'save_the_date', 'hindu_south', 'tamil', 1500, 2100,
 '{"version":"5.3.0","background":"#F5E8D0","objects":[{"type":"rect","left":0,"top":0,"width":1500,"height":200,"fill":"#8B0A1F"},{"type":"rect","left":0,"top":1900,"width":1500,"height":200,"fill":"#8B0A1F"},{"type":"textbox","text":"கல்யாண அழைப்பிதழ்","left":750,"top":100,"width":1400,"fontSize":42,"fontFamily":"Noto Serif Tamil","fill":"#FFD700","textAlign":"center","originX":"center","originY":"center"},{"type":"textbox","text":"Save the Date","left":750,"top":400,"width":1200,"fontSize":36,"fontFamily":"Cormorant Garamond","fill":"#8B0A1F","textAlign":"center","originX":"center","originY":"center","charSpacing":600,"fontStyle":"italic"},{"type":"textbox","text":"Your Names","left":750,"top":780,"width":1300,"fontSize":108,"fontFamily":"Cormorant Garamond","fill":"#8B0A1F","textAlign":"center","originX":"center","originY":"center","fontWeight":"bold"},{"type":"line","x1":500,"y1":950,"x2":1000,"y2":950,"stroke":"#FFD700","strokeWidth":1.5},{"type":"textbox","text":"Date","left":750,"top":1100,"width":1200,"fontSize":64,"fontFamily":"Cormorant Garamond","fill":"#8B0A1F","textAlign":"center","originX":"center","originY":"center","charSpacing":200,"fontWeight":"500"},{"type":"textbox","text":"Venue","left":750,"top":1300,"width":1200,"fontSize":30,"fontFamily":"Cormorant Garamond","fill":"#5A3A20","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"textbox","text":"Invitation to follow","left":750,"top":1600,"width":1200,"fontSize":22,"fontFamily":"Cormorant Garamond","fill":"#5A3A20","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic","charSpacing":300},{"type":"textbox","text":"காதல் • 2026","left":750,"top":1990,"width":1400,"fontSize":28,"fontFamily":"Noto Serif Tamil","fill":"#FFD700","textAlign":"center","originX":"center","originY":"center"}]}'::jsonb,
 '["#8B0A1F","#FFD700","#F5E8D0","#5A3A20"]'::jsonb,
 '["Cormorant Garamond","Noto Serif Tamil"]'::jsonb,
 array['traditional','south_indian','silk','tamil','trending','luxury'],
 149, true, false, true,
 array['save_the_date']),

('Script and Sage',
 'Romantic script-first save-the-date in soft sage and cream. Calligraphy hero, minimal supporting type.',
 'save_the_date', 'fusion', null, 1500, 2100,
 '{"version":"5.3.0","background":"#EBE5DA","objects":[{"type":"textbox","text":"SAVE THE DATE","left":750,"top":280,"width":1200,"fontSize":20,"fontFamily":"Inter","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","charSpacing":800,"fontWeight":"600"},{"type":"line","x1":550,"y1":380,"x2":950,"y2":380,"stroke":"#8B7355","strokeWidth":1},{"type":"textbox","text":"Your Names","left":750,"top":800,"width":1400,"fontSize":140,"fontFamily":"Great Vibes","fill":"#8B7355","textAlign":"center","originX":"center","originY":"center"},{"type":"textbox","text":"are tying the knot","left":750,"top":1040,"width":1000,"fontSize":26,"fontFamily":"Inter","fill":"#5A5A5A","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"textbox","text":"Date","left":750,"top":1300,"width":1000,"fontSize":48,"fontFamily":"Playfair Display","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","charSpacing":200},{"type":"textbox","text":"Venue","left":750,"top":1450,"width":1000,"fontSize":24,"fontFamily":"Inter","fill":"#5A5A5A","textAlign":"center","originX":"center","originY":"center"},{"type":"textbox","text":"Formal invitation to follow","left":750,"top":1750,"width":1000,"fontSize":18,"fontFamily":"Inter","fill":"#8B7355","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic","charSpacing":400}]}'::jsonb,
 '["#8B7355","#2C2C2C","#EBE5DA","#5A5A5A"]'::jsonb,
 '["Great Vibes","Playfair Display","Inter"]'::jsonb,
 array['romantic','script','minimalist','sage','modern'],
 0, false, false, true,
 array['save_the_date']),

-- ═══ Menu Card (4×9, 1200×2700) ════════════════════════════════════════════

('Mughal Feast',
 'Obsidian menu with Arabic bismillah header, gold rules, and course-by-course Playfair serif.',
 'menu', 'muslim', null, 1200, 2700,
 '{"version":"5.3.0","background":"#1A1412","objects":[{"type":"textbox","text":"بسم الله","left":600,"top":180,"width":1000,"fontSize":48,"fontFamily":"Noto Naskh Arabic","fill":"#D4AF37","textAlign":"center","originX":"center","originY":"center"},{"type":"textbox","text":"WEDDING FEAST","left":600,"top":320,"width":1000,"fontSize":22,"fontFamily":"Cinzel","fill":"#D4AF37","textAlign":"center","originX":"center","originY":"center","charSpacing":600},{"type":"textbox","text":"Your Names","left":600,"top":520,"width":1100,"fontSize":72,"fontFamily":"Playfair Display","fill":"#F5E6C3","textAlign":"center","originX":"center","originY":"center","fontWeight":"bold"},{"type":"textbox","text":"Date","left":600,"top":680,"width":1000,"fontSize":24,"fontFamily":"Cormorant Garamond","fill":"#D4AF37","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic","charSpacing":400},{"type":"line","x1":300,"y1":800,"x2":900,"y2":800,"stroke":"#D4AF37","strokeWidth":1},{"type":"textbox","text":"STARTERS","left":600,"top":900,"width":1000,"fontSize":26,"fontFamily":"Cinzel","fill":"#D4AF37","textAlign":"center","originX":"center","originY":"center","charSpacing":600},{"type":"textbox","text":"Shorba • Galouti Kebab • Hara Bhara Kebab","left":600,"top":990,"width":1100,"fontSize":22,"fontFamily":"Cormorant Garamond","fill":"#F5E6C3","textAlign":"center","originX":"center","originY":"center"},{"type":"textbox","text":"MAIN COURSE","left":600,"top":1240,"width":1000,"fontSize":26,"fontFamily":"Cinzel","fill":"#D4AF37","textAlign":"center","originX":"center","originY":"center","charSpacing":600},{"type":"textbox","text":"Hyderabadi Biryani • Nihari • Paneer Makhani • Dal Bukhara","left":600,"top":1340,"width":1100,"fontSize":20,"fontFamily":"Cormorant Garamond","fill":"#F5E6C3","textAlign":"center","originX":"center","originY":"center"},{"type":"textbox","text":"BREADS","left":600,"top":1600,"width":1000,"fontSize":26,"fontFamily":"Cinzel","fill":"#D4AF37","textAlign":"center","originX":"center","originY":"center","charSpacing":600},{"type":"textbox","text":"Sheermal • Taftan • Ulte Tawa Paratha","left":600,"top":1690,"width":1100,"fontSize":22,"fontFamily":"Cormorant Garamond","fill":"#F5E6C3","textAlign":"center","originX":"center","originY":"center"},{"type":"textbox","text":"DESSERTS","left":600,"top":1940,"width":1000,"fontSize":26,"fontFamily":"Cinzel","fill":"#D4AF37","textAlign":"center","originX":"center","originY":"center","charSpacing":600},{"type":"textbox","text":"Shahi Tukda • Phirni • Kulfi","left":600,"top":2030,"width":1100,"fontSize":22,"fontFamily":"Cormorant Garamond","fill":"#F5E6C3","textAlign":"center","originX":"center","originY":"center"},{"type":"line","x1":300,"y1":2300,"x2":900,"y2":2300,"stroke":"#D4AF37","strokeWidth":1},{"type":"textbox","text":"Venue","left":600,"top":2430,"width":1100,"fontSize":22,"fontFamily":"Cormorant Garamond","fill":"#D4AF37","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic","charSpacing":300}]}'::jsonb,
 '["#1A1412","#D4AF37","#F5E6C3"]'::jsonb,
 '["Playfair Display","Cinzel","Cormorant Garamond","Noto Naskh Arabic"]'::jsonb,
 array['luxury','mughal','muslim','dark','gold_foil','feast'],
 299, false, false, true,
 array['reception','menu']),

('Tasting Notes',
 'Pared-back course card. Eyebrow tags in copper, course names in italic Playfair — reads like a wine list.',
 'menu', 'fusion', null, 1200, 2700,
 '{"version":"5.3.0","background":"#FBF8F3","objects":[{"type":"textbox","text":"MENU","left":600,"top":200,"width":1000,"fontSize":28,"fontFamily":"Inter","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","charSpacing":800,"fontWeight":"600"},{"type":"line","x1":450,"y1":300,"x2":750,"y2":300,"stroke":"#2C2C2C","strokeWidth":1},{"type":"textbox","text":"Your Names","left":600,"top":440,"width":1100,"fontSize":60,"fontFamily":"Playfair Display","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","fontWeight":"300"},{"type":"textbox","text":"Date","left":600,"top":560,"width":1000,"fontSize":18,"fontFamily":"Inter","fill":"#8B8B8B","textAlign":"center","originX":"center","originY":"center","charSpacing":400},{"type":"textbox","text":"First Course","left":600,"top":800,"width":1000,"fontSize":18,"fontFamily":"Inter","fill":"#B08968","textAlign":"center","originX":"center","originY":"center","charSpacing":500,"fontWeight":"500"},{"type":"textbox","text":"Tomato Shorba","left":600,"top":860,"width":1000,"fontSize":32,"fontFamily":"Playfair Display","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"textbox","text":"Second Course","left":600,"top":1100,"width":1000,"fontSize":18,"fontFamily":"Inter","fill":"#B08968","textAlign":"center","originX":"center","originY":"center","charSpacing":500,"fontWeight":"500"},{"type":"textbox","text":"Paneer Tikka Masala","left":600,"top":1160,"width":1000,"fontSize":32,"fontFamily":"Playfair Display","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"textbox","text":"Main","left":600,"top":1400,"width":1000,"fontSize":18,"fontFamily":"Inter","fill":"#B08968","textAlign":"center","originX":"center","originY":"center","charSpacing":500,"fontWeight":"500"},{"type":"textbox","text":"Saffron Biryani","left":600,"top":1460,"width":1000,"fontSize":32,"fontFamily":"Playfair Display","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"textbox","text":"Dessert","left":600,"top":1700,"width":1000,"fontSize":18,"fontFamily":"Inter","fill":"#B08968","textAlign":"center","originX":"center","originY":"center","charSpacing":500,"fontWeight":"500"},{"type":"textbox","text":"Rose Kulfi","left":600,"top":1760,"width":1000,"fontSize":32,"fontFamily":"Playfair Display","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"line","x1":500,"y1":2500,"x2":700,"y2":2500,"stroke":"#B08968","strokeWidth":1},{"type":"textbox","text":"Venue","left":600,"top":2580,"width":1000,"fontSize":16,"fontFamily":"Inter","fill":"#8B8B8B","textAlign":"center","originX":"center","originY":"center","charSpacing":400}]}'::jsonb,
 '["#2C2C2C","#B08968","#FBF8F3","#8B8B8B"]'::jsonb,
 '["Playfair Display","Inter"]'::jsonb,
 array['minimalist','modern','editorial','menu','pared_back'],
 149, false, false, true,
 array['reception','menu']),

-- ═══ Welcome Sign (24×36 portrait proxy 1200×1800) ═════════════════════════

('Palace Swagatam',
 'Oxblood-and-gold welcome sign with devanagari swagatam, double border, and monumental display type.',
 'welcome_sign', 'hindu_north', 'rajasthani', 1200, 1800,
 '{"version":"5.3.0","background":"#2E1810","objects":[{"type":"rect","left":80,"top":80,"width":1040,"height":1640,"fill":"","stroke":"#D4AF37","strokeWidth":3},{"type":"rect","left":110,"top":110,"width":980,"height":1580,"fill":"","stroke":"#D4AF37","strokeWidth":1},{"type":"textbox","text":"स्वागतम्","left":600,"top":350,"width":1000,"fontSize":96,"fontFamily":"Noto Serif Devanagari","fill":"#D4AF37","textAlign":"center","originX":"center","originY":"center","charSpacing":200},{"type":"textbox","text":"WELCOME","left":600,"top":550,"width":1000,"fontSize":36,"fontFamily":"Cinzel","fill":"#F5E6C3","textAlign":"center","originX":"center","originY":"center","charSpacing":700},{"type":"line","x1":400,"y1":680,"x2":800,"y2":680,"stroke":"#D4AF37","strokeWidth":1.5},{"type":"textbox","text":"to the wedding of","left":600,"top":780,"width":1000,"fontSize":32,"fontFamily":"Cormorant Garamond","fill":"#F5E6C3","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"textbox","text":"Your Names","left":600,"top":1020,"width":1100,"fontSize":120,"fontFamily":"Playfair Display","fill":"#D4AF37","textAlign":"center","originX":"center","originY":"center","fontWeight":"bold"},{"type":"line","x1":400,"y1":1280,"x2":800,"y2":1280,"stroke":"#D4AF37","strokeWidth":1.5},{"type":"textbox","text":"Date","left":600,"top":1380,"width":1000,"fontSize":42,"fontFamily":"Playfair Display","fill":"#F5E6C3","textAlign":"center","originX":"center","originY":"center","charSpacing":300},{"type":"textbox","text":"Venue","left":600,"top":1500,"width":1000,"fontSize":28,"fontFamily":"Cormorant Garamond","fill":"#D4AF37","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"}]}'::jsonb,
 '["#2E1810","#D4AF37","#F5E6C3"]'::jsonb,
 '["Playfair Display","Cinzel","Cormorant Garamond","Noto Serif Devanagari"]'::jsonb,
 array['luxury','royal','palace','rajasthani','devanagari','trending','dark','welcome'],
 299, true, true, true,
 array['welcome','signage']),

('Bohemian Welcome',
 'Airy welcome sign with handwritten script hero on warm linen. Destination-wedding energy.',
 'welcome_sign', 'fusion', null, 1200, 1800,
 '{"version":"5.3.0","background":"#F2EDE4","objects":[{"type":"textbox","text":"welcome","left":600,"top":400,"width":1000,"fontSize":140,"fontFamily":"Great Vibes","fill":"#8B7355","textAlign":"center","originX":"center","originY":"center"},{"type":"line","x1":450,"y1":620,"x2":750,"y2":620,"stroke":"#8B7355","strokeWidth":1},{"type":"textbox","text":"to our wedding","left":600,"top":720,"width":1000,"fontSize":28,"fontFamily":"Inter","fill":"#5A5A5A","textAlign":"center","originX":"center","originY":"center","charSpacing":400,"fontStyle":"italic"},{"type":"textbox","text":"Your Names","left":600,"top":1000,"width":1100,"fontSize":88,"fontFamily":"Playfair Display","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","fontWeight":"300"},{"type":"circle","left":600,"top":1200,"radius":5,"fill":"#8B7355","originX":"center","originY":"center"},{"type":"textbox","text":"Date","left":600,"top":1320,"width":1000,"fontSize":28,"fontFamily":"Inter","fill":"#5A5A5A","textAlign":"center","originX":"center","originY":"center","charSpacing":300,"fontWeight":"500"},{"type":"textbox","text":"Venue","left":600,"top":1440,"width":1000,"fontSize":22,"fontFamily":"Inter","fill":"#8B8B8B","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"}]}'::jsonb,
 '["#8B7355","#2C2C2C","#F2EDE4","#5A5A5A"]'::jsonb,
 '["Great Vibes","Playfair Display","Inter"]'::jsonb,
 array['bohemian','romantic','script','destination','linen','welcome'],
 0, false, false, true,
 array['welcome','signage']),

-- ═══ Seating Chart (24×36 landscape proxy 1800×1200) ═══════════════════════

('Heritage Seating',
 'Bengali alpona-inspired seating chart in jasmine and pomegranate. Three-table grid with serif numerals.',
 'seating_chart', 'hindu_north', 'bengali', 1800, 1200,
 '{"version":"5.3.0","background":"#EFE3CD","objects":[{"type":"rect","left":60,"top":60,"width":1680,"height":1080,"fill":"","stroke":"#8B1A2B","strokeWidth":3},{"type":"textbox","text":"আসন বিন্যাস","left":900,"top":160,"width":1400,"fontSize":40,"fontFamily":"Noto Serif Bengali","fill":"#8B1A2B","textAlign":"center","originX":"center","originY":"center","charSpacing":150},{"type":"textbox","text":"SEATING CHART","left":900,"top":260,"width":1400,"fontSize":22,"fontFamily":"Cinzel","fill":"#8B1A2B","textAlign":"center","originX":"center","originY":"center","charSpacing":800},{"type":"textbox","text":"Your Names","left":900,"top":400,"width":1600,"fontSize":72,"fontFamily":"Playfair Display","fill":"#8B1A2B","textAlign":"center","originX":"center","originY":"center","fontWeight":"bold"},{"type":"line","x1":500,"y1":520,"x2":1300,"y2":520,"stroke":"#D4AF37","strokeWidth":1.5},{"type":"textbox","text":"Table 1","left":350,"top":700,"width":600,"fontSize":34,"fontFamily":"Playfair Display","fill":"#8B1A2B","textAlign":"center","originX":"center","originY":"center","fontWeight":"500","charSpacing":200},{"type":"textbox","text":"Guest Names","left":350,"top":800,"width":550,"fontSize":18,"fontFamily":"Cormorant Garamond","fill":"#5A3A20","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"textbox","text":"Table 2","left":900,"top":700,"width":600,"fontSize":34,"fontFamily":"Playfair Display","fill":"#8B1A2B","textAlign":"center","originX":"center","originY":"center","fontWeight":"500","charSpacing":200},{"type":"textbox","text":"Guest Names","left":900,"top":800,"width":550,"fontSize":18,"fontFamily":"Cormorant Garamond","fill":"#5A3A20","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"textbox","text":"Table 3","left":1450,"top":700,"width":600,"fontSize":34,"fontFamily":"Playfair Display","fill":"#8B1A2B","textAlign":"center","originX":"center","originY":"center","fontWeight":"500","charSpacing":200},{"type":"textbox","text":"Guest Names","left":1450,"top":800,"width":550,"fontSize":18,"fontFamily":"Cormorant Garamond","fill":"#5A3A20","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"textbox","text":"Venue","left":900,"top":1060,"width":1400,"fontSize":22,"fontFamily":"Cormorant Garamond","fill":"#5A3A20","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic","charSpacing":300}]}'::jsonb,
 '["#8B1A2B","#D4AF37","#EFE3CD","#5A3A20"]'::jsonb,
 '["Playfair Display","Cormorant Garamond","Cinzel","Noto Serif Bengali"]'::jsonb,
 array['luxury','bengali','traditional','alpona','heritage','seating'],
 299, false, false, true,
 array['reception','seating']),

('Modern Grid Seating',
 'Four-column minimal seating chart with copper italic numerals and Inter name lists.',
 'seating_chart', 'fusion', null, 1800, 1200,
 '{"version":"5.3.0","background":"#FAFAF7","objects":[{"type":"textbox","text":"FIND YOUR SEAT","left":900,"top":120,"width":1600,"fontSize":22,"fontFamily":"Inter","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","charSpacing":800,"fontWeight":"600"},{"type":"line","x1":700,"y1":200,"x2":1100,"y2":200,"stroke":"#2C2C2C","strokeWidth":1},{"type":"textbox","text":"Your Names","left":900,"top":320,"width":1600,"fontSize":88,"fontFamily":"Playfair Display","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","fontWeight":"300"},{"type":"textbox","text":"01","left":280,"top":620,"width":400,"fontSize":54,"fontFamily":"Playfair Display","fill":"#B08968","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"textbox","text":"Guest Names","left":280,"top":740,"width":400,"fontSize":16,"fontFamily":"Inter","fill":"#5A5A5A","textAlign":"center","originX":"center","originY":"center"},{"type":"textbox","text":"02","left":680,"top":620,"width":400,"fontSize":54,"fontFamily":"Playfair Display","fill":"#B08968","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"textbox","text":"Guest Names","left":680,"top":740,"width":400,"fontSize":16,"fontFamily":"Inter","fill":"#5A5A5A","textAlign":"center","originX":"center","originY":"center"},{"type":"textbox","text":"03","left":1080,"top":620,"width":400,"fontSize":54,"fontFamily":"Playfair Display","fill":"#B08968","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"textbox","text":"Guest Names","left":1080,"top":740,"width":400,"fontSize":16,"fontFamily":"Inter","fill":"#5A5A5A","textAlign":"center","originX":"center","originY":"center"},{"type":"textbox","text":"04","left":1480,"top":620,"width":400,"fontSize":54,"fontFamily":"Playfair Display","fill":"#B08968","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"textbox","text":"Guest Names","left":1480,"top":740,"width":400,"fontSize":16,"fontFamily":"Inter","fill":"#5A5A5A","textAlign":"center","originX":"center","originY":"center"},{"type":"textbox","text":"Venue","left":900,"top":1060,"width":1400,"fontSize":16,"fontFamily":"Inter","fill":"#8B8B8B","textAlign":"center","originX":"center","originY":"center","charSpacing":500}]}'::jsonb,
 '["#2C2C2C","#B08968","#FAFAF7","#5A5A5A"]'::jsonb,
 '["Playfair Display","Inter"]'::jsonb,
 array['minimalist','modern','grid','editorial','seating'],
 0, false, false, true,
 array['reception','seating']),

-- ═══ Ceremony Program (5×7, 1500×2100) ═════════════════════════════════════

('Anand Karaj',
 'Sikh Anand Karaj program with Ik Onkar header, saffron-and-royal-blue palette, full ritual list.',
 'ceremony_program', 'sikh', 'punjabi', 1500, 2100,
 '{"version":"5.3.0","background":"#F5E8D0","objects":[{"type":"rect","left":60,"top":60,"width":1380,"height":1980,"fill":"","stroke":"#FF6B35","strokeWidth":3},{"type":"textbox","text":"ੴ","left":750,"top":260,"width":500,"fontSize":96,"fontFamily":"Noto Sans Gurmukhi","fill":"#FF6B35","textAlign":"center","originX":"center","originY":"center"},{"type":"textbox","text":"ANAND KARAJ","left":750,"top":440,"width":1200,"fontSize":32,"fontFamily":"Cinzel","fill":"#2A3A8B","textAlign":"center","originX":"center","originY":"center","charSpacing":700,"fontWeight":"bold"},{"type":"textbox","text":"Your Names","left":750,"top":660,"width":1300,"fontSize":88,"fontFamily":"Playfair Display","fill":"#2A3A8B","textAlign":"center","originX":"center","originY":"center","fontWeight":"bold"},{"type":"line","x1":500,"y1":820,"x2":1000,"y2":820,"stroke":"#FF6B35","strokeWidth":1.5},{"type":"textbox","text":"ORDER OF CEREMONY","left":750,"top":940,"width":1200,"fontSize":20,"fontFamily":"Cinzel","fill":"#2A3A8B","textAlign":"center","originX":"center","originY":"center","charSpacing":600,"fontWeight":"500"},{"type":"textbox","text":"Ardaas","left":750,"top":1060,"width":1200,"fontSize":32,"fontFamily":"Playfair Display","fill":"#2A3A8B","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"textbox","text":"Kirtan","left":750,"top":1170,"width":1200,"fontSize":32,"fontFamily":"Playfair Display","fill":"#2A3A8B","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"textbox","text":"Laavan","left":750,"top":1280,"width":1200,"fontSize":32,"fontFamily":"Playfair Display","fill":"#2A3A8B","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"textbox","text":"Hukamnama","left":750,"top":1390,"width":1200,"fontSize":32,"fontFamily":"Playfair Display","fill":"#2A3A8B","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"textbox","text":"Karah Parshad","left":750,"top":1500,"width":1200,"fontSize":32,"fontFamily":"Playfair Display","fill":"#2A3A8B","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"textbox","text":"Langar","left":750,"top":1610,"width":1200,"fontSize":32,"fontFamily":"Playfair Display","fill":"#2A3A8B","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"line","x1":500,"y1":1760,"x2":1000,"y2":1760,"stroke":"#FF6B35","strokeWidth":1.5},{"type":"textbox","text":"Date • Venue","left":750,"top":1880,"width":1200,"fontSize":22,"fontFamily":"Cormorant Garamond","fill":"#5A3A20","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic","charSpacing":300}]}'::jsonb,
 '["#2A3A8B","#FF6B35","#F5E8D0","#5A3A20"]'::jsonb,
 '["Playfair Display","Cinzel","Cormorant Garamond","Noto Sans Gurmukhi"]'::jsonb,
 array['sikh','punjabi','traditional','religious','anand_karaj','trending'],
 199, true, false, true,
 array['ceremony']),

('Order of Service',
 'Pared-back Christian / interfaith order of service. All-Playfair italic ritual stack on bright white.',
 'ceremony_program', 'christian', null, 1500, 2100,
 '{"version":"5.3.0","background":"#FFFFFF","objects":[{"type":"textbox","text":"ORDER OF SERVICE","left":750,"top":220,"width":1200,"fontSize":20,"fontFamily":"Inter","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","charSpacing":800,"fontWeight":"500"},{"type":"line","x1":650,"y1":310,"x2":850,"y2":310,"stroke":"#2C2C2C","strokeWidth":1},{"type":"textbox","text":"Your Names","left":750,"top":550,"width":1300,"fontSize":96,"fontFamily":"Playfair Display","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","fontWeight":"300"},{"type":"textbox","text":"Date","left":750,"top":760,"width":1000,"fontSize":20,"fontFamily":"Inter","fill":"#8B8B8B","textAlign":"center","originX":"center","originY":"center","charSpacing":500},{"type":"textbox","text":"Processional","left":750,"top":1000,"width":1200,"fontSize":38,"fontFamily":"Playfair Display","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"textbox","text":"Welcome and Prayer","left":750,"top":1130,"width":1200,"fontSize":38,"fontFamily":"Playfair Display","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"textbox","text":"Readings","left":750,"top":1260,"width":1200,"fontSize":38,"fontFamily":"Playfair Display","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"textbox","text":"Vows","left":750,"top":1390,"width":1200,"fontSize":38,"fontFamily":"Playfair Display","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"textbox","text":"Ring Exchange","left":750,"top":1520,"width":1200,"fontSize":38,"fontFamily":"Playfair Display","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"textbox","text":"Pronouncement","left":750,"top":1650,"width":1200,"fontSize":38,"fontFamily":"Playfair Display","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"textbox","text":"Recessional","left":750,"top":1780,"width":1200,"fontSize":38,"fontFamily":"Playfair Display","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"line","x1":650,"y1":1950,"x2":850,"y2":1950,"stroke":"#B08968","strokeWidth":1}]}'::jsonb,
 '["#2C2C2C","#B08968","#FFFFFF","#8B8B8B"]'::jsonb,
 '["Playfair Display","Inter"]'::jsonb,
 array['christian','minimalist','modern','interfaith','order_of_service'],
 149, false, false, true,
 array['ceremony']),

-- ═══ Thank You Card (A6, 1240×1748) ════════════════════════════════════════

('Dhanyavaad Card',
 'Marigold-ivory thank-you with devanagari dhanyavaad, double border, and heartfelt italic sign-off.',
 'thank_you', 'hindu_north', null, 1240, 1748,
 '{"version":"5.3.0","background":"#F5E6C3","objects":[{"type":"rect","left":50,"top":50,"width":1140,"height":1648,"fill":"","stroke":"#8B1A2B","strokeWidth":2.5},{"type":"textbox","text":"धन्यवाद","left":620,"top":300,"width":1000,"fontSize":108,"fontFamily":"Noto Serif Devanagari","fill":"#8B1A2B","textAlign":"center","originX":"center","originY":"center","charSpacing":150},{"type":"textbox","text":"THANK YOU","left":620,"top":500,"width":1000,"fontSize":32,"fontFamily":"Cinzel","fill":"#D4AF37","textAlign":"center","originX":"center","originY":"center","charSpacing":800},{"type":"line","x1":400,"y1":620,"x2":840,"y2":620,"stroke":"#D4AF37","strokeWidth":1.5},{"type":"textbox","text":"for being a part of our celebration","left":620,"top":760,"width":1000,"fontSize":28,"fontFamily":"Cormorant Garamond","fill":"#5A3A20","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"textbox","text":"Your Names","left":620,"top":1050,"width":1100,"fontSize":80,"fontFamily":"Playfair Display","fill":"#8B1A2B","textAlign":"center","originX":"center","originY":"center","fontWeight":"bold"},{"type":"line","x1":400,"y1":1200,"x2":840,"y2":1200,"stroke":"#D4AF37","strokeWidth":1.5},{"type":"textbox","text":"with love and gratitude","left":620,"top":1400,"width":1000,"fontSize":22,"fontFamily":"Cormorant Garamond","fill":"#5A3A20","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic","charSpacing":300}]}'::jsonb,
 '["#8B1A2B","#D4AF37","#F5E6C3","#5A3A20"]'::jsonb,
 '["Playfair Display","Cormorant Garamond","Cinzel","Noto Serif Devanagari"]'::jsonb,
 array['traditional','gold_foil','devanagari','post_wedding','heartfelt'],
 149, false, false, true,
 array['post_wedding','thank_you']),

('Simple Gratitude',
 'Oversized script thank-you on sage linen. Two objects, one moment — for couples who say less.',
 'thank_you', 'fusion', null, 1240, 1748,
 '{"version":"5.3.0","background":"#EBE5DA","objects":[{"type":"textbox","text":"thank you","left":620,"top":600,"width":1100,"fontSize":160,"fontFamily":"Great Vibes","fill":"#8B7355","textAlign":"center","originX":"center","originY":"center"},{"type":"line","x1":470,"y1":860,"x2":770,"y2":860,"stroke":"#8B7355","strokeWidth":1},{"type":"textbox","text":"for celebrating with us","left":620,"top":960,"width":1000,"fontSize":26,"fontFamily":"Inter","fill":"#5A5A5A","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic","charSpacing":300},{"type":"textbox","text":"Your Names","left":620,"top":1250,"width":1100,"fontSize":48,"fontFamily":"Playfair Display","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","fontWeight":"300","charSpacing":100}]}'::jsonb,
 '["#8B7355","#2C2C2C","#EBE5DA","#5A5A5A"]'::jsonb,
 '["Great Vibes","Playfair Display","Inter"]'::jsonb,
 array['minimalist','script','romantic','trending','post_wedding'],
 0, true, true, true,
 array['post_wedding','thank_you']),

-- ═══ Table Numbers (4×6, 1200×1800) ════════════════════════════════════════

('Ornate Table Numbers',
 'Heritage-framed table number card with oversized serif numeral and gold inner border.',
 'table_number', 'hindu_north', null, 1200, 1800,
 '{"version":"5.3.0","background":"#FDF8EF","objects":[{"type":"rect","left":50,"top":50,"width":1100,"height":1700,"fill":"","stroke":"#8B1A2B","strokeWidth":3},{"type":"rect","left":80,"top":80,"width":1040,"height":1640,"fill":"","stroke":"#D4AF37","strokeWidth":1},{"type":"textbox","text":"TABLE","left":600,"top":400,"width":1000,"fontSize":38,"fontFamily":"Cinzel","fill":"#8B1A2B","textAlign":"center","originX":"center","originY":"center","charSpacing":800,"fontWeight":"500"},{"type":"textbox","text":"1","left":600,"top":900,"width":1000,"fontSize":480,"fontFamily":"Playfair Display","fill":"#8B1A2B","textAlign":"center","originX":"center","originY":"center","fontWeight":"bold"},{"type":"line","x1":400,"y1":1350,"x2":800,"y2":1350,"stroke":"#D4AF37","strokeWidth":1.5},{"type":"textbox","text":"Your Names","left":600,"top":1500,"width":1000,"fontSize":32,"fontFamily":"Cormorant Garamond","fill":"#8B1A2B","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic","charSpacing":200}]}'::jsonb,
 '["#8B1A2B","#D4AF37","#FDF8EF"]'::jsonb,
 '["Playfair Display","Cormorant Garamond","Cinzel"]'::jsonb,
 array['traditional','luxury','gold_foil','heritage','table_number'],
 299, false, false, true,
 array['reception','signage']),

('Deco Table Numbers',
 'Onyx Art Deco table card with gold rule and double-zero prefixed numeral.',
 'table_number', 'fusion', null, 1200, 1800,
 '{"version":"5.3.0","background":"#2C2C2C","objects":[{"type":"rect","left":60,"top":60,"width":1080,"height":1680,"fill":"","stroke":"#D4AF37","strokeWidth":1.5},{"type":"textbox","text":"TABLE","left":600,"top":340,"width":1000,"fontSize":22,"fontFamily":"Inter","fill":"#D4AF37","textAlign":"center","originX":"center","originY":"center","charSpacing":1000,"fontWeight":"500"},{"type":"line","x1":500,"y1":440,"x2":700,"y2":440,"stroke":"#D4AF37","strokeWidth":1},{"type":"textbox","text":"01","left":600,"top":900,"width":1000,"fontSize":380,"fontFamily":"Playfair Display","fill":"#F5E6C3","textAlign":"center","originX":"center","originY":"center","fontWeight":"300"},{"type":"line","x1":500,"y1":1360,"x2":700,"y2":1360,"stroke":"#D4AF37","strokeWidth":1},{"type":"textbox","text":"Your Names","left":600,"top":1480,"width":1000,"fontSize":20,"fontFamily":"Inter","fill":"#D4AF37","textAlign":"center","originX":"center","originY":"center","charSpacing":600}]}'::jsonb,
 '["#2C2C2C","#D4AF37","#F5E6C3"]'::jsonb,
 '["Playfair Display","Inter"]'::jsonb,
 array['art_deco','modern','dark','gold_foil','minimalist','table_number'],
 0, false, false, true,
 array['reception','signage']),

-- ═══ Instagram Story (1080×1920) ═══════════════════════════════════════════

('Ethnic Gujarati Story',
 'Marigold-orange save-the-date story with Gujarati header, thick gold frame, and serif couple type.',
 'ig_story', 'hindu_north', 'gujarati', 1080, 1920,
 '{"version":"5.3.0","background":"#FF6B35","objects":[{"type":"rect","left":60,"top":60,"width":960,"height":1800,"fill":"","stroke":"#FFD700","strokeWidth":4},{"type":"textbox","text":"શુભ લગ્ન","left":540,"top":300,"width":900,"fontSize":72,"fontFamily":"Noto Serif Gujarati","fill":"#FFD700","textAlign":"center","originX":"center","originY":"center","charSpacing":150},{"type":"textbox","text":"SAVE THE DATE","left":540,"top":500,"width":900,"fontSize":24,"fontFamily":"Cinzel","fill":"#FFFFFF","textAlign":"center","originX":"center","originY":"center","charSpacing":700,"fontWeight":"600"},{"type":"line","x1":340,"y1":620,"x2":740,"y2":620,"stroke":"#FFD700","strokeWidth":1.5},{"type":"textbox","text":"Your Names","left":540,"top":900,"width":1000,"fontSize":100,"fontFamily":"Playfair Display","fill":"#FFFFFF","textAlign":"center","originX":"center","originY":"center","fontWeight":"bold"},{"type":"line","x1":340,"y1":1200,"x2":740,"y2":1200,"stroke":"#FFD700","strokeWidth":1.5},{"type":"textbox","text":"Date","left":540,"top":1360,"width":900,"fontSize":54,"fontFamily":"Playfair Display","fill":"#FFD700","textAlign":"center","originX":"center","originY":"center","charSpacing":300,"fontWeight":"500"},{"type":"textbox","text":"Venue","left":540,"top":1500,"width":900,"fontSize":30,"fontFamily":"Cormorant Garamond","fill":"#FFFFFF","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"textbox","text":"save our date","left":540,"top":1750,"width":900,"fontSize":20,"fontFamily":"Cinzel","fill":"#FFD700","textAlign":"center","originX":"center","originY":"center","charSpacing":600}]}'::jsonb,
 '["#FF6B35","#FFD700","#FFFFFF"]'::jsonb,
 '["Playfair Display","Cinzel","Cormorant Garamond","Noto Serif Gujarati"]'::jsonb,
 array['vibrant','gujarati','traditional','marigold','social','story'],
 149, false, false, true,
 array['digital','social']),

('Minimal Story',
 'Editorial save-the-date story in bone and ink. Oversized italic hero, copper rule.',
 'ig_story', 'fusion', null, 1080, 1920,
 '{"version":"5.3.0","background":"#F8F6F1","objects":[{"type":"textbox","text":"SAVE THE DATE","left":540,"top":360,"width":900,"fontSize":22,"fontFamily":"Inter","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","charSpacing":800,"fontWeight":"600"},{"type":"line","x1":420,"y1":460,"x2":660,"y2":460,"stroke":"#2C2C2C","strokeWidth":1},{"type":"textbox","text":"Your Names","left":540,"top":900,"width":1000,"fontSize":120,"fontFamily":"Playfair Display","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","fontWeight":"300","charSpacing":-20},{"type":"textbox","text":"are getting married","left":540,"top":1160,"width":900,"fontSize":28,"fontFamily":"Inter","fill":"#8B8B8B","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"line","x1":440,"y1":1320,"x2":640,"y2":1320,"stroke":"#B08968","strokeWidth":1},{"type":"textbox","text":"Date","left":540,"top":1450,"width":900,"fontSize":30,"fontFamily":"Inter","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","charSpacing":400,"fontWeight":"500"},{"type":"textbox","text":"Venue","left":540,"top":1570,"width":900,"fontSize":22,"fontFamily":"Inter","fill":"#8B8B8B","textAlign":"center","originX":"center","originY":"center"},{"type":"textbox","text":"formal invitation to follow","left":540,"top":1770,"width":900,"fontSize":16,"fontFamily":"Inter","fill":"#B08968","textAlign":"center","originX":"center","originY":"center","charSpacing":400,"fontStyle":"italic"}]}'::jsonb,
 '["#2C2C2C","#B08968","#F8F6F1","#8B8B8B"]'::jsonb,
 '["Playfair Display","Inter"]'::jsonb,
 array['minimalist','modern','editorial','trending','story','social'],
 0, true, false, true,
 array['digital','social']),

-- ═══ Instagram Post (1080×1080) ════════════════════════════════════════════

('Desi Square Announcement',
 'Oxblood announcement square with devanagari header, gold frame, and vanilla ivory serif type.',
 'ig_post', 'hindu_north', null, 1080, 1080,
 '{"version":"5.3.0","background":"#8B1A2B","objects":[{"type":"rect","left":40,"top":40,"width":1000,"height":1000,"fill":"","stroke":"#D4AF37","strokeWidth":2.5},{"type":"textbox","text":"शुभ विवाह","left":540,"top":200,"width":900,"fontSize":48,"fontFamily":"Noto Serif Devanagari","fill":"#D4AF37","textAlign":"center","originX":"center","originY":"center","charSpacing":150},{"type":"textbox","text":"Your Names","left":540,"top":500,"width":980,"fontSize":84,"fontFamily":"Playfair Display","fill":"#F5E6C3","textAlign":"center","originX":"center","originY":"center","fontWeight":"bold"},{"type":"line","x1":340,"y1":660,"x2":740,"y2":660,"stroke":"#D4AF37","strokeWidth":1.5},{"type":"textbox","text":"Date","left":540,"top":780,"width":900,"fontSize":36,"fontFamily":"Cormorant Garamond","fill":"#D4AF37","textAlign":"center","originX":"center","originY":"center","charSpacing":300,"fontWeight":"500"},{"type":"textbox","text":"Venue","left":540,"top":880,"width":900,"fontSize":22,"fontFamily":"Cormorant Garamond","fill":"#F5E6C3","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"}]}'::jsonb,
 '["#8B1A2B","#D4AF37","#F5E6C3"]'::jsonb,
 '["Playfair Display","Cormorant Garamond","Noto Serif Devanagari"]'::jsonb,
 array['traditional','luxury','devanagari','social','announcement','dark'],
 199, false, false, true,
 array['digital','social']),

('Modern Square Announcement',
 'Bone-paper announcement square with long-tracked Inter eyebrow and Playfair hero.',
 'ig_post', 'fusion', null, 1080, 1080,
 '{"version":"5.3.0","background":"#FAFAF7","objects":[{"type":"textbox","text":"WE ARE GETTING MARRIED","left":540,"top":200,"width":900,"fontSize":20,"fontFamily":"Inter","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","charSpacing":600,"fontWeight":"500"},{"type":"line","x1":440,"y1":280,"x2":640,"y2":280,"stroke":"#2C2C2C","strokeWidth":1},{"type":"textbox","text":"Your Names","left":540,"top":500,"width":1000,"fontSize":88,"fontFamily":"Playfair Display","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","fontWeight":"300"},{"type":"circle","left":540,"top":660,"radius":4,"fill":"#B08968","originX":"center","originY":"center"},{"type":"textbox","text":"Date","left":540,"top":780,"width":900,"fontSize":24,"fontFamily":"Inter","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","charSpacing":400,"fontWeight":"500"},{"type":"textbox","text":"Venue","left":540,"top":870,"width":900,"fontSize":18,"fontFamily":"Inter","fill":"#8B8B8B","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"}]}'::jsonb,
 '["#2C2C2C","#B08968","#FAFAF7","#8B8B8B"]'::jsonb,
 '["Playfair Display","Inter"]'::jsonb,
 array['minimalist','modern','editorial','trending','social','announcement'],
 0, true, true, true,
 array['digital','social']),

-- ═══ WhatsApp Invite (800×800) ═════════════════════════════════════════════

('Malayali Mangalam',
 'Kerala-style WhatsApp invite with Malayalam mangalam header, double border, and serif couple type.',
 'whatsapp_invite', 'hindu_south', 'malayali', 800, 800,
 '{"version":"5.3.0","background":"#FFF8E7","objects":[{"type":"rect","left":30,"top":30,"width":740,"height":740,"fill":"","stroke":"#8B0A1F","strokeWidth":3},{"type":"rect","left":55,"top":55,"width":690,"height":690,"fill":"","stroke":"#D4AF37","strokeWidth":1},{"type":"textbox","text":"മംഗളം","left":400,"top":180,"width":700,"fontSize":48,"fontFamily":"Noto Serif Malayalam","fill":"#8B0A1F","textAlign":"center","originX":"center","originY":"center","charSpacing":200},{"type":"textbox","text":"WEDDING INVITATION","left":400,"top":260,"width":700,"fontSize":16,"fontFamily":"Cinzel","fill":"#D4AF37","textAlign":"center","originX":"center","originY":"center","charSpacing":700,"fontWeight":"600"},{"type":"textbox","text":"Your Names","left":400,"top":400,"width":720,"fontSize":60,"fontFamily":"Playfair Display","fill":"#8B0A1F","textAlign":"center","originX":"center","originY":"center","fontWeight":"bold"},{"type":"line","x1":250,"y1":500,"x2":550,"y2":500,"stroke":"#D4AF37","strokeWidth":1.5},{"type":"textbox","text":"Date","left":400,"top":580,"width":700,"fontSize":30,"fontFamily":"Cormorant Garamond","fill":"#8B0A1F","textAlign":"center","originX":"center","originY":"center","charSpacing":300,"fontWeight":"500"},{"type":"textbox","text":"Venue","left":400,"top":660,"width":700,"fontSize":20,"fontFamily":"Cormorant Garamond","fill":"#5A3A20","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"}]}'::jsonb,
 '["#8B0A1F","#D4AF37","#FFF8E7","#5A3A20"]'::jsonb,
 '["Playfair Display","Cormorant Garamond","Cinzel","Noto Serif Malayalam"]'::jsonb,
 array['traditional','south_indian','malayali','whatsapp','luxury'],
 149, false, false, true,
 array['digital','whatsapp']),

('Noor Nikah Invite',
 'Midnight-navy Nikah card with Arabic bismillah header and restrained gold rules. WhatsApp-ready.',
 'whatsapp_invite', 'muslim', null, 800, 800,
 '{"version":"5.3.0","background":"#0E2A3F","objects":[{"type":"textbox","text":"بسم الله","left":400,"top":160,"width":700,"fontSize":48,"fontFamily":"Noto Naskh Arabic","fill":"#D4AF37","textAlign":"center","originX":"center","originY":"center"},{"type":"textbox","text":"NIKAH","left":400,"top":260,"width":700,"fontSize":24,"fontFamily":"Cinzel","fill":"#D4AF37","textAlign":"center","originX":"center","originY":"center","charSpacing":900,"fontWeight":"500"},{"type":"line","x1":250,"y1":330,"x2":550,"y2":330,"stroke":"#D4AF37","strokeWidth":1},{"type":"textbox","text":"Your Names","left":400,"top":440,"width":720,"fontSize":60,"fontFamily":"Playfair Display","fill":"#F5E6C3","textAlign":"center","originX":"center","originY":"center","fontWeight":"300"},{"type":"line","x1":250,"y1":560,"x2":550,"y2":560,"stroke":"#D4AF37","strokeWidth":1},{"type":"textbox","text":"Date","left":400,"top":630,"width":700,"fontSize":22,"fontFamily":"Inter","fill":"#D4AF37","textAlign":"center","originX":"center","originY":"center","charSpacing":400,"fontWeight":"500"},{"type":"textbox","text":"Venue","left":400,"top":700,"width":700,"fontSize":18,"fontFamily":"Inter","fill":"#F5E6C3","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"}]}'::jsonb,
 '["#0E2A3F","#D4AF37","#F5E6C3"]'::jsonb,
 '["Playfair Display","Cinzel","Inter","Noto Naskh Arabic"]'::jsonb,
 array['muslim','nikah','minimalist','dark','gold_foil','whatsapp'],
 149, false, false, true,
 array['digital','whatsapp']),

-- ═══ RSVP Card (A6, 1240×1748) ═════════════════════════════════════════════

('Ornate RSVP',
 'Heritage RSVP with devanagari header, double border, accept/decline check boxes, and guest-count rule.',
 'rsvp_card', 'hindu_north', null, 1240, 1748,
 '{"version":"5.3.0","background":"#FDF8EF","objects":[{"type":"rect","left":50,"top":50,"width":1140,"height":1648,"fill":"","stroke":"#8B1A2B","strokeWidth":2.5},{"type":"rect","left":75,"top":75,"width":1090,"height":1598,"fill":"","stroke":"#D4AF37","strokeWidth":1},{"type":"textbox","text":"आपका उत्तर","left":620,"top":220,"width":1000,"fontSize":42,"fontFamily":"Noto Serif Devanagari","fill":"#8B1A2B","textAlign":"center","originX":"center","originY":"center","charSpacing":200},{"type":"textbox","text":"R.S.V.P.","left":620,"top":360,"width":1000,"fontSize":44,"fontFamily":"Cinzel","fill":"#D4AF37","textAlign":"center","originX":"center","originY":"center","charSpacing":800,"fontWeight":"bold"},{"type":"line","x1":400,"y1":460,"x2":840,"y2":460,"stroke":"#D4AF37","strokeWidth":1.5},{"type":"textbox","text":"Kindly respond by Date","left":620,"top":580,"width":1000,"fontSize":26,"fontFamily":"Cormorant Garamond","fill":"#5A3A20","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic"},{"type":"textbox","text":"Name","left":620,"top":800,"width":800,"fontSize":22,"fontFamily":"Cormorant Garamond","fill":"#8B1A2B","textAlign":"center","originX":"center","originY":"center","charSpacing":400,"fontWeight":"500"},{"type":"line","x1":260,"y1":850,"x2":980,"y2":850,"stroke":"#5A3A20","strokeWidth":1},{"type":"rect","left":380,"top":990,"width":40,"height":20,"fill":"","stroke":"#8B1A2B","strokeWidth":1.5},{"type":"textbox","text":"Joyfully Accepts","left":440,"top":1000,"width":500,"fontSize":22,"fontFamily":"Cormorant Garamond","fill":"#8B1A2B","textAlign":"left","originX":"left","originY":"center","fontStyle":"italic"},{"type":"rect","left":380,"top":1070,"width":40,"height":20,"fill":"","stroke":"#8B1A2B","strokeWidth":1.5},{"type":"textbox","text":"Regretfully Declines","left":440,"top":1080,"width":500,"fontSize":22,"fontFamily":"Cormorant Garamond","fill":"#8B1A2B","textAlign":"left","originX":"left","originY":"center","fontStyle":"italic"},{"type":"textbox","text":"Number of Guests","left":620,"top":1240,"width":800,"fontSize":22,"fontFamily":"Cormorant Garamond","fill":"#8B1A2B","textAlign":"center","originX":"center","originY":"center","charSpacing":300,"fontWeight":"500"},{"type":"line","x1":440,"y1":1290,"x2":800,"y2":1290,"stroke":"#5A3A20","strokeWidth":1},{"type":"textbox","text":"Your Names • Date","left":620,"top":1580,"width":1000,"fontSize":18,"fontFamily":"Cormorant Garamond","fill":"#8B1A2B","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic","charSpacing":300}]}'::jsonb,
 '["#8B1A2B","#D4AF37","#FDF8EF","#5A3A20"]'::jsonb,
 '["Cormorant Garamond","Cinzel","Noto Serif Devanagari"]'::jsonb,
 array['traditional','devanagari','gold_foil','rsvp','heritage'],
 199, false, true, true,
 array['wedding_invite','rsvp']),

('Modern RSVP',
 'Bright-white RSVP with lowercase check-boxes, tracked Inter labels, and a guest-count underline.',
 'rsvp_card', 'fusion', null, 1240, 1748,
 '{"version":"5.3.0","background":"#FFFFFF","objects":[{"type":"textbox","text":"RSVP","left":620,"top":220,"width":1000,"fontSize":56,"fontFamily":"Playfair Display","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","fontWeight":"300","charSpacing":600},{"type":"line","x1":540,"y1":310,"x2":700,"y2":310,"stroke":"#2C2C2C","strokeWidth":1},{"type":"textbox","text":"please respond by Date","left":620,"top":400,"width":1000,"fontSize":18,"fontFamily":"Inter","fill":"#8B8B8B","textAlign":"center","originX":"center","originY":"center","fontStyle":"italic","charSpacing":400},{"type":"textbox","text":"NAME","left":620,"top":620,"width":800,"fontSize":16,"fontFamily":"Inter","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","charSpacing":500,"fontWeight":"500"},{"type":"line","x1":260,"y1":680,"x2":980,"y2":680,"stroke":"#2C2C2C","strokeWidth":1},{"type":"rect","left":380,"top":820,"width":30,"height":30,"fill":"","stroke":"#2C2C2C","strokeWidth":1.5},{"type":"textbox","text":"attending","left":440,"top":835,"width":500,"fontSize":22,"fontFamily":"Inter","fill":"#2C2C2C","textAlign":"left","originX":"left","originY":"center"},{"type":"rect","left":380,"top":890,"width":30,"height":30,"fill":"","stroke":"#2C2C2C","strokeWidth":1.5},{"type":"textbox","text":"not attending","left":440,"top":905,"width":500,"fontSize":22,"fontFamily":"Inter","fill":"#2C2C2C","textAlign":"left","originX":"left","originY":"center"},{"type":"textbox","text":"GUESTS","left":620,"top":1080,"width":800,"fontSize":16,"fontFamily":"Inter","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","charSpacing":500,"fontWeight":"500"},{"type":"line","x1":460,"y1":1140,"x2":780,"y2":1140,"stroke":"#2C2C2C","strokeWidth":1},{"type":"textbox","text":"MEAL PREFERENCE","left":620,"top":1290,"width":800,"fontSize":16,"fontFamily":"Inter","fill":"#2C2C2C","textAlign":"center","originX":"center","originY":"center","charSpacing":500,"fontWeight":"500"},{"type":"line","x1":300,"y1":1350,"x2":940,"y2":1350,"stroke":"#2C2C2C","strokeWidth":1},{"type":"textbox","text":"Your Names • Date","left":620,"top":1620,"width":1000,"fontSize":14,"fontFamily":"Inter","fill":"#8B8B8B","textAlign":"center","originX":"center","originY":"center","charSpacing":500}]}'::jsonb,
 '["#2C2C2C","#FFFFFF","#8B8B8B"]'::jsonb,
 '["Playfair Display","Inter"]'::jsonb,
 array['minimalist','modern','rsvp','editorial','clean'],
 0, false, false, true,
 array['wedding_invite','rsvp']);
