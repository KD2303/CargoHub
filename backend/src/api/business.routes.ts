// ============================================================================
// Business (B2B) Routes
// POST /business/bookings/bulk, GET /business/invoices
// ============================================================================

import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../config/database';
import { verifyFirebaseToken } from '../middlewares/auth.middleware';
import { requireRole, requireB2B } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { BulkBookingSchema, calculateFare } from '@cargohub/shared';
import type { Booking } from '@cargohub/shared';

const router = Router();

// All B2B routes require USER role + B2B account type
router.use(verifyFirebaseToken, requireRole('USER'), requireB2B);

// Bulk booking
router.post('/bookings/bulk',
  validate(BulkBookingSchema),
  async (req, res) => {
    const results = {
      created: 0,
      failed: 0,
      bookingIds: [] as string[],
      errors: [] as Array<{ row: number; field: string; message: string }>,
    };

    await Promise.all(req.body.bookings.map(async (row: any, index: number) => {
      try {
        // Mock geocoding — in production, use Mapbox Geocoding API
        const booking: Booking = {
          id: uuid(),
          bookingRef: `FA-B2B-${Date.now().toString(36).toUpperCase()}-${index}`,
          userId: req.user!.uid,
          pickupLat: 26.8467 + (Math.random() * 0.1 - 0.05),
          pickupLng: 80.9462 + (Math.random() * 0.1 - 0.05),
          pickupAddress: row.pickupAddress,
          dropLat: 26.8467 + (Math.random() * 0.1 - 0.05),
          dropLng: 80.9462 + (Math.random() * 0.1 - 0.05),
          dropAddress: row.dropAddress,
          vehicleType: row.vehicleType,
          loadType: row.loadType,
          helpersRequested: row.helpers || 0,
          fareEstimate: 0,
          status: 'PENDING',
          paymentStatus: 'UNPAID',
          scheduledAt: row.scheduledTime,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Calculate fare
        const fare = calculateFare({
          pickupLat: booking.pickupLat,
          pickupLng: booking.pickupLng,
          dropLat: booking.dropLat,
          dropLng: booking.dropLng,
          vehicleType: booking.vehicleType,
          loadType: booking.loadType,
          helpersRequested: booking.helpersRequested,
        });
        booking.fareEstimate = fare.total;

        await db.bookings.create(booking);
        results.created++;
        results.bookingIds.push(booking.id);
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          row: index + 1,
          field: 'unknown',
          message: error.message || 'Failed to create booking',
        });
      }
    }));

    res.status(201).json({ success: true, data: results });
  }
);

// Fleet invoices
router.get('/invoices', async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const result = await db.bookings.findByUserId(req.user!.uid, page, limit);
  const invoices = result.data
    .filter(b => b.paymentStatus === 'PAID')
    .map(b => ({
      id: b.id,
      bookingRef: b.bookingRef,
      amount: b.finalFare || b.fareEstimate,
      vehicleType: b.vehicleType,
      pickup: b.pickupAddress,
      drop: b.dropAddress,
      date: b.createdAt,
    }));

  res.json({
    success: true,
    data: invoices,
    total: invoices.length,
    page,
    limit,
    totalPages: Math.ceil(invoices.length / limit),
  });
});

export default router;
