// ============================================================================
// Admin Routes (ADMIN only)
// GET /admin/bookings, GET /admin/drivers, PATCH /admin/drivers/:id/verify
// PATCH /admin/drivers/:id/status, PATCH /admin/bookings/:id/cancel
// GET /admin/analytics/revenue, GET /admin/analytics/heatmap
// ============================================================================

import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../config/database';
import { verifyFirebaseToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { KycDecisionSchema, DriverSuspensionSchema, AdminCancelBookingSchema } from '@cargohub/shared';

const router = Router();

// All admin routes require ADMIN role
router.use(verifyFirebaseToken, requireRole('ADMIN'));

// Get all bookings with filters
router.get('/bookings', (req, res) => {
  const result = db.bookings.getAll({
    status: req.query.status as any,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 20,
  });
  res.json({ success: true, ...result });
});

// Get all drivers (KYC queue)
router.get('/drivers', (req, res) => {
  let drivers = db.drivers.getAll();

  if (req.query.kycStatus) {
    drivers = drivers.filter(d => d.kycStatus === req.query.kycStatus);
  }
  if (req.query.vehicleType) {
    drivers = drivers.filter(d => d.vehicleType === req.query.vehicleType);
  }

  res.json({ success: true, data: drivers, total: drivers.length });
});

// Approve/reject driver KYC
router.patch('/drivers/:id/verify',
  validate(KycDecisionSchema),
  (req, res) => {
    const driver = db.drivers.findById(req.params.id as string) ||
      db.drivers.findByFirebaseUid(req.params.id as string);

    if (!driver) {
      res.status(404).json({ success: false, error: 'DRIVER_NOT_FOUND' });
      return;
    }

    const updated = db.drivers.update(driver.firebaseUid, {
      kycStatus: req.body.decision,
      isAvailable: req.body.decision === 'VERIFIED' ? driver.isAvailable : false,
    });

    // Audit log
    db.auditLogs.create({
      id: uuid(),
      adminUid: req.user!.uid,
      action: req.body.decision === 'VERIFIED' ? 'KYC_APPROVED' : 'KYC_REJECTED',
      targetType: 'driver',
      targetId: driver.id,
      metadata: { reason: req.body.reason, previousStatus: driver.kycStatus },
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, data: updated });
  }
);

// Suspend/reinstate driver
router.patch('/drivers/:id/status',
  validate(DriverSuspensionSchema),
  (req, res) => {
    const driver = db.drivers.findById(req.params.id as string) ||
      db.drivers.findByFirebaseUid(req.params.id as string);

    if (!driver) {
      res.status(404).json({ success: false, error: 'DRIVER_NOT_FOUND' });
      return;
    }

    // Update both user and driver records
    db.users.update(driver.firebaseUid, { isActive: req.body.isActive });
    const updated = db.drivers.update(driver.firebaseUid, {
      isActive: req.body.isActive,
      isAvailable: req.body.isActive ? driver.isAvailable : false,
    });

    // Audit log
    db.auditLogs.create({
      id: uuid(),
      adminUid: req.user!.uid,
      action: req.body.isActive ? 'DRIVER_REINSTATED' : 'DRIVER_SUSPENDED',
      targetType: 'driver',
      targetId: driver.id,
      metadata: { reason: req.body.reason },
      createdAt: new Date().toISOString(),
    });

    // If suspended, disconnect their socket
    if (!req.body.isActive) {
      const io = req.app.get('io');
      io.to(`driver:${driver.firebaseUid}`).emit('notification', {
        title: 'Account Suspended',
        body: req.body.reason,
        data: { type: 'SUSPENSION' },
      });
    }

    res.json({ success: true, data: updated });
  }
);

// Admin cancel any booking
router.patch('/bookings/:id/cancel',
  validate(AdminCancelBookingSchema),
  (req, res) => {
    const booking = db.bookings.findById(req.params.id as string);

    if (!booking) {
      res.status(404).json({ success: false, error: 'BOOKING_NOT_FOUND' });
      return;
    }

    const updated = db.bookings.update(booking.id, {
      status: 'CANCELLED',
      cancellationReason: `Admin: ${req.body.reason}`,
    });

    // Audit log
    db.auditLogs.create({
      id: uuid(),
      adminUid: req.user!.uid,
      action: 'BOOKING_CANCELLED',
      targetType: 'booking',
      targetId: booking.id,
      metadata: { reason: req.body.reason, previousStatus: booking.status },
      createdAt: new Date().toISOString(),
    });

    // Notify booking room
    const io = req.app.get('io');
    io.to(`booking:${booking.id}`).emit('booking:cancelled', {
      bookingId: booking.id,
      reason: `Admin: ${req.body.reason}`,
    });

    res.json({ success: true, data: updated });
  }
);

// Revenue analytics
router.get('/analytics/revenue', (_req, res) => {
  const revenue = db.analytics.getRevenue();
  res.json({ success: true, data: revenue });
});

// Booking heatmap
router.get('/analytics/heatmap', (_req, res) => {
  const heatmap = db.analytics.getHeatmap();
  res.json({ success: true, data: heatmap });
});

export default router;
