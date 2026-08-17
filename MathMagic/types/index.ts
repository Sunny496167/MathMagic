export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  basePrice: number;
  discountedPrice: number;
  stock: number;
  category: string;
  images: string[];
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  imageUrl: string;
  addresses: Address[];
  wishlist: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id: string;
  label: string;
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  isDefault: boolean;
}

export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  shippingAddress: {
    fullName?: string;
    streetAddress?: string;
    address?: string;
    addressLine?: string;
    city: string;
    state?: string;
    zip?: string;
    zipCode?: string;
    pincode?: string;
    phoneNumber?: string;
    phone?: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  status: "pending" | "accepted" | "processing" | "shipped" | "delivered" | "cancelled";
  hasReviewed: boolean;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  _id: string;
  productId: Product;
  quantity: number;
  price: number;
}

export interface Review {
  _id: string;
  productId: string;
  userId: string | User;
  orderId: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  _id?: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  _id?: string;
  user?: string;
  items: CartItem[];
  createdAt?: string;
  updatedAt?: string;
}
