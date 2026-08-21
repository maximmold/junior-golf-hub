export type TourType = 'USKG' | 'SCJGA' | 'OTHER';

export type EventDuration = '1-Day' | '2-Day';

export type RegistrationStatus = 
  | 'registered' 
  | 'contingent'
  | 'considering' 
  | 'open' 
  | 'waitlist' 
  | 'closed' 
  | 'not_registered';

export interface Player {
  id: string;
  name: string;
  uskidsDivision: string; // e.g. "Boys 9", "Girls 11-12"
  scjgaDivision: string;  // e.g. "Boys 10-12", "Girls 13-18"
  yardage?: string;        // e.g. "1,800 yds (9-holes)" or "5,200 yds (18-holes)"
  color: string;           // Hex color for badges/markers
  avatarEmoji?: string;
  isDefault?: boolean;
}

export interface Course {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  phone?: string;
  website?: string;
  holes?: number;
  par?: number;
  facilityType?: 'Public' | 'Semi-Private' | 'Private' | 'Resort';
}

export interface Tournament {
  id: string;
  name: string;
  tour: TourType;
  tourSeries: string; // "Charleston Local Tour", "Hootie Series", "Players Series", "Major Championship", etc.
  courseId: string;
  course: Course;
  startDate: string; // ISO format: YYYY-MM-DD
  endDate: string;   // ISO format: YYYY-MM-DD
  duration: EventDuration;
  entryFee?: number;
  registrationDeadline?: string;
  registrationUrl?: string;
  playerRegistrations: Record<string, RegistrationStatus>; // playerId -> RegistrationStatus
  notes?: string;
  yardageOrFormat?: string;
  isMajor?: boolean;
  isTourChampionship?: boolean;
  season?: 'Spring' | 'Summer' | 'Fall' | 'Winter' | 'Year-Round';
}

export interface UserLocation {
  address: string;
  lat: number;
  lng: number;
  label: string;
}

export interface DistanceInfo {
  distanceMiles: number;
  driveTimeMinutes: number;
  driveTimeFormatted: string; // e.g. "35 mins", "1 hr 15 mins"
  googleMapsDirectionsUrl: string;
  appleMapsDirectionsUrl: string;
}

export type DatePreset = 
  | 'ALL' 
  | '7D' 
  | '14D' 
  | '30D' 
  | '60D' 
  | 'THIS_MONTH' 
  | 'NEXT_MONTH' 
  | 'CUSTOM';

export interface FilterState {
  tour: 'ALL' | 'USKG' | 'SCJGA';
  duration: 'ALL' | '1-Day' | '2-Day';
  registrationStatus: 'ALL' | 'registered' | 'contingent' | 'considering' | 'not_registered';
  selectedPlayerId: 'ALL' | string;
  onlyUpcoming: boolean;
  maxDriveMinutes?: number;
  searchQuery: string;
  startDate?: string;
  endDate?: string;
  selectedMonth?: string; // YYYY-MM for calendar filtering
  datePreset?: DatePreset;
}

export type ViewMode = 'timeline' | 'calendar' | 'map' | 'players' | 'ingest';
