import React, { useState } from 'react';
import { DEFAULT_PLACEHOLDER } from '../utils/placeholders';
import { formatPriceDisplay } from '../utils/currency';

const ProductCard = ({ product, onAddToCart, onQuickView, compact = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = () => {
  // Ensure product has a stable id before passing to the cart handler
  const safeId = product?.id || product?._id || product?.productId || product?.sku || product?.name || `local_${Math.random().toString(36).slice(2,8)}`;
  const safeProduct = { ...product, id: safeId };
  onAddToCart(safeProduct);
  };

  const handleQuickView = () => {
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">☆</span>);
    }
    return stars;
  };

  // Function to get the correct image URL
  const getImageUrl = (product) => {
    if (!product) return null;
    
    // Try different image properties in order of preference
    const imageUrls = [
      product.image,
      product.thumbnail,
      product.images?.[0],
      product.imageUrl,
      product.img
    ];

    // Find the first valid image URL
    const validImageUrl = imageUrls.find(url => {
      if (!url) return false;
      // Check if it's an absolute URL
      try {
        new URL(url);
        return true;
      } catch {
        // If it's a relative path (starts with /) or a simple filename/path, consider it valid
        if (url.startsWith('/')) return true;
        // simple relative path like '400x400.png' or 'images/400x400.png'
        if (/^[\w\-./]+$/.test(url)) return true;
        return false;
      }
    });

    if (validImageUrl) {
      // If it's a relative path, resolve against backend URL if provided or window origin
      // If it's a relative path, resolve against backend URL or current origin
      if (validImageUrl.startsWith('/')) {
        const backendBase = import.meta.env.VITE_BACKEND_API_URL || window.location.origin;
        return `${backendBase.replace(/\/$/, '')}${validImageUrl}`;
      }
      // If it's a simple relative filename/path (no scheme), prefix with backend base or origin
      if (/^[\w\-./]+$/.test(validImageUrl) && !/^[a-zA-Z]+:/.test(validImageUrl)) {
        const backendBase = import.meta.env.VITE_BACKEND_API_URL || window.location.origin;
        return `${backendBase.replace(/\/$/, '')}/${validImageUrl.replace(/^\//, '')}`;
      }
      return validImageUrl;
    }

  // Use inline SVG data URI as fallback to avoid external network failures
  return DEFAULT_PLACEHOLDER;
  };

  const placeholderImage = DEFAULT_PLACEHOLDER;

  const cardClasses = compact 
    ? "w-full max-w-xs mx-auto" 
    : "w-full max-w-sm mx-auto";

  return (
    <div 
      className={`${cardClasses} bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden bg-gray-100 group">
        {/* Shimmer loading effect */}
        {!imageLoaded && !imageError && (
          <div className={`${compact ? 'h-48' : 'h-64'} animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 background-animate flex items-center justify-center`}>
            <svg className="w-12 h-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        <img
          src={imageError ? DEFAULT_PLACEHOLDER : (getImageUrl(product) || DEFAULT_PLACEHOLDER)}
          alt={product?.name || product?.title || 'Product image'}
          className={`w-full ${compact ? 'h-48' : 'h-64'} object-cover transition-all duration-300 ${
            isHovered ? 'scale-110' : 'scale-100'
          } ${imageLoaded && !imageError ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={handleImageError}
          loading="lazy"
          onClick={() => { if (onQuickView) onQuickView(product); }}
          role={onQuickView ? 'button' : undefined}
        />

        {/* Featured Badge */}
        {product.featured && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            ⭐ Featured
          </div>
        )}

        {/* Discount Badge */}
        {product.originalPrice && product.originalPrice > product.price && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </div>
        )}

        {/* Quick View Overlay */}
        {isHovered && onQuickView && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-opacity duration-300">
            <button
              onClick={handleQuickView}
              className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Quick View 👁
            </button>
          </div>
        )}

        {/* Stock Status */}
        {product.inStock !== undefined && product.inStock === false && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className={`p-${compact ? '4' : '6'}`}>
        {/* Product Name */}
        <h3 className={`font-bold text-gray-800 mb-2 ${compact ? 'text-sm' : 'text-lg'} line-clamp-2`}>
          {product.name || product.title}
        </h3>

        {/* Rating & Reviews */}
        <div className="flex items-center mb-3">
          <div className="flex items-center mr-2">
            {renderStars(typeof product.rating === 'number' ? product.rating : (product.rating?.rate || 4.0))}
          </div>
          <span className="text-gray-500 text-sm">
            {(typeof product.rating === 'number' ? product.rating : (product.rating?.rate || 4.0)).toFixed(1)} 
            ({product.ratingCount || product.reviews || 0} reviews)
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className={`font-bold text-green-600 ${compact ? 'text-lg' : 'text-xl'}`}>
              {formatPriceDisplay(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-gray-400 line-through text-sm">
                {formatPriceDisplay(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {!compact && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {product.tags.slice(0, compact ? 2 : 3).map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Category */}
        {product.category && (
          <div className="mb-4">
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              {product.category}
            </span>
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.inStock !== undefined && product.inStock === false}
          className={`w-full py-${compact ? '2' : '3'} ${compact ? 'text-sm' : 'text-base'} font-medium rounded-lg transition-all duration-200 ${
            product.inStock === undefined || product.inStock !== false
              ? 'bg-green-600 hover:bg-green-700 text-white transform hover:scale-105 active:scale-95'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {product.inStock === undefined || product.inStock !== false ? (
            <>
              🛒 Add to Cart
            </>
          ) : (
            'Out of Stock'
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;