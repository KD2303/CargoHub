// ============================================================================
// Payment Routes
// POST /payments/create-order, POST /payments/verify, POST /payments/webhook
// ============================================================================

import { Router } from 'express';
import crypto from 'crypto';
import { db } from '../config/database';
import { razorpay } from '../config/services';
import { verifyFirebaseToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { strictLimiter } from '../middlewares/rateLimit.middleware';
import { CreatePaymentOrderSchema, VerifyPaymentSchema } from '@cargohub/shared';

const router = Router();

// Create Razorpay order (USER only)
router.post('/create-order',
  strictLimiter,
  verifyFirebaseToken,
  requireRole('USER'),
  validate(CreatePaymentOrderSchema),
  async (req, res) => {
    try {
      const booking = await db.bookings.findById(req.body.bookingId);

      if (!booking) {
        res.status(404).json({ success: false, error: 'BOOKING_NOT_FOUND' });
        return;
      }

      if (booking.userId !== req.user!.uid) {
        res.status(403).json({ success: false, error: 'FORBIDDEN' });
        return;
      }

      if (booking.status !== 'DELIVERED') {
        res.status(400).json({
          success: false,
          error: 'BOOKING_NOT_DELIVERED',
          message: 'Payment can only be made after delivery.',
        });
        return;
      }

      const amount = booking.finalFare || booking.fareEstimate;

      // Actual Razorpay order creation
      const options = {
        amount: Math.round(amount * 100), // amount in the smallest currency unit
        currency: "INR",
        receipt: `receipt_${booking.id.substring(0, 10)}`
      };
      
      const order = await razorpay.orders.create(options);

      await db.bookings.update(booking.id, { paymentStatus: 'PENDING' });

      res.json({
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          bookingId: booking.id,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: 'INTERNAL_SERVER_ERROR' });
    }
  }
);

// Verify payment signature (USER only)
router.post('/verify',
  verifyFirebaseToken,
  requireRole('USER'),
  validate(VerifyPaymentSchema),
  async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      const secret = process.env.RAZORPAY_KEY_SECRET;

      if (!secret) {
        res.status(500).json({ success: false, error: 'CONFIG_ERROR' });
        return;
      }

      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        res.status(400).json({ success: false, error: 'INVALID_SIGNATURE' });
        return;
      }

      // Find booking 
      const allBookings = await db.bookings.findByUserId(req.user!.uid);
      const booking = allBookings.data.find(b => b.paymentStatus === 'PENDING');

      if (booking) {
        await db.bookings.update(booking.id, {
          paymentStatus: 'PAID',
          finalFare: booking.finalFare || booking.fareEstimate,
        });

        // Emit payment confirmation
        const io = req.app.get('io');
        io.to(`booking:${booking.id}`).emit('booking:status', {
          bookingId: booking.id,
          status: booking.status,
          timestamp: new Date().toISOString(),
        });
      }

      res.json({
        success: true,
        message: 'Payment verified successfully.',
        data: { paymentId: razorpay_payment_id },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: 'INTERNAL_SERVER_ERROR' });
    }
  }
);

// Razorpay webhook (server-to-server, no auth)
router.post('/webhook', (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  
  if (secret) {
    const signature = req.headers['x-razorpay-signature'] as string;
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (generatedSignature !== signature) {
      res.status(400).send('Invalid signature');
      return;
    }
  }

  console.log('Razorpay webhook received:', req.body.event);
  // Handle webhook events (payment.captured, etc.)
  res.json({ status: 'ok' });
});

export default router;
