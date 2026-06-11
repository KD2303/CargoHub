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

import { cloudinary } from '../config/services';

// Get own driver profile (DRIVER only) — avoids /:id param mismatch
router.get('/me',
  verifyFirebaseToken,
  requireRole('DRIVER'),
  async (req, res) => {
    try {
      const driver = await db.drivers.findByFirebaseUid(req.user!.uid);
      if (!driver) {
        res.status(404).json({ success: false, error: 'DRIVER_NOT_FOUND' });
        return;
      }
      res.json({ success: true, data: driver });
    } catch (error: any) {
      console.error('Get Driver Me Error:', error);
      res.status(500).json({ success: false, error: 'INTERNAL_ERROR' });
    }
  }
);

// Submit KYC documents (DRIVER only)
router.post('/kyc/submit',
  verifyFirebaseToken,
  requireRole('DRIVER'),
  async (req, res) => {
    try {
      const { documents } = req.body;
      const updateData: any = {
        kycStatus: 'PENDING',
      };
      
      if (documents) {
        const uploadPromises = [];
        
        const processDoc = async (key: string, dataStr: string) => {
          if (dataStr && dataStr.startsWith('data:image/')) {
            const result = await cloudinary.uploader.upload(dataStr, {
              folder: `kyc_documents/${req.user!.uid}`,
              resource_type: 'image',
            });
            return { key, url: result.secure_url };
          }
          return { key, url: dataStr }; // Return as is if already a URL
        };

        const keysMap: Record<string, string> = {
          aadhaarFront: 'aadhaarUrl',
          license: 'licenseUrl',
          rc: 'rcUrl',
          photo: 'vehiclePhotoUrl'
        };

        for (const [docKey, dbKey] of Object.entries(keysMap)) {
           if (documents[docKey]) {
             uploadPromises.push(processDoc(docKey, documents[docKey]).then(res => {
               updateData[dbKey] = res.url;
             }));
           }
        }
        
        await Promise.all(uploadPromises);
      }

      const updated = await db.drivers.update(req.user!.uid, updateData);
      res.json({ success: true, data: updated, message: 'KYC documents submitted successfully' });
    } catch (error: any) {
      console.error('KYC Submit Error:', error);
      res.status(500).json({ success: false, error: 'Failed to submit KYC' });
    }
  }
);

// Get driver profile details (DRIVER only or ADMIN)
router.get('/:id',
  verifyFirebaseToken,
  async (req, res) => {
    try {
      if (req.user!.role !== 'ADMIN' && req.params.id !== req.user!.uid) {
        res.status(403).json({ success: false, error: 'FORBIDDEN' });
        return;
      }

      const driver = await db.drivers.findByFirebaseUid(req.params.id as string) ||
        await db.drivers.findById(req.params.id as string);

      if (!driver) {
        res.status(404).json({ success: false, error: 'DRIVER_NOT_FOUND' });
        return;
      }

      res.json({ success: true, data: driver });
    } catch (error: any) {
      console.error('Get Driver Profile Error:', error);
      res.status(500).json({ success: false, error: 'INTERNAL_ERROR' });
    }
  }
);

export default router;
