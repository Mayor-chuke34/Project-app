import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatPriceDisplay } from '../utils/currency';

const CartModal = ({ cartItems, onClose, onRemoveItem, onUpdateQuantity }) => {
  const navigate = useNavigate();
  
  // Group items by id and calculate quantities
  const groupedItems = cartItems.reduce((acc, item) => {
    const existingItem = acc.find(i => i.id === item.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      acc.push({ ...item, quantity: 1 });
    }
    return acc;
  }, []);

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);
  const itemCount = cartItems.length;

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const handleRemoveItem = (productId) => {
    if (onRemoveItem) {
      onRemoveItem(productId);
    }
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (onUpdateQuantity) {
      onUpdateQuantity(productId, newQuantity);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Shopping Cart</h2>
            <p className="text-gray-600">{itemCount} item{itemCount !== 1 ? 's' : ''} in your cart</p>
          </div>
          <button
            onClick={onClose}
            className="text-3xl text-gray-400 hover:text-gray-600 transition duration-200 hover:bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center"
          >
            ×
          </button>
        </div>
        
        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {groupedItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">🛒</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 text-lg mb-6">Add some products to get started!</p>
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition duration-300"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-xl hover:bg-gray-50 transition duration-200">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatPriceDisplay(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => handleQuantityChange(item.id, Math.max(0, item.quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 transition duration-200"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 transition duration-200"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition duration-200"
                      title="Remove item"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        {groupedItems.length > 0 && (
          <div className="p-6 border-t bg-gray-50">
            {/* Summary */}
                <div className="mb-6">
              <div className="flex justify-between items-center text-lg">
                <span>Subtotal ({itemCount} items):</span>
                <span className="font-bold">{formatPriceDisplay(total)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                <span>Delivery:</span>
                <span>{total >= 50000 ? 'FREE' : formatPriceDisplay(2000)}</span>
              </div>
              <div className="border-t mt-3 pt-3">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">
                    {formatPriceDisplay(total + (total >= 50000 ? 0 : 2000))}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={onClose}
                className="flex-1 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition duration-300"
              >
                Continue Shopping
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition duration-300"
              >
                Proceed to Checkout
              </button>
            </div>

            {/* Free delivery notice */}
            {total < 50000 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 Add {formatPriceDisplay(50000 - total)} more to get FREE delivery!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;