const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
	name: { type: String, required: true },
	description: { type: String },
	price: { type: Number, required: true }, // Store in Naira
	image: { type: String },
	category: { type: String },
	stock: { type: Number, default: 0 }, // New field for inventory
	brand: { type: String },
	tags: [{ type: String }],
	isFeatured: { type: Boolean, default: false },
	rating: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
