import { Router } from 'express';
import { db } from '../config/database';
import { bookingService } from '../services/booking.service';
import { verifyFirebaseToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { requireVerifiedKyc } from '../middlewares/kyc.middleware';
import { validateBookingOwnership } from '../middlewares/ownership.middleware';
import { validate } from '../middlewares/validate.middleware';
import { CreateBookingSchema, CancelBookingSchema, USER_CANCELLABLE_STATUSES, FEE_CANCELLATION_STATUSES } from '@cargohub/shared';
import type { Booking } from '@cargohub/shared';

const router = Router();

// Create new booking (USER only)
router.post('/',
  verifyFirebaseToken,
  requireRole('USER'),
  validate(CreateBookingSchema),
  async (req, res) => {
    try {
      const io = req.app.get('io');
      const { booking, fareBreakdown } = await bookingService.createBooking(req.user!.uid, req.body, io);
      
      res.status(201).json({
        success: true,
        data: { booking, fareBreakdown },
      });
    } catch (err) {
      res.status(500).json({ success: false, error: 'INTERNAL_ERROR', details: err instanceof Error ? err.message : JSON.stringify(err) });
    }
  }
);

// Get user's booking history (USER only)
router.get('/',
  verifyFirebaseToken,
  requireRole('USER'),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string | undefined;

      const result = await db.bookings.findByUserId(req.user!.uid, page, limit, status as any);
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(500).json({ success: false, error: 'INTERNAL_ERROR' });
    }
  }
);

// Get driver's active booking (DRIVER only)
router.get('/driver/active',
  verifyFirebaseToken,
  requireRole('DRIVER'),
  requireVerifiedKyc,
  async (req, res) => {
    try {
      const booking = await db.bookings.findDriverActive(req.user!.uid);
      res.json({ success: true, data: booking });
    } catch (err) {
      res.status(500).json({ success: false, error: 'INTERNAL_ERROR' });
    }
  }
);

// Get available jobs for drivers (DRIVER only)
router.get('/driver/available',
  verifyFirebaseToken,
  requireRole('DRIVER'),
  async (req, res) => {
    try {
      // In a real app, we might filter by the driver's vehicle type or current coordinates.
      // For now, we return all PENDING bookings.
      const bookings = await db.bookings.findAvailable();
      res.json({ success: true, data: bookings });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: 'INTERNAL_ERROR' });
    }
  }
);

// Get user booking stats (USER only)
router.get('/stats',
  verifyFirebaseToken,
  requireRole('USER'),
  async (req, res) => {
    try {
      const stats = await db.bookings.getUserStats(req.user!.uid);
      res.json({ success: true, data: stats });
    } catch (err) {
      res.status(500).json({ success: false, error: 'INTERNAL_ERROR' });
    }
  }
);

// Get single booking detail
router.get('/:id',
  verifyFirebaseToken,
  async (req, res) => {
    try {
      const booking = await db.bookings.findById(req.params.id as string);

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
        const driver = await db.drivers.findByFirebaseUid(booking.driverId);
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
    } catch (err) {
      res.status(500).json({ success: false, error: 'INTERNAL_ERROR' });
    }
  }
);

// Cancel booking (USER only, own bookings)
router.patch('/:id/cancel',
  verifyFirebaseToken,
  requireRole('USER'),
  validateBookingOwnership('user'),
  validate(CancelBookingSchema),
  async (req, res) => {
    try {
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
      const io = req.app.get('io');
      const updated = await bookingService.cancelBookingByUser(booking.id, req.body.reason || 'Cancelled by user', io);

      res.json({
        success: true,
        data: updated,
        cancellationFee: hasFee ? 50 : 0,
      });
    } catch (err) {
      res.status(500).json({ success: false, error: 'INTERNAL_ERROR' });
    }
  }
);

// Get driver's booking history (DRIVER only)
router.get('/driver/history',
  verifyFirebaseToken,
  requireRole('DRIVER'),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string | undefined;

      const result = await db.bookings.findByDriverId(req.user!.uid, page, limit, status as any);
      res.json({ success: true, ...result });
    } catch (err) {
      console.error('Driver History Error:', err);
      res.status(500).json({ success: false, error: 'INTERNAL_ERROR' });
    }
  }
);

export default router;
