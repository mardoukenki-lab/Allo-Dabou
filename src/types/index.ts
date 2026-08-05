export type ServiceType = 'taxi' | 'delivery' | 'concierge' | 'vtc';

export type RideStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone: string;
  role?: 'client' | 'driver_pending' | 'driver' | 'admin';
  isApprovedDriver?: boolean;
  approved?: boolean;
  vehicleNumber?: string;
  fcmToken?: string;
  ratingAverage?: number;
  ratingCount?: number;
  totalRatingSum?: number;
  requestedDriverAt?: any;
  createdAt?: any;
}

export interface Ride {
  id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  userPhone?: string;
  pickupAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  destinationAddress: string;
  destinationLat?: number;
  destinationLng?: number;
  distanceKm: number;
  durationMin: number;
  priceFcfa: number;
  status: RideStatus;
  notes?: string;
  serviceType?: ServiceType;
  packageDetails?: string;
  recipientPhone?: string;
  conciergeTask?: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverVehiclePlate?: string;
  rating?: number;
  ratingComment?: string;
  ratedAt?: any;
  acceptedAt?: any;
  createdAt: any;
  updatedAt?: any;
}

export interface PricingCalculation {
  distanceKm: number;
  durationMin: number;
  basePriceFcfa: number;
  extraDistanceKm: number;
  extraKmRateFcfa: number;
  extraKmPriceFcfa: number;
  rawTotalPriceFcfa: number;
  finalPriceFcfa: number;
  formattedPrice: string;
  isWithinBaseZone: boolean;
  isValid: boolean;
  errorMessage?: string;
  warningMessage?: string;
  serviceType?: ServiceType;
}

export interface DabouLandmark {
  id: string;
  name: string;
  category: 'Gare' | 'Santé' | 'Administration' | 'Éducation' | 'Commerce' | 'Quartier';
  lat: number;
  lng: number;
  description?: string;
}

declare global {
  interface Window {
    google?: {
      maps?: {
        DistanceMatrixService: new () => any;
        Geocoder: new () => any;
        TravelMode: {
          DRIVING: any;
        };
        UnitSystem: {
          METRIC: any;
        };
      };
    };
  }
}

