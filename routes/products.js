// const express = require('express');
// const router = express.Router();
// const productsController = require('../controllers/productsController');
// const upload = require('../middleware/upload');
// const authMiddleware = require('../middleware/auth');
// const adminMiddleware = require('../middleware/admin');

// // GET /api/products
// router.get('/', productsController.getAllProducts);
// // GET /api/products/:id
// router.get('/:id', productsController.getProductById);
// // POST /api/products (admin only, with image upload)
// router.post('/', authMiddleware, adminMiddleware, upload.single('image'), productsController.createProductWithImage);
// // PUT /api/products/:id (admin only)
// router.put('/:id', authMiddleware, adminMiddleware, productsController.updateProduct);
// // DELETE /api/products/:id (admin only)
// router.delete('/:id', authMiddleware, adminMiddleware, productsController.deleteProduct);

// module.exports = router;
