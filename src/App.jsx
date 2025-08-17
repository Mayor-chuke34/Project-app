import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Checkout from './pages/Checkout';
import ProductCard from './components/ProductCard';

import About from './pages/About';
import Contact from './pages/Contact';
import API from './utils/api';
import { DEFAULT_PLACEHOLDER, placeholderDataURI } from './utils/placeholders';
import { formatPriceDisplay } from './utils/currency';

const App = () => {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);

  // Check for existing session and sync cart on app load
  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      try {
        const savedUserData = localStorage.getItem('naijaShopUser');

        if (savedUserData) {
          let parsedData = null;
          try {
            parsedData = JSON.parse(savedUserData);
          } catch (err) {
            console.error('Corrupt stored user, clearing:', err);
            localStorage.removeItem('naijaShopUser');
            parsedData = null;
          }

          if (parsedData && parsedData.data?.token && parsedData.data?.user) {
            // Restore user immediately so UI stays logged in
            console.debug('Restoring user from localStorage:', parsedData.data.user);
            setUser(parsedData.data.user);

            // Verify token (blocking) but don't destroy session on transient/network errors
              try {
              console.debug('Verifying token with backend...');
              const result = await API.auth.verifyToken();
              if (result && result.success) {
                // Extend local expiration and update user if backend returned fresh user
                const updatedData = {
                  ...parsedData,
                  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                };
                localStorage.setItem('naijaShopUser', JSON.stringify(updatedData));
                if (result.data?.user) setUser(result.data.user);
              } else if (result && result.status === 401) {
                // Token explicitly invalid -> force logout
                localStorage.removeItem('naijaShopUser');
                localStorage.removeItem('naijaShopCart');
                setUser(null);
              } else {
                // verification failed for other reasons (don't clear session)
                console.warn('Token verification returned non-success:', result);
              }
            } catch (err) {
              console.error('Token verification network/error (keeping session):', err);
            }

            // Try loading cart from backend; if it fails we'll fallback to local cart inside the function
            console.debug('Calling loadCartFromBackend after restoring user');
            await loadCartFromBackend();
          }
        } else {
          // No persisted user, try load local cart
          const savedCart = localStorage.getItem('naijaShopCart');
          if (savedCart) {
            try {
              const localCart = JSON.parse(savedCart);
              setCartItems(localCart);
            } catch (error) {
              console.error('Error parsing saved cart:', error);
              localStorage.removeItem('naijaShopCart');
            }
          }
        }

        // Load initial products from DummyJSON
        await loadProducts();
      } catch (error) {
        console.error('Error in app initialization:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Load products from DummyJSON
  const loadProducts = async () => {
    try {
      const result = await API.products.getAll(20, 0);
      // prepare a small local sample fallback
  const sample = Array.from({ length: 8 }).map((_, i) => API.helpers.formatDummyProduct({
        id: `local_${i}`,
        title: `Sample Product ${i+1}`,
        price: (i + 1) * 10,
        description: 'Locally generated sample product for fallback',
  thumbnail: placeholderDataURI(400,400,`Sample Product ${i+1}`),
        rating: 4.0,
        stock: 10,
        brand: 'Local'
      }));

      if (result && result.success) {
        // result.data may be { products: [...] } or an array
        const productsArr = result.data?.products || result.data || [];
        const formattedProducts = (productsArr || []).map(product => {
          try {
            return API.helpers.formatDummyProduct(product);
          } catch (e) {
            // If formatting fails, skip this item
            console.warn('Failed to format product, using raw item', e, product);
            return null;
          }
        }).filter(Boolean);

        if (formattedProducts.length > 0) {
          setProducts(formattedProducts);
          return;
        }
      }

      // fallback to sample if API failed or returned no items
      console.warn('loadProducts: using local sample fallback');
      setProducts(sample);
    } catch (error) {
      console.error('Error loading products:', error);
      // Ensure UI recovers with a fallback sample
      const sample = Array.from({ length: 8 }).map((_, i) => API.helpers.formatDummyProduct({
        id: `local_${i}`,
        title: `Sample Product ${i+1}`,
        price: (i + 1) * 10,
        description: 'Locally generated sample product for fallback',
        thumbnail: placeholderDataURI(400,400,`Sample Product ${i+1}`),
        rating: 4.0,
        stock: 10,
        brand: 'Local'
      }));
      setProducts(sample);
    }
  };

  // Load cart from backend
  const loadCartFromBackend = async () => {
    try {
      // Check if user is logged in
      const stored = localStorage.getItem('naijaShopUser');
      let token = null;
      try {
        const parsed = stored ? JSON.parse(stored) : null;
        token = parsed?.data?.token || null;
      } catch (err) {
        token = null;
      }

      if (!token) {
        // If no token, load from localStorage
        const localCart = JSON.parse(localStorage.getItem('naijaShopCart') || '[]');
        setCartItems(localCart);
        return;
      }

  console.debug('Calling API.cart.getCart with token:', token && token.slice ? token.slice(0,10) + '...' : token);
  const result = await API.cart.getCart();
  console.debug('API.cart.getCart result:', result);
      if (!result.success) {
        if (result.status === 401) {
          // explicit unauthorized - clear session
          localStorage.removeItem('naijaShopUser');
          localStorage.removeItem('naijaShopCart');
          setUser(null);
          return;
        }
        throw new Error(result.error || 'Failed to load cart');
      }

      const backendCart = result.data.cart || [];
      
      // Get product details for cart items from DummyJSON
      if (backendCart.length > 0) {
        const productIds = backendCart.map(item => item.productId);
        const productDetails = await API.helpers.getProductDetails(productIds);
        
        if (productDetails.success) {
          // Merge cart quantities with product details
          const mergedCart = backendCart.map(cartItem => {
            const product = productDetails.data.find(p => p.id.toString() === cartItem.productId);
            return product ? {
              ...product,
              quantity: cartItem.quantity,
              addedAt: cartItem.addedAt
            } : null;
          }).filter(Boolean);
          
          setCartItems(mergedCart);
          
          // Clear localStorage cart since we loaded from backend
          localStorage.removeItem('naijaShopCart');
        } else {
          throw new Error('Failed to load product details');
        }
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error loading cart from backend:', error);
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        // Handle unauthorized error
        localStorage.removeItem('naijaShopUser');
        setUser(null);
      }
      // Fallback to localStorage cart if backend fails
      const localCart = JSON.parse(localStorage.getItem('naijaShopCart') || '[]');
      setCartItems(localCart);
    }
  };

  // Handle user login
  const handleLogin = async (userData) => {
    try {
      if (!userData.success || !userData.data) {
        throw new Error('Invalid login response');
      }

      // Store the complete user data structure
      const dataToStore = {
        data: {
          user: userData.data.user,
          token: userData.data.token
        },
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      // First store in localStorage to ensure persistence
      localStorage.setItem('naijaShopUser', JSON.stringify(dataToStore));
  console.debug('Stored naijaShopUser after login:', dataToStore);
      
      // Then update the state
      setUser(userData.data.user);
      
      // Handle cart synchronization
      const localCart = localStorage.getItem('naijaShopCart');
      if (localCart) {
        try {
          const parsedCart = JSON.parse(localCart);
          // Add local cart items to backend one by one
          for (const item of parsedCart) {
            await API.cart.addToCart(item.id, item.quantity);
          }
          // Only remove local cart after successful sync
          localStorage.removeItem('naijaShopCart');
        } catch (error) {
          console.error('Error syncing local cart:', error);
          // Don't throw here - cart sync failure shouldn't affect login
        }
      }
      
      // Finally load cart from backend
      await loadCartFromBackend();
    } catch (error) {
      console.error('Login error:', error);
      // Clear any partial data on error
      localStorage.removeItem('naijaShopUser');
      setUser(null);
      throw error;
    }
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      await API.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setUser(null);
    setCartItems([]);
    localStorage.removeItem('naijaShopUser');
    localStorage.removeItem('naijaShopCart');
  };

  // Add item to cart (improved error handling)
  const handleAddToCart = async (product) => {
    if (!user) {
      // User not logged in, store in localStorage
      const localCart = JSON.parse(localStorage.getItem('naijaShopCart') || '[]');
      const existingItem = localCart.find(item => item.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        localCart.push({ ...product, quantity: 1 });
      }
      
      localStorage.setItem('naijaShopCart', JSON.stringify(localCart));
      setCartItems(localCart);
      
      // Show success message
      alert(`${product.name} added to cart!`);
      return;
    }

    try {
      // User logged in, add to backend
      const result = await API.cart.addToCart(product.id, 1);
      if (result.success) {
        await loadCartFromBackend(); // Refresh cart
        alert(`${product.name} added to cart!`);
      } else {
        // If backend reports missing route/failed call, fallback to local cart so UI can proceed
        console.warn('Backend addToCart failed, falling back to local cart:', result);
        const localCart = JSON.parse(localStorage.getItem('naijaShopCart') || '[]');
        const existingItem = localCart.find(item => item.id === product.id);
        if (existingItem) existingItem.quantity += 1;
        else localCart.push({ ...product, quantity: 1 });
        localStorage.setItem('naijaShopCart', JSON.stringify(localCart));
        setCartItems(localCart);
        alert(`${product.name} added to cart (local fallback).`);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      // On unexpected error, also fallback to local cart so user can reach checkout
      console.warn('Falling back to local cart due to exception:', error);
      const localCart = JSON.parse(localStorage.getItem('naijaShopCart') || '[]');
      const existingItem = localCart.find(item => item.id === product.id);
      if (existingItem) existingItem.quantity += 1;
      else localCart.push({ ...product, quantity: 1 });
      localStorage.setItem('naijaShopCart', JSON.stringify(localCart));
      setCartItems(localCart);
      alert(`${product.name} added to cart (local fallback).`);
    }
  };

  // Update cart item quantity
  const updateCartQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    if (!user) {
      // Update localStorage
      const localCart = JSON.parse(localStorage.getItem('naijaShopCart') || '[]');
      const updatedCart = localCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
      
      localStorage.setItem('naijaShopCart', JSON.stringify(updatedCart));
      setCartItems(updatedCart);
      return;
    }

    try {
      const result = await API.cart.updateCartItem(productId, quantity);
      if (result.success) {
        await loadCartFromBackend();
      } else {
        console.warn('updateCartItem failed, falling back to local cart:', result);
        // fallback: update localStorage cart
        const localCart = JSON.parse(localStorage.getItem('naijaShopCart') || '[]');
        const updatedCart = localCart.map(item => item.id === productId ? { ...item, quantity } : item);
        localStorage.setItem('naijaShopCart', JSON.stringify(updatedCart));
        setCartItems(updatedCart);
        return;
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      console.warn('Falling back to local cart due to exception:', error);
      const localCart = JSON.parse(localStorage.getItem('naijaShopCart') || '[]');
      const updatedCart = localCart.map(item => item.id === productId ? { ...item, quantity } : item);
      localStorage.setItem('naijaShopCart', JSON.stringify(updatedCart));
      setCartItems(updatedCart);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    if (!user) {
      // Update localStorage
      const localCart = JSON.parse(localStorage.getItem('naijaShopCart') || '[]');
      const updatedCart = localCart.filter(item => item.id !== productId);
      
      localStorage.setItem('naijaShopCart', JSON.stringify(updatedCart));
      setCartItems(updatedCart);
      return;
    }

    try {
      const result = await API.cart.removeFromCart(productId);
      if (result.success) {
        await loadCartFromBackend();
      } else {
        console.warn('removeFromCart failed, falling back to local cart:', result);
        const localCart = JSON.parse(localStorage.getItem('naijaShopCart') || '[]');
        const updatedCart = localCart.filter(item => item.id !== productId);
        localStorage.setItem('naijaShopCart', JSON.stringify(updatedCart));
        setCartItems(updatedCart);
        return;
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      console.warn('Falling back to local cart remove due to exception:', error);
      const localCart = JSON.parse(localStorage.getItem('naijaShopCart') || '[]');
      const updatedCart = localCart.filter(item => item.id !== productId);
      localStorage.setItem('naijaShopCart', JSON.stringify(updatedCart));
      setCartItems(updatedCart);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!user) {
      localStorage.removeItem('naijaShopCart');
      setCartItems([]);
      return;
    }

    try {
      const result = await API.cart.clearCart();
      if (result.success) {
        setCartItems([]);
      } else {
        throw new Error(result.error || 'Failed to clear cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Error clearing cart: ' + error.message);
    }
  };

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    return user ? children : <Navigate to="/" replace />;
  };

  // Admin Route Component (fixed admin check)
  const AdminRoute = ({ children }) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    // Check if user is admin (checking both possible structures)
    const isAdmin = user?.isAdmin || user?.user?.isAdmin;
    return user && isAdmin ? children : <Navigate to="/dashboard" replace />;
  };

  // Cart Page Component
  const CartPage = () => {
    const navigate = useNavigate();
    const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    const handleProceedToCheckout = () => {
      if (cartItems.length > 0) {
        navigate('/checkout');
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
          
          {cartItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-gray-600 mb-4">Your cart is empty</p>
              <button 
                onClick={() => navigate('/home')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-6 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={item.image || DEFAULT_PLACEHOLDER} 
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = DEFAULT_PLACEHOLDER;
                        }}
                      />
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-gray-600">{formatPriceDisplay(item.price)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="font-medium min-w-[2rem] text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                      
                      <p className="font-semibold min-w-[6rem] text-right">
                        {formatPriceDisplay(item.price * item.quantity)}
                      </p>
                      
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-800 ml-4"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-semibold">
                    Total: {formatPriceDisplay(totalAmount)}
                  </span>
                </div>
                <button 
                  onClick={handleProceedToCheckout}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Products Page Component using DummyJSON
  const ProductsPage = () => {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">All Products</h1>
          {products.length === 0 ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Show Navbar only when user is logged in */}
      {user && (
        <Navbar 
          cartItems={cartItems} 
          user={user} 
          onLogout={handleLogout}
        />
      )}

      <Routes>
        {/* Landing Page - shown when not logged in */}
        <Route 
          path="/" 
          element={
            user ? (
              (user?.isAdmin || user?.user?.isAdmin) ? 
                <Navigate to="/dashboard" replace /> : 
                <Navigate to="/home" replace />
            ) : (
              <LandingPage onLogin={handleLogin} />
            )
          } 
        />

        {/* Protected Routes */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home onAddToCart={handleAddToCart} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/products" 
          element={
            <ProtectedRoute>
              <ProductsPage />
            </ProtectedRoute>
          } 
        />



        <Route 
          path="/about" 
          element={
            <ProtectedRoute>
              <About />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/contact" 
          element={
            <ProtectedRoute>
              <Contact />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/cart" 
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/checkout" 
          element={
            <ProtectedRoute>
              <Checkout 
                cartItems={cartItems}
                user={user}
                cartTotal={cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)}
                onClearCart={clearCart}
              />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard user={user} />
            </ProtectedRoute>
          } 
        />

        {/* Admin Dashboard Route */}
        <Route 
          path="/admin-dashboard" 
          element={
            <AdminRoute>
              <Dashboard user={user} />
            </AdminRoute>
          } 
        />

        {/* Placeholder routes */}
        <Route 
          path="/about" 
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                  <h1 className="text-3xl font-bold mb-8">About Us</h1>
                  <div className="bg-white rounded-lg shadow-sm p-8">
                    <p className="text-gray-600">About page content coming soon...</p>
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          } 
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;