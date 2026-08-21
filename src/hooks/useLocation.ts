import { useState, useEffect } from 'react';
import { UserLocation, Course, DistanceInfo } from '../types/tournament';
import { loadUserLocation, saveUserLocation, DEFAULT_LOCATION } from '../services/storageService';
import { calculateDistanceAndETA, geocodeAddress } from '../services/distanceService';
import { DEFAULT_USER_LOCATIONS } from '../data/courses';

export function useLocation() {
  const [userLocation, setUserLocation] = useState<UserLocation>(loadUserLocation);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  useEffect(() => {
    saveUserLocation(userLocation);
  }, [userLocation]);

  const updateLocation = (location: UserLocation) => {
    setUserLocation(location);
  };

  const selectPresetLocation = (presetAddress: string) => {
    const found = DEFAULT_USER_LOCATIONS.find((loc) => loc.address === presetAddress || loc.label === presetAddress);
    if (found) {
      setUserLocation({
        address: found.address,
        lat: found.lat,
        lng: found.lng,
        label: found.label,
      });
    }
  };

  const setCustomAddress = async (addressQuery: string) => {
    if (!addressQuery.trim()) return false;
    setIsGeocoding(true);
    setGeocodeError(null);

    // Check if matches preset
    const preset = DEFAULT_USER_LOCATIONS.find(
      (p) => p.label.toLowerCase() === addressQuery.toLowerCase() || p.address.toLowerCase().includes(addressQuery.toLowerCase())
    );
    if (preset) {
      setUserLocation({
        address: preset.address,
        lat: preset.lat,
        lng: preset.lng,
        label: preset.label,
      });
      setIsGeocoding(false);
      return true;
    }

    try {
      const geo = await geocodeAddress(addressQuery);
      if (geo) {
        setUserLocation({
          address: geo.formattedAddress,
          lat: geo.lat,
          lng: geo.lng,
          label: addressQuery,
        });
        setIsGeocoding(false);
        return true;
      } else {
        setGeocodeError('Could not locate address in South Carolina. Try a city, zip code or landmark.');
      }
    } catch {
      setGeocodeError('Failed to geocode address.');
    } finally {
      setIsGeocoding(false);
    }
    return false;
  };

  const getDistanceAndETA = (course: Course): DistanceInfo => {
    return calculateDistanceAndETA(userLocation, course);
  };

  return {
    userLocation,
    isGeocoding,
    geocodeError,
    updateLocation,
    selectPresetLocation,
    setCustomAddress,
    getDistanceAndETA,
    presetLocations: DEFAULT_USER_LOCATIONS,
  };
}
