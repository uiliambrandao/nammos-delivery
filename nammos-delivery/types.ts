import { Timestamp } from 'firebase/firestore';

export enum OrderType {
  DELIVERY = 'delivery',
  PICKUP = 'pickup'
}

export enum OrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  IN_KITCHEN = 'in_kitchen',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export interface User {
  id?: string;
  name: string;
  phone: string;
  createdAt: Timestamp | Date;
}

export interface Address {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  zipCode: string;
  reference?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  isOpen: boolean;
  deliveryFeeBase: number;
}

export interface Category {
  id: string;
  name: string;
  order: number;
  isActive: boolean;
  restaurantId: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  isActive: boolean;
  restaurantId: string;
  imageUrl?: string;
  categoryId?: string;
}

export interface CartItem {
  tempId: string; 
  productId: string;
  productNameSnapshot: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  observation: string;
}

export interface Order {
  id?: string;
  userId: string;
  restaurantId: string;
  customerName: string;
  customerPhone: string;
  orderType: OrderType;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  address?: Address;
  status: OrderStatus;
  createdAt: Timestamp | Date;
}