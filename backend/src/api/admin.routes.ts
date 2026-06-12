// ============================================================================
// Admin Routes (ADMIN only)
// GET /admin/bookings, GET /admin/drivers, PATCH /admin/drivers/:id/verify
// PATCH /admin/drivers/:id/status, PATCH /admin/bookings/:id/cancel
// GET /admin/analytics/revenue, GET /admin/analytics/heatmap
// ============================================================================

import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../config/database';
import { verifyAdminToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { KycDecisionSchema, DriverSuspensionSchema, AdminCancelBookingSchema } from '@cargohub/shared';

const router = Router();

// All admin routes require custom admin token and ADMIN role
router.use(verifyAdminToken, requireRole('ADMIN'));

// Global Audit Logger for Admin Mutations
router.use(async (req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    // We log it asynchronously so it doesn't block the request
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          await db.auditLogs.create({
            id: uuid(),
            adminUid: req.user!.uid,
            action: `${req.method}_${req.path.replace(/\//g, '_').toUpperCase()}`.replace(/^_|_$/g, ''),
            targetType: 'system',
            targetId: req.path,
            metadata: { method: req.method, path: req.path, query: req.query, body: req.body },
            createdAt: new Date().toISOString(),
          } as any);
        } catch(e) {
          console.error("Global Audit Log failed", e);
        }
      }
    });
  }
  next();
});

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

router.delete('/drivers/:id', async (req, res) => {
  await db.drivers.delete(req.params.id);
  await db.auditLogs.create({
    id: uuid(),
    adminUid: req.user!.uid,
    action: 'DRIVER_DELETED',
    targetType: 'driver',
    targetId: req.params.id,
    metadata: { reason: req.query.reason || 'Admin deletion' },
    createdAt: new Date().toISOString(),
  } as any);
  res.json({ success: true });
});

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

// Admin create manual booking
router.post('/bookings', async (req, res) => {
  const payload = {
    id: `BK-${Math.floor(Math.random() * 10000)}`,
    ...req.body,
    status: req.body.status || 'PENDING',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  const created = await db.bookings.create(payload);
  await db.auditLogs.create({
    id: uuid(),
    adminUid: req.user!.uid,
    action: 'BOOKING_CREATED_MANUAL',
    targetType: 'booking',
    targetId: created.id,
    metadata: { route: payload.route },
    createdAt: new Date().toISOString(),
  } as any);
  res.json({ success: true, data: created });
});

// Admin delete any booking
router.delete('/bookings/:id', async (req, res) => {
  await db.bookings.delete(req.params.id);
  await db.auditLogs.create({
    id: uuid(),
    adminUid: req.user!.uid,
    action: 'BOOKING_DELETED',
    targetType: 'booking',
    targetId: req.params.id,
    metadata: { reason: req.query.reason || 'Admin deletion' },
    createdAt: new Date().toISOString(),
  } as any);
  res.json({ success: true });
});

// Revenue analytics
router.get('/analytics/revenue', async (_req, res) => {
  const revenue = await db.analytics.getRevenue();
  res.json({ success: true, data: revenue });
});

// Dashboard stats
router.get('/dashboard-stats', async (_req, res) => {
  try {
    const stats = await db.analytics.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
  }
});

// Global Search
router.get('/search', async (req, res) => {
  const query = (req.query.q as string || '').toLowerCase();
  if (!query) {
    return res.json({ success: true, data: [] });
  }

  const [users, drivers, bookings] = await Promise.all([
    db.users.getAll(),
    db.drivers.getAll(),
    db.bookings.getAll({ page: 1, limit: 1000 })
  ]);

  const results = [];

  for (const u of users) {
    if (u.name?.toLowerCase().includes(query) || u.email?.toLowerCase().includes(query) || u.phone?.includes(query)) {
      results.push({ id: u.firebaseUid, type: 'Customer', title: u.name || 'Unknown', desc: u.email || u.phone, url: `/admin/customers` });
    }
  }

  for (const d of drivers) {
    if (d.name?.toLowerCase().includes(query) || d.email?.toLowerCase().includes(query) || d.vehicleNumber?.toLowerCase().includes(query)) {
      results.push({ id: d.firebaseUid, type: 'Driver', title: d.name || 'Unknown', desc: d.vehicleNumber || d.email, url: `/admin/drivers` });
    }
  }

  for (const b of (bookings.data || [])) {
    if (b.id?.toLowerCase().includes(query) || b.userName?.toLowerCase().includes(query) || b.route?.toLowerCase().includes(query)) {
      results.push({ id: b.id, type: 'Booking', title: b.id, desc: `${b.userName || 'Unknown'} - ${b.route || 'Unknown'}`, url: `/admin/bookings` });
    }
  }

  res.json({ success: true, data: results.slice(0, 8) }); // Limit to top 8
});

// Booking heatmap
router.get('/analytics/heatmap', async (_req, res) => {
  const heatmap = await db.analytics.getHeatmap();
  res.json({ success: true, data: heatmap });
});

// ==========================================
// Settings
// ==========================================
let adminSettings = {
  baseFare: 50,
  perKmRate: 12
};

router.get('/settings', (req, res) => {
  res.json({ success: true, data: adminSettings });
});

router.post('/settings', (req, res) => {
  adminSettings = { ...adminSettings, ...req.body };
  res.json({ success: true, data: adminSettings });
});

// ==========================================
// Live Sessions
// ==========================================
import { liveUsers } from '../shared/liveUsers';

router.get('/live-sessions', (req, res) => {
  const users = Array.from(liveUsers.USER.values());
  const drivers = Array.from(liveUsers.DRIVER.values());
  const admins = Array.from(liveUsers.ADMIN.values());
  res.json({ success: true, data: [...users, ...drivers, ...admins] });
});

router.delete('/live-sessions/:uid', (req, res) => {
  const { uid } = req.params;
  liveUsers.USER.delete(uid);
  liveUsers.DRIVER.delete(uid);
  liveUsers.ADMIN.delete(uid);

  const io = req.app.get('io');
  if (io) {
    // Optionally emit a force disconnect signal
    io.to(`user:${uid}`).emit('system:disconnect');
    io.to(`driver:${uid}`).emit('system:disconnect');
  }

  res.json({ success: true });
});

// ==========================================
// User Management
// ==========================================
router.get('/users', async (req, res) => {
  const users = await db.users.getAll();
  res.json({ success: true, data: users, total: users.length });
});

router.patch('/users/:id', async (req, res) => {
  const user = await db.users.findByFirebaseUid(req.params.id);
  if (!user) {
    res.status(404).json({ success: false, error: 'USER_NOT_FOUND' });
    return;
  }
  
  const updated = await db.users.update(user.firebaseUid, req.body);
  
  await db.auditLogs.create({
    id: uuid(),
    adminUid: req.user!.uid,
    action: 'USER_UPDATED',
    targetType: 'user',
    targetId: user.firebaseUid,
    metadata: { updates: Object.keys(req.body) },
    createdAt: new Date().toISOString(),
  } as any);
  
  res.json({ success: true, data: updated });
});

router.patch('/users/:id/status', async (req, res) => {
  const user = await db.users.findByFirebaseUid(req.params.id);
  if (!user) {
    res.status(404).json({ success: false, error: 'USER_NOT_FOUND' });
    return;
  }
  
  const updated = await db.users.update(user.firebaseUid, { isActive: req.body.isActive });
  
  await db.auditLogs.create({
    id: uuid(),
    adminUid: req.user!.uid,
    action: req.body.isActive ? 'USER_REINSTATED' : 'USER_SUSPENDED',
    targetType: 'user',
    targetId: user.firebaseUid,
    metadata: { reason: req.body.reason },
    createdAt: new Date().toISOString(),
  } as any);
  
  res.json({ success: true, data: updated });
});

router.delete('/users/:id', async (req, res) => {
  await db.users.delete(req.params.id);
  await db.auditLogs.create({
    id: uuid(),
    adminUid: req.user!.uid,
    action: 'USER_DELETED',
    targetType: 'user',
    targetId: req.params.id,
    metadata: { reason: req.query.reason || 'Admin deletion' },
    createdAt: new Date().toISOString(),
  } as any);
  res.json({ success: true });
});

// ==========================================
// Broadcasts
// ==========================================
router.get('/broadcasts', async (req, res) => {
  const broadcasts = await db.broadcasts.getAll();
  res.json({ success: true, data: broadcasts, total: broadcasts.length });
});

router.post('/broadcasts', async (req, res) => {
  const payload = {
    id: uuid(),
    title: req.body.title,
    message: req.body.message,
    target: req.body.target,
    status: req.body.startDate ? 'SCHEDULED' : 'SENT',
    scheduled_at: req.body.startDate || null,
    sent_at: req.body.startDate ? null : new Date().toISOString(),
    created_at: new Date().toISOString()
  };
  const created = await db.broadcasts.create(payload);
  
  if (!req.body.startDate) {
    // Push to notification store immediately
    await db.notifications.create({
      id: uuid(),
      targetUid: payload.target === 'ALL' ? 'ALL' : payload.target,
      title: payload.title,
      body: payload.message,
      type: 'BROADCAST',
      createdAt: payload.created_at,
      expiresAt: req.body.endDate || null
    });

    const io = req.app.get('io');
    if (io) {
      if (payload.target === 'ALL') {
        io.emit('notification', {
          title: req.body.title,
          body: req.body.message,
          data: { type: 'BROADCAST' }
        });
      } else {
        io.to(`user:${payload.target}`).emit('notification', {
          title: req.body.title,
          body: req.body.message,
          data: { type: 'BROADCAST' }
        });
        io.to(`driver:${payload.target}`).emit('notification', {
          title: req.body.title,
          body: req.body.message,
          data: { type: 'BROADCAST' }
        });
      }
    }
  }

  await db.auditLogs.create({
    id: uuid(),
    adminUid: req.user!.uid,
    action: req.body.startDate ? 'BROADCAST_SCHEDULED' : 'BROADCAST_SENT',
    targetType: 'broadcast',
    targetId: payload.id,
    metadata: { target: payload.target, startDate: req.body.startDate, endDate: req.body.endDate },
    createdAt: new Date().toISOString(),
  } as any);

  res.json({ success: true, data: created });
});

router.delete('/broadcasts/:id', async (req, res) => {
  await db.broadcasts.delete(req.params.id);
  res.json({ success: true });
});

// ==========================================
// Promo Codes
// ==========================================
router.get('/promo-codes', async (req, res) => {
  const promos = await db.promoCodes.getAll();
  res.json({ success: true, data: promos, total: promos.length });
});

router.post('/promo-codes', async (req, res) => {
  const payload = {
    id: uuid(),
    code: req.body.code,
    discount_amount: req.body.discountAmount,
    discount_type: req.body.discountType,
    expiry_date: req.body.expiryDate,
    is_active: true,
    created_at: new Date().toISOString()
  };
  const created = await db.promoCodes.create(payload);
  await db.auditLogs.create({
    id: uuid(),
    adminUid: req.user!.uid,
    action: 'PROMO_CREATED',
    targetType: 'promo',
    targetId: payload.id,
    metadata: { code: payload.code },
    createdAt: new Date().toISOString(),
  } as any);
  res.json({ success: true, data: created });
});

router.delete('/promo-codes/:id', async (req, res) => {
  await db.promoCodes.delete(req.params.id);
  res.json({ success: true });
});

// ==========================================
// Audit Logs
// ==========================================
router.get('/audit-logs', async (req, res) => {
  const logs = await db.auditLogs.getAll();
  res.json({ success: true, data: logs, total: logs.length });
});

export default router;
