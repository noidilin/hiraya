-- Hiraya Furugi Catalog reseed for products_db

DELETE FROM product_images;
DELETE FROM products;
DELETE FROM categories;

INSERT INTO categories (id, name, description) VALUES
('274cfdcb-1d8a-4563-93f3-a62e72c9e6f6', 'Dresses', 'Vintage dresses'),
('0f22f7b3-f87a-4603-9e7f-93dc0b42ec65', 'Accessories', 'Scarves, bags, and finishing pieces'),
('61e5f91b-4fb0-4116-8c6b-6dd947331daa', 'Outerwear', 'Coats and jackets'),
('8db2bf2a-cbb6-4db2-9ff0-cb14ce94067b', 'Denim', 'Vintage denim'),
('d7ab35db-b100-47ec-9316-3a89a1df4ebf', 'Tops', 'Shirts and blouses');

INSERT INTO products (id, name, slug, description, short_description, sku, brand, category_id, price, compare_price, inventory_quantity, is_featured) VALUES
('67be2d5e-ecfb-4bf9-b751-8474f9d7bcac', 'Prairie Midi Dress', 'prairie-midi-dress',
'Faded cotton midi dress with a gathered waist, lace-trim neckline, and an easy drape for warm days.', 'Faded cotton prairie midi dress', 'HF-DRESS-001', 'Hiraya Furugi',
'274cfdcb-1d8a-4563-93f3-a62e72c9e6f6', 128.00, 168.00, 4, true),

('e858df02-4a5b-4f8e-a1f4-2b6c28150d0b', 'Washed Linen Work Jacket', 'washed-linen-work-jacket',
'Unlined work jacket in softened linen canvas with utility pockets and a clean, boxy fall.', 'Softened linen work jacket', 'HF-JACKET-001', 'Hiraya Furugi',
'61e5f91b-4fb0-4116-8c6b-6dd947331daa', 154.00, NULL, 3, true),

('760f89d0-c80f-4798-8c75-f26070eb35d8', 'Indigo Straight Denim', 'indigo-straight-denim',
'Straight-leg denim with softened fading, sturdy seams, and a worn-in hand without heavy distressing.', 'Softened straight-leg indigo denim', 'HF-DENIM-001', 'Hiraya Furugi',
'8db2bf2a-cbb6-4db2-9ff0-cb14ce94067b', 116.00, NULL, 6, false),

('99026f04-ced9-42a5-b9e3-9440c4e38902', 'Cotton Lace Night Blouse', 'cotton-lace-night-blouse',
'Ivory cotton blouse with fine lace panels, shell buttons, and a relaxed shape for layered dressing.', 'Ivory cotton lace blouse', 'HF-BLOUSE-001', 'Hiraya Furugi',
'd7ab35db-b100-47ec-9316-3a89a1df4ebf', 92.00, 118.00, 5, true),

('d68c49dd-ccfb-4965-8b70-c98d32f77d71', 'Sumi Silk Scarf', 'sumi-silk-scarf',
'Light silk scarf in a charcoal wash, finished with narrow hems and a subtle natural sheen.', 'Charcoal washed silk scarf', 'HF-SCARF-001', 'Hiraya Furugi',
'0f22f7b3-f87a-4603-9e7f-93dc0b42ec65', 64.00, NULL, 8, false),

('b87e70bb-13e1-4200-87ab-d1c7698e43c6', 'Wool Twill Evening Coat', 'wool-twill-evening-coat',
'Long black wool coat with a narrow lapel, satin-like lining, and a quiet formal line.', 'Black wool twill evening coat', 'HF-COAT-001', 'Hiraya Furugi',
'61e5f91b-4fb0-4116-8c6b-6dd947331daa', 248.00, NULL, 2, true),

('4db3c0fe-b753-42d2-a102-e26c5a9f71f5', 'Patchwork Market Tote', 'patchwork-market-tote',
'Daily tote assembled from mixed cotton remnants with reinforced handles and a soft, slouching body.', 'Patchwork remnant market tote', 'HF-TOTE-001', 'Hiraya Furugi',
'0f22f7b3-f87a-4603-9e7f-93dc0b42ec65', 78.00, NULL, 7, false),

('f7b0b8b5-7e1d-4562-9cd4-10ac3f12fe35', 'Linen Tab Collar Shirt', 'linen-tab-collar-shirt',
'Bone linen shirt with a small tab collar, generous cuffs, and a dry hand that softens with wear.', 'Bone linen tab collar shirt', 'HF-SHIRT-001', 'Hiraya Furugi',
'd7ab35db-b100-47ec-9316-3a89a1df4ebf', 104.00, NULL, 5, false);

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
('67be2d5e-ecfb-4bf9-b751-8474f9d7bcac', '/product-images/prairie-midi-dress.jpg', 'Prairie Midi Dress product image', true, 1),
('e858df02-4a5b-4f8e-a1f4-2b6c28150d0b', '/product-images/washed-linen-work-jacket.jpg', 'Washed Linen Work Jacket product image', true, 1),
('760f89d0-c80f-4798-8c75-f26070eb35d8', '/product-images/indigo-straight-denim.jpg', 'Indigo Straight Denim product image', true, 1),
('99026f04-ced9-42a5-b9e3-9440c4e38902', '/product-images/cotton-lace-night-blouse.jpg', 'Cotton Lace Night Blouse product image', true, 1),
('d68c49dd-ccfb-4965-8b70-c98d32f77d71', '/product-images/sumi-silk-scarf.jpg', 'Sumi Silk Scarf product image', true, 1),
('b87e70bb-13e1-4200-87ab-d1c7698e43c6', '/product-images/wool-twill-evening-coat.jpg', 'Wool Twill Evening Coat product image', true, 1),
('4db3c0fe-b753-42d2-a102-e26c5a9f71f5', '/product-images/patchwork-market-tote.jpg', 'Patchwork Market Tote product image', true, 1),
('f7b0b8b5-7e1d-4562-9cd4-10ac3f12fe35', '/product-images/linen-tab-collar-shirt.jpg', 'Linen Tab Collar Shirt product image', true, 1);
