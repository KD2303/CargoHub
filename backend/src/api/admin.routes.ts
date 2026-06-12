// ============================================================================
// Admin Routes (ADMIN only)
// GET /admin/bookings, GET /admin/drivers, PATCH /admin/drivers/:id/verify
// PATCH /admin/drivers/:id/status, PATCH /admin/bookings/:id/cancel
// GET /admin/analytics/revenue, GET /admin/analytics/heatmap
// ============================================================================

import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../config/database';
import { redis } from '../config/redis';
import { verifyFirebaseToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { KycDecisionSchema, DriverSuspensionSchema, AdminCancelBookingSchema } from '@cargohub/shared';

const router = Router();

// All admin routes require ADMIN role
router.use(verifyFirebaseToken, requireRole('ADMIN'));

// Get all bookings with filters
router.get('/bookings', async (req, res) => {
  const result = await db.bookings.getAll({
    status: req.query.status as any,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 20,
  });
  res.json({ success: true, ...result });
});

// Get all drivers (KYC queue)
router.get('/drivers', async (req, res) => {
  let drivers = await db.drivers.getAll();

  if (req.query.kycStatus) {
    drivers = drivers.filter(d => d.kycStatus === req.query.kycStatus);
  }
  if (req.query.vehicleType) {
    drivers = drivers.filter(d => d.vehicleType === req.query.vehicleType);
  }

  res.json({ success: true, data: drivers, total: drivers.length });
});

// Get all customers/users
router.get('/customers', async (req, res) => {
  try {
    const users = await db.users.getAll();
    
    // Attach stats (spent, bookings) for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        try {
          const stats = await db.bookings.getUserStats(user.firebaseUid);
          return { ...user, totalBookings: stats.totalBookings, spent: stats.totalSpent };
        } catch {
          return { ...user, totalBookings: 0, spent: 0 };
        }
      })
    );

    res.json({ success: true, data: usersWithStats, total: users.length });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch customers' });
  }
});

// Approve/reject driver KYC
router.patch('/drivers/:id/verify',
  validate(KycDecisionSchema),
  async (req, res) => {
    const driver = await db.drivers.findById(req.params.id as string) ||
      await db.drivers.findByFirebaseUid(req.params.id as string);

    if (!driver) {
      res.status(404).json({ success: false, error: 'DRIVER_NOT_FOUND' });
      return;
    }

    const updated = await db.drivers.update(driver.firebaseUid, {
      kycStatus: req.body.decision,
      isAvailable: req.body.decision === 'VERIFIED' ? driver.isAvailable : false,
    });

    // Audit log
    await db.auditLogs.create({
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
  async (req, res) => {
    const driver = await db.drivers.findById(req.params.id as string) ||
      await db.drivers.findByFirebaseUid(req.params.id as string);

    if (!driver) {
      res.status(404).json({ success: false, error: 'DRIVER_NOT_FOUND' });
      return;
    }

    // Update both user and driver records
    await db.users.update(driver.firebaseUid, { isActive: req.body.isActive });
    const updated = await db.drivers.update(driver.firebaseUid, {
      isActive: req.body.isActive,
      isAvailable: req.body.isActive ? driver.isAvailable : false,
    });

    // Audit log
    await db.auditLogs.create({
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
  async (req, res) => {
    const booking = await db.bookings.findById(req.params.id as string);

    if (!booking) {
      res.status(404).json({ success: false, error: 'BOOKING_NOT_FOUND' });
      return;
    }

    const updated = await db.bookings.update(booking.id, {
      status: 'CANCELLED',
      cancellationReason: `Admin: ${req.body.reason}`,
    });

    // Audit log
    await db.auditLogs.create({
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
router.get('/analytics/revenue', async (_req, res) => {
  const revenue = await db.analytics.getRevenue();
  res.json({ success: true, data: revenue });
});

// Dashboard stats
router.get('/dashboard-stats', async (_req, res) => {
  try {
    const cacheKey = 'admin:dashboard_stats';
    let stats: any = null;

    if (redis) {
      try {
        stats = await redis.get(cacheKey);
      } catch (e) {
        console.warn('Redis cache get failed for dashboard stats');
      }
    }

    if (!stats) {
      stats = await db.analytics.getDashboardStats();
      if (redis) {
        try {
          await redis.setex(cacheKey, 60, JSON.stringify(stats));
        } catch (e) {
          console.warn('Redis cache set failed for dashboard stats');
        }
      }
    } else if (typeof stats === 'string') {
      stats = JSON.parse(stats);
    }

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
  }
});

// Booking heatmap
router.get('/analytics/heatmap', async (_req, res) => {
  const heatmap = await db.analytics.getHeatmap();
  res.json({ success: true, data: heatmap });
});

export default router;
