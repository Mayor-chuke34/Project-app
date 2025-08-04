const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

// Helper to upload image to Cloudinary using a Promise
function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });
}

// GET all products (with optional category filter)
exports.getAllProducts = async (req, res) => {
  try {
    const category = req.query.category;
    const filter = category ? { category } : {};
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// GET single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/products (with image upload)
exports.createProductWithImage = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    let imageUrl = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }
    // Create product
    const product = new Product({
      name,
      description,
      price,
      image: imageUrl,
      category,
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// PUT /api/products/:id (admin only)
exports.updateProduct = async (req, res) => {
  try {
    const updateData = req.body;
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// DELETE /api/products/:id (admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
