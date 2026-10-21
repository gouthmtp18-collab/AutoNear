// ============================================================
// AutoNear — Core TypeScript Types
// ============================================================

export type UserRole = 'passenger' | 'driver' | 'admin';

export type DriverApprovalStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  createdAt: number;
}

export interface DriverProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  vehicleRegNumber: string;
  approvalStatus: DriverApprovalStatus;
  createdAt: number;
  updatedAt: number;
  approvedAt?: number;
  approvedBy?: string;
  rejectionReason?: string;
  suspensionReason?: string;
}

export interface DriverLocation {
  uid: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  isOnline: boolean;
}

export interface NearbyDriver {
  profile: DriverProfile;
  location: DriverLocation;
  distanceKm: number;
  isStale: boolean;
}

export interface PassengerLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export type SortOption = 'distance' | 'name';
export type RadiusOption = 1 | 3 | 5 | 10;

export interface SearchFilters {
  radius: RadiusOption;
  sort: SortOption;
  onlineOnly: boolean;
}

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
  permissionStatus: PermissionState | null;
}

// Seconds after which a driver location is considered stale
export const LOCATION_STALE_THRESHOLD_SECONDS = 60;

// Database paths
export const DB_PATHS = {
  users: 'users',
  drivers: 'drivers',
  locations: 'locations',
  admins: 'admins',
} as const;
