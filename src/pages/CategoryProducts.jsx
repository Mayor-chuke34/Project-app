import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { categories, products } from '../data/productData';
import { DEFAULT_PLACEHOLDER, placeholderDataURI } from '../utils/placeholders';

const CategoryProducts = ({ onAddToCart }) => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Find the category
    const category = categories.find(cat => cat.id === parseInt(categoryId));
    setCurrentCategory(category);

    // Filter products by category
    if (products && products.length > 0) {
      const categoryProducts = products.filter(product => 
        product.category === parseInt(categoryId)
      );
      setFilteredProducts(categoryProducts);
    } else {
      // Mock products for demonstration with Nigerian prices
      const mockProducts = generateMockProducts(parseInt(categoryId));
      setFilteredProducts(mockProducts);
    }
    
    setIsLoading(false);
  }, [categoryId]);

  const generateMockProducts = (catId) => {
    const productsByCategory = {
      1: [ // Fashion
  { id: 101, name: "Premium Nigerian Ankara Dress", price: 25000, image: placeholderDataURI(300,300,'Ankara Dress'), category: 1, description: "Beautiful traditional Ankara dress with modern cut" },
  { id: 102, name: "Men's Agbada - Royal Blue", price: 45000, image: placeholderDataURI(300,300,"Agbada"), category: 1, description: "Elegant traditional Agbada for special occasions" },
  { id: 103, name: "Women's Gele Headwrap", price: 8000, image: placeholderDataURI(300,300,'Gele Headwrap'), category: 1, description: "Premium quality Gele for traditional events" },
  { id: 104, name: "Designer Dashiki Shirt", price: 12000, image: placeholderDataURI(300,300,'Dashiki'), category: 1, description: "Modern dashiki with contemporary styling" },
  { id: 105, name: "Traditional Iro and Buba", price: 35000, image: placeholderDataURI(300,300,'Iro and Buba'), category: 1, description: "Complete traditional outfit set" },
  { id: 106, name: "Nigerian Flag Jersey", price: 15000, image: placeholderDataURI(300,300,'Flag Jersey'), category: 1, description: "Official Nigerian football team jersey" }
      ],
      2: [ // Electronics
        { id: 201, name: "Samsung Galaxy A54 5G", price: 280000, image: placeholderDataURI(300,300,'Samsung A54'), category: 2, description: "Latest Samsung smartphone with 5G capability" },
        { id: 202, name: "iPhone 15 Pro Max", price: 850000, image: placeholderDataURI(300,300,'iPhone 15 Pro Max'), category: 2, description: "Apple's latest flagship smartphone" },
        { id: 203, name: "HP Pavilion Laptop", price: 450000, image: placeholderDataURI(300,300,'HP Pavilion'), category: 2, description: "High-performance laptop for work and gaming" },
        { id: 204, name: "Sony WH-1000XM5 Headphones", price: 120000, image: placeholderDataURI(300,300,'Sony Headphones'), category: 2, description: "Premium noise-canceling headphones" },
        { id: 205, name: "iPad Air 5th Gen", price: 380000, image: placeholderDataURI(300,300,'iPad Air'), category: 2, description: "Apple's powerful tablet for creativity" },
        { id: 206, name: "LG 55\" OLED TV", price: 650000, image: placeholderDataURI(300,300,'LG OLED TV'), category: 2, description: "4K OLED smart TV with premium picture quality" }
      ],
      3: [ // Home & Garden
  { id: 301, name: "Nigerian Art Wall Painting", price: 18000, image: placeholderDataURI(300,300,'Art Painting'), category: 3, description: "Beautiful Nigerian-themed artwork for your home" },
  { id: 302, name: "Luxury Bed Set - King Size", price: 85000, image: placeholderDataURI(300,300,'Bed Set'), category: 3, description: "Premium bedding set with Nigerian-inspired patterns" },
  { id: 303, name: "Traditional Clay Pots Set", price: 12000, image: placeholderDataURI(300,300,'Clay Pots'), category: 3, description: "Authentic Nigerian clay pots for cooking" },
  { id: 304, name: "Rattan Furniture Set", price: 150000, image: placeholderDataURI(300,300,'Rattan Furniture'), category: 3, description: "Beautiful outdoor furniture made from local materials" },
  { id: 305, name: "African Print Cushions", price: 6000, image: placeholderDataURI(300,300,'Cushions'), category: 3, description: "Colorful cushions with African-inspired prints" },
  { id: 306, name: "Garden Plant Collection", price: 25000, image: placeholderDataURI(300,300,'Plants'), category: 3, description: "Collection of tropical plants perfect for Nigerian climate" }
      ],
      4: [ // Sports
  { id: 401, name: "Professional Football", price: 8000, image: placeholderDataURI(300,300,'Football'), category: 4, description: "FIFA-approved football for professional play" },
  { id: 402, name: "Nike Air Max Sneakers", price: 55000, image: placeholderDataURI(300,300,'Sneakers'), category: 4, description: "Premium running shoes with Air Max technology" },
  { id: 403, name: "Basketball Jersey - Lagos Lakers", price: 18000, image: placeholderDataURI(300,300,'Jersey'), category: 4, description: "Official Lagos Lakers team jersey" },
  { id: 404, name: "Gym Equipment Set", price: 120000, image: placeholderDataURI(300,300,'Gym Equipment'), category: 4, description: "Complete home gym equipment package" },
  { id: 405, name: "Table Tennis Set", price: 35000, image: placeholderDataURI(300,300,'Table Tennis'), category: 4, description: "Professional table tennis rackets and balls" },
  { id: 406, name: "Yoga Mat Premium", price: 12000, image: placeholderDataURI(300,300,'Yoga Mat'), category: 4, description: "High-quality non-slip yoga mat" }
      ],
      5: [ // Books
  { id: 501, name: "Things Fall Apart - Chinua Achebe", price: 3500, image: placeholderDataURI(300,300,'Things Fall Apart'), category: 5, description: "Classic Nigerian literature masterpiece" },
  { id: 502, name: "Half of a Yellow Sun", price: 4500, image: placeholderDataURI(300,300,'Half of a Yellow Sun'), category: 5, description: "Award-winning novel by Chimamanda Ngozi Adichie" },
  { id: 503, name: "Nigerian History Textbook", price: 8000, image: placeholderDataURI(300,300,'History Textbook'), category: 5, description: "Comprehensive guide to Nigerian history" },
  { id: 504, name: "Business Success in Nigeria", price: 6000, image: placeholderDataURI(300,300,'Business Success'), category: 5, description: "Practical guide to starting business in Nigeria" },
  { id: 505, name: "Children's Yoruba Stories", price: 2500, image: placeholderDataURI(300,300,'Yoruba Stories'), category: 5, description: "Traditional Yoruba folktales for children" },
  { id: 506, name: "Cookbook - Nigerian Cuisine", price: 5500, image: placeholderDataURI(300,300,'Cookbook'), category: 5, description: "Complete guide to traditional Nigerian cooking" }
      ]
    };
    
    return productsByCategory[catId] || [];
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    let sorted = [...filteredProducts];
    
    switch (newSort) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    
    setFilteredProducts(sorted);
  };

  const handlePriceFilter = (range) => {
    setPriceRange(range);
    // Re-filter products based on price range
    // This would typically refetch from API with price filters
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Category Not Found</h2>
          <p className="text-gray-600 mb-6">The category you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/products')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse All Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <button 
              onClick={() => navigate('/home')}
              className="hover:text-blue-600"
            >
              Home
            </button>
            <span>›</span>
            <button 
              onClick={() => navigate('/products')}
              className="hover:text-blue-600"
            >
              Products
            </button>
            <span>›</span>
            <span className="text-blue-600 font-medium">{currentCategory.name}</span>
          </nav>
        </div>

        {/* Category Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <div className="text-6xl mb-4">{currentCategory.icon}</div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {currentCategory.name}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our curated selection of premium {currentCategory.name.toLowerCase()} products
            </p>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            {/* Results Count */}
            <div className="text-gray-600">
              <span className="font-medium">{filteredProducts.length}</span> products found
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              
              {/* Price Range Filter */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Price:</label>
                <select 
                  value={priceRange}
                  onChange={(e) => handlePriceFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Prices</option>
                  <option value="0-10000">Under ₦10,000</option>
                  <option value="10000-50000">₦10,000 - ₦50,000</option>
                  <option value="50000-100000">₦50,000 - ₦100,000</option>
                  <option value="100000+">Above ₦100,000</option>
                </select>
              </div>

              {/* Sort Options */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <select 
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                showFullPrice={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-6">📦</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">No Products Found</h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              We're working hard to add more products to this category. Check back soon!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/products')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse All Products
              </button>
              <button 
                onClick={() => navigate('/home')}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}

        {/* Related Categories */}
        {filteredProducts.length > 0 && (
          <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Explore Other Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories
                .filter(cat => cat.id !== currentCategory.id && cat.id !== 0)
                .slice(0, 4)
                .map((category) => (
                  <button
                    key={category.id}
                    onClick={() => navigate(`/category/${category.id}`)}
                    className="group p-4 text-center border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">
                      {category.icon}
                    </div>
                    <div className="font-medium text-gray-800 group-hover:text-blue-600">
                      {category.name}
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;