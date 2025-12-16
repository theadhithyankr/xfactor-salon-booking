-- ============================================
-- XFactor Salon Booking - Complete Database Seed
-- ============================================
-- Run this in your Supabase SQL Editor
-- This will populate your database with sample data

-- ============================================
-- 1. SEED SALONS
-- ============================================
INSERT INTO salons (name, address, city, state, zip_code, phone, description, opening_time, closing_time, is_active) VALUES
('XFactor Downtown', '123 Main Street', 'New York', 'NY', '10001', '(555) 123-4567', 'Our flagship location in the heart of downtown. Modern facilities with experienced stylists.', '09:00', '21:00', true),
('XFactor Uptown', '456 Park Avenue', 'New York', 'NY', '10065', '(555) 234-5678', 'Upscale salon with premium services and luxury treatments.', '10:00', '20:00', true),
('XFactor Brooklyn', '789 Bedford Ave', 'Brooklyn', 'NY', '11211', '(555) 345-6789', 'Trendy Brooklyn location with a vibrant atmosphere.', '09:00', '22:00', true);

-- ============================================
-- 2. SEED SERVICES
-- ============================================
INSERT INTO services (name, description, price, duration_minutes, category, image_url, is_active) VALUES
-- Haircuts
('Hair Cutting', 'Expert styling tailored to your face shape and lifestyle.', 25.00, 30, 'haircut', 'https://images.unsplash.com/photo-1599351431202-6e0c06e7afbb?auto=format&fit=crop&q=80', true),
('Hair Cutting + Shaving', 'The complete grooming package for a fresh look.', 35.00, 45, 'haircut', 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80', true),
('Baby Hair Cutting', 'Gentle and care-filled haircuts for little ones.', 15.00, 20, 'haircut', 'https://images.unsplash.com/photo-1620331313174-d73136453180?auto=format&fit=crop&q=80', true),

-- Styling
('Shaving', 'Classic clean shaves with hot towel treatment.', 15.00, 20, 'styling', 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80', true),
('Beard Designing', 'Sculpt and shape your beard to perfection.', 22.00, 30, 'styling', 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80', true),
('Hair Straightening', 'Silky smooth straightening with Loreal products.', 80.00, 120, 'styling', 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80', true),

-- Coloring
('Hair Colouring', 'Streax, Loreal, Fruits, Garnier - your choice of style.', 50.00, 90, 'coloring', 'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?auto=format&fit=crop&q=80', true),
('Henna', 'Traditional and conditioning henna treatments.', 30.00, 60, 'coloring', 'https://images.unsplash.com/photo-1556760544-74068565f05c?auto=format&fit=crop&q=80', true),
('Highlight Colouring', 'Add dimension with expert highlights.', 65.00, 100, 'coloring', 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=80', true),

-- Treatments
('Face Massage', 'Relaxing massage to rejuvenate your skin.', 20.00, 25, 'treatment', 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80', true),
('Head Massage', 'Relieve stress with our therapeutic head massage.', 18.00, 20, 'treatment', 'https://images.unsplash.com/photo-1519823551278-64ac927accc9?auto=format&fit=crop&q=80', true),
('Hair Wash', 'Deep cleansing wash with premium conditioners.', 12.00, 15, 'treatment', 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?auto=format&fit=crop&q=80', true),
('Hair Spa', 'Luxurious Loreal spa treatment for healthy hair.', 45.00, 60, 'treatment', 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&q=80', true),
('Bleach', 'Skin brightening bleach treatments.', 28.00, 40, 'treatment', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80', true),
('Clean Up', '2-step or 3-step deep pore cleansing.', 35.00, 45, 'treatment', 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80', true),
('Facial', 'Papaya, VLCC, Gold - premium facials for glow.', 40.00, 50, 'treatment', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80', true),
('Scrub Massage', 'Exfoliating scrub with relaxing massage.', 32.00, 35, 'treatment', 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&q=80', true),

-- Other
('Threading', 'Precise hair removal for eyebrows and face.', 10.00, 15, 'other', 'https://images.unsplash.com/photo-1560066984-12186d305d4d?auto=format&fit=crop&q=80', true);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify your data was inserted correctly

-- Check salons
SELECT COUNT(*) as total_salons FROM salons WHERE is_active = true;

-- Check services by category
SELECT category, COUNT(*) as count, AVG(price) as avg_price 
FROM services 
WHERE is_active = true 
GROUP BY category 
ORDER BY category;

-- Check all services
SELECT name, price, duration_minutes, category 
FROM services 
WHERE is_active = true 
ORDER BY category, price;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
-- If you see results from the queries above, your database is seeded!
-- You should now see:
-- - 3 Salons
-- - 18 Services across 4 categories
-- 
-- Next steps:
-- 1. Refresh your app to see services load
-- 2. Try booking an appointment
-- 3. Check the services display on the home page
