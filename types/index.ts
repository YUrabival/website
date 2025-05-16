import { User as PrismaUser } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

export type SafeUser = Omit<
  PrismaUser,
  "passwordHash" | "createdAt" | "updatedAt" | "emailVerified"
> & {
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
};

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  categoryId: string;
  brandId: string;
  carBrand: string;
  carModel: string;
  partNumber: string;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  brand?: Brand;
  compatibilities?: VehicleCompatibility[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
}

export interface VehicleCompatibility {
  id: string;
  productId: string;
  vehicleId: string;
  vehicle: Vehicle;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  engine?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  emailVerified?: string;
  image?: string;
  role: string;
  phone?: string;
  address?: string;
  addresses?: Address[];
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  userId: string;
}

export interface Order {
  id: string;
  userId: string;
  items: Product[];
  totalPrice: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: Date;
}

export type Cart = {
  id: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  name: string;
  product: Product;
}; 