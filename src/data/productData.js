// Enhanced Product Data with working images
export const products = [
  // FASHION CATEGORY
  {
    id: 1,
    name: "Nike Air Force 1",
    price: 45000,
    originalPrice: 55000,
    category: "fashion",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center",
    description: "Classic white Nike Air Force 1 sneakers. Comfortable and stylish for everyday wear.",
    rating: 4.8,
    reviews: 156,
    inStock: true,
    featured: true,
    tags: ["shoes", "sneakers", "nike", "white"]
  },
  {
    id: 2,
    name: "Denim Jacket",
    price: 25000,
    originalPrice: 30000,
    category: "fashion",
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop&crop=center",
    description: "Classic blue denim jacket. Perfect for casual outings and layering.",
    rating: 4.5,
    reviews: 89,
    inStock: true,
    featured: false,
    tags: ["jacket", "denim", "casual", "blue"]
  },
  {
    id: 3,
    name: "Black Leather Boots",
    price: 38000,
    originalPrice: 45000,
    category: "fashion",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop&crop=center",
    description: "Premium black leather boots. Durable and stylish for any occasion.",
    rating: 4.7,
    reviews: 124,
    inStock: true,
    featured: true,
    tags: ["boots", "leather", "black", "premium"]
  },
  {
    id: 4,
    name: "Cotton T-Shirt",
    price: 8000,
    originalPrice: 12000,
    category: "fashion",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center",
    description: "Soft cotton t-shirt available in multiple colors. Comfortable everyday wear.",
    rating: 4.3,
    reviews: 67,
    inStock: true,
    featured: false,
    tags: ["t-shirt", "cotton", "casual", "comfortable"]
  },
  {
    id: 5,
    name: "Designer Sunglasses",
    price: 15000,
    originalPrice: 20000,
    category: "fashion",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop&crop=center",
    description: "Stylish designer sunglasses with UV protection. Perfect for sunny days.",
    rating: 4.6,
    reviews: 93,
    inStock: true,
    featured: true,
    tags: ["sunglasses", "designer", "uv-protection", "stylish"]
  },
  {
    id: 6,
    name: "Formal Dress Shirt",
    price: 22000,
    originalPrice: 28000,
    category: "fashion",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop&crop=center",
    description: "Crisp white formal dress shirt. Perfect for business and formal occasions.",
    rating: 4.4,
    reviews: 78,
    inStock: true,
    featured: false,
    tags: ["shirt", "formal", "white", "business"]
  },

  // HOME & GARDEN CATEGORY
  {
    id: 7,
    name: "Modern Floor Lamp",
    price: 35000,
    originalPrice: 42000,
    category: "home-garden",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center",
    description: "Elegant modern floor lamp with adjustable brightness. Perfect for living rooms.",
    rating: 4.7,
    reviews: 142,
    inStock: true,
    featured: true,
    tags: ["lamp", "modern", "lighting", "adjustable"]
  },
  {
    id: 8,
    name: "Indoor Plant Set",
    price: 18500,
    originalPrice: 25000,
    category: "home-garden",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop&crop=center",
    description: "Set of 3 beautiful indoor plants with decorative pots. Great for home decoration.",
    rating: 4.6,
    reviews: 87,
    inStock: true,
    featured: false,
    tags: ["plants", "indoor", "decoration", "set"]
  },
  {
    id: 9,
    name: "Wooden Coffee Table",
    price: 85000,
    originalPrice: 100000,
    category: "home-garden",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center",
    description: "Handcrafted wooden coffee table. Adds warmth and elegance to any living space.",
    rating: 4.8,
    reviews: 156,
    inStock: true,
    featured: true,
    tags: ["table", "wooden", "coffee", "handcrafted"]
  },
  {
    id: 10,
    name: "Decorative Wall Art",
    price: 12000,
    originalPrice: 16000,
    category: "home-garden",
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop&crop=center",
    description: "Beautiful abstract wall art piece. Perfect for modern home decoration.",
    rating: 4.4,
    reviews: 73,
    inStock: true,
    featured: false,
    tags: ["art", "wall", "decoration", "abstract"]
  },
  {
    id: 11,
    name: "Kitchen Utensil Set",
    price: 28000,
    originalPrice: 35000,
    category: "home-garden",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center",
    description: "Complete stainless steel kitchen utensil set. Essential tools for every kitchen.",
    rating: 4.5,
    reviews: 112,
    inStock: true,
    featured: true,
    tags: ["kitchen", "utensils", "stainless-steel", "set"]
  },
  {
    id: 12,
    name: "Garden Tool Kit",
    price: 32000,
    originalPrice: 40000,
    category: "home-garden",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop&crop=center",
    description: "Professional garden tool kit with essential tools for gardening enthusiasts.",
    rating: 4.6,
    reviews: 94,
    inStock: true,
    featured: false,
    tags: ["garden", "tools", "kit", "professional"]
  },

  // ELECTRONICS CATEGORY
  {
    id: 13,
    name: "iPhone 15 Pro",
    price: 850000,
    originalPrice: 900000,
    category: "electronics",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop&crop=center",
    description: "Latest iPhone 15 Pro with advanced camera system and powerful A17 chip.",
    rating: 4.9,
    reviews: 234,
    inStock: true,
    featured: true,
    tags: ["iphone", "smartphone", "apple", "latest"]
  },
  {
    id: 14,
    name: "MacBook Air M2",
    price: 1200000,
    originalPrice: 1350000,
    category: "electronics",
    image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop&crop=center",
    description: "Ultra-thin MacBook Air with M2 chip. Perfect for work and creativity.",
    rating: 4.8,
    reviews: 189,
    inStock: true,
    featured: true,
    tags: ["macbook", "laptop", "apple", "m2-chip"]
  },
  {
    id: 15,
    name: "Samsung 4K Smart TV",
    price: 320000,
    originalPrice: 380000,
    category: "electronics",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop&crop=center",
    description: "55-inch Samsung 4K Smart TV with HDR and smart features.",
    rating: 4.7,
    reviews: 167,
    inStock: true,
    featured: false,
    tags: ["tv", "4k", "samsung", "smart"]
  },
  {
    id: 16,
    name: "Wireless Headphones",
    price: 45000,
    originalPrice: 55000,
    category: "electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&crop=center",
    description: "Premium wireless headphones with noise cancellation and long battery life.",
    rating: 4.6,
    reviews: 203,
    inStock: true,
    featured: true,
    tags: ["headphones", "wireless", "noise-cancellation", "premium"]
  },
  {
    id: 17,
    name: "Gaming Console",
    price: 280000,
    originalPrice: 320000,
    category: "electronics",
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop&crop=center",
    description: "Latest gaming console with 4K gaming and extensive game library.",
    rating: 4.8,
    reviews: 156,
    inStock: true,
    featured: true,
    tags: ["gaming", "console", "4k", "entertainment"]
  },
  {
    id: 18,
    name: "Smart Watch",
    price: 95000,
    originalPrice: 110000,
    category: "electronics",
    image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400&h=400&fit=crop&crop=center",
    description: "Advanced smartwatch with health monitoring and fitness tracking features.",
    rating: 4.5,
    reviews: 142,
    inStock: true,
    featured: false,
    tags: ["smartwatch", "fitness", "health", "tracking"]
  },

  // SPORTS CATEGORY
  {
    id: 19,
    name: "Football Jersey",
    price: 18000,
    originalPrice: 23000,
    category: "sports",
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop&crop=center",
    description: "Official team football jersey. High-quality fabric and authentic design.",
    rating: 4.4,
    reviews: 89,
    inStock: true,
    featured: false,
    tags: ["jersey", "football", "sports", "team"]
  },
  {
    id: 20,
    name: "Tennis Racket",
    price: 35000,
    originalPrice: 42000,
    category: "sports",
    image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&h=400&fit=crop&crop=center",
    description: "Professional tennis racket with carbon fiber frame. Perfect for competitive play.",
    rating: 4.7,
    reviews: 76,
    inStock: true,
    featured: true,
    tags: ["tennis", "racket", "professional", "carbon-fiber"]
  },
  {
    id: 21,
    name: "Basketball",
    price: 8500,
    originalPrice: 12000,
    category: "sports",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=400&fit=crop&crop=center",
    description: "Official size basketball with premium leather construction.",
    rating: 4.3,
    reviews: 54,
    inStock: true,
    featured: false,
    tags: ["basketball", "sports", "leather", "official"]
  },
  {
    id: 22,
    name: "Yoga Mat",
    price: 12000,
    originalPrice: 15000,
    category: "sports",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop&crop=center",
    description: "Non-slip yoga mat with extra cushioning. Perfect for yoga and fitness routines.",
    rating: 4.6,
    reviews: 98,
    inStock: true,
    featured: true,
    tags: ["yoga", "mat", "fitness", "non-slip"]
  },
  {
    id: 23,
    name: "Dumbbells Set",
    price: 45000,
    originalPrice: 55000,
    category: "sports",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center",
    description: "Adjustable dumbbell set for home workouts. Space-saving design.",
    rating: 4.5,
    reviews: 123,
    inStock: true,
    featured: false,
    tags: ["dumbbells", "fitness", "home-gym", "adjustable"]
  },
  {
    id: 24,
    name: "Running Shoes",
    price: 32000,
    originalPrice: 38000,
    category: "sports",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&crop=center",
    description: "Lightweight running shoes with advanced cushioning technology.",
    rating: 4.7,
    reviews: 187,
    inStock: true,
    featured: true,
    tags: ["running", "shoes", "lightweight", "cushioning"]
  }
];

// Categories for filtering
export const categories = [
  { id: 'all', name: 'All Products', icon: '🛍' },
  { id: 'fashion', name: 'Fashion', icon: '👔' },
  { id: 'home-garden', name: 'Home & Garden', icon: '🏠' },
  { id: 'electronics', name: 'Electronics', icon: '📱' },
  { id: 'sports', name: 'Sports', icon: '⚽' }
];

// Featured products (subset of products)
export const featuredProducts = products.filter(product => product.featured);

// Helper function to get products by category
export const getProductsByCategory = (categoryId) => {
  if (categoryId === 'all') return products;
  return products.filter(product => product.category === categoryId);
};

// Helper function to search products
export const searchProducts = (query, categoryFilter = 'all') => {
  const searchTerm = query.toLowerCase();
  let filteredProducts = categoryFilter === 'all' ? products : getProductsByCategory(categoryFilter);
  
  return filteredProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm) ||
    product.description.toLowerCase().includes(searchTerm) ||
    product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
};