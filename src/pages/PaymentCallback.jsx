import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { paymentAPI, ordersAPI } from '../utils/api';
import { formatPriceDisplay } from '../utils/currency';

const PaymentCallback = ({ onClearCart }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState('verifying'); // 'verifying', 'success', 'failed'
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const reference = searchParams.get('reference');
        const trxref = searchParams.get('trxref');
        
        // Use reference or trxref from Paystack callback
        const paymentRef = reference || trxref;
        
        if (!paymentRef) {
          setPaymentStatus('failed');
          setError('Payment reference not found');
          return;
        }

        // Verify payment with backend
        const verifyResult = await paymentAPI.verify(paymentRef);
        
        if (verifyResult.success) {
          setPaymentStatus('success');
          
          // Get order details from metadata
          const metadata = verifyResult.data.metadata;
          if (metadata && metadata.orderId) {
            try {
              const orderResult = await ordersAPI.getOrderById(metadata.orderId);
              if (orderResult.success) {
                setOrderDetails(orderResult.data);
              }
            } catch (orderError) {
              console.log('Could not fetch order details:', orderError);
            }
          }
          
          // Set basic order details from payment data
          if (!orderDetails) {
            setOrderDetails({
              id: metadata?.orderId || 'N/A',
              total: verifyResult.data.amount,
              paymentReference: paymentRef,
              status: 'Confirmed'
            });
          }
          
          // Clear cart on successful payment
          if (onClearCart) {
            onClearCart();
          }
        } else {
          setPaymentStatus('failed');
          setError(verifyResult.error || 'Payment verification failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setPaymentStatus('failed');
        setError('An error occurred while verifying your payment');
      }
    };

    // Check for callback parameters
    if (searchParams.get('reference') || searchParams.get('trxref')) {
      verifyPayment();
    } else {
      setPaymentStatus('failed');
      setError('Invalid payment callback');
    }
  }, [searchParams, onClearCart, orderDetails]);

  const handleContinue = () => {
    if (paymentStatus === 'success') {
      navigate('/dashboard');
    } else {
      navigate('/cart');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {paymentStatus === 'verifying' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
            <div className="mt-4 text-sm text-gray-500">This should only take a few seconds</div>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">Thank you for your purchase. Your order has been confirmed.</p>
            
            {orderDetails && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-green-800 mb-3">Order Details</h3>
                <div className="space-y-2 text-sm text-green-700">
                  <div className="flex justify-between">
                    <span>Order ID:</span>
                    <span className="font-medium">#{orderDetails.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount Paid:</span>
                    <span className="font-medium">{formatPriceDisplay(orderDetails.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Ref:</span>
                    <span className="font-medium text-xs">{orderDetails.paymentReference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-medium">{orderDetails.status}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleContinue}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-4">Sorry, we couldn't process your payment.</p>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleContinue}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Back to Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;