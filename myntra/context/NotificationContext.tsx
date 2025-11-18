import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Platform, AppState } from 'react-native';
import { useAuth } from './AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '@/constants/env';

// Only import and configure notifications on native platforms or when window is available (client-side)
let Notifications: typeof import('expo-notifications') | null = null;

if (Platform.OS !== 'web') {
  try {
    Notifications = require('expo-notifications');
    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (error) {
    console.warn('Failed to load expo-notifications:', error);
  }
}

interface NotificationContextType {
  expoPushToken: string | null;
  notification: any | null;
  registerForPushNotifications: () => Promise<string | null>;
  unregisterForPushNotifications: () => Promise<void>;
  updatePreferences: (preferences: NotificationPreferences) => Promise<void>;
  sendTestNotification: () => Promise<void>;
}

interface NotificationPreferences {
  offers?: boolean;
  orderUpdates?: boolean;
  cartReminders?: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<any | null>(null);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);
  const appState = useRef(AppState.currentState);

  // Register for push notifications
  const registerForPushNotifications = async (): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return null;
    }
    if (!Notifications) {
      console.warn('Notifications not available on this platform');
      return null;
    }

    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      // Get the Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'ebeb96a2-b9fb-4d49-b0c2-8c4a4dd38cf0', // From app.json
      });
      const token = tokenData.data;

      setExpoPushToken(token);

      // Register token with backend if user is logged in
      if (user && token) {
        try {
          const platform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';
          
          await axios.post(`${API_BASE_URL}/notification/register`, {
            userId: user._id,
            token,
            platform,
            preferences: {
              offers: true,
              orderUpdates: true,
              cartReminders: true,
            },
          });
        } catch (error) {
          console.error('Error registering token with backend:', error);
        }
      }

      // Configure Android channel
      if (Platform.OS === 'android' && Notifications) {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });

        // Create additional channels for different notification types
        await Notifications.setNotificationChannelAsync('offers', {
          name: 'Offers',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });

        await Notifications.setNotificationChannelAsync('orders', {
          name: 'Order Updates',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });

        await Notifications.setNotificationChannelAsync('cart', {
          name: 'Cart Reminders',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });
      }

      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  };

  // Unregister from push notifications
  const unregisterForPushNotifications = async (): Promise<void> => {
    try {
      if (expoPushToken) {
        await axios.post(`${API_BASE_URL}/notification/unregister`, {
          token: expoPushToken,
        });
        setExpoPushToken(null);
      }
    } catch (error) {
      console.error('Error unregistering push notifications:', error);
    }
  };

  // Update notification preferences
  const updatePreferences = async (preferences: NotificationPreferences): Promise<void> => {
    try {
      if (user) {
        await axios.patch(
          `${API_BASE_URL}/notification/preferences/${user._id}`,
          { preferences }
        );
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  // Send test notification
  const sendTestNotification = async (): Promise<void> => {
    if (!Notifications) {
      console.warn('Notifications not available on this platform');
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Notification",
          body: "This is a test notification from Myntra!",
          data: { type: 'test' },
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  // Set up notification listeners
  useEffect(() => {
    if (!Notifications) {
      return;
    }

    // Listener for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener((notification: any) => {
      console.log('Notification received (foreground):', notification);
      setNotification(notification);
    });

    // Listener for user tapping on or interacting with a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response: any) => {
      console.log('Notification response:', response);
      const data = response.notification.request.content.data;

      // Handle navigation based on notification type and app state
      const appStateNow = AppState.currentState;
      
      // Store navigation action to be handled by components
      // Components can listen to notification changes and navigate accordingly
      if (data?.type === 'order' && data?.orderId) {
        // Store navigation data - components can listen to this
        setNotification({
          ...response.notification,
          request: {
            ...response.notification.request,
            content: {
              ...response.notification.request.content,
              data: {
                ...data,
                navigateTo: '/orders',
              },
            },
          },
        } as any);
      } else if (data?.type === 'cart') {
        setNotification({
          ...response.notification,
          request: {
            ...response.notification.request,
            content: {
              ...response.notification.request.content,
              data: {
                ...data,
                navigateTo: '/bag',
              },
            },
          },
        } as any);
      } else if (data?.type === 'offer' && data?.productId) {
        setNotification({
          ...response.notification,
          request: {
            ...response.notification.request,
            content: {
              ...response.notification.request.content,
              data: {
                ...data,
                navigateTo: `/product/${data.productId}`,
              },
            },
          },
        } as any);
      } else if (data?.type === 'offer') {
        setNotification({
          ...response.notification,
          request: {
            ...response.notification.request,
            content: {
              ...response.notification.request.content,
              data: {
                ...data,
                navigateTo: '/',
              },
            },
          },
            } as any);
      }
    });

    // Track app state changes
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground
        console.log('App has come to the foreground');
      }
      appState.current = nextAppState;
    });

    return () => {
      if (Notifications) {
        if (notificationListener.current) {
          Notifications.removeNotificationSubscription(notificationListener.current);
        }
        if (responseListener.current) {
          Notifications.removeNotificationSubscription(responseListener.current);
        }
      }
      subscription?.remove();
    };
  }, []);

  // Register for notifications when user logs in
  useEffect(() => {
    if (user) {
      registerForPushNotifications();
    } else {
      unregisterForPushNotifications();
    }
  }, [user]);

  const value: NotificationContextType = {
    expoPushToken,
    notification,
    registerForPushNotifications,
    unregisterForPushNotifications,
    updatePreferences,
    sendTestNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

