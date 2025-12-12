import { User, Restaurant, Food, Order } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Chidi Okonkwo',
    email: 'chidi@example.com',
    role: 'consumer',
    location: { lat: 6.5244, lng: 3.3792, address: 'Yaba, Lagos' },
    preferences: ['Rice', 'Pastries', 'Local'],
    budget: 2000,
  },
  {
    id: 'u2',
    name: 'Mama Nkechi Kitchen',
    email: 'nkechi@example.com',
    role: 'restaurant',
    location: { lat: 6.4253, lng: 3.4890, address: 'Lekki Phase 1, Lagos' },
    preferences: [],
    budget: 0,
  },
  {
    id: 'u3',
    name: 'Lagos Food Bank',
    email: 'info@lagosfoodbank.org',
    role: 'ngo',
    location: { lat: 6.5000, lng: 3.3500, address: 'Ikeja, Lagos' },
    preferences: ['Rice', 'Beans', 'Staples'],
    budget: 50000,
  },
  {
    id: 'u4',
    name: 'Admin User',
    email: 'admin@foodrescue.ng',
    role: 'admin',
    location: { lat: 0, lng: 0, address: 'HQ' },
    preferences: [],
    budget: 0,
  },
  {
    id: 'u5',
    name: 'ShopRite Lekki',
    email: 'shoprite@example.com',
    role: 'stores',
    location: { lat: 6.4474, lng: 3.4700, address: 'Lekki, Lagos' },
    preferences: [],
    budget: 0,
  }
];

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: 'r1',
    name: 'Taste of Lagos',
    description: 'Authentic Nigerian dishes made with love.',
    ownerId: 'u2',
    location: { lat: 6.4253, lng: 3.4890, address: 'Lekki Phase 1, Lagos' },
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
    rating: 4.8,
    verified: true,
  },
  {
    id: 'r2',
    name: 'Chicken Republic (Surulere)',
    description: 'Fresh fried chicken and sides.',
    ownerId: 'u3',
    location: { lat: 6.4969, lng: 3.3562, address: 'Surulere, Lagos' },
    image: 'https://images.unsplash.com/photo-1513639776629-9269d0d34639?auto=format&fit=crop&w=1000&q=80',
    rating: 4.5,
    verified: true,
  }
];

export const MOCK_FOODS: Food[] = [
  {
    id: 'f1',
    restaurantId: 'r1',
    name: 'Jollof Rice & Beef',
    description: 'Premium smoky party jollof rice with two pieces of fried beef.',
    originalPrice: 2500,
    discountedPrice: 1200,
    discountPercent: 52,
    quantity: 5,
    quantityType: 'plates',
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(), // Expires in 4 hours
    image: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?auto=format&fit=crop&w=1000&q=80', // Jollof rice
    category: 'Rice',
    tags: ['Spicy', 'Lunch', 'Dinner'],
    status: 'active',
  },
  {
    id: 'f2',
    restaurantId: 'r1',
    name: 'Fried Plantain (Dodo)',
    description: 'Golden fried plantain slices, perfect side dish.',
    originalPrice: 1000,
    discountedPrice: 500,
    discountPercent: 50,
    quantity: 10,
    quantityType: 'portions',
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), // Expires in 2 hours
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=1000&q=80', // Plantain
    category: 'Sides',
    tags: ['Vegetarian', 'Snack'],
    status: 'active',
  },
  {
    id: 'f3',
    restaurantId: 'r2',
    name: 'Chicken & Chips',
    description: 'Crispy fried chicken with golden fries.',
    originalPrice: 1500,
    discountedPrice: 700,
    discountPercent: 53,
    quantity: 8,
    quantityType: 'portions',
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(),
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=1000&q=80', // Fried chicken
    category: 'Fast Food',
    tags: ['Chicken', 'Crispy'],
    status: 'active',
  },
  // Store Items (ShopRite Lekki)
  {
    id: 'g1',
    restaurantId: 'u5', // ShopRite Lekki
    name: '50kg Bag of Rice (Royal Stallion)',
    description: 'Premium long grain parboiled rice. Slightly damaged packaging but rice is perfectly fine.',
    originalPrice: 45000,
    discountedPrice: 35000,
    discountPercent: 22,
    quantity: 3,
    quantityType: 'bags',
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1000&q=80', // Rice
    category: 'Packaged Goods',
    tags: ['Staple', 'Bulk'],
    status: 'active',
  },
  {
    id: 'g2',
    restaurantId: 'u5',
    name: 'Fresh Tomatoes (5kg)',
    description: 'Slightly overripe but perfect for stew and sauce. Must use within 2 days.',
    originalPrice: 3500,
    discountedPrice: 1500,
    discountPercent: 57,
    quantity: 10,
    quantityType: 'baskets',
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), // 2 days
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=1000&q=80', // Tomatoes
    category: 'Fresh Produce',
    tags: ['Vegetables', 'Cooking'],
    status: 'active',
  },
  {
    id: 'g3',
    restaurantId: 'u5',
    name: 'Peak Milk (12 tins)',
    description: 'Evaporated milk approaching expiry date. Still fresh and safe.',
    originalPrice: 6000,
    discountedPrice: 3500,
    discountPercent: 42,
    quantity: 5,
    quantityType: 'packs',
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(), // 14 days
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=1000&q=80', // Milk
    category: 'Dairy',
    tags: ['Milk', 'Pantry'],
    status: 'active',
  },
  {
    id: 'g4',
    restaurantId: 'u5',
    name: 'Sliced Bread (10 loaves)',
    description: 'Day-old bread, still soft and fresh. Perfect for toast or sandwiches.',
    originalPrice: 5000,
    discountedPrice: 2500,
    discountPercent: 50,
    quantity: 15,
    quantityType: 'loaves',
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 1 day
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80', // Bread
    category: 'Bread & Bakery',
    tags: ['Breakfast', 'Fresh'],
    status: 'active',
  },
  {
    id: 'g5',
    restaurantId: 'u5',
    name: 'Fresh Eggs (30 pieces - 1 crate)',
    description: 'Farm fresh eggs. Few with minor cracks but all safe to eat.',
    originalPrice: 2800,
    discountedPrice: 1800,
    discountPercent: 36,
    quantity: 8,
    quantityType: 'crates',
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=1000&q=80', // Eggs
    category: 'Fresh Produce',
    tags: ['Protein', 'Breakfast'],
    status: 'active',
  },
  {
    id: 'g6',
    restaurantId: 'u5',
    name: 'Canned Baked Beans (24 cans)',
    description: 'Heinz baked beans nearing expiry. Perfect for quick meals.',
    originalPrice: 12000,
    discountedPrice: 7000,
    discountPercent: 42,
    quantity: 4,
    quantityType: 'cartons',
    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=1000&q=80', // Canned food
    category: 'Canned Food',
    tags: ['Canned', 'Protein'],
    status: 'active',
  }
];

// Helper to simulate DB operations
export const getActiveFoods = () => MOCK_FOODS.filter(f => f.status === 'active');
export const getFoodById = (id: string) => MOCK_FOODS.find(f => f.id === id);
export const getRestaurantFoods = (restaurantId: string) => MOCK_FOODS.filter(f => f.restaurantId === restaurantId);

export const addFood = (food: Food) => {
  MOCK_FOODS.unshift(food);
  return food;
};

export const getRestaurantStats = (restaurantId: string) => {
  // In a real app, execute aggregations here
  return {
    totalSales: 45000,
    mealsSaved: 124,
    co2Saved: 310, // kg
    activeListings: MOCK_FOODS.filter(f => f.restaurantId === restaurantId && f.status === 'active').length
  };
};

const MOCK_ORDERS_STORE: Order[] = [
  {
    id: 'ord_sample_1',
    foodId: 'f1',
    buyerId: 'u1',
    restaurantId: 'r1',
    quantity: 2,
    totalPrice: 2400,
    status: 'picked-up',
    pickupCode: '1234',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
  },
  {
    id: 'ord_sample_2',
    foodId: 'f3',
    buyerId: 'u1',
    restaurantId: 'r2',
    quantity: 1,
    totalPrice: 700,
    status: 'reserved',
    pickupCode: '5678',
    createdAt: new Date().toISOString(),
  }
];

export const getUserOrders = (userId: string) => {
  return MOCK_ORDERS_STORE.filter(o => o.buyerId === userId).map(order => {
    const food = getFoodById(order.foodId);
    const restaurant = MOCK_RESTAURANTS.find(r => r.id === order.restaurantId);
    return { ...order, food, restaurant };
  });
};

export const createOrder = (orderData: Partial<Order>) => {
  const newOrder: Order = {
    id: `ord_${Date.now()}`,
    foodId: orderData.foodId!,
    buyerId: orderData.buyerId!,
    restaurantId: orderData.restaurantId!,
    quantity: orderData.quantity || 1,
    totalPrice: orderData.totalPrice || 0,
    status: 'reserved',
    pickupCode: Math.floor(1000 + Math.random() * 9000).toString(),
    createdAt: new Date().toISOString(),
  };
  MOCK_ORDERS_STORE.unshift(newOrder); // Add to local store
  console.log("Created Order:", newOrder);
  return newOrder;
};
