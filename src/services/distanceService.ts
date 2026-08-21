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

  // Format ETA string
  let formattedTime = '';
  if (minutes < 60) {
    formattedTime = `${minutes} min${minutes === 1 ? '' : 's'}`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remMins = minutes % 60;
    if (remMins === 0) {
      formattedTime = `${hours} hr${hours === 1 ? '' : 's'}`;
    } else {
      formattedTime = `${hours} hr${hours === 1 ? '' : 's'} ${remMins} min${remMins === 1 ? '' : 's'}`;
    }
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
    driveTimeFormatted: formattedTime,
    googleMapsDirectionsUrl,
    appleMapsDirectionsUrl,
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
