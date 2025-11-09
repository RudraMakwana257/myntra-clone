export const Breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
};

export type DeviceSize = 'mobile' | 'tablet' | 'desktop' | 'wide';

export function getDeviceSize(width: number): DeviceSize {
  if (width >= Breakpoints.wide) return 'wide';
  if (width >= Breakpoints.desktop) return 'desktop';
  if (width >= Breakpoints.tablet) return 'tablet';
  return 'mobile';
}


