// routes/products.js - Fixed route ordering with public bulk route
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Import controllers
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsBySeller,
  getMyProducts,
  addProductReview,
  searchProducts,
  getProductsByCategory
} = require('../controllers/productController');

// Import auth middleware
const { protect, authorize } = require('../middleware/auth');

// ✅ PUBLIC ROUTES (no authentication required)
// Order matters: specific routes BEFORE parametric routes
router.get('/', getProducts);                           // GET /api/products
router.get('/search', searchProducts);                  // GET /api/products/search?q=term
router.get('/category/:category', getProductsByCategory); // GET /api/products/category/electronics
router.get('/seller/:sellerId', getProductsBySeller);   // GET /api/products/seller/123

// ✅ PUBLIC BULK CREATE (for testing - NO AUTH REQUIRED)
router.post('/bulk', async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        message: 'Products array is required'
      });
    }

    console.log(`Attempting to create ${products.length} products...`);

    // Validate each product has required fields
    const validatedProducts = [];
    const errors = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      // Check required fields
      if (!product.name || !product.description || !product.price || !product.category) {
        errors.push({
          index: i,
          product: product.name || `Product ${i + 1}`,
          error: 'Missing required fields: name, description, price, category'
        });
        continue;
      }

      // Add default values and format data
      validatedProducts.push({
        name: product.name.trim(),
        description: product.description.trim(),
        price: Number(product.price),
        category: product.category,
        brand: product.brand || '',
        stock: Number(product.stock) || 0,
        tags: Array.isArray(product.tags) ? product.tags : [],
        specifications: product.specifications || {},
        currency: 'NGN',
        discount: product.discount || { percentage: 0 },
        isActive: true
      });
    }

    if (validatedProducts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid products to create',
        errors
      });
    }

    // Use insertMany for bulk creation
    const createdProducts = await Product.insertMany(validatedProducts, {
      ordered: false // Continue inserting even if some fail
    });

    console.log(`Successfully created ${createdProducts.length} products`);

    res.status(201).json({
      success: true,
      message: `Successfully created ${createdProducts.length} of ${products.length} products`,
      count: createdProducts.length,
      data: createdProducts,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Bulk create error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate product found',
        error: error.keyValue
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// ✅ PUBLIC SINGLE PRODUCT CREATE (for testing)
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      brand,
      stock,
      tags,
      specifications,
      discount
    } = req.body;

    // Validation
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, price, and category are required'
      });
    }

    // Create product
    const productData = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      brand: brand || '',
      stock: Number(stock) || 0,
      tags: Array.isArray(tags) ? tags : [],
      specifications: specifications || {},
      currency: 'NGN',
      isActive: true
    };

    // Add discount if provided
    if (discount && discount.percentage > 0) {
      productData.discount = {
        percentage: Number(discount.percentage),
        validFrom: new Date(discount.validFrom),
        validTo: new Date(discount.validTo)
      };
    }

    const product = new Product(productData);
    const savedProduct = await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: savedProduct
    });

  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
});

// ✅ PROTECTED ROUTES (authentication required)
router.use(protect); // All routes below require authentication

// Specific protected routes (MUST come before /:id routes)
router.get('/my/products', getMyProducts);              // GET /api/products/my/products

// Parametric routes (MUST come after specific routes)
router.get('/:id', getProduct);                         // GET /api/products/123
router.put('/:id', authorize('seller', 'admin'), updateProduct); // PUT /api/products/123
router.delete('/:id', authorize('seller', 'admin'), deleteProduct); // DELETE /api/products/123
router.post('/:id/reviews', addProductReview);          // POST /api/products/123/reviews

module.exports = router;