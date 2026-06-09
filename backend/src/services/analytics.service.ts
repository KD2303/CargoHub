import { db } from '../config/database';

export const analyticsService = {
  /**
   * Tracks an event by logging it into the audit_logs table.
   * This is our native alternative to PostHog.
   */
  async trackEvent(eventName: string, userId: string, targetType: 'user' | 'driver' | 'booking', targetId: string, metadata?: any) {
    try {
      await db.auditLogs.create({
        id: crypto.randomUUID(),
        adminUid: userId, // Using adminUid field to store the actor's ID
        action: eventName,
        targetType,
        targetId,
        metadata,
        createdAt: new Date().toISOString()
      });
      console.log(`[Analytics Tracked] ${eventName} for ${targetType} ${targetId}`);
    } catch (error) {
      console.error('Failed to track analytics event', error);
    }
  }
};
