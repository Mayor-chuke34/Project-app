import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import API from '../utils/api';

const Home = ({ onAddToCart }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Check if user token is valid
  const checkAuthToken = () => {
    const userData = localStorage.getItem('naijaShopUser');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
          localStorage.removeItem('naijaShopUser');
          window.location.href = '/login';
          return false;
        }
        return true;
      } catch (error) {
        console.error('Error parsing user data:', error);
        return false;
      }
    }
    return false;
  };

  useEffect(() => {
    if (checkAuthToken()) {
      loadHomeData();
    }
  }, []);

  const loadHomeData = async () => {
    setProductsLoading(true);
    
    try {
      // Load products and categories from backend
      const [productsResult, categoriesResult] = await Promise.all([
        API.products.getAll(), // Get all products from backend
        API.products.getCategories() // You may need to update this to fetch categories from backend if available
      ]);

      if (productsResult.success) {
        const products = productsResult.data?.products || productsResult.data || [];
        // Mark products as featured and ensure each has a unique ID
        const featured = products
          .filter(p => p && (p.id !== undefined && p.id !== null))
          .map(p => ({
            ...p,
            id: p.id ? p.id.toString() : String(p._id || '') // Ensure ID is a string
          }))
          .filter(p => p.isFeatured || Math.random() < 0.3) // If no featured flag, randomly select some
          .slice(0, 8);
        setFeaturedProducts(featured);
      }

      if (categoriesResult.success) {
        const categoryData = categoriesResult.data || [];
        // Format categories with emojis (fallback to name if not available)
        const categoryEmojis = {
          'beauty': '💄',
          'fragrances': '🌸',
          'furniture': '🪑',
          'groceries': '🛒',
          'home-decoration': '🏠',
          'kitchen-accessories': '🍳',
          'laptops': '💻',
          'mens-shirts': '👔',
          'mens-shoes': '👞',
          'mens-watches': '⌚',
          'mobile-accessories': '📱',
          'motorcycle': '🏍️',
          'skin-care': '🧴',
          'smartphones': '📱',
          'sports-accessories': '⚽',
          'sunglasses': '🕶️',
          'tablets': '📱',
          'tops': '👕',
          'vehicle': '🚗',
          'womens-bags': '👜',
          'womens-dresses': '👗',
          'womens-jewellery': '💍',
          'womens-shoes': '👠',
          'womens-watches': '⌚'
        };

        const formattedCategories = categoryData.slice(0, 8).map(cat => ({
          id: cat.slug || cat._id || cat,
          name: cat.name || cat,
          emoji: categoryEmojis[cat.slug || cat.name || cat] || '📦',
          description: `Explore our ${cat.name || cat} collection`
        }));
        setCategories(formattedCategories);
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setMessage('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      // Simulate newsletter subscription
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('Thank you for subscribing!');
      setEmail('');
    } catch (error) {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
            backgroundSize: '20px 20px'
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-8">
              <span role="img" aria-label="sparkles">✨</span>
              <span className="text-sm font-medium">New Collection Available</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Shop with Style
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Discover amazing products at unbeatable prices. Your perfect shopping experience starts here.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/products')}
                className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/30"
                aria-label="Shop now"
              >
                Shop Now
              </button>
              <button 
                onClick={() => document.getElementById('categories').scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/30"
                aria-label="Explore categories"
              >
                Explore Categories
              </button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-bounce delay-1000" aria-hidden="true">
          <div className="w-4 h-4 bg-white/20 rounded-full"></div>
        </div>
        <div className="absolute top-40 right-20 animate-bounce delay-500" aria-hidden="true">
          <div className="w-6 h-6 bg-white/30 rounded-full"></div>
        </div>
        <div className="absolute bottom-20 left-20 animate-bounce delay-700" aria-hidden="true">
          <div className="w-3 h-3 bg-white/25 rounded-full"></div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find exactly what you're looking for in our curated categories
            </p>
          </div>
          
          {productsLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8">
              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="group cursor-pointer bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 focus:outline-none focus:ring-4 focus:ring-blue-300"
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleCategoryClick(category.id);
                    }
                  }}
                  aria-label={`Browse ${category.name} category`}
                >
                  <div className="text-6xl mb-4 text-center group-hover:scale-110 transition-transform duration-300">
                    {category.emoji}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-center text-sm">
                    {category.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p>Categories will be loaded shortly...</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Handpicked favorites that our customers love most
            </p>
          </div>
          
          {productsLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p>Featured products will be loaded shortly...</p>
            </div>
          )}
          
          {/* View All Products Button */}
          {featuredProducts.length > 0 && (
            <div className="text-center mt-12">
              <button
                onClick={() => navigate('/products')}
                className="bg-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
              >
                View All Products
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl mb-8 text-purple-100">
            Subscribe to get special offers, free giveaways, and exclusive deals.
          </p>
          
          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30"
                required
                disabled={isLoading}
                aria-label="Email address for newsletter subscription"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold hover:bg-purple-50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-white/30"
                aria-label="Subscribe to newsletter"
              >
                {isLoading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>
            
            {message && (
              <div className={`mt-4 p-3 rounded-lg ${
                message.includes('Thank you') 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {message}
              </div>
            )}
          </form>
          
          <div className="mt-8 text-sm text-purple-200">
            <span role="img" aria-label="lock">🔒</span> We respect your privacy. Unsubscribe at any time.
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
              <div className="text-5xl mb-4" role="img" aria-label="shipping">🚚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Free Shipping</h3>
              <p className="text-gray-600">Free shipping on orders over ₦50,000. Fast and reliable delivery.</p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
              <div className="text-5xl mb-4" role="img" aria-label="support">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600">Our customer service team is here to help you anytime.</p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
              <div className="text-5xl mb-4" role="img" aria-label="return">↩</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Returns</h3>
              <p className="text-gray-600">Not satisfied? Return your items within 30 days.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;