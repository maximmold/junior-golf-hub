import { Course, DistanceInfo, UserLocation } from '../types/tournament';

/**
 * Calculates straight line distance in miles between two coordinates using Haversine formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Radius of Earth in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Computes realistic driving distance and estimated drive time (ETA)
 * Lowcountry & SC road network factor (~1.25x haversine)
 */
export function calculateDistanceAndETA(
  userLocation: UserLocation,
  course: Course
): DistanceInfo {
  const straightMiles = calculateHaversineDistance(
    userLocation.lat,
    userLocation.lng,
    course.lat,
    course.lng
  );

  // Estimate road driving miles (typically 1.22x - 1.35x straight line)
  const roadFactor = straightMiles < 15 ? 1.25 : straightMiles < 60 ? 1.28 : 1.22;
  const drivingMiles = Math.round(straightMiles * roadFactor * 10) / 10;

  // Calculate estimated drive time based on average speed profiles in SC
  let avgMph = 38; // City / Charleston bridges
  if (drivingMiles > 15 && drivingMiles <= 45) {
    avgMph = 48; // Highway 17 / I-26 local
  } else if (drivingMiles > 45) {
    avgMph = 58; // I-26 / I-95 interstate travel (Columbia, Florence, etc.)
  }

  const rawMinutes = Math.round((drivingMiles / avgMph) * 60) + 3; // +3 min buffer for parking/turning
  const minutes = Math.max(5, rawMinutes);

  // Navigation Links
  const destinationQuery = encodeURIComponent(
    `${course.name}, ${course.address}, ${course.city}, ${course.state} ${course.zip}`
  );
  const originQuery = encodeURIComponent(userLocation.address);

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originQuery}&destination=${destinationQuery}`;
  const appleMapsDirectionsUrl = `https://maps.apple.com/?saddr=${originQuery}&daddr=${destinationQuery}`;

  return {
    distanceMiles: drivingMiles,
    driveTimeMinutes: minutes,
    driveTimeFormatted: formatMinutesDuration(minutes),
    googleMapsDirectionsUrl,
    appleMapsDirectionsUrl,
  };
}

/**
 * Format total minutes into a clean human string (e.g. "65 mins" -> "1h 5m", "45 mins")
 */
export function formatMinutesDuration(totalMinutes: number): string {
  const rounded = Math.round(totalMinutes);
  if (rounded < 60) return `${rounded} min${rounded === 1 ? '' : 's'}`;
  const hrs = Math.floor(rounded / 60);
  const mins = rounded % 60;
  if (mins === 0) return `${hrs} hr${hrs === 1 ? '' : 's'}`;
  return `${hrs}h ${mins}m`;
}

/**
 * Parse any time string (e.g. "10:54", "10:54 AM", "14:30", "9:00am") into minutes elapsed from midnight
 */
export function parseTimeToMinutesFromMidnight(timeStr: string): number | null {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const clean = timeStr.trim().toLowerCase();
  
  const isPM = clean.includes('pm');
  const isAM = clean.includes('am');
  const numPart = clean.replace(/[a-z]/g, '').trim();
  
  const parts = numPart.split(':').map((p) => parseInt(p, 10));
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
  
  let hours = parts[0];
  const minutes = parts[1];
  
  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;
  
  return hours * 60 + minutes;
}

/**
 * Format minutes from midnight to standard 12-hour AM/PM string (e.g. 654 -> "10:54 AM")
 */
export function formatMinutesToTimeString(minutesFromMidnight: number): string {
  let normalized = Math.round(minutesFromMidnight);
  while (normalized < 0) normalized += 24 * 60;
  normalized = normalized % (24 * 60);
  
  const hours24 = Math.floor(normalized / 60);
  const mins = normalized % 60;
  
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const minsPadded = mins < 10 ? `0${mins}` : `${mins}`;
  
  return `${hours12}:${minsPadded} ${period}`;
}

/**
 * Calculates departure schedule based on tee time, warm-up buffer, and driving time
 */
export function calculateDepartureSchedule(
  teeTimeStr: string,
  warmupMinutes: number = 65,
  driveTimeMinutes: number
) {
  const teeTimeMinutes = parseTimeToMinutesFromMidnight(teeTimeStr);
  if (teeTimeMinutes === null) return null;
  
  const targetArrivalMinutes = teeTimeMinutes - warmupMinutes;
  const departureMinutes = targetArrivalMinutes - driveTimeMinutes;
  
  return {
    teeTimeRaw: teeTimeStr,
    teeTimeFormatted: formatMinutesToTimeString(teeTimeMinutes),
    warmupMinutes,
    warmupFormatted: formatMinutesDuration(warmupMinutes),
    targetArrivalTimeFormatted: formatMinutesToTimeString(targetArrivalMinutes),
    driveTimeMinutes,
    driveTimeFormatted: formatMinutesDuration(driveTimeMinutes),
    departureTimeFormatted: formatMinutesToTimeString(departureMinutes),
  };
}

/**
 * Geocode an address using OpenStreetMap Nominatim or fallback
 */
export async function geocodeAddress(query: string): Promise<{ lat: number; lng: number; formattedAddress: string } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query + ', South Carolina'
      )}&limit=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'CharlestonGolfHub/1.0',
        },
      }
    );
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        formattedAddress: data[0].display_name,
      };
    }
  } catch (err) {
    console.warn('Geocoding error, falling back to default coordinates', err);
  }
  return null;
}
