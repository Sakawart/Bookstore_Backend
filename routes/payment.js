const express = require('express');
const router = express.Router();

// Controllers
const { createPayment, ChangePaymentStatus } = require('../controllers/payment');

// Middleware
const { auth } = require('../middleware/auth');

// Routes
router.post('/payment', auth, createPayment);
router.put('/admin/payment-status', auth, ChangePaymentStatus);

module.exports = router;
