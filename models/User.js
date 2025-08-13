// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: { 
    type: String, 
    required: true 
  },
  address: { 
    type: String,
    trim: true
  },
  isAdmin: { 
    type: Boolean, 
    default: false 
  },
  phone: { 
    type: String,
    trim: true
  },
  city: { 
    type: String,
    trim: true
  },
  state: { 
    type: String,
    trim: true
  },
  country: { 
    type: String, 
    default: 'Nigeria',
    trim: true
  },
  // Wishlist stores DummyJSON product IDs
  wishlist: [{
    type: String, // Changed from ObjectId to String for DummyJSON IDs
    required: true
  }],
  // Cart stores DummyJSON product IDs with quantities
  cart: [{
    productId: {
      type: String, // DummyJSON product ID
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // User preferences
  preferences: {
    newsletter: {
      type: Boolean,
      default: false
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    }
  },
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, { 
  timestamps: true 
});

// Index for better performance
userSchema.index({ email: 1 });
userSchema.index({ 'cart.productId': 1 });
userSchema.index({ wishlist: 1 });

// Virtual for cart total items
userSchema.virtual('cartItemCount').get(function() {
  return this.cart.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for wishlist count
userSchema.virtual('wishlistCount').get(function() {
  return this.wishlist.length;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);