// Utility functions for API integration

/**
 * Convert Naira to Kobo (backend expects prices in kobo)
 * @param naira - Amount in Naira
 * @returns Amount in kobo
 */
export const nairaToKobo = (naira: number): number => {
  return Math.round(naira * 100);
};

/**
 * Convert Kobo to Naira (for display)
 * @param kobo - Amount in kobo
 * @returns Amount in Naira
 */
export const koboToNaira = (kobo: number): number => {
  return kobo / 100;
};

/**
 * Format price for display
 * @param kobo - Amount in kobo
 * @returns Formatted string like "₦2,500"
 */
export const formatPrice = (kobo: number): string => {
  const naira = koboToNaira(kobo);
  return `₦${naira.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

/**
 * Extract data from backend API response
 * Backend returns: { success: true, data: {...} }
 * This extracts the actual data
 */
export const extractApiData = <T>(response: any): T => {
  if (response && typeof response === 'object') {
    // If response has a 'data' property, extract it
    if ('data' in response) {
      return response.data as T;
    }
    // Otherwise return the response itself
    return response as T;
  }
  return response as T;
};

/**
 * Extract error message from API error response
 */
export const extractErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

/**
 * Map frontend roles to backend roles
 */
export const mapRoleToBackend = (
  frontendRole: 'consumer' | 'restaurant' | 'stores' | 'ngo' | 'admin'
): 'customer' | 'seller' | 'admin' => {
  const roleMap: Record<string, 'customer' | 'seller' | 'admin'> = {
    'consumer': 'customer',
    'restaurant': 'seller',
    'stores': 'seller',
    'ngo': 'seller',
    'admin': 'admin'
  };
  
  return roleMap[frontendRole] || 'customer';
};

/**
 * Map backend roles to frontend roles
 */
export const mapRoleToFrontend = (
  backendRole: 'customer' | 'seller' | 'admin'
): 'consumer' | 'restaurant' | 'admin' => {
  const roleMap: Record<string, 'consumer' | 'restaurant' | 'admin'> = {
    'customer': 'consumer',
    'seller': 'restaurant', // Default sellers to restaurant
    'admin': 'admin'
  };
  
  return roleMap[backendRole] || 'consumer';
};

/**
 * Check if user has seller role (restaurant, stores, ngo)
 */
export const isSellerRole = (role: string): boolean => {
  return ['restaurant', 'stores', 'ngo', 'seller'].includes(role);
};

/**
 * Check if user has customer role
 */
export const isCustomerRole = (role: string): boolean => {
  return ['consumer', 'customer'].includes(role);
};

/**
 * Format date for API (ISO string)
 */
export const formatDateForApi = (date: Date | string): string => {
  if (typeof date === 'string') {
    return new Date(date).toISOString();
  }
  return date.toISOString();
};

/**
 * Parse date from API
 */
export const parseDateFromApi = (dateString: string): Date => {
  return new Date(dateString);
};
