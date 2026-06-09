import { getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { db } from '../config/database';
import { Socket } from 'socket.io';

export const notificationService = {
  /**
   * Send a push notification to a user's mobile device via FCM
   */
  async sendMobilePush(userId: string, title: string, body: string, data?: Record<string, string>) {
    try {
      // Get the user's FCM token
      const user = await db.users.findByFirebaseUid(userId); // In a real app we'd fetch by internal ID or UID
      const fcmToken = user?.fcmToken;
      
      if (!fcmToken) {
        console.warn(`No FCM token for user ${userId}`);
        return;
      }

      if (!getApps().length) {
        console.warn('[MOCK FCM] Firebase admin not initialized. Notification:', { title, body, userId });
        return;
      }

      await getMessaging().send({
        token: fcmToken,
        notification: { title, body },
        data: data || {},
      });
      
      console.log(`Sent FCM notification to user ${userId}`);
    } catch (error) {
      console.error('Failed to send FCM push notification', error);
    }
  },

  /**
   * Emit a real-time web socket event for Web Dashboard notifications 
   * (Replaces OneSignal for website push)
   */
  emitWebDashboardAlert(io: any, eventType: string, payload: any) {
    // Emit to admin dashboard room or business room
    io.to('admin_dashboard').emit(eventType, payload);
    console.log(`Emitted web dashboard alert: ${eventType}`);
  }
};
