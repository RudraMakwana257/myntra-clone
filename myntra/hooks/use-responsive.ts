/**
 * A hook that tracks the current screen dimensions and device type.
 * 
 * It automatically updates when the screen size changes (like when rotating
 * a device or resizing a browser window).
 * 
 * @returns An object with width, height, size category, and boolean flags
 *          for device type (isMobile, isTablet, isDesktop)
 */

import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import { DeviceSize, getDeviceSize } from '@/constants/responsive';

export function useResponsive() {
  // Get initial screen dimensions
  const [width, setWidth] = useState(Dimensions.get('window').width);
  const [height, setHeight] = useState(Dimensions.get('window').height);

  // Listen for screen size changes (rotation, window resize, etc.)
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWidth(window.width);
      setHeight(window.height);
    });

    // Clean up the listener when component unmounts
    return () => {
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, []);

  // Determine device size category based on width
  const size: DeviceSize = getDeviceSize(width);
  
  // Convenient boolean flags for device type
  const isMobile = size === 'mobile';
  const isTablet = size === 'tablet';
  const isDesktop = size === 'desktop' || size === 'wide';

  return { width, height, size, isMobile, isTablet, isDesktop };
}


