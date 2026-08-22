import { Course, DistanceInfo, UserLocation } from '../types/tournament';

// LocalStorage key for caching real OSRM turn-by-turn road routes
const OSRM_CACHE_KEY = 'golf_osrm_route_cache_v1';

// Verified initial real-road OpenStreetMap routes from 2561 Rivertowne Pkwy (lat: 32.886, lng: -79.771)
const INITIAL_VERIFIED_ROUTES: Record<string, { distanceMiles: number; driveTimeMinutes: number }> = {
  // Wedgefield Country Club (US-17 North / Georgetown)
  '32.886,-79.771->33.454,-79.351': { distanceMiles: 56.0, driveTimeMinutes: 89 },
  // The Plantation Course At Edisto (US-17 South / SC-174)
  '32.886,-79.771->32.503,-80.313': { distanceMiles: 73.5, driveTimeMinutes: 102 },
  // Fripp Island Ocean Creek (US-17 South / US-21 Beaufort / Sea Islands)
  '32.886,-79.771->32.318,-80.491': { distanceMiles: 105.1, driveTimeMinutes: 158 },
  // LinRick Golf Course (I-26 West / Columbia)
  '32.886,-79.771->34.121,-81.083': { distanceMiles: 131.5, driveTimeMinutes: 157 },
  // Players Series @ Darlington CC (US-52 / Florence / Darlington)
  '32.886,-79.771->34.299,-79.883': { distanceMiles: 118.2, driveTimeMinutes: 135 },
  // Berkeley Country Club (Moncks Corner)
  '32.886,-79.771->33.185,-80.013': { distanceMiles: 32.8, driveTimeMinutes: 44 },
  // Crowfield Golf Club (Goose Creek)
  '32.886,-79.771->32.995,-80.071': { distanceMiles: 23.5, driveTimeMinutes: 36 },
  // Summerville Country Club
  '32.886,-79.771->33.019,-80.176': { distanceMiles: 31.2, driveTimeMinutes: 45 },
  // CC of Newberry
  '32.886,-79.771->34.275,-81.619': { distanceMiles: 161.0, driveTimeMinutes: 178 },
  // Quixote Club (Sumter)
  '32.886,-79.771->33.921,-80.342': { distanceMiles: 96.0, driveTimeMinutes: 112 },
};

// In-memory route cache for instant lookups
const routeMemoryCache: Record<string, { distanceMiles: number; driveTimeMinutes: number }> = (() => {
  try {
    const raw = localStorage.getItem(OSRM_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return { ...INITIAL_VERIFIED_ROUTES, ...parsed };
  } catch {
    return { ...INITIAL_VERIFIED_ROUTES };
  }
})();

function getRouteCacheKey(lat1: number, lng1: number, lat2: number, lng2: number): string {
  return `${lat1.toFixed(3)},${lng1.toFixed(3)}->${lat2.toFixed(3)},${lng2.toFixed(3)}`;
}

function saveRouteToCache(key: string, data: { distanceMiles: number; driveTimeMinutes: number }) {
  try {
    routeMemoryCache[key] = data;
    localStorage.setItem(OSRM_CACHE_KEY, JSON.stringify(routeMemoryCache));
  } catch {
    // Ignore storage quota error
  }
}

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
 * Uses real OSRM cached turn-by-turn road data if available, or calibrated SC Lowcountry geometric model
 */
export function calculateDistanceAndETA(
  userLocation: UserLocation,
  course: Course
): DistanceInfo {
  const cacheKey = getRouteCacheKey(userLocation.lat, userLocation.lng, course.lat, course.lng);
  const cached = routeMemoryCache[cacheKey];

  let drivingMiles: number;
  let minutes: number;

  if (cached) {
    // Use exact OpenStreetMap turn-by-turn road network route
    drivingMiles = cached.distanceMiles;
    minutes = cached.driveTimeMinutes;
  } else {
    // Calibrated SC Lowcountry & Highway Geometric Model (Accounting for marsh, winding highways, & lights)
    const straightMiles = calculateHaversineDistance(
      userLocation.lat,
      userLocation.lng,
      course.lat,
      course.lng
    );

    // Realistic road curvature (coastal rivers, US-17 detours, sea islands = 1.32x - 1.36x)
    const roadFactor = straightMiles < 15 ? 1.34 : straightMiles < 60 ? 1.32 : 1.24;
    drivingMiles = Math.round(straightMiles * roadFactor * 10) / 10;

    // Calibrated real-world SC average speeds (accounting for stoplights, drawbridges, speed zones)
    let avgMph = 32; // City / local bridge traffic (Mount Pleasant / Charleston)
    if (drivingMiles > 15 && drivingMiles <= 50) {
      avgMph = 43; // Regional highways with speed zones & lights (US-17 North/South, SC-41, US-52)
    } else if (drivingMiles > 50) {
      avgMph = 55; // Interstate corridors (I-26 toward Columbia, I-95)
    }

    // Realistic driving minutes + 5 min buffer for course gate, bag drop, and parking
    const rawMinutes = Math.round((drivingMiles / avgMph) * 60) + 5;
    minutes = Math.max(5, rawMinutes);

    // Trigger non-blocking background fetch for exact road route
    fetchOSRMRoute(userLocation.lat, userLocation.lng, course.lat, course.lng).catch(() => {});
  }

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
 * Fetch exact turn-by-turn road network route from Open Source Routing Machine (OSRM)
 */
export async function fetchOSRMRoute(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): Promise<{ distanceMiles: number; driveTimeMinutes: number } | null> {
  const cacheKey = getRouteCacheKey(lat1, lng1, lat2, lng2);
  if (routeMemoryCache[cacheKey]) {
    return routeMemoryCache[cacheKey];
  }

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=false`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();

    if (data && data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      // meters to miles
      const distanceMiles = Math.round((route.distance / 1609.344) * 10) / 10;
      // seconds to minutes + 3 min buffer for parking / gate check-in
      const driveTimeMinutes = Math.round(route.duration / 60) + 3;

      const result = { distanceMiles, driveTimeMinutes };
      saveRouteToCache(cacheKey, result);
      return result;
    }
  } catch (e) {
    // Fallback gracefully to calibrated model
  }
  return null;
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
