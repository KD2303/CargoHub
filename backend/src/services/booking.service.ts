import { v4 as uuid } from 'uuid';
import { db } from '../config/database';
import { calculateSmartFare, Booking, BookingCreateInput } from '@cargohub/shared';
import { analyticsService } from './analytics.service';
import { emailService } from './email.service';
import { notificationService } from './notification.service';
import axios from 'axios';

export const bookingService = {
  /**
   * Creates a new booking, assigns default fare, and alerts nearby drivers
   */
  async createBooking(userId: string, input: BookingCreateInput, io: any): Promise<{ booking: Booking, fareBreakdown: any }> {
    // Determine exact distance from OLA Maps
    let distanceKm = 10; // Fallback
    if (process.env.OLA_MAPS_API_KEY) {
      try {
        const origin = `${input.pickupLat},${input.pickupLng}`;
        const destination = `${input.dropLat},${input.dropLng}`;
        const olaRes = await axios.get('https://api.olamaps.io/routing/v1/distanceMatrix', {
          params: { origins: origin, destinations: destination, api_key: process.env.OLA_MAPS_API_KEY }
        });
        
        if (olaRes.data?.rows?.[0]?.elements?.[0]?.status === 'OK') {
          const element = olaRes.data.rows[0].elements[0];
          const dist = typeof element.distance === 'object' ? element.distance.value : element.distance;
          distanceKm = dist / 1000;
        }
      } catch (err) {
        console.error('OLA Maps API error:', err instanceof Error ? err.message : err);
      }
    }

    const baseFare = calculateSmartFare({
      pickupLat: input.pickupLat,
      pickupLng: input.pickupLng,
      dropLat: input.dropLat,
      dropLng: input.dropLng,
      vehicleType: input.vehicleType,
      loadType: input.loadType, // kept for schema compat
      helpersRequested: input.helpersRequested,
      weight: input.weight,
      distanceKm: distanceKm,
    });

    const finalFareTotal = baseFare.total;

    const booking: Booking = {
      id: uuid(),
      bookingRef: `FA-${Date.now().toString(36).toUpperCase()}`,
      userId,
      pickupLat: input.pickupLat,
      pickupLng: input.pickupLng,
      pickupAddress: input.pickupAddress,
      dropLat: input.dropLat,
      dropLng: input.dropLng,
      dropAddress: input.dropAddress,
      vehicleType: input.vehicleType,
      loadType: input.loadType,
      helpersRequested: input.helpersRequested,
      fareEstimate: finalFareTotal,
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.bookings.create(booking);

    // Track analytics
    await analyticsService.trackEvent('booking_created', userId, 'booking', booking.id, { vehicleType: booking.vehicleType });

    // Web notification for Admin
    notificationService.emitWebDashboardAlert(io, 'admin:booking_new', booking);

    // Alert Nearby Drivers
    const nearbyDrivers = await db.drivers.findNearby(input.pickupLat, input.pickupLng, input.vehicleType);
    if (nearbyDrivers.length > 0) {
      const targetDriver = nearbyDrivers[0];
      io.to(`driver:${targetDriver.firebaseUid}`).emit('booking:new', booking);
      await notificationService.sendMobilePush(targetDriver.firebaseUid, 'New Booking Request', `Pickup: ${booking.pickupAddress}`);
    }

    // Email user
    const user = await db.users.findByFirebaseUid(userId);
    if (user?.email) {
      await emailService.sendBookingConfirmation(user.email, user.name, booking.bookingRef);
    }

    return { booking, fareBreakdown: { ...baseFare, distanceKm, total: finalFareTotal } };
  },

  /**
   * Cancel an existing booking by user
   */
  async cancelBookingByUser(bookingId: string, reason: string, io: any) {
    const updated = await db.bookings.update(bookingId, {
      status: 'CANCELLED',
      cancellationReason: reason,
    });

    await analyticsService.trackEvent('booking_cancelled', updated.userId, 'booking', bookingId, { reason });
    
    // Notify driver
    if (updated.driverId) {
      io.to(`booking:${updated.id}`).emit('booking:cancelled', { bookingId: updated.id, reason });
      await notificationService.sendMobilePush(updated.driverId, 'Booking Cancelled', 'The customer cancelled the trip.');
    }

    return updated;
  }
};
