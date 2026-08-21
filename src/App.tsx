import React, { useState } from 'react';
import { ViewMode, Tournament } from './types/tournament';
import { usePlayers } from './hooks/usePlayers';
import { useLocation } from './hooks/useLocation';
import { useTournaments } from './hooks/useTournaments';
import { generateICalendar, downloadFile } from './services/calendarExport';
import { resetAllToDefaults } from './services/storageService';

// Layout & Components
import { Header } from './components/layout/Header';
import { StatsBar } from './components/layout/StatsBar';
import { FilterBar } from './components/filters/FilterBar';
import { TimelineView } from './components/timeline/TimelineView';
import { CalendarView } from './components/calendar/CalendarView';
import { TournamentMap } from './components/map/TournamentMap';

// Modals & Drawers
import { LocationModal } from './components/location/LocationModal';
import { PlayerModal } from './components/players/PlayerModal';
import { IngestionModal } from './components/ingestion/IngestionModal';
import { AddTournamentModal } from './components/tournament/AddTournamentModal';
import { TournamentDrawer } from './components/details/TournamentDrawer';

export function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  // Modal open states
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [isAddTournamentModalOpen, setIsAddTournamentModalOpen] = useState(false);

  // Hooks
  const {
    players,
    selectedPlayerId,
    setSelectedPlayerId,
    addPlayer,
    updatePlayer,
    deletePlayer,
    setPlayers,
  } = usePlayers();

  const {
    userLocation,
    isGeocoding,
    geocodeError,
    selectPresetLocation,
    setCustomAddress,
    getDistanceAndETA,
    presetLocations,
    updateLocation,
  } = useLocation();

  const {
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
  } = useTournaments(players, userLocation);

  // Keep filters.selectedPlayerId synced with selectedPlayerId
  const handleSelectPlayer = (id: string) => {
    setSelectedPlayerId(id);
    setFilters((prev) => ({ ...prev, selectedPlayerId: id }));
  };

  // Quick filter to signed up
  const handleFilterSignedUpOnly = () => {
    setFilters((prev) => ({
      ...prev,
      registrationStatus: prev.registrationStatus === 'registered' ? 'ALL' : 'registered',
    }));
  };

  // Quick filter to contingent
  const handleFilterContingentOnly = () => {
    setFilters((prev) => ({
      ...prev,
      registrationStatus: prev.registrationStatus === 'contingent' ? 'ALL' : 'contingent',
    }));
  };

  // Full calendar export (.ics)
  const handleExportAllCalendar = () => {
    const ics = generateICalendar(filteredTournaments, players);
    downloadFile(ics, 'charleston_junior_golf_tournaments.ics', 'text/calendar;charset=utf-8');
  };

  // Reset to default seed data
  const handleResetData = () => {
    if (window.confirm('Reset all tournaments and golfers back to default seed data?')) {
      const reset = resetAllToDefaults();
      setAllTournaments(reset.tournaments);
      setPlayers(reset.players);
      updateLocation(reset.location);
    }
  };

  const nextTournamentETA = stats.nextTournament
    ? getDistanceAndETA(stats.nextTournament.course)
    : undefined;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* Header */}
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        userLocation={userLocation}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onOpenPlayerModal={() => setIsPlayerModalOpen(true)}
        onOpenIngestModal={() => setIsIngestModalOpen(true)}
        onOpenAddTournamentModal={() => setIsAddTournamentModalOpen(true)}
        onExportCalendar={handleExportAllCalendar}
        players={players}
        selectedPlayerId={selectedPlayerId}
        onSelectPlayer={handleSelectPlayer}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* Quick Stats Bar */}
        <StatsBar
          totalUpcoming={stats.totalUpcoming}
          registeredCount={stats.registeredCount}
          contingentCount={stats.contingentCount}
          consideringCount={stats.consideringCount}
          totalRegisteredMiles={stats.totalRegisteredRoundtripMiles}
          nextTournament={stats.nextTournament}
          nextTournamentETA={nextTournamentETA}
          onSelectTournament={(t) => setSelectedTournament(t)}
          onFilterSignedUpOnly={handleFilterSignedUpOnly}
          onFilterContingentOnly={handleFilterContingentOnly}
        />

        {/* Global Filter Bar */}
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          totalMatches={filteredTournaments.length}
          totalTotal={tournaments.length}
        />

        {/* View Component Switcher */}
        {viewMode === 'timeline' && (
          <TimelineView
            tournaments={filteredTournaments}
            players={players}
            selectedPlayerId={selectedPlayerId}
            userLocation={userLocation}
            onSetRegistration={setPlayerRegistration}
            onOpenDetails={(t) => setSelectedTournament(t)}
            onResetFilters={() =>
              setFilters({
                tour: 'ALL',
                duration: 'ALL',
                registrationStatus: 'ALL',
                selectedPlayerId: 'ALL',
                onlyUpcoming: true,
                maxDriveMinutes: undefined,
                searchQuery: '',
              })
            }
          />
        )}

        {viewMode === 'calendar' && (
          <CalendarView
            tournaments={filteredTournaments}
            players={players}
            selectedPlayerId={selectedPlayerId}
            userLocation={userLocation}
            onSelectTournament={(t) => setSelectedTournament(t)}
          />
        )}

        {viewMode === 'map' && (
          <TournamentMap
            tournaments={filteredTournaments}
            userLocation={userLocation}
            players={players}
            selectedPlayerId={selectedPlayerId}
            filters={filters}
            setFilters={setFilters}
            onSelectTournament={(t) => setSelectedTournament(t)}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Charleston Junior Golf Hub</span>
            <span>•</span>
            <span>U.S. Kids Golf & SCJGA Tournaments</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleExportAllCalendar}
              className="text-emerald-400 hover:underline font-semibold"
            >
              Export Schedule (.ics)
            </button>
            <span>•</span>
            <button
              onClick={() => setIsIngestModalOpen(true)}
              className="text-slate-300 hover:text-white"
            >
              Ingest Registrations
            </button>
            <span>•</span>
            <button
              onClick={handleResetData}
              className="text-slate-400 hover:text-rose-400 transition-colors"
              title="Reset data back to seed schedule"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Slide-Over Drawer */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        userLocation={userLocation}
        presetLocations={presetLocations}
        onSelectPreset={selectPresetLocation}
        onSetCustomAddress={setCustomAddress}
        isGeocoding={isGeocoding}
        geocodeError={geocodeError}
      />

      <PlayerModal
        isOpen={isPlayerModalOpen}
        onClose={() => setIsPlayerModalOpen(false)}
        players={players}
        onAddPlayer={addPlayer}
        onUpdatePlayer={updatePlayer}
        onDeletePlayer={deletePlayer}
      />

      <IngestionModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        tournaments={tournaments}
        players={players}
        onImportSuccess={importTournaments}
      />

      <AddTournamentModal
        isOpen={isAddTournamentModalOpen}
        onClose={() => setIsAddTournamentModalOpen(false)}
        players={players}
        onAddTournament={addTournament}
      />

      <TournamentDrawer
        tournament={selectedTournament}
        onClose={() => setSelectedTournament(null)}
        players={players}
        userLocation={userLocation}
        onSetRegistration={setPlayerRegistration}
      />

    </div>
  );
}

export default App;
