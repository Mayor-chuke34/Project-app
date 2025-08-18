const express = require('express');
const router = express.Router();

// Mock Paystack configuration - replace with your actual secret key
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// GET /api/payment/methods - Get available payment methods
router.get('/methods', (req, res) => {
  try {
    const paymentMethods = [
      {
        id: 'card',
        name: 'Debit/Credit Card',
        description: 'Secure payment with Paystack',
        icon: 'credit-card',
        enabled: true
      },
      {
        id: 'transfer',
        name: 'Bank Transfer',
        description: 'Transfer to our account',
        icon: 'bank',
        enabled: true
      },
      {
        id: 'cod',
        name: 'Cash on Delivery',
        description: 'Pay when you receive',
        icon: 'cash',
        enabled: true
      }
    ];

    res.json({
      success: true,
      data: paymentMethods
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment methods'
    });
  }
});

// POST /api/payment/initialize - Initialize Paystack payment
router.post('/initialize', async (req, res) => {
  try {
    const { email, amount, orderId, metadata } = req.body;

    // Validate required fields
    if (!email || !amount || !orderId) {
      return res.status(400).json({
        success: false,
        error: 'Email, amount, and orderId are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Validate amount (should be positive number)
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be a positive number'
      });
    }

    // Convert amount to kobo (Paystack expects amount in kobo)
    const amountInKobo = Math.round(amount * 100);

    // Prepare callback URLs
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const callbackUrl = baseUrl + '/payment/callback';

    // Generate static values for testing
    const currentTime = Date.now();
    const referenceId = ['ref', orderId, currentTime].join('_');
    const accessCode = ['mock_access', currentTime].join('_');

    // Mock Paystack initialization response
    const mockPaystackResponse = {
      status: true,
      message: "Authorization URL created",
      data: {
        authorization_url: 'https://checkout.paystack.com/mock-payment',
        access_code: accessCode,
        reference: referenceId
      }
    };

    // For actual Paystack integration, use this:
    /*
    const https = require('https');
    const postData = JSON.stringify({
      email,
      amount: amountInKobo,
      reference: `ref_${orderId}_${Date.now()}`,
      callback_url: callbackUrl,
      metadata: {
        orderId,
        ...metadata
      }
    });

    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const paystackReq = https.request(options, (paystackRes) => {
      let data = '';
      paystackRes.on('data', (chunk) => {
        data += chunk;
      });

      paystackRes.on('end', () => {
        const response = JSON.parse(data);
        if (response.status) {
          res.json({
            success: true,
            data: response.data
          });
        } else {
          res.status(400).json({
            success: false,
            error: response.message || 'Payment initialization failed'
          });
        }
      });
    });

    paystackReq.on('error', (error) => {
      console.error('Paystack API error:', error);
      res.status(500).json({
        success: false,
        error: 'Payment service unavailable'
      });
    });

    paystackReq.write(postData);
    paystackReq.end();
    */

    // Return mock response for development
    res.json({
      success: true,
      data: mockPaystackResponse.data
    });

  } catch (error) {
    console.error('Error initializing payment:', error);
    res.status(500).json({
      success: false,
      error: 'Payment initialization failed'
    });
  }
});

// POST /api/payment/verify - Verify Paystack payment
router.post('/verify', async (req, res) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({
        success: false,
        error: 'Payment reference is required'
      });
    }

    // Mock verification response
    // In production, you would verify with Paystack API
    const mockVerificationResponse = {
      status: true,
      message: "Verification successful",
      data: {
        status: "success",
        reference: reference,
        amount: 50000, // Amount in kobo
        gateway_response: "Successful",
        paid_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        channel: "card",
        currency: "NGN",
        authorization: {
          authorization_code: "AUTH_mock123",
          bin: "408408",
          last4: "4081",
          exp_month: "12",
          exp_year: "2030",
          channel: "card",
          card_type: "visa DEBIT",
          bank: "Test Bank",
          country_code: "NG",
          brand: "visa",
          reusable: true,
          signature: "SIG_mockSignature"
        }
      }
    };

    // For actual Paystack integration, use this:
    /*
    const https = require('https');
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: `/transaction/verify/${reference}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    };

    const paystackReq = https.request(options, (paystackRes) => {
      let data = '';
      paystackRes.on('data', (chunk) => {
        data += chunk;
      });

      paystackRes.on('end', () => {
        const response = JSON.parse(data);
        res.json({
          success: response.status,
          data: response.data,
          message: response.message
        });
      });
    });

    paystackReq.on('error', (error) => {
      console.error('Paystack verification error:', error);
      res.status(500).json({
        success: false,
        error: 'Payment verification failed'
      });
    });

    paystackReq.end();
    */

    // Return mock response for development
    res.json({
      success: true,
      data: mockVerificationResponse.data
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      error: 'Payment verification failed'
    });
  }
});

// GET /api/payment/banks - Get list of Nigerian banks (for transfer)
router.get('/banks', (req, res) => {
  try {
    const nigerianBanks = [
      { name: 'Access Bank', code: '044' },
      { name: 'Guaranty Trust Bank', code: '058' },
      { name: 'First Bank of Nigeria', code: '011' },
      { name: 'United Bank for Africa', code: '033' },
      { name: 'Zenith Bank', code: '057' },
      { name: 'Fidelity Bank', code: '070' },
      { name: 'Union Bank of Nigeria', code: '032' },
      { name: 'Sterling Bank', code: '232' },
      { name: 'Stanbic IBTC Bank', code: '221' },
      { name: 'Ecobank Nigeria', code: '050' }
    ];

    res.json({
      success: true,
      data: nigerianBanks
    });
  } catch (error) {
    console.error('Error fetching banks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch banks'
    });
  }
});

module.exports = router;