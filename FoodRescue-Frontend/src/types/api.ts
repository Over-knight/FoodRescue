// API Response Types

/**
 * Standard API Response Wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code?: string;
    message?: string;
  };
}

/**
 * Pagination Info
 */
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalProducts?: number;
  totalItems?: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Product Response Types
 */
export interface ProductCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface ProductPricing {
  retail: {
    price: number; // in kobo
    currency: string;
  };
}

export interface ProductInventory {
  availableStock: number;
  lowStockThreshold: number;
}

export interface ProductStats {
  viewCount: number;
  orderCount: number;
}

export interface BackendProduct {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  images: string[];
  category: ProductCategory;
  pricing: ProductPricing;
  inventory: ProductInventory;
  stats: ProductStats;
  tags: string[];
  status: 'active' | 'inactive' | 'out_of_stock' | 'draft';
  dealId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  products: BackendProduct[];
  pagination: PaginationInfo;
}

/**
 * User/Auth Response Types
 */
export interface UserProfile {
  isVerified: boolean;
  address?: string;
}

export interface BackendUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'seller' | 'admin';
  phone?: string;
  profile: UserProfile;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: BackendUser;
  token: string;
}

/**
 * Order Response Types
 */
export interface BackendOrder {
  _id: string;
  product: BackendProduct;
  customer: BackendUser;
  seller: BackendUser;
  quantity: number;
  totalAmount: number; // in kobo
  status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
  pickupCode?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface OrderListResponse {
  orders: BackendOrder[];
  pagination: PaginationInfo;
}

/**
 * Category Response Types
 */
export interface BackendCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Deal Response Types
 */
export interface BackendDeal {
  _id: string;
  product: BackendProduct;
  seller: BackendUser;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startAt: string;
  endAt?: string;
  status: 'scheduled' | 'active' | 'expired' | 'cancelled';
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DealListResponse {
  deals: BackendDeal[];
  pagination: PaginationInfo;
}

/**
 * Review Response Types
 */
export interface BackendReview {
  _id: string;
  product: string | BackendProduct;
  customer: BackendUser;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewListResponse {
  reviews: BackendReview[];
  averageRating: number;
  totalReviews: number;
}

/**
 * Favorite Response Types
 */
export interface BackendFavorite {
  _id: string;
  product: BackendProduct;
  customer: string;
  createdAt: string;
}

export interface FavoriteListResponse {
  favorites: BackendFavorite[];
  pagination: PaginationInfo;
}

/**
 * Analytics Response Types
 */
export interface RestaurantOverview {
  totalRevenue: number; // in kobo
  totalOrders: number;
  totalProducts: number;
  activeProducts: number;
  completedOrders: number;
  pendingOrders: number;
  averageOrderValue: number; // in kobo
  wasteReduced: number; // in kg
}

export interface SalesDataPoint {
  date: string;
  revenue: number; // in kobo
  orders: number;
}

export interface TopProduct {
  product: BackendProduct;
  totalSales: number; // in kobo
  totalOrders: number;
}

/**
 * Analytics API Response Types (matching backend structure)
 */

// GET /api/analytics/restaurant/overview
export interface RestaurantOverviewData {
  totalOrders: number;
  totalRevenue: number; // in naira (already converted from kobo)
  totalMealsSaved: number;
  totalProducts: number;
  pendingOrders: number;
  avgRating: number;
  today: {
    orders: number;
    revenue: number; // in naira
  };
}

// GET /api/analytics/restaurant/sales
export interface SalesData {
  period: string | number;
  revenue: number; // in naira
  orders: number;
  mealsSaved: number;
}

export interface RestaurantSalesData {
  period: string; // 'daily' | 'weekly' | 'monthly'
  sales: SalesData[];
}

// GET /api/analytics/restaurant/products
export interface TopProductData {
  productId: string;
  name: string;
  slug: string;
  image: string;
  totalQuantity: number;
  totalRevenue: number; // in naira
  orderCount: number;
}

export interface TopProductsData {
  products: TopProductData[];
}

// GET /api/analytics/restaurant/revenue
export interface CategoryRevenueData {
  categoryId: string;
  categoryName: string;
  totalRevenue: number; // in naira
  orderCount: number;
  itemsSold: number;
}

export interface RevenueByCategoryData {
  categories: CategoryRevenueData[];
}

// GET /api/analytics/restaurant/waste
export interface WasteReductionOverview {
  totalMealsSaved: number;
  weightSaved: number; // in kg
  co2Saved: number; // in kg
  waterSaved: number; // in liters
  moneySavedByCustomers: number; // in naira
}

export interface MonthlyWasteData {
  month: string; // 'YYYY-MM'
  mealsSaved: number;
  weightSaved: number; // in kg
  co2Saved: number; // in kg
}

export interface WasteReductionData {
  overview: WasteReductionOverview;
  monthly: MonthlyWasteData[];
}


/**
 * Notification Response Types
 */
export interface BackendNotification {
  _id: string;
  user: string;
  type: 'order' | 'deal' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  data?: any;
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: BackendNotification[];
  unreadCount: number;
  pagination: PaginationInfo;
}

/**
 * AI Response Types
 */
export interface PricingSuggestion {
  suggestedPrice: number; // in kobo
  suggestedDiscount: number; // percentage
  reason: string;
  confidence: number; // 0-1
}

export interface FoodRecommendation {
  product: BackendProduct;
  score: number;
  reason: string;
}
