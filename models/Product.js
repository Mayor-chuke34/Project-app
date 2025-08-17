// models/Product.js - Updated with Naira currency support
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
    // Price will be stored in Naira (₦)
  },
  currency: {
    type: String,
    default: 'NGN', // Nigerian Naira
    enum: ['NGN', 'USD', 'EUR', 'GBP']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: ['electronics', 'clothing', 'books', 'home', 'sports', 'beauty', 'toys', 'automotive', 'other'],
    lowercase: true
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [50, 'Brand name cannot exceed 50 characters']
  },
  // Support both field names for compatibility
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  image: {
    type: String,
    default: ''
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    }
  }],
  specifications: {
    type: Map,
    of: String
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  // Support both field names
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Review comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    weight: Number,
    unit: {
      type: String,
      enum: ['cm', 'inch', 'kg', 'lb'],
      default: 'cm'
    }
  },
  discount: {
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    validFrom: Date,
    validTo: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for countInStock (backward compatibility)
productSchema.virtual('countInStock').get(function() {
  return this.stock;
});

productSchema.virtual('countInStock').set(function(value) {
  this.stock = value;
});

// Virtual for formatted price in Naira
productSchema.virtual('formattedPrice').get(function() {
  return `₦${this.price.toLocaleString('en-NG')}`;
});

// Virtual for discounted price
productSchema.virtual('discountedPrice').get(function() {
  if (this.discount.percentage > 0) {
    const now = new Date();
    if ((!this.discount.validFrom || now >= this.discount.validFrom) &&
        (!this.discount.validTo || now <= this.discount.validTo)) {
      return this.price * (1 - this.discount.percentage / 100);
    }
  }
  return this.price;
});

// Virtual for formatted discounted price
productSchema.virtual('formattedDiscountedPrice').get(function() {
  return `₦${this.discountedPrice.toLocaleString('en-NG')}`;
});

// Virtual for availability status
productSchema.virtual('isAvailable').get(function() {
  return this.isActive && this.stock > 0;
});

// Index for search optimization
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ user: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });

// Pre-save middleware to sync seller and user fields
productSchema.pre('save', function(next) {
  if (this.user && !this.seller) {
    this.seller = this.user;
  } else if (this.seller && !this.user) {
    this.user = this.seller;
  }
  next();
});

// Method to update average rating
productSchema.methods.updateRating = function() {
  if (this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating = totalRating / this.reviews.length;
    this.numReviews = this.reviews.length;
  } else {
    this.rating = 0;
    this.numReviews = 0;
  }
  return this.save();
};

// Static method to get products by category
productSchema.statics.findByCategory = function(category, options = {}) {
  const query = { category, isActive: true };
  return this.find(query)
    .populate('seller', 'firstName lastName')
    .populate('user', 'firstName lastName')
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

// Static method for search
productSchema.statics.search = function(searchTerm, options = {}) {
  const query = {
    $text: { $search: searchTerm },
    isActive: true
  };
  
  return this.find(query, { score: { $meta: 'textScore' } })
    .populate('seller', 'firstName lastName')
    .populate('user', 'firstName lastName')
    .sort({ score: { $meta: 'textScore' } })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

module.exports = mongoose.model('Product', productSchema);