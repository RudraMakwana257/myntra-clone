import * as Notifications from 'expo-notifications';
import axios from 'axios';
import { Platform } from 'react-native';

/**
 * Notification Service
 * Handles sending notifications via Expo Push API
 * Supports immediate and scheduled notifications
 */

const EXPO_PUSH_API_URL = 'https://exp.host/--/api/v2/push/send';

interface NotificationData {
  type: 'offer' | 'order' | 'cart' | 'general';
  [key: string]: any;
}

interface SendNotificationOptions {
  token: string;
  title: string;
  body: string;
  data?: NotificationData;
  sound?: string;
  badge?: number;
  priority?: 'default' | 'normal' | 'high';
  channelId?: string;
  scheduledFor?: Date;
}

/**
 * Send a push notification to a device token
 */
export async function sendPushNotification(options: SendNotificationOptions): Promise<void> {
  try {
    const {
      token,
      title,
      body,
      data,
      sound = 'default',
      badge,
      priority = 'high',
      channelId,
      scheduledFor,
    } = options;

    const message = {
      to: token,
      sound,
      title,
      body,
      data: data || {},
      priority,
      badge,
      channelId: channelId || getChannelIdForType(data?.type),
    };

    // If scheduled, use Expo's scheduling API
    if (scheduledFor) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound,
          badge,
        },
        trigger: scheduledFor,
      });
    } else {
      // Send immediately via Expo Push API
      await axios.post(EXPO_PUSH_API_URL, message, {
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
}

/**
 * Send notifications to multiple tokens
 */
export async function sendPushNotificationsToMultiple(
  tokens: string[],
  title: string,
  body: string,
  data?: NotificationData,
  options?: Partial<SendNotificationOptions>
): Promise<void> {
  try {
    const promises = tokens.map((token) =>
      sendPushNotification({
        token,
        title,
        body,
        data,
        ...options,
      })
    );

    await Promise.all(promises);
  } catch (error) {
    console.error('Error sending notifications to multiple tokens:', error);
    throw error;
  }
}

/**
 * Get channel ID for notification type (Android)
 */
function getChannelIdForType(type?: string): string | undefined {
  if (Platform.OS !== 'android') {
    return undefined;
  }

  switch (type) {
    case 'offer':
      return 'offers';
    case 'order':
      return 'orders';
    case 'cart':
      return 'cart';
    default:
      return 'default';
  }
}

/**
 * Send order status update notification
 */
export async function sendOrderUpdateNotification(
  token: string,
  orderId: string,
  status: string
): Promise<void> {
  await sendPushNotification({
    token,
    title: 'Order Status Update',
    body: `Your order #${orderId} is now ${status}`,
    data: {
      type: 'order',
      orderId,
      status,
    },
    channelId: 'orders',
    priority: 'high',
  });
}

/**
 * Send cart abandonment reminder
 */
export async function sendCartReminderNotification(
  token: string,
  itemCount: number,
  total: number
): Promise<void> {
  await sendPushNotification({
    token,
    title: "Don't forget your items!",
    body: `You have ${itemCount} item${itemCount > 1 ? 's' : ''} worth ₹${total.toFixed(2)} in your cart`,
    data: {
      type: 'cart',
      itemCount,
      total,
    },
    channelId: 'cart',
    priority: 'default',
  });
}

/**
 * Send offer notification
 */
export async function sendOfferNotification(
  token: string,
  title: string,
  body: string,
  offerData?: Record<string, any>
): Promise<void> {
  await sendPushNotification({
    token,
    title,
    body,
    data: {
      type: 'offer',
      ...offerData,
    },
    channelId: 'offers',
    priority: 'normal',
  });
}

/**
 * Schedule a notification for later
 */
export async function scheduleNotification(
  title: string,
  body: string,
  scheduledFor: Date,
  data?: NotificationData
): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
      sound: 'default',
    },
    trigger: scheduledFor,
  });

  return notificationId;
}

/**
 * Cancel a scheduled notification
 */
export async function cancelScheduledNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get all scheduled notifications
 */
export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

