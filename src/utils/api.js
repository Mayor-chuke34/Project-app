// src/utils/api.js - COMPLETE FIXED VERSION WITH PAYMENT
// Vite exposes env variables via import.meta.env.
// Set VITE_BACKEND_API_URL and VITE_DUMMYJSON_API_URL in your .env files if needed.
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';
const DUMMYJSON_API_URL = import.meta.env.VITE_DUMMYJSON_API_URL || 'https://dummyjson.com';

import { getStoredToken } from './auth';

// Helper function to get auth token and check expiration
const getAuthToken = () => {
  try {
    const userData = JSON.parse(localStorage.getItem('naijaShopUser'));
    if (!userData || !userData.data?.token) {
      return null;
    }
    return userData.data.token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Helper function to store user data with expiration
const storeUserData = (userData) => {
  try {
    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Ensure we have the correct data structure
    const dataToStore = {
      data: {
        user: userData.data?.user || userData.user || userData,
        token: userData.data?.token || userData.token
      },
      expiresAt: expiresAt.toISOString()
    };
    
    localStorage.setItem('naijaShopUser', JSON.stringify(dataToStore));
    return dataToStore;
  } catch (error) {
    console.error('Error storing user data:', error);
    return null;
  }
};

// Generic API request function for YOUR BACKEND
let backendAvailable = true;

const backendRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
  ...(token && { Authorization: `Bearer ${token}` }),
  ...(token && { 'x-auth-token': token }),
    },
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  // Add credentials option for auth endpoints
  if (endpoint.startsWith('/auth')) {
    finalOptions.credentials = 'include';
  }

  if (!backendAvailable) {
    // Fast-fail when backend was observed to be unavailable
    return { success: false, error: 'Backend not available' };
  }

  try {
    const response = await fetch(`${BACKEND_API_URL}${endpoint}`, finalOptions);

    // Handle 401 Unauthorized explicitly
    if (response.status === 401) {
      const err = await response.json().catch(() => ({}));
      return { success: false, status: 401, error: err.message || 'Unauthorized' };
    }

    // If 404 or any client/server error, return structured result without throwing
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Mark backend as unavailable on 404 to silence repeated failing calls
      if (response.status === 404) {
        backendAvailable = false;
        console.warn(`Backend route not found: ${endpoint} (404). Switching to fallback mode.`);
        return { success: false, status: 404, error: errorData.message || errorData.error || 'Not Found' };
      }
      // For other non-ok statuses return structured error
      console.warn(`Backend request failed: ${endpoint} status=${response.status}`);
      return { success: false, status: response.status, error: errorData.message || errorData.error || `HTTP ${response.status}` };
    }

    const data = await response.json().catch(() => null);
    return { data: data ? (data.data || data) : null, success: data ? data.success !== false : true };
  } catch (error) {
    // Network or other runtime error — mark backend unavailable and return structured result
    backendAvailable = false;
    console.warn('Backend API request network/error (switching to fallback):', error.message || error);
    return { error: error.message || 'Network error', success: false };
  }
};

// Generic API request function for DUMMYJSON
const dummyJsonRequest = async (endpoint) => {
  try {
    const response = await fetch(`${DUMMYJSON_API_URL}${endpoint}`);
    
    if (!response.ok) {
      throw new Error('DummyJSON request failed');
    }
    
    const data = await response.json();
    return { data, success: true };
  } catch (error) {
    console.error('DummyJSON API request error:', error);
    return { error: error.message, success: false };
  }
};

// Generic API request function for FakeStore API
const FAKESTORE_API_URL = 'https://fakestoreapi.com';
const fakeStoreRequest = async (endpoint) => {
  try {
    const response = await fetch(`${FAKESTORE_API_URL}${endpoint}`);
    
    if (!response.ok) {
      throw new Error('FakeStore request failed');
    }
    
    const data = await response.json();
    return { data, success: true };
  } catch (error) {
    console.error('FakeStore API request error:', error);
    return { error: error.message, success: false };
  }
};

// ============ PRODUCTS API ============
import sampleProducts from '../data/sampleProducts';

const productsAPI = {
  // Get products from both DummyJSON and FakeStore
  getAll: async (limit = 20, skip = 0) => {
    try {
      // First, try to get products from your backend
      const backendResponse = await backendRequest('/products');
      if (backendResponse.success && backendResponse.data?.length > 0) {
        return backendResponse;
      }

      // If backend fails or has no products, fallback to external APIs
      const [dummyJsonResponse, fakeStoreResponse] = await Promise.all([
        dummyJsonRequest(`/products?limit=${limit}&skip=${skip}`),
        fakeStoreRequest('/products')
      ]);

      if (!dummyJsonResponse.success && !fakeStoreResponse.success) {
        console.warn('External product sources failed, falling back to local sample products');
        return { success: true, data: { products: sampleProducts } };
      }

      // Combine and format products from both sources
      const dummyProducts = dummyJsonResponse.success ? dummyJsonResponse.data.products : [];
      const fakeStoreProducts = fakeStoreResponse.success ? fakeStoreResponse.data : [];

      const combinedProducts = [
        ...dummyProducts.map(p => ({
          id: `dummy_${p.id}`,
          name: p.title,
          price: p.price,
          description: p.description,
          image: p.thumbnail,
          category: p.category,
          rating: typeof p.rating === 'number' ? p.rating : (p.rating?.rate || 4),
          ratingCount: p.rating?.count || 0,
          brand: p.brand,
          source: 'dummyjson'
        })),
        ...fakeStoreProducts.map(p => ({
          id: `fakestore_${p.id}`,
          name: p.title,
          price: p.price,
          description: p.description,
          image: p.image,
          category: p.category,
          rating: p.rating?.rate || 4,
          ratingCount: p.rating?.count || 0,
          source: 'fakestore'
        }))
      ];

      return { success: true, data: { products: combinedProducts } };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { success: false, error: error.message };
    }
  },

  // Get products by category
  getByCategory: async (category) => {
    try {
      const [dummyJsonResponse, fakeStoreResponse] = await Promise.all([
        dummyJsonRequest(`/products/category/${category}`),
        fakeStoreRequest(`/products/category/${category}`)
      ]);

      // Combine products from both sources
      const dummyProducts = dummyJsonResponse.success ? dummyJsonResponse.data.products : [];
      const fakeStoreProducts = fakeStoreResponse.success ? fakeStoreResponse.data : [];

      const combinedProducts = [
        ...dummyProducts.map(p => ({
          id: `dummy_${p.id}`,
          name: p.title,
          price: p.price,
          description: p.description,
          image: p.thumbnail,
          category: p.category,
          rating: p.rating,
          brand: p.brand,
          source: 'dummyjson'
        })),
        ...fakeStoreProducts.map(p => ({
          id: `fakestore_${p.id}`,
          name: p.title,
          price: p.price,
          description: p.description,
          image: p.image,
          category: p.category,
          rating: { rate: p.rating.rate, count: p.rating.count },
          source: 'fakestore'
        }))
      ];

      return { success: true, data: combinedProducts };
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all categories from both sources
  getCategories: async () => {
    try {
      const [dummyJsonResponse, fakeStoreResponse] = await Promise.all([
        dummyJsonRequest('/products/categories'),
        fakeStoreRequest('/products/categories')
      ]);

      const allCategories = new Set([
        ...(dummyJsonResponse.success ? dummyJsonResponse.data : []),
        ...(fakeStoreResponse.success ? fakeStoreResponse.data : [])
      ]);

      return { success: true, data: Array.from(allCategories) };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { success: false, error: error.message };
    }
  },

  // Get product by ID from either source
  getById: async (id) => {
    try {
      if (id.startsWith('dummy_')) {
        const dummyResponse = await dummyJsonRequest(`/products/${id.replace('dummy_', '')}`);
        if (dummyResponse.success) {
          const product = dummyResponse.data;
          return {
            success: true,
            data: {
              id: `dummy_${product.id}`,
              name: product.title,
              price: product.price,
              description: product.description,
              image: product.thumbnail,
              category: product.category,
              rating: product.rating,
              brand: product.brand,
              source: 'dummyjson'
            }
          };
        }
      } else if (id.startsWith('fakestore_')) {
        const fakeStoreResponse = await fakeStoreRequest(`/products/${id.replace('fakestore_', '')}`);
        if (fakeStoreResponse.success) {
          const product = fakeStoreResponse.data;
          return {
            success: true,
            data: {
              id: `fakestore_${product.id}`,
              name: product.title,
              price: product.price,
              description: product.description,
              image: product.image,
              category: product.category,
              rating: { rate: product.rating.rate, count: product.rating.count },
              source: 'fakestore'
            }
          };
        }
      }

      return { success: false, error: 'Product not found' };
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      return { success: false, error: error.message };
    }
  },

  // Search for products
  search: async (query) => {
    try {
      const searchResponse = await dummyJsonRequest(`/products/search?q=${encodeURIComponent(query)}`);
      if (!searchResponse.success) {
        throw new Error('Search request failed');
      }

      const products = searchResponse.data.products.map(p => ({
        id: `dummy_${p.id}`,
        name: p.title,
        price: p.price,
        description: p.description,
        image: p.thumbnail,
        category: p.category,
        rating: p.rating,
        brand: p.brand,
        source: 'dummyjson'
      }));

      return { success: true, data: { products } };
    } catch (error) {
      console.error('Error searching products:', error);
      return { success: false, error: error.message };
    }
  },

  // Get product by ID from either source
  getById: async (id) => {
    try {
      if (id.startsWith('dummy_')) {
        const dummyResponse = await dummyJsonRequest(`/products/${id.replace('dummy_', '')}`);
        if (dummyResponse.success) {
          const product = dummyResponse.data;
          return {
            success: true,
            data: {
              id: `dummy_${product.id}`,
              name: product.title,
              price: product.price,
              description: product.description,
              image: product.thumbnail,
              category: product.category,
              rating: product.rating,
              brand: product.brand,
              source: 'dummyjson'
            }
          };
        }
      } else if (id.startsWith('fakestore_')) {
        const fakeStoreResponse = await fakeStoreRequest(`/products/${id.replace('fakestore_', '')}`);
        if (fakeStoreResponse.success) {
          const product = fakeStoreResponse.data;
          return {
            success: true,
            data: {
              id: `fakestore_${product.id}`,
              name: product.title,
              price: product.price,
              description: product.description,
              image: product.image,
              category: product.category,
              rating: { rate: product.rating.rate, count: product.rating.count },
              source: 'fakestore'
            }
          };
        }
      }

      return { success: false, error: 'Product not found' };
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      return { success: false, error: error.message };
    }
  },

  // Search for products
  search: async (query) => {
    try {
      const searchResponse = await dummyJsonRequest(`/products/search?q=${encodeURIComponent(query)}`);
      if (!searchResponse.success) {
        throw new Error('Search request failed');
      }

      const products = searchResponse.data.products.map(p => ({
        id: `dummy_${p.id}`,
        name: p.title,
        price: p.price,
        description: p.description,
        image: p.thumbnail,
        category: p.category,
        rating: p.rating,
        brand: p.brand,
        source: 'dummyjson'
      }));

      return { success: true, data: { products } };
    } catch (error) {
      console.error('Error searching products:', error);
      return { success: false, error: error.message };
    }
  }
};

// ============ AUTHENTICATION API ============
export const authAPI = {
  login: async (credentials) => {
    return await backendRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  
  register: async (userData) => {
    return await backendRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  logout: async () => {
    return await backendRequest('/auth/logout', {
      method: 'POST',
    });
  },
  
  verifyToken: async () => {
    return await backendRequest('/auth/verify');
  },

  getProfile: async () => {
    return await backendRequest('/auth/profile');
  }
};

// ============ CART API ============
export const cartAPI = {
  getCart: async () => {
    return await backendRequest('/cart');
  },
  
  addToCart: async (productId, quantity = 1) => {
    try {
      if (!productId) return { success: false, error: 'Missing productId' };
      const pid = typeof productId === 'string' ? productId : String(productId);
      return await backendRequest('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ productId: pid, quantity }),
      });
    } catch (error) {
      console.error('cartAPI.addToCart error:', error);
      return { success: false, error: error.message };
    }
  },
  
  updateCartItem: async (productId, quantity) => {
    try {
      if (!productId) return { success: false, error: 'Missing productId' };
      const pid = typeof productId === 'string' ? productId : String(productId);
      return await backendRequest('/cart/update', {
        method: 'PUT',
        body: JSON.stringify({ productId: pid, quantity }),
      });
    } catch (error) {
      console.error('cartAPI.updateCartItem error:', error);
      return { success: false, error: error.message };
    }
  },
  
  removeFromCart: async (productId) => {
    return await backendRequest(`/cart/remove/${productId}`, {
      method: 'DELETE',
    });
  },
  
  clearCart: async () => {
    return await backendRequest('/cart/clear', {
      method: 'DELETE',
    });
  }
};

// ============ ORDERS API ============
export const ordersAPI = {
  getUserOrders: async () => {
    return await backendRequest('/orders');
  },
  
  getOrderById: async (id) => {
    return await backendRequest(`/orders/${id}`);
  },
  
  create: async (orderData) => {
    return await backendRequest('/orders/create', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },
  
  cancelOrder: async (id) => {
    return await backendRequest(`/orders/${id}/cancel`, {
      method: 'PUT',
    });
  },
  
  getAllOrders: async () => {
    return await backendRequest('/orders/admin/all');
  },
  
  updateOrderStatus: async (id, status) => {
    return await backendRequest(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }
};

// ============ PAYMENT API (NEW - PAYSTACK INTEGRATION) ============
export const paymentAPI = {
  // Initialize payment with Paystack
  initialize: async (paymentData) => {
    return await backendRequest('/payment/initialize', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },
  
  // Verify payment
  verify: async (reference) => {
    return await backendRequest(`/payment/verify/${reference}`);
  },
  
  // Get available payment methods
  getMethods: async () => {
    return await backendRequest('/payment/methods');
  }
};

// ============ USERS API ============
export const usersAPI = {
  getProfile: async () => {
    return await backendRequest('/users/profile');
  },
  
  updateProfile: async (userData) => {
    return await backendRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
  
  changePassword: async (currentPassword, newPassword) => {
    return await backendRequest('/users/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
  
  // Wishlist methods
  getWishlist: async () => {
    return await backendRequest('/users/wishlist');
  },
  
  addToWishlist: async (productId) => {
    return await backendRequest('/users/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId: productId.toString() }),
    });
  },
  
  removeFromWishlist: async (productId) => {
    return await backendRequest(`/users/wishlist/${productId}`, {
      method: 'DELETE',
    });
  }
};

// ============ HELPER FUNCTIONS ============

// Convert DummyJSON product to your format
export const formatDummyProduct = (dummyProduct) => {
  // Defensive normalizer: accept multiple shapes (dummyjson, fakestore, local sample)
  if (!dummyProduct) return null;

  const id = dummyProduct.id ?? dummyProduct._id ?? dummyProduct.productId ?? String(dummyProduct.sku || dummyProduct.name || Date.now());
  const name = dummyProduct.title ?? dummyProduct.name ?? dummyProduct.productName ?? 'Product';

  // Price conversion: if price looks small (dummyjson in USD), convert to Naira; if already large assume Naira
  let priceRaw = dummyProduct.price ?? dummyProduct.priceInNaira ?? 0;
  let price = Number(priceRaw) || 0;
  if (price > 0 && price < 1000) {
    // likely a USD price from external API; convert to Naira using ~1600 rate used elsewhere
    price = Math.round(price * 1600);
  } else {
    price = Math.round(price);
  }

  const originalPrice = (dummyProduct.originalPrice || (price > 0 ? Math.round(price * 1.2) : null));
  const category = dummyProduct.category ?? dummyProduct.cat ?? 'general';
  const image = dummyProduct.thumbnail || dummyProduct.image || dummyProduct.images?.[0] || dummyProduct.imageUrl || null;
  const description = dummyProduct.description ?? dummyProduct.desc ?? '';

  // Determine rating robustly
  const ratingVal = (typeof dummyProduct.rating === 'number') ? dummyProduct.rating : (dummyProduct.rating?.rate || 4.0);

  // Determine stock / inStock: default to true when unknown
  let inStock = true;
  if (typeof dummyProduct.inStock === 'boolean') {
    inStock = dummyProduct.inStock;
  } else if (typeof dummyProduct.stock === 'number') {
    inStock = dummyProduct.stock > 0;
  } else if (typeof dummyProduct.available === 'number') {
    inStock = dummyProduct.available > 0;
  } else if (typeof dummyProduct.available === 'boolean') {
    inStock = dummyProduct.available;
  } else {
    // Unknown stock information -> assume available so UI doesn't block users
    inStock = true;
  }

  return {
    id,
    name,
    price,
    originalPrice,
    category,
    image,
    description,
    rating: ratingVal,
    reviews: dummyProduct.reviews ?? Math.floor(Math.random() * 200) + 10,
    inStock,
    featured: (typeof ratingVal === 'number' && ratingVal > 4.5),
    tags: [dummyProduct.brand, dummyProduct.category, dummyProduct.tags].flat().filter(Boolean)
  };
};

// Get product details for cart/wishlist items
export const getProductDetails = async (productIds) => {
  try {
    const promises = productIds.map(async (id) => {
      const result = await productsAPI.getById(id);
      if (result.success) {
        return formatDummyProduct(result.data);
      }
      return null;
    });
    
    const results = await Promise.all(promises);
    const products = results.filter(Boolean);
    
    return { data: products, success: true };
  } catch (error) {
    console.error('Error fetching product details:', error);
    return { error: error.message, success: false };
  }
};

// Payment helper functions
export const paymentHelpers = {
  // Create payment data for order
  createPaymentData: (orderData, user) => {
    return {
      email: user.email,
      amount: orderData.total,
      orderId: orderData.id || `order_${Date.now()}`,
      metadata: {
        userId: user.id,
        userName: user.name,
        orderItems: orderData.items?.length || 0,
        paymentMethod: orderData.paymentMethod
      }
    };
  },
  
  // Handle payment success
  handlePaymentSuccess: async (reference, orderData) => {
    try {
      // Verify payment
      const verifyResult = await paymentAPI.verify(reference);
      
      if (verifyResult.success) {
        // Update order with payment info
        const updatedOrder = {
          ...orderData,
          paymentReference: reference,
          paymentStatus: 'completed',
          status: 'confirmed',
          paidAt: new Date().toISOString()
        };
        
        return { success: true, data: updatedOrder };
      }
      
      return { success: false, error: 'Payment verification failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Main API object
const API = {
  auth: authAPI,
  products: productsAPI,
  cart: cartAPI,
  orders: ordersAPI,
  payment: paymentAPI, // Added payment API
  users: usersAPI,
  helpers: {
    getProductDetails,
    formatDummyProduct,
    payment: paymentHelpers // Added payment helpers
  }
};

export default API;