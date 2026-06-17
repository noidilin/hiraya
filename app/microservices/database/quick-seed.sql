-- Simple product seeding with proper UUIDs and working images

-- Add a few sample products
INSERT INTO products (id, name, slug, description, short_description, sku, brand, category_id, price, compare_price, inventory_quantity, is_featured) VALUES
(gen_random_uuid(), '1970s Prairie Midi Dress', '1970s-prairie-midi-dress', 
'A romantic prairie midi dress with lace-trim details and a softly faded floral print', '1970s-inspired prairie dress', 'HV-DRESS-001', 'Hiraya Vintage', 
'10000000-0000-0000-0000-000000000001', 128.00, 168.00, 8, true),

(gen_random_uuid(), '1980s Wool Blazer', '1980s-wool-blazer', 
'Structured wool blazer with strong shoulders and a softly worn vintage finish', 'Tailored 1980s wool blazer', 'HV-BLAZER-001', 'Hiraya Vintage', 
'10000000-0000-0000-0000-000000000004', 146.00, 190.00, 6, true),

(gen_random_uuid(), '1990s Leather Shoulder Bag', '1990s-leather-shoulder-bag', 
'Compact leather shoulder bag with a clean 1990s silhouette', 'Minimal 1990s leather shoulder bag', 'HV-BAG-001', 'Hiraya Vintage', 
'10000000-0000-0000-0000-000000000003', 118.00, 150.00, 10, true),

(gen_random_uuid(), 'Art Deco Pendant Necklace', 'art-deco-pendant-necklace', 
'Geometric pendant necklace inspired by Art Deco lines and heirloom styling', 'Art Deco-inspired pendant necklace', 'HV-NECKLACE-001', 'Hiraya Vintage', 
'10000000-0000-0000-0000-000000000002', 92.00, 120.00, 12, true),

(gen_random_uuid(), 'Suede Block Heel Boots', 'suede-block-heel-boots', 
'Soft suede ankle boots with a walkable block heel and retro profile', 'Retro suede block heel boots', 'HV-BOOTS-001', 'Hiraya Vintage', 
'10000000-0000-0000-0000-000000000005', 135.00, 175.00, 7, true);

-- Add images for these products
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT 
    p.id,
    CASE 
        WHEN p.name LIKE '%Prairie%' THEN '/product-images/1970s-prairie-midi-dress.jpg'
        WHEN p.name LIKE '%Blazer%' THEN '/product-images/1980s-wool-blazer.jpg'
        WHEN p.name LIKE '%Shoulder Bag%' THEN '/product-images/1990s-leather-shoulder-bag.jpg'
        WHEN p.name LIKE '%Necklace%' THEN '/product-images/art-deco-pendant-necklace.jpg'
        WHEN p.name LIKE '%Boots%' THEN '/product-images/suede-block-heel-boots.jpg'
    END,
    p.name || ' - Main image',
    true,
    1
FROM products p
WHERE p.sku IN ('HV-DRESS-001', 'HV-BLAZER-001', 'HV-BAG-001', 'HV-NECKLACE-001', 'HV-BOOTS-001');