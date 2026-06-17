-- Database initialization script for Vintage Microservices
-- This file will be executed when PostgreSQL container starts

-- ============================================================
-- AUTH DB
-- ============================================================
\c auth_db

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@hirayavintage.test', '$2a$10$placeholder_hash', 'Admin', 'User', 'admin'),
('customer@hirayavintage.test', '$2a$10$placeholder_hash', 'John', 'Doe', 'customer');

-- ============================================================
-- PRODUCTS DB
-- ============================================================
\c products_db

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    description TEXT,
    short_description TEXT,
    sku VARCHAR(100),
    brand VARCHAR(100),
    category_id UUID REFERENCES categories(id),
    price DECIMAL(10,2) NOT NULL,
    compare_price DECIMAL(10,2),
    materials TEXT,
    care_instructions TEXT,
    inventory_quantity INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories (id, name, description) VALUES
('10000000-0000-0000-0000-000000000001', 'Dresses', 'Elegant dresses for special occasions'),
('10000000-0000-0000-0000-000000000002', 'Accessories', 'Vintage accessories and finishing touches'),
('10000000-0000-0000-0000-000000000003', 'Bags', 'Vintage handbags and shoulder bags'),
('10000000-0000-0000-0000-000000000004', 'Outerwear', 'Coats and jackets'),
('10000000-0000-0000-0000-000000000005', 'Shoes', 'Vintage footwear and boots');

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

-- ============================================================
-- ORDERS DB
-- ============================================================
\c orders_db

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
