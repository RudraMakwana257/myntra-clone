/**
 * Represents a product in the store
 */
export interface Product {
  _id: string;
  name: string;
  brand: string;
  price: number | string;
  discount?: string;
  images?: string[];
  image?: string;
  category?: string;
  description?: string;
}

/**
 * Represents a product category with optional subcategories
 */
export interface Category {
  _id: string;
  name: string;
  image: string;
  subcategories?: string[];
}

/**
 * Represents a promotional deal or offer
 */
export interface Deal {
  id: number;
  title: string;
  image: string;
}

