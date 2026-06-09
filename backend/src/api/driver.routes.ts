// ============================================================================
// Driver Routes
// GET /drivers/nearby, PATCH /drivers/availability, PATCH /drivers/location
// GET /drivers/:id/earnings
// ============================================================================

import { Router } from 'express';
import { db } from '../config/database';
import { verifyFirebaseToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { requireVerifiedKyc } from '../middlewares/kyc.middleware';
import { validate } from '../middlewares/validate.middleware';
import { ToggleAvailabilitySchema, UpdateLocationSchema, NearbyDriversSchema } from '@cargohub/shared';

const router = Router();

// Find nearby drivers (USER)
router.get('/nearby',
  verifyFirebaseToken,
  requireRole('USER'),
  validate(NearbyDriversSchema, 'query'),
  async (req, res) => {
    const { lat, lng, vehicleType } = req.query as any;
    const drivers = await db.drivers.findNearby(
      parseFloat(lat),
      parseFloat(lng),
      vehicleType as any
    );

    // Return anonymised data (no phone or personal info)
    const anonymised = drivers.map(d => ({
      id: d.id,
      name: d.name,
      vehicleType: d.vehicleType,
      rating: d.rating,
      distance: (d as any).distance,
      estimatedEta: Math.ceil((d as any).distance * 3), // rough ETA in minutes
    }));

    res.json({ success: true, data: anonymised });
  }
);

// Toggle availability (DRIVER only, KYC required)
router.patch('/availability',
  verifyFirebaseToken,
  requireRole('DRIVER'),
  requireVerifiedKyc,
  validate(ToggleAvailabilitySchema),
  async (req, res) => {
    const updated = await db.drivers.update(req.user!.uid, {
      isAvailable: req.body.available,
    });

    if (!updated) {
      res.status(404).json({ success: false, error: 'DRIVER_NOT_FOUND' });
      return;
    }

    res.json({ success: true, data: { isAvailable: updated.isAvailable } });
  }
);

// Update GPS location (DRIVER only, REST fallback for Socket.io disconnect)
router.patch('/location',
  verifyFirebaseToken,
  requireRole('DRIVER'),
  validate(UpdateLocationSchema),
  async (req, res) => {
    const updated = await db.drivers.update(req.user!.uid, {
      currentLat: req.body.lat,
      currentLng: req.body.lng,
    });

    if (!updated) {
      res.status(404).json({ success: false, error: 'DRIVER_NOT_FOUND' });
      return;
    }

    // If there's a booking, broadcast to booking room
    if (req.body.bookingId) {
      const io = req.app.get('io');
      io.to(`booking:${req.body.bookingId}`).emit('driver:location', {
        driverId: req.user!.uid,
        lat: req.body.lat,
        lng: req.body.lng,
        heading: req.body.heading,
        speed: req.body.speed,
        timestamp: Date.now(),
      });
    }

    res.json({ success: true, message: 'Location updated.' });
  }
);

// View own earnings (DRIVER only)
router.get('/:id/earnings',
  verifyFirebaseToken,
  requireRole('DRIVER'),
  async (req, res) => {
    // Ownership check: driver can only view their own earnings
    if (req.params.id !== req.user!.uid) {
      const driver = await db.drivers.findById(req.params.id as string);
      if (!driver || driver.firebaseUid !== req.user!.uid) {
        res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'You can only view your own earnings.',
        });
        return;
      }
    }

    const driver = await db.drivers.findByFirebaseUid(req.user!.uid);
    if (!driver) {
      res.status(404).json({ success: false, error: 'DRIVER_NOT_FOUND' });
      return;
    }

    res.json({ success: true, data: driver.earnings });
  }
);

export default router;
