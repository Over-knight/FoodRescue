export interface User {
  id: string;
  name: string;
  email: string;
  role: 'consumer' | 'restaurant' | 'grocery' | 'ngo' | 'admin' | 'seller' | 'customer';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  preferences: string[];
  budget: number;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  image: string;
  rating: number;
  verified: boolean;
}

export interface Food {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  quantity: number;
  quantityType: string;
  expiryTime: string; // ISO date string
  image: string;
  category: string;
  tags: string[];
  status: 'active' | 'reserved' | 'completed' | 'expired';
}

export interface Order {
  id: string;
  foodId: string;
  buyerId: string;
  restaurantId: string;
  quantity: number;
  totalPrice: number;
  status: 'reserved' | 'picked-up' | 'cancelled';
  pickupCode: string;
  createdAt: string;
}
