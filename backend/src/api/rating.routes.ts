// ============================================================================
// Rating Routes — POST /ratings/:bookingId
// ============================================================================

import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../config/database';
import { verifyFirebaseToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { SubmitRatingSchema } from '@cargohub/shared';

const router = Router();

// Submit trip rating (USER only)
router.post('/:bookingId',
  verifyFirebaseToken,
  requireRole('USER'),
  validate(SubmitRatingSchema),
  async (req, res) => {
    const booking = await db.bookings.findById(req.params.bookingId as string);

    if (!booking) {
      res.status(404).json({ success: false, error: 'BOOKING_NOT_FOUND' });
      return;
    }

    if (booking.userId !== req.user!.uid) {
      res.status(403).json({ success: false, error: 'FORBIDDEN' });
      return;
    }

    if (booking.paymentStatus !== 'PAID') {
      res.status(400).json({
        success: false,
        error: 'PAYMENT_REQUIRED',
        message: 'Rating can only be submitted after payment.',
      });
      return;
    }

    // Check for existing rating
    const existing = await db.ratings.findByBookingId(booking.id);
    if (existing) {
      res.status(400).json({
        success: false,
        error: 'ALREADY_RATED',
        message: 'You have already rated this booking.',
      });
      return;
    }

    const rating = await db.ratings.create({
      id: uuid(),
      bookingId: booking.id,
      userId: req.user!.uid,
      driverId: booking.driverId!,
      rating: req.body.rating,
      comment: req.body.comment,
      createdAt: new Date().toISOString(),
    });

    // Update driver's rolling average rating
    if (booking.driverId) {
      const driver = await db.drivers.findByFirebaseUid(booking.driverId);
      if (driver) {
        const newRating = driver.totalTrips > 0
          ? ((driver.rating * driver.totalTrips) + req.body.rating) / (driver.totalTrips + 1)
          : req.body.rating;
        await db.drivers.update(booking.driverId, { rating: Math.round(newRating * 10) / 10 });
      }
    }

    res.status(201).json({ success: true, data: rating });
  }
);

export default router;
