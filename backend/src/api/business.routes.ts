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
    .filter((b: any) => b.paymentStatus === 'PAID')
    .map((b: any) => ({
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

// ==========================================
// 🚀 Live Fleet Tracking
// ==========================================

router.get('/fleet', async (req, res) => {
  try {
    // Fetch all active bookings for this B2B user
    const result = await db.bookings.findByUserId(req.user!.uid, 1, 100);
    
    // Filter active ones (In Transit, Delayed, Delivered, Picked Up)
    const activeBookings = result.data.filter((b: any) => 
      ['IN_TRANSIT', 'DELAYED', 'DELIVERED', 'PICKED_UP'].includes(b.status)
    );

    // Format them for the Fleet Map
    const fleet = await Promise.all(activeBookings.map(async (b: any) => {
      // In a real app we would join the drivers table. 
      // For now, we do a fallback if driverId is missing.
      let driverName = "Unassigned";
      if (b.driverId) {
        const driver = await db.drivers.findByFirebaseUid(b.driverId);
        if (driver) driverName = driver.name;
      }
      
      return {
        id: b.bookingRef,
        status: b.status === 'IN_TRANSIT' || b.status === 'PICKED_UP' ? 'In Transit' : 
                b.status === 'DELAYED' ? 'Delayed' : 'Delivered',
        driver: driverName,
        from: b.pickupAddress.split(',')[0],
        to: b.dropAddress.split(',')[0],
        eta: b.status === 'DELIVERED' ? 'Arrived' : 'In Progress',
        lat: b.pickupLat + (b.dropLat - b.pickupLat) * 0.5, // Mock current lat
        lng: b.pickupLng + (b.dropLng - b.pickupLng) * 0.5, // Mock current lng
        pickup: { lat: b.pickupLat, lng: b.pickupLng },
        dropoff: { lat: b.dropLat, lng: b.dropLng },
        progress: b.status === 'DELIVERED' ? 100 : 50,
        type: b.vehicleType
      };
    }));

    res.json({ success: true, data: fleet });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 🚀 Developer API Hub
// ==========================================

router.get('/developer/keys', async (req, res) => {
  try {
    const keys = await db.b2bApiKeys.findByUserId(req.user!.uid);
    res.json({ success: true, data: keys });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/developer/keys', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
    
    // Generate a secure API key prefix + random string
    const key = `sk_live_${uuid().replace(/-/g, '')}`;
    
    const newKey = await db.b2bApiKeys.create({
      userId: req.user!.uid,
      name,
      key
    });
    
    res.status(201).json({ success: true, data: newKey });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/developer/keys/:id', async (req, res) => {
  try {
    await db.b2bApiKeys.delete(req.params.id, req.user!.uid);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/developer/webhooks', async (req, res) => {
  try {
    const webhooks = await db.b2bWebhooks.findByUserId(req.user!.uid);
    res.json({ success: true, data: webhooks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/developer/webhooks', async (req, res) => {
  try {
    const { endpointUrl, events } = req.body;
    if (!endpointUrl || !events || !Array.isArray(events)) {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }
    
    const newWebhook = await db.b2bWebhooks.create({
      userId: req.user!.uid,
      endpointUrl,
      events
    });
    
    res.status(201).json({ success: true, data: newWebhook });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/developer/webhooks/:id', async (req, res) => {
  try {
    await db.b2bWebhooks.delete(req.params.id, req.user!.uid);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
