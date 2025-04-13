// backend/routes/payment.js
const express = require('express');
const router = express.Router();

// Try to load Stripe, but don't crash if it's not available
let stripe;
try {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} catch (error) {
  console.warn('Stripe module not found. Payment features will be limited.');
  // Create a mock stripe for development
  stripe = {
    paymentIntents: {
      create: async () => ({
        client_secret: 'mock_secret_' + Date.now()
      })
    }
  };
}

// Create payment intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, items } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        items: JSON.stringify(items)
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (err) {
    console.error('Error creating payment intent:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;