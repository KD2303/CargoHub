// ============================================================================
// Socket.io Server — Real-time event handlers
// Handles connections from Android, iOS, and Website clients
// ============================================================================

import { Server } from 'socket.io';
import { db } from '../config/database';
import { VALID_STATUS_TRANSITIONS } from '@cargohub/shared';
import type { ClientToServerEvents, ServerToClientEvents, BookingStatus } from '@cargohub/shared';

import { liveUsers } from '../shared/liveUsers';

export function setupSocketHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>
): void {
  io.on('connection', async (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Get user identity from auth handshake
    const token = socket.handshake.auth?.token as string;
    const mockUid = socket.handshake.auth?.mockUid as string;
    const uid = mockUid || token;

    if (uid) {
      const user = await db.users.findByFirebaseUid(uid);
      if (user) {
        socket.data.uid = user.firebaseUid;
        socket.data.role = user.role;
        liveUsers[user.role as keyof typeof liveUsers]?.set(user.firebaseUid, {
          uid: user.firebaseUid,
          role: user.role,
          email: user.email,
          name: user.name || user.email || 'Unknown',
          startTime: Date.now(),
          lastPulse: Date.now()
        });

        // Auto-join personal room
        if (user.role === 'USER') {
          socket.join(`user:${uid}`);
          console.log(`   → User ${user.name} joined room user:${uid}`);
        } else if (user.role === 'DRIVER') {
          socket.join(`driver:${uid}`);
          console.log(`   → Driver ${user.name} joined room driver:${uid}`);
        } else if (user.role === 'ADMIN') {
          socket.join('admin_dashboard');
          console.log(`   → Admin ${user.name} joined room admin_dashboard`);
        }
      }
    }

    // ── Join Booking Room ──────────────────────────────────────────────────

    socket.on('join:booking', ({ bookingId }: { bookingId: string }) => {
      socket.join(`booking:${bookingId}`);
      console.log(`   → Socket ${socket.id} joined booking:${bookingId}`);
    });

    // ── Driver Location Update ─────────────────────────────────────────────

    socket.on('driver:location', async (data: { bookingId?: string; lat: number; lng: number; heading?: number; speed?: number; timestamp?: number }) => {
      if (!uid) return;

      // Update driver location in DB
      await db.drivers.update(uid, {
        currentLat: data.lat,
        currentLng: data.lng,
      });

      // Broadcast to booking room
      if (data.bookingId) {
        io.to(`booking:${data.bookingId}`).emit('driver:location', {
          driverId: uid,
          lat: data.lat,
          lng: data.lng,
          heading: data.heading,
          speed: data.speed,
          timestamp: data.timestamp || Date.now(),
        });
      }
    });

    // ── Booking Accept ─────────────────────────────────────────────────────

    socket.on('booking:accept', async ({ bookingId }: { bookingId: string }) => {
      if (!uid) return;

      const booking = await db.bookings.findById(bookingId);
      if (!booking || booking.status !== 'PENDING') return;

      const driver = await db.drivers.findByFirebaseUid(uid);
      if (!driver || !driver.isAvailable || driver.kycStatus !== 'VERIFIED') return;

      // Assign driver to booking
      await db.bookings.update(bookingId, {
        driverId: uid,
        status: 'ACCEPTED',
      });

      // Mark driver as on trip
      await db.drivers.update(uid, { isAvailable: false });

      // Join booking room
      socket.join(`booking:${bookingId}`);

      // Notify user
      io.to(`booking:${bookingId}`).emit('booking:accepted', {
        driverId: uid,
        driverName: driver.name,
        eta: 8, // Mock ETA
      });

      io.to(`user:${booking.userId}`).emit('notification', {
        title: 'Driver Accepted! 🚛',
        body: `${driver.name} is on the way`,
        data: { bookingId, screen: 'tracking' },
      });

      console.log(`   ✅ Driver ${driver.name} accepted booking ${bookingId}`);
    });

    // ── Booking Reject ─────────────────────────────────────────────────────

    socket.on('booking:reject', ({ bookingId }: { bookingId: string }) => {
      if (!uid) return;
      console.log(`   ❌ Driver ${uid} rejected booking ${bookingId}`);
      // In production: try next nearest driver
    });

    // ── Booking Status Update ──────────────────────────────────────────────

    socket.on('booking:status', async ({ bookingId, status }: { bookingId: string; status: BookingStatus }) => {
      if (!uid) return;

      const booking = await db.bookings.findById(bookingId);
      if (!booking || booking.driverId !== uid) return;

      // Validate transition
      const validTransitions = VALID_STATUS_TRANSITIONS[booking.status];
      if (!validTransitions.includes(status)) {
        console.warn(`   ⚠️ Invalid transition: ${booking.status} → ${status}`);
        return;
      }

      // Update booking
      await db.bookings.update(bookingId, { status });

      // If delivered, set final fare and make driver available
      if (status === 'DELIVERED') {
        await db.bookings.update(bookingId, {
          finalFare: booking.fareEstimate,
        });
        await db.drivers.update(uid, { isAvailable: true });
      }

      // Broadcast to room
      io.to(`booking:${bookingId}`).emit('booking:status', {
        bookingId,
        status,
        timestamp: new Date().toISOString(),
      });

      console.log(`   📦 Booking ${bookingId}: ${booking.status} → ${status}`);
    });

    // ── Disconnect ─────────────────────────────────────────────────────────

    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id} (${reason})`);
      if (socket.data.role && socket.data.uid) {
        liveUsers[socket.data.role as keyof typeof liveUsers]?.delete(socket.data.uid);
      }
    });
  });

  console.log('⚡ Socket.io handlers initialized');
}
