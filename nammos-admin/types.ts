
export type OrderStatus = 'pending' | 'accepted' | 'in_kitchen' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  addresses?: any[];
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  observations?: string;
  options?: string[];
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  createdAt: any; // Firestore Timestamp
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
  };
}

export interface Product {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  isActive: boolean;
  tags: string[];
}

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  order: number;
  isActive: boolean;
}

export interface RestaurantAddress {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface RestaurantIntegrations {
  ifood: boolean;
  whatsapp: boolean;
  stripe: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  description?: string; // Novo
  phoneNumber?: string; // Novo
  email?: string; // Novo
  slug: string;
  logoUrl?: string;
  coverUrl?: string; // Novo
  isOpen: boolean;
  minOrderValue: number;
  deliveryFeeBase: number;
  prepTimeMinutesAvg: number;
  address?: RestaurantAddress;
  integrations?: RestaurantIntegrations;
}
