import React, { useEffect, useRef, useState } from 'react';
import { Tournament, UserLocation, Player, FilterState, DatePreset } from '../../types/tournament';
import { calculateDistanceAndETA } from '../../services/distanceService';
import L from 'leaflet';
import { Navigation, ExternalLink, Calendar, Filter, X, ChevronDown } from 'lucide-react';

interface TournamentMapProps {
  tournaments: Tournament[];
  userLocation: UserLocation;
  players: Player[];
  selectedPlayerId: string;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onSelectTournament: (t: Tournament) => void;
}

export const TournamentMap: React.FC<TournamentMapProps> = ({
  tournaments,
  userLocation,
  players,
  selectedPlayerId,
  filters,
  setFilters,
  onSelectTournament,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const radiusLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat || 32.7765, userLocation.lng || -79.9311],
        zoom: 10,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Dark / Modern CartoDB Dark Matter tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      radiusLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      // Keep map alive or clean up
    };
  }, []);

  // Update User Location Marker & Radius Rings
  useEffect(() => {
    const map = mapInstanceRef.current;
    const radiusLayer = radiusLayerRef.current;
    if (!map || !radiusLayer) return;

    radiusLayer.clearLayers();

    // User Home Pin
    const homeIcon = L.divIcon({
      className: 'custom-home-pin',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-emerald-500/20 animate-ping"></div>
          <div class="w-7 h-7 rounded-full bg-emerald-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-bold">
            🏠
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const homeMarker = L.marker([userLocation.lat, userLocation.lng], { icon: homeIcon });
    homeMarker.bindPopup(`
      <div class="p-2 text-slate-900 font-sans">
        <div class="text-[10px] uppercase font-bold text-emerald-700">Starting Location</div>
        <div class="font-bold text-xs">${userLocation.label || 'Home'}</div>
        <div class="text-[11px] text-slate-600">${userLocation.address}</div>
      </div>
    `);
    radiusLayer.addLayer(homeMarker);

    // 25-mile and 50-mile rings
    const ring25 = L.circle([userLocation.lat, userLocation.lng], {
      radius: 25 * 1609.34, // 25 miles in meters
      color: '#10b981',
      fillColor: '#10b981',
      fillOpacity: 0.03,
      weight: 1,
      dashArray: '4, 4',
    });
    radiusLayer.addLayer(ring25);

    const ring50 = L.circle([userLocation.lat, userLocation.lng], {
      radius: 50 * 1609.34, // 50 miles in meters
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.015,
      weight: 1,
      dashArray: '6, 6',
    });
    radiusLayer.addLayer(ring50);
  }, [userLocation]);

  // Update Tournament Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    const bounds = L.latLngBounds([[userLocation.lat, userLocation.lng]]);

    tournaments.forEach((t) => {
      const course = t.course;
      if (!course.lat || !course.lng) return;

      bounds.extend([course.lat, course.lng]);

      const eta = calculateDistanceAndETA(userLocation, course, selectedPlayerId);

      // Check if signed up or contingent
      const isSignedUp = selectedPlayerId === 'ALL'
        ? Object.values(t.playerRegistrations).some((st) => st === 'registered')
        : t.playerRegistrations[selectedPlayerId] === 'registered';

      const isContingent = selectedPlayerId === 'ALL'
        ? Object.values(t.playerRegistrations).some((st) => st === 'contingent')
        : t.playerRegistrations[selectedPlayerId] === 'contingent';

      const isConsidering = selectedPlayerId === 'ALL'
        ? Object.values(t.playerRegistrations).some((st) => st === 'considering')
        : t.playerRegistrations[selectedPlayerId] === 'considering';

      const isUSKG = t.tour === 'USKG';
      const bgColor = isSignedUp ? '#f59e0b' : isContingent ? '#ea580c' : isUSKG ? '#059669' : '#2563eb';
      const badgeText = isUSKG ? 'USK' : 'SCJ';

      const markerHtml = `
        <div class="relative group cursor-pointer transition-transform hover:scale-110">
          ${isSignedUp ? '<div class="absolute -top-2 -right-1 w-4 h-4 bg-amber-400 text-slate-950 font-black rounded-full flex items-center justify-center text-[9px] shadow-md border border-white z-10">★</div>' : ''}
          ${isContingent ? '<div class="absolute -top-2 -right-1 w-4 h-4 bg-orange-500 text-white font-black rounded-full flex items-center justify-center text-[8px] shadow-md border border-white z-10">🔶</div>' : ''}
          ${isConsidering && !isContingent ? '<div class="absolute -top-2 -right-1 w-4 h-4 bg-amber-500 text-white font-bold rounded-full flex items-center justify-center text-[9px] shadow-md z-10">?</div>' : ''}
          <div style="background-color: ${bgColor};" class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-[11px] font-black">
            ${badgeText}
          </div>
          <div class="w-2 h-2 bg-slate-900 mx-auto -mt-0.5 rotate-45"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-tournament-pin',
        html: markerHtml,
        iconSize: [32, 36],
        iconAnchor: [16, 36],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([course.lat, course.lng], { icon: customIcon });

      // Popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'p-3 font-sans max-w-[280px] text-slate-900';
      popupContent.innerHTML = `
        <div class="flex items-center justify-between gap-1 mb-1">
          <span class="text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
            isUSKG ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
          }">
            ${isUSKG ? 'U.S. Kids Golf' : 'SCJGA'}
          </span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded ${
            t.duration === '2-Day' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
          }">
            ${t.duration}
          </span>
        </div>
        
        <h4 class="font-extrabold text-xs text-slate-900 leading-tight mb-1">${t.name}</h4>
        
        <div class="text-[11px] font-semibold text-slate-700 mb-1">⛳ ${course.name}</div>
        <div class="text-[11px] text-slate-500 mb-2">📅 ${t.startDate}${t.startDate !== t.endDate ? ' to ' + t.endDate : ''}</div>

        <div class="bg-slate-50 p-2 rounded-lg border border-slate-200 mb-2 flex items-center justify-between text-xs">
          <span class="text-slate-600">🚗 ETA:</span>
          <span class="font-bold text-emerald-700">${eta.driveTimeFormatted}</span>
          <span class="text-[10px] text-slate-400">(${eta.distanceMiles} mi)</span>
        </div>

        <div class="flex items-center gap-1.5 pt-1">
          <a 
            href="${eta.googleMapsDirectionsUrl}" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold py-1 px-2 rounded text-center"
          >
            Google Maps
          </a>
          <a 
            href="${eta.appleMapsDirectionsUrl}" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold py-1 px-2 rounded text-center border border-slate-300"
          >
            Apple Maps
          </a>
        </div>
        <button 
          id="btn-details-${t.id}"
          class="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold py-1 px-2 rounded text-center transition-colors shadow-sm"
        >
          View Tournament Details & Register
        </button>
      `;

      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-details-${t.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectTournament(t);
          };
        }
      });

      markersLayer.addLayer(marker);
    });

    // Fit map bounds if markers exist
    if (tournaments.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
  }, [tournaments, userLocation, selectedPlayerId, players]);

  const [showCustomDates, setShowCustomDates] = useState(false);

  const activePreset = filters.datePreset || 'ALL';

  const handleSetPreset = (preset: DatePreset) => {
    if (preset === 'CUSTOM') {
      setShowCustomDates(true);
      setFilters((prev) => ({ ...prev, datePreset: 'CUSTOM' }));
    } else {
      setShowCustomDates(false);
      setFilters((prev) => ({
        ...prev,
        datePreset: preset,
        startDate: undefined,
        endDate: undefined,
        selectedMonth: undefined,
      }));
    }
  };

  const handleSetMonth = (monthStr: string) => {
    setShowCustomDates(false);
    setFilters((prev) => ({
      ...prev,
      datePreset: undefined,
      selectedMonth: monthStr === 'ALL' ? undefined : monthStr,
      startDate: undefined,
      endDate: undefined,
    }));
  };

  const handleClearDateFilter = () => {
    setShowCustomDates(false);
    setFilters((prev) => ({
      ...prev,
      datePreset: 'ALL',
      startDate: undefined,
      endDate: undefined,
      selectedMonth: undefined,
    }));
  };

  const hasDateFilter = 
    (filters.datePreset && filters.datePreset !== 'ALL') ||
    filters.startDate ||
    filters.endDate ||
    filters.selectedMonth;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Map Header Controls Bar */}
        <div className="p-3 sm:p-4 bg-slate-950/80 border-b border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-white">Map Date Filter</span>
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  📍 {tournaments.length} {tournaments.length === 1 ? 'course' : 'courses'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Filter courses displayed on the map by tournament timeframe</p>
            </div>
          </div>

          {/* Quick Date Range Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => handleSetPreset('ALL')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePreset === 'ALL' && !filters.selectedMonth && !filters.startDate
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleSetPreset('7D')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePreset === '7D'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              ⚡ 7 Days
            </button>
            <button
              onClick={() => handleSetPreset('14D')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePreset === '14D'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => handleSetPreset('30D')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePreset === '30D'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => handleSetMonth('2026-08')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filters.selectedMonth === '2026-08'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Aug '26
            </button>
            <button
              onClick={() => handleSetMonth('2026-09')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filters.selectedMonth === '2026-09'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Sep '26
            </button>
            <button
              onClick={() => handleSetMonth('2026-10')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filters.selectedMonth === '2026-10'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Oct '26
            </button>
            <button
              onClick={() => handleSetMonth('2026-11')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filters.selectedMonth === '2026-11'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Nov '26
            </button>
            <button
              onClick={() => setShowCustomDates((prev) => !prev)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                showCustomDates || filters.startDate || filters.endDate
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-900 text-purple-300 hover:text-white border border-slate-800'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Custom</span>
            </button>
            {hasDateFilter && (
              <button
                onClick={handleClearDateFilter}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Reset date filter"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Expandable Custom Date Inputs */}
        {showCustomDates && (
          <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center gap-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">From:</span>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    startDate: e.target.value || undefined,
                    datePreset: 'CUSTOM',
                    selectedMonth: undefined,
                  }))
                }
                className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">To:</span>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    endDate: e.target.value || undefined,
                    datePreset: 'CUSTOM',
                    selectedMonth: undefined,
                  }))
                }
                className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            {(filters.startDate || filters.endDate) && (
              <button
                onClick={handleClearDateFilter}
                className="text-xs text-slate-400 hover:text-white underline ml-auto"
              >
                Clear Custom Dates
              </button>
            )}
          </div>
        )}

        {/* Map Canvas Container with Legend */}
        <div className="relative w-full h-[520px] sm:h-[620px]">
          
          {/* Map Legend Overlay (Bottom Left) */}
          <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3 rounded-2xl shadow-xl text-xs space-y-1.5 max-w-[220px]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Map Legend</div>
            <div className="flex items-center gap-2 text-slate-300">
              <div className="w-3 h-3 rounded-full bg-emerald-600 border border-white"></div>
              <span>U.S. Kids Golf Local Tour</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <div className="w-3 h-3 rounded-full bg-blue-600 border border-white"></div>
              <span>SCJGA Tournament</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <div className="w-3 h-3 rounded-full bg-amber-500 border border-white flex items-center justify-center text-[8px] text-white">★</div>
              <span className="font-bold text-amber-300">Signed Up</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <div className="w-3 h-3 rounded-full bg-orange-600 border border-white flex items-center justify-center text-[8px] text-white">🔶</div>
              <span className="font-bold text-orange-300">Contingent</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[11px] pt-1 border-t border-slate-800">
              <span>⭕ Rings: 25mi & 50mi from home</span>
            </div>
          </div>

          {/* Map Container */}
          <div ref={mapContainerRef} className="w-full h-full z-0" />
        </div>

      </div>
    </div>
  );
};
