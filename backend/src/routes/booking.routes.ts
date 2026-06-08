// ============================================================================
// Booking Routes
// POST /bookings, GET /bookings, GET /bookings/:id, PATCH /bookings/:id/cancel
// GET /bookings/driver/active
// ============================================================================

import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../config/database';
import { verifyFirebaseToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { requireVerifiedKyc } from '../middleware/kyc.middleware';
import { validateBookingOwnership } from '../middleware/ownership.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  CreateBookingSchema, CancelBookingSchema,
  calculateFare, USER_CANCELLABLE_STATUSES, FEE_CANCELLATION_STATUSES,
} from '@cargohub/shared';
import type { Booking } from '@cargohub/shared';

const router = Router();

// Create new booking (USER only)
router.post('/',
  verifyFirebaseToken,
  requireRole('USER'),
  validate(CreateBookingSchema),
  (req, res) => {
    const fare = calculateFare({
      pickupLat: req.body.pickupLat,
      pickupLng: req.body.pickupLng,
      dropLat: req.body.dropLat,
      dropLng: req.body.dropLng,
      vehicleType: req.body.vehicleType,
      loadType: req.body.loadType,
      helpersRequested: req.body.helpersRequested,
    });

    const booking: Booking = {
      id: uuid(),
      bookingRef: `FA-${Date.now().toString(36).toUpperCase()}`,
      userId: req.user!.uid,
      pickupLat: req.body.pickupLat,
      pickupLng: req.body.pickupLng,
      pickupAddress: req.body.pickupAddress,
      dropLat: req.body.dropLat,
      dropLng: req.body.dropLng,
      dropAddress: req.body.dropAddress,
      vehicleType: req.body.vehicleType,
      loadType: req.body.loadType,
      helpersRequested: req.body.helpersRequested,
      fareEstimate: fare.total,
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.bookings.create(booking);

    // Find nearest driver and emit Socket.io event
    const nearbyDrivers = db.drivers.findNearby(
      req.body.pickupLat,
      req.body.pickupLng,
      req.body.vehicleType
    );

    if (nearbyDrivers.length > 0) {
      const io = req.app.get('io');
      const targetDriver = nearbyDrivers[0];
      io.to(`driver:${targetDriver.firebaseUid}`).emit('booking:new', booking);
    }

    res.status(201).json({
      success: true,
      data: { booking, fareBreakdown: fare },
    });
  }
);

// Get user's booking history (USER only)
router.get('/',
  verifyFirebaseToken,
  requireRole('USER'),
  (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string | undefined;

    const result = db.bookings.findByUserId(req.user!.uid, page, limit, status as any);
    res.json({ success: true, ...result });
  }
);

// Get driver's active booking (DRIVER only)
router.get('/driver/active',
  verifyFirebaseToken,
  requireRole('DRIVER'),
  requireVerifiedKyc,
  (req, res) => {
    const booking = db.bookings.findDriverActive(req.user!.uid);
    res.json({ success: true, data: booking });
  }
);

// Get single booking detail (USER own, DRIVER assigned, ADMIN any)
router.get('/:id',
  verifyFirebaseToken,
  (req, res) => {
    const booking = db.bookings.findById(req.params.id as string);

    if (!booking) {
      res.status(404).json({ success: false, error: 'BOOKING_NOT_FOUND' });
      return;
    }

    // Access control
    if (req.user!.role === 'ADMIN') {
      // Admin can see any booking
    } else if (req.user!.role === 'USER' && booking.userId !== req.user!.uid) {
      res.status(403).json({ success: false, error: 'FORBIDDEN' });
      return;
    } else if (req.user!.role === 'DRIVER' && booking.driverId !== req.user!.uid) {
      res.status(403).json({ success: false, error: 'FORBIDDEN' });
      return;
    }

    // Attach driver info if assigned
    if (booking.driverId) {
      const driver = db.drivers.findByFirebaseUid(booking.driverId);
      if (driver) {
        booking.driver = {
          id: driver.id,
          name: driver.name,
          phone: driver.phone,
          vehicleType: driver.vehicleType,
          vehicleNumber: driver.vehicleNumber,
          profilePhoto: driver.profilePhoto,
          rating: driver.rating,
          totalTrips: driver.totalTrips,
          currentLat: driver.currentLat,
          currentLng: driver.currentLng,
        };
      }
    }

    res.json({ success: true, data: booking });
  }
);

// Cancel booking (USER only, own bookings)
router.patch('/:id/cancel',
  verifyFirebaseToken,
  requireRole('USER'),
  validateBookingOwnership('user'),
  validate(CancelBookingSchema),
  (req, res) => {
    const booking = req.booking as Booking;

    if (!USER_CANCELLABLE_STATUSES.includes(booking.status)) {
      res.status(400).json({
        success: false,
        error: 'CANNOT_CANCEL',
        message: `Booking in status '${booking.status}' cannot be cancelled.`,
      });
      return;
    }

    const hasFee = FEE_CANCELLATION_STATUSES.includes(booking.status);

    const updated = db.bookings.update(booking.id, {
      status: 'CANCELLED',
      cancellationReason: req.body.reason || 'Cancelled by user',
    });

    // Notify driver if assigned
    if (booking.driverId) {
      const io = req.app.get('io');
      io.to(`booking:${booking.id}`).emit('booking:cancelled', {
        bookingId: booking.id,
        reason: req.body.reason || 'Cancelled by user',
      });
    }

    res.json({
      success: true,
      data: updated,
      cancellationFee: hasFee ? 50 : 0,
    });
  }
);

export default router;
