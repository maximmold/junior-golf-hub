import { Course, DistanceInfo, UserLocation } from '../types/tournament';

/**
 * Curated real-world Google Maps driving routes from 2561 Rivertowne Pkwy, Mount Pleasant, SC 29466 (Owen's Home)
 */
export const OWEN_HOME_GOOGLE_MAPS_ETAS: Record<string, { distanceMiles: number; driveTimeMinutes: number }> = {
  'wedgefield': { distanceMiles: 51.0, driveTimeMinutes: 65 },         // 1 hr 5 mins via US-17 N
  'edisto-plantation': { distanceMiles: 64.0, driveTimeMinutes: 85 },  // 1 hr 25 mins via US-17 S / SC-174
  'summerville-cc': { distanceMiles: 29.0, driveTimeMinutes: 40 },     // 40 mins via I-526 / I-26
  'berkeley-cc': { distanceMiles: 28.0, driveTimeMinutes: 38 },        // 38 mins via SC-41
  'crowfield': { distanceMiles: 22.0, driveTimeMinutes: 30 },          // 30 mins via I-526 / US-52
  'linrick': { distanceMiles: 124.0, driveTimeMinutes: 115 },          // 1 hr 55 mins via I-26 W
  'fripp-island': { distanceMiles: 92.0, driveTimeMinutes: 125 },      // 2 hr 5 mins via US-17 S / US-21
  'darlington-cc': { distanceMiles: 110.0, driveTimeMinutes: 110 },    // 1 hr 50 mins via US-52 N
  'quixote': { distanceMiles: 95.0, driveTimeMinutes: 100 },           // 1 hr 40 mins via US-52 / US-378
  'river-hills': { distanceMiles: 104.0, driveTimeMinutes: 120 },      // 2 hr 00 mins via US-17 N
  'the-fort-club': { distanceMiles: 175.0, driveTimeMinutes: 165 },    // 2 hr 45 mins via I-26 W
  'boscobel': { distanceMiles: 235.0, driveTimeMinutes: 215 },         // 3 hr 35 mins via I-26 / I-385 / I-85
  'newberry-cc': { distanceMiles: 152.0, driveTimeMinutes: 140 },      // 2 hr 20 mins via I-26 W
  'white-plains': { distanceMiles: 145.0, driveTimeMinutes: 145 },     // 2 hr 25 mins via SC-151 / US-601
  'timberlake': { distanceMiles: 138.0, driveTimeMinutes: 130 },       // 2 hr 10 mins via I-26 W
  'village-greens': { distanceMiles: 215.0, driveTimeMinutes: 195 },   // 3 hr 15 mins via I-26 W
  'cobbs-glen': { distanceMiles: 228.0, driveTimeMinutes: 210 },       // 3 hr 30 mins via I-26 / I-385 / US-76
  'hickory-knob': { distanceMiles: 185.0, driveTimeMinutes: 180 },     // 3 hr 00 mins via I-26 / US-378
  'cherokee-national': { distanceMiles: 205.0, driveTimeMinutes: 190 },// 3 hr 10 mins via I-26 W
  'spartanburg-cc': { distanceMiles: 198.0, driveTimeMinutes: 180 },   // 3 hr 00 mins via I-26 W
  'cc-lexington': { distanceMiles: 128.0, driveTimeMinutes: 120 },     // 2 hr 00 mins via I-26 W
  'golden-bear': { distanceMiles: 108.0, driveTimeMinutes: 125 },      // 2 hr 05 mins via US-17 S / US-278
  'cheraw-state-park': { distanceMiles: 135.0, driveTimeMinutes: 135 },// 2 hr 15 mins via US-52 N
  'edgewater': { distanceMiles: 170.0, driveTimeMinutes: 160 },        // 2 hr 40 mins via I-26 / I-77 / SC-9
  'lake-city-cc': { distanceMiles: 88.0, driveTimeMinutes: 95 },       // 1 hr 35 mins via US-52 N
  'southern-oaks': { distanceMiles: 225.0, driveTimeMinutes: 205 },    // 3 hr 25 mins via I-26 / I-385
  'hartsville-cc': { distanceMiles: 120.0, driveTimeMinutes: 120 },    // 2 hr 00 mins via US-52 N
  'cc-south-carolina': { distanceMiles: 105.0, driveTimeMinutes: 105 },// 1 hr 45 mins via US-52 N
  'diamondback': { distanceMiles: 115.0, driveTimeMinutes: 125 },      // 2 hr 05 mins via US-17 N / SC-9
  'rose-hill': { distanceMiles: 102.0, driveTimeMinutes: 115 },        // 1 hr 55 mins via US-17 S / US-278
};

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
 * Uses curated Google Maps ETAs from Rivertowne when Owen is selected,
 * and dynamically falls back to the mathematical model for other golfers or custom locations.
 */
export function calculateDistanceAndETA(
  userLocation: UserLocation,
  course: Course,
  selectedPlayerId?: string
): DistanceInfo {
  // Check if Owen / Rivertowne home route is active
  const isOwen = !selectedPlayerId || selectedPlayerId === 'player-owen' || selectedPlayerId === 'ALL';
  const isRivertowneHome = userLocation.address.toLowerCase().includes('rivertowne') || 
                           (Math.abs(userLocation.lat - 32.8858) < 0.01 && Math.abs(userLocation.lng - (-79.7712)) < 0.01);

  if (isOwen && isRivertowneHome && OWEN_HOME_GOOGLE_MAPS_ETAS[course.id]) {
    const curated = OWEN_HOME_GOOGLE_MAPS_ETAS[course.id];
    const destinationQuery = encodeURIComponent(
      `${course.name}, ${course.address}, ${course.city}, ${course.state} ${course.zip}`
    );
    const originQuery = encodeURIComponent(userLocation.address);

    return {
      distanceMiles: curated.distanceMiles,
      driveTimeMinutes: curated.driveTimeMinutes,
      driveTimeFormatted: formatMinutesDuration(curated.driveTimeMinutes),
      googleMapsDirectionsUrl: `https://www.google.com/maps/dir/?api=1&origin=${originQuery}&destination=${destinationQuery}`,
      appleMapsDirectionsUrl: `https://maps.apple.com/?saddr=${originQuery}&daddr=${destinationQuery}`,
    };
  }

  // Dynamic fallback calculation for other golfers or custom addresses
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
