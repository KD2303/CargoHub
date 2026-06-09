import { v2 as cloudinary } from 'cloudinary';
import { db } from '../config/database';
import { emailService } from './email.service';
import { analyticsService } from './analytics.service';

if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

export const kycService = {
  /**
   * Approves or rejects a driver's KYC documents
   */
  async updateKycStatus(adminUid: string, driverId: string, decision: 'VERIFIED' | 'REJECTED', reason?: string) {
    const driver = await db.drivers.findById(driverId);
    if (!driver) throw new Error('Driver not found');

    const updated = await db.drivers.update(driver.firebaseUid, {
      kycStatus: decision,
      isActive: decision === 'VERIFIED',
    });

    const user = await db.users.findByFirebaseUid(driver.firebaseUid);

    // Analytics Tracking
    await analyticsService.trackEvent(
      decision === 'VERIFIED' ? 'kyc_approved' : 'kyc_rejected', 
      adminUid, 
      'driver', 
      driver.id,
      { reason }
    );

    // Email notification
    if (user?.email && decision === 'VERIFIED') {
      await emailService.sendKycApproved(user.email, user.name);
    }

    return updated;
  }
};
