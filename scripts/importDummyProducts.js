// Script to import DummyJSON products into MongoDB
const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

dotenv.config();

const DUMMYJSON_API = 'https://dummyjson.com/products?limit=50';

async function importProducts() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Connected to MongoDB');

  const { data } = await axios.get(DUMMYJSON_API);
  const products = data.products || [];

  for (const item of products) {
    const product = {
      name: item.title,
      description: item.description,
      price: Math.round(item.price * 1500), // Convert USD to Naira (approx)
      image: Array.isArray(item.images) ? item.images[0] : item.thumbnail,
      category: item.category,
      stock: item.stock || 100,
      brand: item.brand || '',
      tags: item.tags || [],
      isFeatured: item.rating > 4.5,
      rating: item.rating || 0,
    };
    await Product.findOneAndUpdate({ name: product.name }, product, { upsert: true, new: true });
    console.log('Imported:', product.name);
  }

  console.log('Import complete!');
  mongoose.disconnect();
}

importProducts().catch(err => {
  console.error('Import error:', err);
  mongoose.disconnect();
});
