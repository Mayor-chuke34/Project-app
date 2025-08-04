const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
  try {
    const { products, total } = req.body;
    const order = new Order({
      user: req.userId,
      products,
      total,
      status: 'pending',
    });
    await order.save();
    res.status(201).json({ message: 'Order created successfully', order });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
