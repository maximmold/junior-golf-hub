import { useState, useEffect, useMemo } from 'react';
import { format, parseISO, addDays, addMonths } from 'date-fns';
import { Tournament, FilterState, RegistrationStatus, Player, UserLocation } from '../types/tournament';
import { loadTournaments, saveTournaments, DEFAULT_FILTERS } from '../services/storageService';
import { calculateDistanceAndETA } from '../services/distanceService';

export function useTournaments(players: Player[], userLocation: UserLocation) {
  const [tournaments, setTournaments] = useState<Tournament[]>(loadTournaments);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Persist to localStorage
  useEffect(() => {
    saveTournaments(tournaments);
  }, [tournaments]);

  // Today ISO string (e.g. 2026-08-20)
  const todayStr = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Update registration status for a player
  const setPlayerRegistration = (
    tournamentId: string,
    playerId: string,
    status: RegistrationStatus
  ) => {
    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id === tournamentId) {
          return {
            ...t,
            playerRegistrations: {
              ...t.playerRegistrations,
              [playerId]: status,
            },
          };
        }
        return t;
      })
    );
  };

  // Add tournament
  const addTournament = (newT: Tournament) => {
    setTournaments((prev) => [newT, ...prev]);
  };

  // Update tournament
  const updateTournament = (id: string, updated: Partial<Tournament>) => {
    setTournaments((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
    );
  };

  // Delete tournament
  const deleteTournament = (id: string) => {
    setTournaments((prev) => prev.filter((t) => t.id !== id));
  };

  // Bulk import
  const importTournaments = (imported: Tournament[]) => {
    setTournaments(imported);
  };

  // Reset tournaments
  const setAllTournaments = (list: Tournament[]) => {
    setTournaments(list);
  };

  // Filtered tournaments
  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      // 1. Upcoming date filter
      if (filters.onlyUpcoming) {
        if (t.endDate < todayStr && t.startDate < todayStr) {
          return false;
        }
      }

      // 2. Tour filter (USKG vs SCJGA vs ALL)
      if (filters.tour !== 'ALL') {
        if (t.tour !== filters.tour) {
          return false;
        }
      }

      // 3. Duration filter (1-Day vs 2-Day vs ALL)
      if (filters.duration !== 'ALL') {
        if (t.duration !== filters.duration) {
          return false;
        }
      }

      // 4. Registration status filter
      if (filters.registrationStatus !== 'ALL') {
        const targetPlayerId = filters.selectedPlayerId;
        if (targetPlayerId !== 'ALL') {
          const status = t.playerRegistrations[targetPlayerId] || 'not_registered';
          if (filters.registrationStatus === 'registered' && status !== 'registered') return false;
          if (filters.registrationStatus === 'contingent' && status !== 'contingent') return false;
          if (filters.registrationStatus === 'considering' && status !== 'considering') return false;
          if (filters.registrationStatus === 'not_registered' && (status === 'registered' || status === 'contingent')) return false;
        } else {
          // If viewing ALL players, check if ANY player matches the registration status
          const hasMatchingPlayer = players.some((p) => {
            const status = t.playerRegistrations[p.id] || 'not_registered';
            if (filters.registrationStatus === 'registered') return status === 'registered';
            if (filters.registrationStatus === 'contingent') return status === 'contingent';
            if (filters.registrationStatus === 'considering') return status === 'considering';
            return status !== 'registered' && status !== 'contingent';
          });
          if (!hasMatchingPlayer) return false;
        }
      }

      // 5. Selected player filter (if player selected, show only if has any status or general)
      if (filters.selectedPlayerId !== 'ALL') {
        // Player filter is also applied above
      }

      // 6. Max drive time filter
      if (filters.maxDriveMinutes && filters.maxDriveMinutes > 0) {
        const eta = calculateDistanceAndETA(userLocation, t.course);
        if (eta.driveTimeMinutes > filters.maxDriveMinutes) {
          return false;
        }
      }

      // 7. Date Presets & Custom Range Filters
      if (filters.datePreset && filters.datePreset !== 'ALL') {
        const todayDate = parseISO(todayStr);
        if (filters.datePreset === '7D') {
          const maxDate = format(addDays(todayDate, 7), 'yyyy-MM-dd');
          if (t.startDate > maxDate) return false;
        } else if (filters.datePreset === '14D') {
          const maxDate = format(addDays(todayDate, 14), 'yyyy-MM-dd');
          if (t.startDate > maxDate) return false;
        } else if (filters.datePreset === '30D') {
          const maxDate = format(addDays(todayDate, 30), 'yyyy-MM-dd');
          if (t.startDate > maxDate) return false;
        } else if (filters.datePreset === '60D') {
          const maxDate = format(addDays(todayDate, 60), 'yyyy-MM-dd');
          if (t.startDate > maxDate) return false;
        } else if (filters.datePreset === 'THIS_MONTH') {
          const thisMonth = todayStr.substring(0, 7);
          if (t.startDate.substring(0, 7) !== thisMonth && t.endDate.substring(0, 7) !== thisMonth) return false;
        } else if (filters.datePreset === 'NEXT_MONTH') {
          const nextMonthStr = format(addMonths(todayDate, 1), 'yyyy-MM');
          if (t.startDate.substring(0, 7) !== nextMonthStr && t.endDate.substring(0, 7) !== nextMonthStr) return false;
        }
      }

      // Custom Start Date / End Date
      if (filters.startDate && t.endDate < filters.startDate) {
        return false;
      }
      if (filters.endDate && t.startDate > filters.endDate) {
        return false;
      }

      // 8. Month filter (for calendar focus if set)
      if (filters.selectedMonth) {
        const startMonth = t.startDate.substring(0, 7); // YYYY-MM
        const endMonth = t.endDate.substring(0, 7);
        if (startMonth !== filters.selectedMonth && endMonth !== filters.selectedMonth) {
          return false;
        }
      }

      // 9. Search query filter
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchName = t.name.toLowerCase().includes(q);
        const matchCourse = t.course.name.toLowerCase().includes(q);
        const matchCity = t.course.city.toLowerCase().includes(q);
        const matchSeries = t.tourSeries.toLowerCase().includes(q);
        const matchNotes = t.notes ? t.notes.toLowerCase().includes(q) : false;
        if (!matchName && !matchCourse && !matchCity && !matchSeries && !matchNotes) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [tournaments, filters, todayStr, players, userLocation]);

  // Overall Statistics
  const stats = useMemo(() => {
    const upcoming = tournaments.filter((t) => t.startDate >= todayStr || t.endDate >= todayStr);
    
    // Count registered & contingent events
    let registeredCount = 0;
    let contingentCount = 0;
    let consideringCount = 0;
    let totalRegisteredMiles = 0;

    upcoming.forEach((t) => {
      const isRegistered = Object.values(t.playerRegistrations).some((st) => st === 'registered');
      const isContingent = Object.values(t.playerRegistrations).some((st) => st === 'contingent');
      const isConsidering = Object.values(t.playerRegistrations).some((st) => st === 'considering');
      
      if (isRegistered) {
        registeredCount++;
        const eta = calculateDistanceAndETA(userLocation, t.course);
        totalRegisteredMiles += eta.distanceMiles * 2; // Roundtrip driving
      } else if (isContingent) {
        contingentCount++;
      } else if (isConsidering) {
        consideringCount++;
      }
    });

    const nextTournament = upcoming.find((t) => 
      Object.values(t.playerRegistrations).some((st) => st === 'registered')
    ) || upcoming[0];

    return {
      totalUpcoming: upcoming.length,
      registeredCount,
      contingentCount,
      consideringCount,
      totalRegisteredRoundtripMiles: Math.round(totalRegisteredMiles),
      nextTournament,
    };
  }, [tournaments, todayStr, userLocation]);

  return {
    tournaments,
    filteredTournaments,
    filters,
    setFilters,
    setPlayerRegistration,
    addTournament,
    updateTournament,
    deleteTournament,
    importTournaments,
    setAllTournaments,
    stats,
    todayStr,
  };
}
