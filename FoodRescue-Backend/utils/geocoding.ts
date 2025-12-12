import axios from 'axios';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationData {
  coordinates: Coordinates;
  address: string;
  city?: string;
  country?: string;
}

/**
 * Geocode an address to get coordinates using Google Maps Geocoding API
 */
export const geocodeAddress = async (address: string): Promise<LocationData> => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key not configured');
  }

  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/geocode/json',
      {
        params: {
          address,
          key: GOOGLE_MAPS_API_KEY
        }
      }
    );

    if (response.data.status !== 'OK' || !response.data.results[0]) {
      throw new Error(`Geocoding failed: ${response.data.status}`);
    }

    const result = response.data.results[0];
    const { lat, lng } = result.geometry.location;

    // Extract city from address components
    const cityComponent = result.address_components.find(
      (comp: any) => 
        comp.types.includes('locality') || 
        comp.types.includes('administrative_area_level_2')
    );

    const countryComponent = result.address_components.find(
      (comp: any) => comp.types.includes('country')
    );

    return {
      coordinates: {
        latitude: lat,
        longitude: lng
      },
      address: result.formatted_address,
      city: cityComponent?.long_name,
      country: countryComponent?.long_name
    };
  } catch (error: any) {
    console.error('Geocoding error:', error.message);
    throw new Error('Failed to geocode address');
  }
};

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export const calculateDistance = (
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
    Math.cos(toRad(point2.lat)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Convert degrees to radians
 */
const toRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

/**
 * Get approximate location from IP address (fallback)
 * For Lagos, Nigeria default
 */
export const getDefaultLocation = (): LocationData => {
  return {
    coordinates: {
      latitude: 6.5244, // Lagos coordinates
      longitude: 3.3792
    },
    address: 'Lagos, Nigeria',
    city: 'Lagos',
    country: 'Nigeria'
  };
};
