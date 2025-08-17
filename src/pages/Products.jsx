import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import API from '../utils/api';
import { DEFAULT_PLACEHOLDER, placeholderDataURI } from '../utils/placeholders';
import { formatPriceDisplay } from '../utils/currency';

const Products = ({ searchQuery, onAddToCart }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 2000000 });
  const [showFilters, setShowFilters] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [heroImage, setHeroImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    useEffect(() => {
      // Fetch products and categories from backend
      const fetchData = async () => {
        setLoading(true);
        setError(null);
        // prepare a local sample fallback so we can reuse it in multiple places
        const sample = Array.from({ length: 8 }).map((_, i) => ({
          id: `local_${i}`,
          name: `Sample Product ${i+1}`,
          price: 1000 * (i+1),
          description: 'This is a locally generated sample product.',
          image: placeholderDataURI(400,400,`Sample ${i+1}`),
          rating: 4.0,
          reviews: 0,
          tags: ['sample'],
          inStock: true
        }));

        // safety timeout: if fetch hangs, show local fallback products after 6s
        let didTimeout = false;
        const timeoutId = setTimeout(() => {
          if (didTimeout) return;
          didTimeout = true;
          console.warn('Products fetch timed out, using local fallback');
          setAllProducts(sample);
          setFilteredProducts(sample);
          setLoading(false);
        }, 6000);

        try {
          const [productsResult, categoriesResult] = await Promise.all([
            API.products.getAll(),
            API.products.getCategories()
          ]);

          if (productsResult && productsResult.success) {
            // Ensure we're getting the products array correctly
            const products = productsResult.data?.products || productsResult.data || [];
            setAllProducts(products);
            setFilteredProducts(products); // Set initial filtered products
          } else {
            console.warn('productsResult not successful:', productsResult);
            // fallback to sample instead of throwing so UI recovers
            setAllProducts(sample);
            setFilteredProducts(sample);
            setError(productsResult?.error || 'Failed to fetch products from backend');
          }

          if (categoriesResult && categoriesResult.success) {
            setCategories(categoriesResult.data || []);
          }
        } catch (err) {
          console.error('Error fetching products:', err);
          // On any unexpected error, show sample products so the page doesn't hang
          if (!didTimeout) {
            setAllProducts(sample);
            setFilteredProducts(sample);
            setError(err.message || 'Error fetching products');
          }
        } finally {
          // Only clear the timeout if it hasn't already fired
          try {
            if (!didTimeout) clearTimeout(timeoutId);
          } catch (e) {}
          // Ensure loading is turned off (if timeout already turned it off, this is harmless)
          setLoading(false);
        }
      };
      fetchData();
    }, []);

    useEffect(() => {
      let filtered = [...allProducts];
      // Filter by category
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(product => product.category === selectedCategory);
      }
      // Search filter
      if (searchQuery && searchQuery.trim() !== '') {
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      // Price filter
      filtered = filtered.filter(product =>
        product.price >= priceRange.min && product.price <= priceRange.max
      );
      // Sorting
      switch (sortBy) {
        case 'price-low':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case 'name':
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'featured':
        default:
          filtered.sort((a, b) => {
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;
            return b.rating - a.rating;
          });
          break;
      }
      setFilteredProducts(filtered);
    }, [searchQuery, selectedCategory, sortBy, priceRange, allProducts]);

  const handleQuickView = (product) => {
    setQuickViewProduct(product);
    const imgs = product?.images || [];
    const initial = imgs.length > 0 ? imgs[0] : (product?.image || product?.thumbnail || DEFAULT_PLACEHOLDER);
    setHeroImage(initial || DEFAULT_PLACEHOLDER);
  };

  const closeQuickView = () => {
    setQuickViewProduct(null);
    setHeroImage(null);
  };

  const handleAddToCart = (product) => {
    onAddToCart(product);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            🛍 Our Products
          </h1>
          {searchQuery && (
            <p className="text-lg text-gray-600">
              Search results for: "<span className="font-medium text-green-600">{searchQuery}</span>"
            </p>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <p className="font-medium">Error loading products</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 8].map((n) => (
                <div key={n} className="bg-white p-4 rounded-xl shadow-sm">
                  <div className="animate-pulse">
                    <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-gray-600">
            Showing {filteredProducts.length} of {allProducts.length} products
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:w-1/4">
            {/* Mobile Filter Toggle */}
            <button
              className="lg:hidden w-full mb-4 bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-between"
              onClick={() => setShowFilters(!showFilters)}
            >
              <span className="font-medium">Filters & Categories</span>
              <span className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`}>
                ⬇
              </span>
            </button>

            <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              {/* Categories */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category._id || category.id || category.name}
                      onClick={() => setSelectedCategory(category.name || category.id || category._id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center ${
                        selectedCategory === (category.name || category.id || category._id)
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="mr-3 text-xl">{category.emoji || '📦'}</span>
                      <span className="font-medium">{category.name}</span>
                      <span className="ml-auto text-sm text-gray-500">
                        ({allProducts.filter(p => p.category === (category.name || category.id || category._id)).length})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Price Range</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Price: {formatPriceDisplay(priceRange.min)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2000000"
                      step="5000"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Price: {formatPriceDisplay(priceRange.max)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2000000"
                      step="5000"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setPriceRange({ min: 0, max: 2000000 });
                      setSortBy('featured');
                    }}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                  >
                    🔄 Reset Filters
                  </button>
                  <button
                    onClick={() => setSelectedCategory('fashion')}
                    className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-4 rounded-lg transition-colors"
                  >
                    👔 Show Fashion
                  </button>
                  <button
                    onClick={() => setSortBy('price-low')}
                    className="w-full bg-green-100 hover:bg-green-200 text-green-700 py-2 px-4 rounded-lg transition-colors"
                  >
                    💰 Cheapest First
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Products Grid */}
          <div className="lg:w-3/4">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product, idx) => (
                  <ProductCard
                    key={product.id || product._id || product.name || idx}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onQuickView={handleQuickView}
                    compact={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Products Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery 
                    ? `No products found for "${searchQuery}". Try adjusting your search or filters.`
                    : "No products match your current filters. Try adjusting your criteria."
                  }
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setPriceRange({ min: 0, max: 2000000 });
                    setSortBy('featured');
                  }}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  🔄 Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Quick View</h2>
              <button
                onClick={closeQuickView}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={heroImage || DEFAULT_PLACEHOLDER}
                      alt={quickViewProduct?.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = DEFAULT_PLACEHOLDER; setHeroImage(DEFAULT_PLACEHOLDER); }}
                    />
                  </div>

                  {/* Thumbnails gallery if multiple images available */}
                  {quickViewProduct?.images && quickViewProduct.images.length > 1 && (
                    <div className="flex gap-2 mt-2">
                      {quickViewProduct.images.map((src, i) => (
                        <button key={i} onClick={() => setHeroImage(src || DEFAULT_PLACEHOLDER)} className="w-16 h-16 rounded-lg overflow-hidden border">
                          <img src={src || DEFAULT_PLACEHOLDER} alt={`thumb-${i}`} className="w-full h-full object-cover" onError={(e)=>{ e.target.src = DEFAULT_PLACEHOLDER; }} />
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {quickViewProduct.featured && (
                    <div className="flex items-center justify-center">
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                        ⭐ Featured Product
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                      {quickViewProduct.name}
                    </h1>
                    
                    {/* Rating */}
                    <div className="flex items-center mb-4">
                      <div className="flex items-center mr-2">
                        {Array.from({ length: 5 }, (_, i) => (
                              <span key={i} className={`text-lg ${i < Math.floor(quickViewProduct.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}>
                                ★
                              </span>
                            ))}
                      </div>
                      <span className="text-gray-600">
                        {(quickViewProduct.rating || 0)} ({quickViewProduct.reviews || 0} reviews)
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="border-t border-b border-gray-200 py-4">
                    <div className="flex items-center space-x-3">
                        <span className="text-3xl font-bold text-green-600">
                        {formatPriceDisplay(quickViewProduct.price)}
                      </span>
                      {quickViewProduct.originalPrice && quickViewProduct.originalPrice > (quickViewProduct.price || 0) && (
                        <>
                          <span className="text-xl text-gray-400 line-through">
                            {formatPriceDisplay(quickViewProduct.originalPrice)}
                          </span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                            {Math.round(((quickViewProduct.originalPrice - (quickViewProduct.price || 0)) / quickViewProduct.originalPrice) * 100)}% OFF
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {quickViewProduct.description}
                    </p>
                  </div>

                  {/* Tags */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {(quickViewProduct.tags || []).map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${quickViewProduct.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`font-medium ${quickViewProduct.inStock ? 'text-green-600' : 'text-red-600'}`}>
                      {(quickViewProduct.inStock === undefined) ? 'Availability unknown' : (quickViewProduct.inStock ? 'In Stock' : 'Out of Stock')}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-4">
                    <button
                      onClick={() => {
                        handleAddToCart(quickViewProduct);
                        closeQuickView();
                      }}
                      disabled={!quickViewProduct.inStock}
                      className={`flex-1 py-4 px-6 rounded-lg font-medium text-lg transition-all ${
                        quickViewProduct.inStock
                          ? 'bg-green-600 hover:bg-green-700 text-white transform hover:scale-105'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      🛒 Add to Cart
                    </button>
                    <button className="px-6 py-4 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                      ❤
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;