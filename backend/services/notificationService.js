const axios = require('axios');

/**
 * Notification Service for Backend
 * Handles sending notifications via Expo Push API
 */

const EXPO_PUSH_API_URL = 'https://exp.host/--/api/v2/push/send';

/**
 * Send push notification to a device token
 */
async function sendPushNotification(token, title, body, data = {}, options = {}) {
  try {
    const message = {
      to: token,
      sound: options.sound || 'default',
      title,
      body,
      data: data || {},
      priority: options.priority || 'high',
      badge: options.badge,
      channelId: options.channelId,
    };

    const response = await axios.post(EXPO_PUSH_API_URL, message, {
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
}

/**
 * Send notifications to multiple tokens
 */
async function sendPushNotificationsToMultiple(tokens, title, body, data = {}, options = {}) {
  try {
    const promises = tokens.map((token) =>
      sendPushNotification(token, title, body, data, options)
    );

    const results = await Promise.allSettled(promises);
    return results;
  } catch (error) {
    console.error('Error sending notifications to multiple tokens:', error);
    throw error;
  }
}

/**
 * Send order status update notification
 */
async function sendOrderUpdateNotification(tokens, orderId, status) {
  const title = 'Order Status Update';
  const body = `Your order #${orderId} is now ${status}`;

  return await sendPushNotificationsToMultiple(
    tokens,
    title,
    body,
    {
      type: 'order',
      orderId: orderId.toString(),
      status,
    },
    {
      channelId: 'orders',
      priority: 'high',
    }
  );
}

/**
 * Send cart abandonment reminder
 */
async function sendCartReminderNotification(tokens, itemCount, total) {
  const title = "Don't forget your items!";
  const body = `You have ${itemCount} item${itemCount > 1 ? 's' : ''} worth ₹${total.toFixed(2)} in your cart`;

  return await sendPushNotificationsToMultiple(
    tokens,
    title,
    body,
    {
      type: 'cart',
      itemCount,
      total,
    },
    {
      channelId: 'cart',
      priority: 'default',
    }
  );
}

/**
 * Send offer notification
 */
async function sendOfferNotification(tokens, title, body, offerData = {}) {
  return await sendPushNotificationsToMultiple(
    tokens,
    title,
    body,
    {
      type: 'offer',
      ...offerData,
    },
    {
      channelId: 'offers',
      priority: 'normal',
    }
  );
}

module.exports = {
  sendPushNotification,
  sendPushNotificationsToMultiple,
  sendOrderUpdateNotification,
  sendCartReminderNotification,
  sendOfferNotification,
};

