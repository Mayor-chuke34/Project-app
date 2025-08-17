import React, { useState } from 'react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🇳🇬</span>
              <h3 className="text-xl font-bold text-white">Naija Shop</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your trusted Nigerian e-commerce platform offering quality products 
              from local and international brands. Shop with confidence!
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                📘 Facebook
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                📷 Instagram
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                🐦 Twitter
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">About Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Contact</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Terms of Service</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Shipping Info</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Returns & Refunds</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Shop Categories</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">👔 Fashion</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">🏠 Home & Garden</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">📱 Electronics</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">⚽ Sports</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">📚 Books</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">🎮 Gaming</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Stay Updated</h4>
            <p className="text-gray-300 text-sm">
              Subscribe to our newsletter for exclusive deals and updates.
            </p>
            
            {subscribed ? (
              <div className="bg-green-600 text-white p-3 rounded-md text-center">
                ✅ Successfully subscribed!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors font-medium"
                >
                  Subscribe 📧
                </button>
              </form>
            )}

            <div className="space-y-2">
              <h5 className="text-sm font-medium text-white">Contact Info</h5>
              <p className="text-gray-300 text-xs">📞 +234 800 123 4567</p>
              <p className="text-gray-300 text-xs">✉ support@naijashop.com</p>
              <p className="text-gray-300 text-xs">📍 Lagos, Nigeria</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods & Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Payment Methods */}
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <span className="text-sm text-gray-400">We Accept:</span>
              <div className="flex items-center space-x-3">
                <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">VISA</span>
                <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">MASTER</span>
                <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">VERVE</span>
                <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold">PAYSTACK</span>
                <span className="bg-indigo-600 text-white px-2 py-1 rounded text-xs font-bold">FLUTTERWAVE</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-green-400">🔒</span>
              <span className="text-xs text-gray-400">SSL Secured</span>
              <span className="text-green-400">📱</span>
              <span className="text-xs text-gray-400">Mobile Friendly</span>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-6 pt-6 border-t border-gray-800 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 Naija Shop. All rights reserved. | Made with ❤ in Nigeria
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;