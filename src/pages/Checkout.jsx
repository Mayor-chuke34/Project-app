import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, CheckCircle, AlertCircle, X } from 'lucide-react';
import { ordersAPI, paymentAPI } from '../utils/api';
import { DEFAULT_PLACEHOLDER } from '../utils/placeholders';
import { formatPriceDisplay } from '../utils/currency';

const Checkout = ({ cartItems, user, cartTotal, onClearCart }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    paymentMethod: 'card'
  });

  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) formattedValue = formattedValue.substr(0, 19);
    }
    
    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      if (formattedValue.length > 5) formattedValue = formattedValue.substr(0, 5);
    }
    
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substr(0, 4);
    }

    setCardData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const required = ['fullName', 'email', 'phone', 'address', 'city', 'state'];
    
    for (let field of required) {
      if (!formData[field].trim()) {
        newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const phoneRegex = /^(\+234|0)[7-9][0-1][0-9]{8}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Nigerian phone number';
    }

    // Only validate card details for card payments
    if (formData.paymentMethod === 'card') {
      const cardRequired = ['cardNumber', 'expiryDate', 'cvv', 'cardName'];
      for (let field of cardRequired) {
        if (!cardData[field].trim()) {
          newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
        }
      }

      const cardNumberDigits = cardData.cardNumber.replace(/\s/g, '');
      if (cardData.cardNumber && cardNumberDigits.length !== 16) {
        newErrors.cardNumber = 'Please enter a valid 16-digit card number';
      }

      const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
      if (cardData.expiryDate && !expiryRegex.test(cardData.expiryDate)) {
        newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
      }

      if (cardData.expiryDate && expiryRegex.test(cardData.expiryDate)) {
        const [month, year] = cardData.expiryDate.split('/');
        const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
        const currentDate = new Date();
        if (expiryDate < currentDate) {
          newErrors.expiryDate = 'Card has expired';
        }
      }

      if (cardData.cvv && cardData.cvv.length < 3) {
        newErrors.cvv = 'Please enter a valid CVV';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const processPaystackPayment = async (orderData) => {
    try {
      // Initialize payment with Paystack
      const paymentData = {
        email: formData.email,
        amount: cartTotal,
        orderId: orderData.id,
        metadata: {
          userId: user.id,
          userName: formData.fullName,
          orderItems: cartItems.length,
          paymentMethod: formData.paymentMethod
        }
      };

      const initResult = await paymentAPI.initialize(paymentData);
      
      if (initResult.success) {
        // Redirect to Paystack payment page
        window.location.href = initResult.data.authorization_url;
      } else {
        throw new Error(initResult.error || 'Payment initialization failed');
      }
    } catch (error) {
      throw new Error(error.message || 'Payment processing failed');
    }
  };

  const simulateCashOnDelivery = async () => {
    // Simulate processing delay for COD
    await new Promise(resolve => setTimeout(resolve, 2000));
    return 'success';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      document.getElementsByName(firstErrorField)[0]?.focus();
      return;
    }

    setIsProcessing(true);
    setShowPaymentModal(true);

    try {
      // Prepare order data
      const orderData = {
        userId: user.id,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
        },
        paymentMethod: formData.paymentMethod,
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        total: cartTotal,
        status: formData.paymentMethod === 'cod' ? 'Confirmed' : 'Pending'
      };

      // Create order in database first
      const orderResponse = await ordersAPI.create(orderData);

      if (!orderResponse.success) {
        throw new Error(orderResponse.error || 'Failed to create order');
      }

      const createdOrder = orderResponse.data;

      // Handle different payment methods
      if (formData.paymentMethod === 'card') {
        // Process with Paystack
        await processPaystackPayment(createdOrder);
      } else if (formData.paymentMethod === 'cod') {
        // Simulate cash on delivery processing
        const result = await simulateCashOnDelivery();
        
        if (result === 'success') {
          setPaymentStatus('success');
          setOrderDetails(createdOrder);
          
          if (onClearCart) {
            onClearCart();
          }
        }
      } else if (formData.paymentMethod === 'transfer') {
        // For bank transfer, show success with transfer details
        setPaymentStatus('transfer');
        setOrderDetails(createdOrder);
        
        if (onClearCart) {
          onClearCart();
        }
      }
    } catch (error) {
      console.error('Order processing error:', error);
      setPaymentStatus('failed');
      setOrderDetails({ 
        ...formData, 
        total: cartTotal,
        error: error.message || 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseModal = () => {
    setShowPaymentModal(false);
    setPaymentStatus(null);
    if (paymentStatus === 'success' || paymentStatus === 'transfer') {
      navigate('/dashboard');
    }
  };

  const handleTryAgain = () => {
    setShowPaymentModal(false);
    setPaymentStatus(null);
    setErrors({});
  };

  // Redirect if cart is empty
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products before proceeding to checkout</p>
          <button 
            onClick={() => navigate('/products')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <button 
            onClick={() => navigate('/cart')}
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+234 800 123 4567"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Delivery Address</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full address"
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Lagos"
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select State</option>
                      <option value="Lagos">Lagos</option>
                      <option value="Abuja">Abuja</option>
                      <option value="Kano">Kano</option>
                      <option value="Rivers">Rivers</option>
                      <option value="Oyo">Oyo</option>
                      <option value="Kaduna">Kaduna</option>
                      <option value="Delta">Delta</option>
                      <option value="Edo">Edo</option>
                      <option value="Anambra">Anambra</option>
                      <option value="Ogun">Ogun</option>
                      <option value="Plateau">Plateau</option>
                      <option value="Cross River">Cross River</option>
                      <option value="Akwa Ibom">Akwa Ibom</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleInputChange}
                      className="mr-3 text-blue-600"
                    />
                    <div className="flex items-center">
                      <CreditCard className="w-6 h-6 mr-3 text-blue-600" />
                      <div>
                        <div className="font-medium">Debit/Credit Card</div>
                        <div className="text-sm text-gray-600">Secure payment with Paystack</div>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="transfer"
                      checked={formData.paymentMethod === 'transfer'}
                      onChange={handleInputChange}
                      className="mr-3 text-blue-600"
                    />
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🏦</span>
                      <div>
                        <div className="font-medium">Bank Transfer</div>
                        <div className="text-sm text-gray-600">Transfer to our account</div>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                      className="mr-3 text-blue-600"
                    />
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">💵</span>
                      <div>
                        <div className="font-medium">Cash on Delivery</div>
                        <div className="text-sm text-gray-600">Pay when you receive</div>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Card Details - Only for Paystack */}
                {formData.paymentMethod === 'card' && (
                  <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Lock className="w-5 h-5 mr-2 text-blue-600" />
                      Payment with Paystack
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      You'll be redirected to Paystack's secure payment page to complete your transaction.
                    </p>
                    <div className="flex items-center text-green-700 text-sm">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span>Secured by Paystack - Accept all Nigerian banks and cards</span>
                    </div>
                  </div>
                )}

                {/* Bank Transfer Details */}
                {formData.paymentMethod === 'transfer' && (
                  <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Bank Transfer Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Account Name:</strong> NaijaShop Nigeria Ltd</p>
                      <p><strong>Account Number:</strong> 0123456789</p>
                      <p><strong>Bank:</strong> Access Bank</p>
                      <p className="text-green-700 font-medium mt-3">
                        Use your order ID as transfer reference for quick processing.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Lock className="w-5 h-5 mr-2" />
                    {formData.paymentMethod === 'card' ? 'Proceed to Payment' : `Place Order - ${formatPriceDisplay(cartTotal)}`}
                  </div>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-8 h-fit">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <img 
                    src={item.image || DEFAULT_PLACEHOLDER} 
                    alt={item.name}
                    className="w-15 h-15 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    <p className="text-sm text-gray-600">{formatPriceDisplay(item.price)} each</p>
                  </div>
                  <p className="font-semibold text-blue-600 flex-shrink-0">{formatPriceDisplay(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-6 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cartItems.length} items):</span>
                <span>{formatPriceDisplay(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee:</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax:</span>
                <span>₦0</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 border-t border-gray-200 pt-3">
                <span>Total:</span>
                <span className="text-blue-600">{formatPriceDisplay(cartTotal)}</span>
              </div>
            </div>
            
            {/* Security Badge */}
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center text-green-800">
                <Lock className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Your payment is secured with 256-bit SSL encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Processing Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full relative">
            {isProcessing && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Your Order</h3>
                <p className="text-gray-600">Please wait while we process your order...</p>
                <div className="mt-4 text-sm text-gray-500">This may take a few seconds</div>
              </div>
            )}

            {paymentStatus === 'success' && (
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Successful!</h3>
                <p className="text-gray-600 mb-4">Your order has been placed successfully.</p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
                  <h4 className="font-medium text-green-800 mb-2">Order Details:</h4>
                    <div className="space-y-1 text-sm text-green-700">
                    <p><strong>Order ID:</strong> #{orderDetails?.id || 'N/A'}</p>
                    <p><strong>Amount:</strong> {formatPriceDisplay(orderDetails?.total || cartTotal)}</p>
                    <p><strong>Payment Method:</strong> {formData.paymentMethod.charAt(0).toUpperCase() + formData.paymentMethod.slice(1)}</p>
                    <p><strong>Status:</strong> Confirmed</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            )}

            {paymentStatus === 'transfer' && (
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🏦</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Created!</h3>
                <p className="text-gray-600 mb-4">Please complete your bank transfer to confirm your order.</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                  <h4 className="font-medium text-blue-800 mb-2">Transfer Details:</h4>
                  <div className="space-y-1 text-sm text-blue-700">
                    <p><strong>Order ID:</strong> #{orderDetails?.id || 'N/A'}</p>
                    <p><strong>Amount:</strong> {formatPriceDisplay(orderDetails?.total || cartTotal)}</p>
                    <p><strong>Account:</strong> 0123456789 (Access Bank)</p>
                    <p><strong>Reference:</strong> {orderDetails?.id || 'Your Order ID'}</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            )}

            {paymentStatus === 'failed' && (
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Failed</h3>
                <p className="text-gray-600 mb-4">Sorry, your order could not be processed.</p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-800">
                    {orderDetails?.error || 'Please check your details and try again, or choose a different payment method.'}
                  </p>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={handleTryAgain}
                    className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate('/cart')}
                    className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Back to Cart
                  </button>
                </div>
              </div>
            )}

            {!isProcessing && (
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;