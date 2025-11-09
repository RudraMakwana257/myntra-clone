import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useNotifications } from '@/context/NotificationContext';

/**
 * Component to handle navigation when notifications are tapped
 * Should be placed in the root layout
 */
export default function NotificationHandler() {
  const { notification } = useNotifications();
  const router = useRouter();

  useEffect(() => {
    if (notification?.request?.content?.data?.navigateTo) {
      const navigateTo = notification.request.content.data.navigateTo;
      
      // Small delay to ensure app is ready
      setTimeout(() => {
        router.push(navigateTo as any);
      }, 100);
    }
  }, [notification, router]);

  return null;
}

