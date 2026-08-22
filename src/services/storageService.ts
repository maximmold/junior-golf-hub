import { Tournament, Player, UserLocation, FilterState } from '../types/tournament';
import { SEED_TOURNAMENTS, DEFAULT_PLAYERS } from '../data/seedTournaments';
import { DEFAULT_USER_LOCATIONS } from '../data/courses';

const STORAGE_KEYS = {
  TOURNAMENTS: 'charleston_golf_tournaments_v10',
  PLAYERS: 'charleston_golf_players_v10',
  USER_LOCATION: 'charleston_golf_location_v10',
  FILTERS: 'charleston_golf_filters_v10',
};

export const DEFAULT_LOCATION: UserLocation = {
  address: DEFAULT_USER_LOCATIONS[0].address,
  lat: DEFAULT_USER_LOCATIONS[0].lat,
  lng: DEFAULT_USER_LOCATIONS[0].lng,
  label: DEFAULT_USER_LOCATIONS[0].label,
};

export const DEFAULT_FILTERS: FilterState = {
  tour: 'ALL',
  duration: 'ALL',
  selectedStatuses: [],
  selectedPlayerId: 'ALL',
  onlyUpcoming: true,
  maxDriveMinutes: undefined,
  searchQuery: '',
};

export function loadTournaments(): Tournament[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load tournaments from localStorage', e);
  }
  return SEED_TOURNAMENTS;
}

export function saveTournaments(tournaments: Tournament[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tournaments));
  } catch (e) {
    console.error('Failed to save tournaments to localStorage', e);
  }
}

export function loadPlayers(): Player[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load players from localStorage', e);
  }
  return DEFAULT_PLAYERS;
}

export function savePlayers(players: Player[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
  } catch (e) {
    console.error('Failed to save players to localStorage', e);
  }
}

export function loadUserLocation(): UserLocation {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_LOCATION);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.lat && parsed.lng) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load user location from localStorage', e);
  }
  return DEFAULT_LOCATION;
}

export function saveUserLocation(location: UserLocation) {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_LOCATION, JSON.stringify(location));
  } catch (e) {
    console.error('Failed to save user location to localStorage', e);
  }
}

export function resetAllToDefaults(): { tournaments: Tournament[]; players: Player[]; location: UserLocation } {
  // Clear all current and legacy storage keys
  ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9', 'v10'].forEach((v) => {
    localStorage.removeItem(`charleston_golf_tournaments_${v}`);
    localStorage.removeItem(`charleston_golf_players_${v}`);
    localStorage.removeItem(`charleston_golf_location_${v}`);
    localStorage.removeItem(`charleston_golf_filters_${v}`);
  });
  return {
    tournaments: SEED_TOURNAMENTS,
    players: DEFAULT_PLAYERS,
    location: DEFAULT_LOCATION,
  };
}
