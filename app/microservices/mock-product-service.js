import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Serve static images from the frontend public directory when running this mock alone.
app.use('/product-images', express.static(path.join(__dirname, 'frontend', 'public', 'product-images')));

const mockProducts = [
  {
    id: '1',
    name: '1970s Prairie Midi Dress',
    description: 'A romantic prairie midi dress with lace-trim details and a softly faded floral print.',
    price: 128.00,
    image_url: '/product-images/1970s-prairie-midi-dress.jpg',
    category: 'Dresses',
    brand: 'Hiraya Vintage',
    inventory: 8,
    inventory_quantity: 8,
    rating: 4.8,
    reviewCount: 12,
    is_featured: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: '1980s Wool Blazer',
    description: 'Structured wool blazer with strong shoulders and a softly worn vintage finish.',
    price: 146.00,
    image_url: '/product-images/1980s-wool-blazer.jpg',
    category: 'Outerwear',
    brand: 'Hiraya Vintage',
    inventory: 6,
    inventory_quantity: 6,
    rating: 4.9,
    reviewCount: 8,
    is_featured: true,
    created_at: '2024-01-14T10:00:00Z',
    updated_at: '2024-01-14T10:00:00Z'
  },
  {
    id: '3',
    name: '1990s Leather Shoulder Bag',
    description: 'Compact leather shoulder bag with a clean 1990s silhouette.',
    price: 118.00,
    image_url: '/product-images/1990s-leather-shoulder-bag.jpg',
    category: 'Bags',
    brand: 'Hiraya Vintage',
    inventory: 10,
    inventory_quantity: 10,
    rating: 4.7,
    reviewCount: 15,
    is_featured: true,
    created_at: '2024-01-13T10:00:00Z',
    updated_at: '2024-01-13T10:00:00Z'
  },
  {
    id: '4',
    name: 'Art Deco Pendant Necklace',
    description: 'Geometric pendant necklace inspired by Art Deco lines and heirloom styling.',
    price: 92.00,
    image_url: '/product-images/art-deco-pendant-necklace.jpg',
    category: 'Accessories',
    brand: 'Hiraya Vintage',
    inventory: 12,
    inventory_quantity: 12,
    rating: 4.6,
    reviewCount: 10,
    is_featured: true,
    created_at: '2024-01-12T10:00:00Z',
    updated_at: '2024-01-12T10:00:00Z'
  },
  {
    id: '5',
    name: 'Suede Block Heel Boots',
    description: 'Soft suede ankle boots with a walkable block heel and retro profile.',
    price: 135.00,
    image_url: '/product-images/suede-block-heel-boots.jpg',
    category: 'Shoes',
    brand: 'Hiraya Vintage',
    inventory: 7,
    inventory_quantity: 7,
    rating: 4.8,
    reviewCount: 11,
    is_featured: true,
    created_at: '2024-01-11T10:00:00Z',
    updated_at: '2024-01-11T10:00:00Z'
  }
];

app.get('/products', (req, res) => {
  const { page = '1', limit = '12', category, search, sortBy } = req.query;
  
  let filteredProducts = [...mockProducts];
  
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }
  
  if (search) {
    const searchLower = search.toString().toLowerCase();
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      p.category.toLowerCase().includes(searchLower)
    );
  }
  
  if (sortBy) {
    switch (sortBy) {
      case 'price-low':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'created_at':
        filteredProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }
  }
  
  const pageNum = parseInt(String(page));
  const limitNum = parseInt(String(limit));
  const offset = (pageNum - 1) * limitNum;
  
  const paginatedProducts = filteredProducts.slice(offset, offset + limitNum);
  const total = filteredProducts.length;
  const totalPages = Math.ceil(total / limitNum);
  
  res.json({
    success: true,
    data: {
      products: paginatedProducts,
      pagination: {
        currentPage: pageNum,
        totalPages,
        total,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    }
  });
});

app.get('/products/:id', (req, res) => {
  const { id } = req.params;
  const product = mockProducts.find(p => p.id === id);
  
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  
  res.json({ success: true, data: product });
});

app.get('/categories', (req, res) => {
  const categories = [
    { id: '1', name: 'Dresses', description: 'Vintage dresses and one-piece finds', image_url: '/product-images/1970s-prairie-midi-dress.jpg', product_count: 1 },
    { id: '2', name: 'Accessories', description: 'Vintage accessories and finishing touches', image_url: '/product-images/art-deco-pendant-necklace.jpg', product_count: 1 },
    { id: '3', name: 'Bags', description: 'Vintage bags and purses', image_url: '/product-images/1990s-leather-shoulder-bag.jpg', product_count: 1 },
    { id: '4', name: 'Outerwear', description: 'Vintage coats, jackets, and blazers', image_url: '/product-images/1980s-wool-blazer.jpg', product_count: 1 },
    { id: '5', name: 'Shoes', description: 'Vintage footwear and boots', image_url: '/product-images/suede-block-heel-boots.jpg', product_count: 1 }
  ];
  
  res.json({ success: true, data: categories });
});

app.get('/health', (req, res) => {
  res.json({ status: 'Product service is healthy', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Mock Products service running on port ${PORT}`);
  console.log(`Serving images from: ${path.join(__dirname, 'frontend', 'public', 'product-images')}`);
});
