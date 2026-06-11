import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set global handler so notifications show even when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const initNotifications = async () => {
  if (Platform.OS === 'android') {
    // Channel for Job Requests (Urgent, custom sound/vibration)
    await Notifications.setNotificationChannelAsync('job-requests', {
      name: 'New Job Requests',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 200, 500],
      lightColor: '#D85A30',
    });

    // Channel for General Updates
    await Notifications.setNotificationChannelAsync('updates', {
      name: 'Status Updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250],
      lightColor: '#378ADD',
    });
  }

  // Setup Notification Categories for actionable pushes
  await Notifications.setNotificationCategoryAsync('new_job', [
    {
      identifier: 'accept_job',
      buttonTitle: '✅ Accept',
      options: { opensAppToForeground: true },
    },
    {
      identifier: 'decline_job',
      buttonTitle: '❌ Decline',
      options: { isDestructive: true, opensAppToForeground: false },
    },
  ]);
};

export const triggerJobRequestNotification = async (jobDetails: any) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'New Job Request 🚛',
      body: `₹${jobDetails.fareEstimate} · ${jobDetails.distance || '4.2'} km · ${jobDetails.loadType} — Tap to respond`,
      data: { type: 'job_request', job: jobDetails },
      categoryIdentifier: 'new_job',
      sound: true, // In production, provide a custom sound file
    },
    trigger: null, // trigger immediately
  });

  // Auto dismiss after 30 seconds
  setTimeout(() => {
    // Cancel the specific notification if possible, but for simplicity we cancel all local or just dismiss
    // Unfortunately expo-notifications doesn't let us update a specific notification easily without its ID,
    // so we'll just clear it for demonstration.
    Notifications.dismissAllNotificationsAsync();
  }, 30000);
};

export const triggerSystemNotification = async (title: string, body: string, data: any = {}) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { type: 'system', ...data },
      sound: true,
    },
    trigger: null,
  });
};
