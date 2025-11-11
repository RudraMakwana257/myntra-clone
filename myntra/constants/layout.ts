import { Platform } from 'react-native';

export const LAYOUT = {
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  // Banner heights
  bannerHeight: {
    mobile: 200,
    tablet: 250,
    desktop: 300,
  },
  
  // Product grid columns
  productColumns: {
    mobile: 2,
    tablet: 3,
    desktop: 4,
  },
  
  // Card dimensions
  categoryCard: {
    mobile: 100,
    tablet: 120,
    desktop: 140,
  },
  
  // Deal card dimensions
  dealCard: {
    width: {
      mobile: 280,
      web: 320,
    },
    height: {
      mobile: 150,
      web: 180,
    },
  },
  
  // Product image heights
  productImageHeight: {
    mobile: 200,
    desktop: 280,
  },
} as const;

export const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300';

