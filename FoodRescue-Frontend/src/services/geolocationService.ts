/**
 * Browser Geolocation Service
 * Handles getting user's current location using browser APIs
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export const geolocationService = {
  /**
   * Get user's current position from browser
   * Requests permission and returns coordinates
   */
  async getCurrentPosition(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          let message = 'Failed to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location permission denied';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out';
              break;
          }
          reject({ code: error.code, message });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // Cache for 5 minutes
        }
      );
    });
  },

  /**
   * Get default location (Lagos, Nigeria)
   * Used as fallback when geolocation fails or is denied
   */
  getDefaultLocation(): Coordinates {
    return {
      latitude: 6.5244, // Lagos coordinates
      longitude: 3.3792
    };
  },

  /**
   * Check if geolocation is available
   */
  isAvailable(): boolean {
    return 'geolocation' in navigator;
  }
};
