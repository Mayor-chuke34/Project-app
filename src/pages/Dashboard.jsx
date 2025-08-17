import React, { useState, useEffect } from 'react';
import {
    User, ShoppingBag, Heart, Settings, CreditCard, MapPin, Bell, Eye, Download,
    Package, Plus, Edit, Trash2, Users, BarChart3, DollarSign, TrendingUp,
    AlertCircle, CheckCircle, Clock, Truck, X
} from 'lucide-react';
import API from '../utils/api';
import { formatPriceDisplay } from '../utils/currency';

const Dashboard = ({ user }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [userOrders, setUserOrders] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        category: '',
        description: '',
        stock: '',
        image: ''
    });
    
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        city: user?.city || '',
        state: user?.state || '',
        country: user?.country || ''
    });

    const isAdmin = user?.isAdmin || user?.role === 'admin';

    const loadOrders = async () => {
        try {
            const response = await API.orders.getUserOrders();
            if (response.success) {
                setUserOrders(response.data || []);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    };

    const loadWishlist = async () => {
        try {
            const response = await API.users.getWishlist();
            if (response.success) {
                setWishlistItems(response.data || []);
            }
        } catch (error) {
            console.error('Error loading wishlist:', error);
        }
    };

    const loadUserData = async () => {
        try {
            const response = await API.users.getProfile();
            if (response.success) {
                setProfileData({
                    ...profileData,
                    ...response.data
                });
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    useEffect(() => {
        const initializeDashboard = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    loadOrders(),
                    loadWishlist(),
                    loadUserData()
                ]);
            } catch (error) {
                console.error('Error initializing dashboard:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        initializeDashboard();
    }, []);

    // API call function
    const apiCall = async (endpoint, options = {}) => {
        try {
            setLoading(true);
            setError(null);
            
                    const base = API.baseURL || '/api';
                    const url = `${base}${endpoint}`;

                    // Get token from localStorage safely
                    let token = null;
                    try {
                        const stored = localStorage.getItem('naijaShopUser');
                        const parsed = stored ? JSON.parse(stored) : null;
                        token = parsed?.data?.token || null;
                    } catch (err) {
                        token = null;
                    }

                    const defaultOptions = {
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token && { Authorization: `Bearer ${token}` }),
                            ...(token && { 'x-auth-token': token })
                        },
                    };

            const config = {
                ...defaultOptions,
                ...options,
                headers: {
                    ...defaultOptions.headers,
                    ...options.headers,
                },
            };

            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }
            
            return { data, success: true };
            
        } catch (err) {
            console.error('API call failed:', err);
            setError(err.message);
            return { error: err.message, success: false };
        } finally {
            setLoading(false);
        }
    };

    // Load initial data
    useEffect(() => {
        loadDashboardData();
    }, [user]);

    const loadDashboardData = async () => {
        if (isAdmin) {
            // Load all data for admin
            const [ordersRes, productsRes, usersRes] = await Promise.all([
                apiCall('/orders/all'),
                apiCall('/products'),
                apiCall('/users')
            ]);
            
            if (ordersRes.success) setAllOrders(ordersRes.data);
            if (productsRes.success) setAllProducts(productsRes.data);
            if (usersRes.success) setAllUsers(usersRes.data);
        } else {
            // Load user-specific data
            const [ordersRes, wishlistRes] = await Promise.all([
                apiCall('/orders/user'),
                apiCall('/wishlist')
            ]);
            
            if (ordersRes.success) setUserOrders(ordersRes.data);
            if (wishlistRes.success) setWishlistItems(wishlistRes.data);
        }
    };

    // Add product function (admin only)
    const handleAddProduct = async (e) => {
        e.preventDefault();
        
        if (!newProduct.name || !newProduct.price || !newProduct.category || !newProduct.stock) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            const response = await apiCall('/products', {
                method: 'POST',
                body: JSON.stringify({
                    ...newProduct,
                    price: parseFloat(newProduct.price),
                    stock: parseInt(newProduct.stock)
                })
            });

            if (response.success) {
                // Update local state
                setAllProducts(prev => [...prev, response.data]);
                
                // Reset form
                setNewProduct({ name: '', price: '', category: '', description: '', stock: '', image: '' });
                setActiveTab('products');
                
                alert('Product added successfully!');
            }
            
        } catch (err) {
            setError('Failed to add product: ' + err.message);
        }
    };

    // Update product function (admin only)
    const handleUpdateProduct = async (productId, updates) => {
        try {
            const response = await apiCall(`/products/${productId}`, {
                method: 'PUT',
                body: JSON.stringify(updates)
            });

            if (response.success) {
                setAllProducts(prev => 
                    prev.map(product => 
                        product.id === productId ? { ...product, ...updates } : product
                    )
                );
                alert('Product updated successfully!');
            }
        } catch (err) {
            setError('Failed to update product: ' + err.message);
        }
    };

    // Delete product function (admin only)
    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        
        try {
            const response = await apiCall(`/products/${productId}`, {
                method: 'DELETE'
            });

            if (response.success) {
                setAllProducts(prev => prev.filter(product => product.id !== productId));
                alert('Product deleted successfully!');
            }
        } catch (err) {
            setError('Failed to delete product: ' + err.message);
        }
    };

    // Update order status function (admin only)
    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            const response = await apiCall(`/orders/${orderId}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus })
            });

            if (response.success) {
                setAllOrders(prev =>
                    prev.map(order =>
                        order.id === orderId ? { ...order, status: newStatus } : order
                    )
                );
                alert('Order status updated successfully!');
            }
        } catch (err) {
            setError('Failed to update order status: ' + err.message);
        }
    };

    // Delete order function
    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to delete this order?')) return;
        
        try {
            const response = await apiCall(`/orders/${orderId}`, {
                method: 'DELETE'
            });

            if (response.success) {
                if (isAdmin) {
                    setAllOrders(prev => prev.filter(order => order.id !== orderId));
                } else {
                    setUserOrders(prev => prev.filter(order => order.id !== orderId));
                }
                alert('Order deleted successfully!');
            }
        } catch (err) {
            setError('Failed to delete order: ' + err.message);
        }
    };

    // Update profile function
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        
        try {
            const response = await apiCall('/auth/profile', {
                method: 'PUT',
                body: JSON.stringify(profileData)
            });

            if (response.success) {
                alert('Profile updated successfully!');
            }
        } catch (err) {
            setError('Failed to update profile: ' + err.message);
        }
    };

    // Navigation tabs based on user role
    const userTabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'orders', label: 'My Orders', icon: ShoppingBag },
        { id: 'wishlist', label: 'Wishlist', icon: Heart },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'settings', label: 'Settings', icon: Settings }
    ];

    const adminTabs = [
        { id: 'overview', label: 'Dashboard', icon: BarChart3 },
        { id: 'orders', label: 'All Orders', icon: ShoppingBag },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'add-product', label: 'Add Product', icon: Plus },
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'analytics', label: 'Analytics', icon: TrendingUp },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'settings', label: 'Settings', icon: Settings }
    ];

    const tabs = isAdmin ? adminTabs : userTabs;

    // Error display component
    const ErrorAlert = () => error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
                <button 
                    onClick={() => setError(null)}
                    className="ml-auto text-red-500 hover:text-red-700"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    // Loading spinner component
    const LoadingSpinner = () => (
        <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading...</span>
        </div>
    );

    const renderUserOverview = () => {
        const userStats = {
            totalOrders: userOrders.length,
            totalSpent: userOrders.reduce((sum, order) => sum + (order.total || 0), 0),
            wishlistCount: wishlistItems.length
        };

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100">Total Orders</p>
                                <p className="text-3xl font-bold">{userStats.totalOrders}</p>
                            </div>
                            <ShoppingBag className="w-8 h-8 text-blue-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100">Total Spent</p>
                                <p className="text-3xl font-bold">{formatPriceDisplay(userStats.totalSpent)}</p>
                            </div>
                            <CreditCard className="w-8 h-8 text-green-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100">Wishlist Items</p>
                                <p className="text-3xl font-bold">{userStats.wishlistCount}</p>
                            </div>
                            <Heart className="w-8 h-8 text-purple-200" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
                    {userOrders.length === 0 ? (
                        <div className="text-center py-8">
                            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">No orders yet</p>
                            <p className="text-sm text-gray-500">Start shopping to see your orders here!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {userOrders.slice(0, 3).map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium">{order.id}</p>
                                        <p className="text-sm text-gray-600">{new Date(order.orderDate || order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{formatPriceDisplay(order.total)}</p>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                            order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderAdminOverview = () => {
        const adminStats = {
            totalOrders: allOrders.length,
            totalRevenue: allOrders.reduce((sum, order) => sum + (order.total || 0), 0),
            totalProducts: allProducts.length,
            lowStockProducts: allProducts.filter(p => parseInt(p.stock || 0) < 10).length,
            totalCustomers: allUsers.filter(u => u.role !== 'admin').length
        };

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100">Total Orders</p>
                                <p className="text-3xl font-bold">{adminStats.totalOrders}</p>
                            </div>
                            <ShoppingBag className="w-8 h-8 text-blue-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100">Revenue</p>
                                <p className="text-3xl font-bold">{formatPriceDisplay(adminStats.totalRevenue)}</p>
                            </div>
                            <DollarSign className="w-8 h-8 text-green-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100">Products</p>
                                <p className="text-3xl font-bold">{adminStats.totalProducts}</p>
                            </div>
                            <Package className="w-8 h-8 text-purple-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100">Customers</p>
                                <p className="text-3xl font-bold">{adminStats.totalCustomers}</p>
                            </div>
                            <Users className="w-8 h-8 text-orange-200" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
                        {allOrders.length === 0 ? (
                            <div className="text-center py-8">
                                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600">No orders yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {allOrders.slice(0, 4).map((order) => (
                                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium">{order.id}</p>
                                            <p className="text-sm text-gray-600">{order.fullName || order.customerName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">{formatPriceDisplay(order.total)}</p>
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                                                order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold mb-4">Low Stock Alert</h3>
                        {allProducts.filter(p => parseInt(p.stock || 0) < 10).length === 0 ? (
                            <div className="text-center py-8">
                                <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
                                <p className="text-gray-600">All products well stocked!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {allProducts.filter(p => parseInt(p.stock || 0) < 10).map((product) => (
                                    <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                        <div>
                                            <p className="font-medium">{product.name}</p>
                                            <p className="text-sm text-gray-600">{product.category}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-red-600">{product.stock || 0} left</p>
                                            <AlertCircle className="w-4 h-4 text-red-500 inline" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Continue with other render methods...
    const renderOrders = () => {
        const ordersToShow = isAdmin ? allOrders : userOrders;

        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">{isAdmin ? 'All Orders' : 'My Orders'}</h3>
                {loading ? <LoadingSpinner /> : 
                ordersToShow.length === 0 ? (
                    <div className="text-center py-8">
                        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No orders found</p>
                        {!isAdmin && (
                            <p className="text-sm text-gray-500 mt-2">Start shopping to see your orders here!</p>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4">Order ID</th>
                                    {isAdmin && <th className="text-left py-3 px-4">Customer</th>}
                                    <th className="text-left py-3 px-4">Date</th>
                                    <th className="text-left py-3 px-4">Status</th>
                                    <th className="text-left py-3 px-4">Total</th>
                                    <th className="text-left py-3 px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ordersToShow.map((order) => (
                                    <tr key={order.id} className="border-b border-gray-100">
                                        <td className="py-3 px-4 font-medium">{order.id}</td>
                                        {isAdmin && <td className="py-3 px-4">{order.fullName || order.customerName}</td>}
                                        <td className="py-3 px-4">{new Date(order.orderDate || order.createdAt).toLocaleDateString()}</td>
                                        <td className="py-3 px-4">
                                            {isAdmin ? (
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                                    className="text-xs px-2 py-1 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Processing">Processing</option>
                                                    <option value="Shipped">Shipped</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            ) : (
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                                                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                                    order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 font-medium">{formatPriceDisplay(order.total)}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex space-x-2">
                                                <button className="text-blue-600 hover:text-blue-800" title="View Details">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteOrder(order.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                    title="Delete Order"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    // ... (continue with other render methods - renderProducts, renderAddProduct, etc.)
    // I'll include the essential ones for brevity

    const renderProducts = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Product Management</h3>
                <button
                    onClick={() => setActiveTab('add-product')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Product</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {loading ? <LoadingSpinner /> : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4">Product</th>
                                    <th className="text-left py-3 px-4">Category</th>
                                    <th className="text-left py-3 px-4">Price</th>
                                    <th className="text-left py-3 px-4">Stock</th>
                                    <th className="text-left py-3 px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allProducts.map((product) => (
                                    <tr key={product.id} className="border-b border-gray-100">
                                        <td className="py-3 px-4 font-medium">{product.name}</td>
                                        <td className="py-3 px-4">{product.category}</td>
                                        <td className="py-3 px-4 font-medium">{formatPriceDisplay(parseFloat(product.price || 0))}</td>
                                        <td className="py-3 px-4">
                                            <span className={parseInt(product.stock || 0) < 10 ? 'text-red-600 font-medium' : 'text-green-600'}>
                                                {product.stock || 0}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex space-x-2">
                                                <button 
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="Edit Product"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                    title="Delete Product"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

    const renderAddProduct = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Add New Product</h3>
                <button
                    onClick={() => setActiveTab('products')}
                    className="text-gray-600 hover:text-gray-800"
                >
                    Back to Products
                </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                        <input
                            type="text"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price (₦) *</label>
                        <input
                            type="number"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                            min="1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                        <select
                            value={newProduct.category}
                            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        >
                            <option value="">Select Category</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Fashion">Fashion</option>
                            <option value="Sports">Sports</option>
                            <option value="Home & Garden">Home & Garden</option>
                            <option value="Books">Books</option>
                            <option value="Beauty">Beauty</option>
                            <option value="Automotive">Automotive</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                        <input
                            type="number"
                            value={newProduct.stock}
                            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                            min="0"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        placeholder="Enter product description..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Image URL</label>
                    <input
                        type="url"
                        value={newProduct.image}
                        onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/image.jpg"
                    />
                </div>

                <div className="flex space-x-4 pt-4">
                    <button
                        type="submit"
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        disabled={loading}
                    >
                        {loading ? 'Adding Product...' : 'Add Product'}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setNewProduct({ name: '', price: '', category: '', description: '', stock: '', image: '' });
                        }}
                        className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Reset
                    </button>
                </div>
            </form>
        </div>
    );

    // Continue with other render functions...
    const renderCustomers = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Customer Management</h3>
            {loading ? <LoadingSpinner /> : 
            allUsers.filter(u => u.role !== 'admin').length === 0 ? (
                <div className="text-center py-8">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No customers found</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4">Name</th>
                                <th className="text-left py-3 px-4">Email</th>
                                <th className="text-left py-3 px-4">Join Date</th>
                                <th className="text-left py-3 px-4">Orders</th>
                                <th className="text-left py-3 px-4">Total Spent</th>
                                <th className="text-left py-3 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allUsers.filter(u => u.role !== 'admin').map((customer) => {
                                const customerOrders = allOrders.filter(o => o.userId === customer.id);
                                const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total || 0), 0);
                                
                                return (
                                    <tr key={customer.id} className="border-b border-gray-100">
                                        <td className="py-3 px-4 font-medium">{customer.name}</td>
                                        <td className="py-3 px-4">{customer.email}</td>
                                        <td className="py-3 px-4">{new Date(customer.joinDate || customer.createdAt).toLocaleDateString()}</td>
                                        <td className="py-3 px-4">{customerOrders.length}</td>
                                        <td className="py-3 px-4 font-medium">{formatPriceDisplay(totalSpent)}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex space-x-2">
                                                <button className="text-blue-600 hover:text-blue-800" title="View Details">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="text-green-600 hover:text-green-800" title="Send Message">
                                                    <Bell className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    const renderWishlist = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">My Wishlist</h3>
            {loading ? <LoadingSpinner /> :
            wishlistItems.length === 0 ? (
                <div className="text-center py-8">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Your wishlist is empty</p>
                    <p className="text-sm text-gray-500">Add products to your wishlist to see them here!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlistItems.map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <Package className="w-8 h-8 text-gray-400" />
                                )}
                            </div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-blue-600 font-semibold">{formatPriceDisplay(item.price)}</p>
                            <div className="flex space-x-2 mt-3">
                                <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm">
                                    Add to Cart
                                </button>
                                <button className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderProfile = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                            type="text"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                            type="text"
                            value={profileData.city}
                            onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                        <input
                            type="text"
                            value={profileData.state}
                            onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                        <input
                            type="text"
                            value={profileData.country}
                            onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                        value={profileData.address}
                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    disabled={loading}
                >
                    {loading ? 'Updating Profile...' : 'Update Profile'}
                </button>
            </form>
        </div>
    );

    const renderAnalytics = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4">Sales Overview</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">This Month</span>
                            <span className="font-semibold">{formatPriceDisplay(allOrders.reduce((sum, order) => sum + (order.total || 0), 0))}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Orders This Month</span>
                            <span className="font-semibold">{allOrders.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Average Order Value</span>
                            <span className="font-semibold">
                                {formatPriceDisplay(allOrders.length > 0 ? Math.round(allOrders.reduce((sum, order) => sum + (order.total || 0), 0) / allOrders.length) : 0)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4">Top Categories</h3>
                    <div className="space-y-3">
                        {['Electronics', 'Fashion', 'Sports'].map((category, index) => (
                            <div key={category} className="flex justify-between items-center">
                                <span className="text-gray-600">{category}</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-blue-600 h-2 rounded-full" 
                                            style={{ width: `${80 - index * 20}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium">{80 - index * 20}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                            <p className="font-medium">New order received</p>
                            <p className="text-sm text-gray-600">Order #ORD001 - ₦85,000</p>
                        </div>
                        <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <Package className="w-5 h-5 text-blue-600" />
                        <div>
                            <p className="font-medium">Product updated</p>
                            <p className="text-sm text-gray-600">Premium Headphones stock updated</p>
                        </div>
                        <span className="text-xs text-gray-500 ml-auto">4 hours ago</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        <div>
                            <p className="font-medium">Low stock alert</p>
                            <p className="text-sm text-gray-600">Leather Jacket - 8 items remaining</p>
                        </div>
                        <span className="text-xs text-gray-500 ml-auto">6 hours ago</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Settings</h3>
            <div className="space-y-6">
                <div>
                    <h4 className="font-medium mb-3">Notifications</h4>
                    <div className="space-y-3">
                        <label className="flex items-center">
                            <input type="checkbox" className="rounded" defaultChecked />
                            <span className="ml-2 text-sm">Email notifications for new orders</span>
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="rounded" defaultChecked />
                            <span className="ml-2 text-sm">Low stock alerts</span>
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="rounded" />
                            <span className="ml-2 text-sm">Weekly sales reports</span>
                        </label>
                    </div>
                </div>

                {isAdmin && (
                    <div>
                        <h4 className="font-medium mb-3">Store Settings</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                                <input
                                    type="text"
                                    defaultValue="NaijaShop"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    <option value="NGN">Nigerian Naira (₦)</option>
                                    <option value="USD">US Dollar ($)</option>
                                    <option value="EUR">Euro (€)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                <div>
                    <h4 className="font-medium mb-3">Security</h4>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Change Password
                    </button>
                </div>

                <div className="pt-4 border-t border-gray-200">
                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return isAdmin ? renderAdminOverview() : renderUserOverview();
            case 'orders':
                return renderOrders();
            case 'products':
                return renderProducts();
            case 'add-product':
                return renderAddProduct();
            case 'customers':
                return renderCustomers();
            case 'wishlist':
                return renderWishlist();
            case 'profile':
                return renderProfile();
            case 'analytics':
                return renderAnalytics();
            case 'settings':
                return renderSettings();
            default:
                return isAdmin ? renderAdminOverview() : renderUserOverview();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
                            </h1>
                            <p className="text-gray-600">
                                Welcome back, {user?.name}! {isAdmin && 'Manage your store efficiently.'}
                            </p>
                        </div>
                        {isAdmin && (
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setActiveTab('add-product')}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Quick Add</span>
                                </button>
                                <button
                                    onClick={loadDashboardData}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    disabled={loading}
                                >
                                    {loading ? 'Refreshing...' : 'Refresh Data'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Alert */}
                <ErrorAlert />

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-4">
                            <nav className="space-y-2">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                                activeTab === tab.id
                                                    ? 'bg-blue-100 text-blue-700 font-medium'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span>{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;