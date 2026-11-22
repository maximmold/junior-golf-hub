import React, { useState } from 'react';
import { ViewMode, UserLocation, Player } from '../../types/tournament';
import { 
  MapPin, 
  Calendar as CalendarIcon, 
  List, 
  Map as MapIcon, 
  Users, 
  Upload, 
  Plus, 
  Download, 
  Sparkles,
  ChevronDown,
  User,
  MoreVertical,
  X
} from 'lucide-react';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  userLocation: UserLocation;
  onOpenLocationModal: () => void;
  onOpenPlayerModal: () => void;
  onOpenIngestModal: () => void;
  onOpenAddTournamentModal: () => void;
  onExportCalendar: () => void;
  players: Player[];
  selectedPlayerId: string;
  onSelectPlayer: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
  userLocation,
  onOpenLocationModal,
  onOpenPlayerModal,
  onOpenIngestModal,
  onOpenAddTournamentModal,
  onExportCalendar,
  players,
  selectedPlayerId,
  onSelectPlayer,
}) => {
  const [playerDropdownOpen, setPlayerDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId);

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 transition-all overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 min-w-0">
          
          {/* Logo & Tour Tags */}
          <div className="flex items-center gap-2 sm:gap-3 shrink min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-900/30 text-white font-black text-xl shrink-0">
              ⛳
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-base lg:text-lg font-black tracking-tight text-white whitespace-nowrap">
                  Junior Golf Hub
                </h1>
                <span className="hidden xs:inline text-[9px] sm:text-[10px] uppercase font-extrabold tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                  CHS & SC
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 whitespace-nowrap">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  U.S. Kids Golf
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1 text-blue-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
                  SCJGA
                </span>
              </div>
            </div>
          </div>

          {/* Center: View Switcher Tabs */}
          <div className="hidden lg:flex items-center bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'timeline'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Timeline
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Calendar View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'map'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              Course Map & ETA
            </button>
            <button
              onClick={() => setViewMode('profile')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'profile'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Profile
            </button>
          </div>

          {/* Right Actions: Address, Active Player, Ingest & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 shrink-0">
            
            {/* User Address Quick Button */}
            <button
              onClick={onOpenLocationModal}
              title="Change your home address for ETA calculation"
              className="hidden md:flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-medium transition-all group min-w-0"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="max-w-[80px] lg:max-w-[120px] truncate">
                {userLocation.label || userLocation.address.split(',')[0]}
              </span>
              <span className="hidden lg:inline text-[10px] text-slate-500 group-hover:text-slate-400">ETA</span>
            </button>

            {/* Active Player Filter / Dropdown */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setPlayerDropdownOpen(!playerDropdownOpen)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-medium transition-all min-w-0"
              >
                <div 
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: selectedPlayer ? selectedPlayer.color : '#10b981' }}
                />
                <span className="max-w-[70px] lg:max-w-[100px] truncate font-semibold">
                  {selectedPlayer ? selectedPlayer.name : 'All Players'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {playerDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={() => setPlayerDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    Filter by Golfer
                  </div>
                  <button
                    onClick={() => onSelectPlayer('ALL')}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 ${
                      selectedPlayerId === 'ALL' ? 'text-emerald-400 font-bold bg-emerald-950/30' : 'text-slate-300'
                    }`}
                  >
                    <span>👥 All Players</span>
                    {selectedPlayerId === 'ALL' && <Sparkles className="w-3 h-3" />}
                  </button>
                  {players.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => onSelectPlayer(p.id)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 ${
                        selectedPlayerId === p.id ? 'text-emerald-400 font-bold bg-emerald-950/30' : 'text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: p.color }}
                        />
                        <span>{p.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{p.uskidsDivision}</span>
                    </button>
                  ))}
                  <div className="border-t border-slate-800 mt-1 pt-1">
                    <button
                      onClick={onOpenPlayerModal}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Manage Player Profiles...
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Ingestion Upload Button */}
            <button
              onClick={onOpenIngestModal}
              title="Import tournament registrations (CSV / JSON)"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/50 transition-all shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Ingest</span>
            </button>

            {/* Export & Actions Dropdown / Quick Button */}
            <button
              onClick={onExportCalendar}
              title="Export schedule to Apple / Google Calendar (.ics)"
              className="hidden sm:block p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all shrink-0"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Add Custom Tournament */}
            <button
              onClick={onOpenAddTournamentModal}
              title="Add a custom tournament or qualifier"
              className="hidden sm:block p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Mobile Overflow Menu Button */}
            <div className="relative lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all"
                title="More options"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <MoreVertical className="w-5 h-5" />}
              </button>

              {/* Mobile Menu Dropdown */}
              {mobileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 py-2">
                  
                  {/* Home Location */}
                  <button
                    onClick={() => {
                      onOpenLocationModal();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">Home Location</div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {userLocation.label || userLocation.address.split(',')[0]}
                      </div>
                    </div>
                  </button>

                  <div className="border-t border-slate-800 my-1" />

                  {/* Ingest */}
                  <button
                    onClick={() => {
                      onOpenIngestModal();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-medium">Ingest Data</span>
                  </button>

                  {/* Export Calendar */}
                  <button
                    onClick={() => {
                      onExportCalendar();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Export Calendar</span>
                  </button>

                  {/* Add Tournament */}
                  <button
                    onClick={() => {
                      onOpenAddTournamentModal();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Add Tournament</span>
                  </button>

                </div>
              )}
            </div>

          </div>
        </div>

        {/* Mobile View Switcher Tabs - 2x2 Grid */}
        <div className="grid grid-cols-4 lg:hidden gap-1 py-2 border-t border-slate-800/80 text-xs font-medium">
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-lg transition-all ${
              viewMode === 'timeline' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400'
            }`}
          >
            <List className="w-4 h-4" />
            <span className="text-[10px]">Timeline</span>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-lg transition-all ${
              viewMode === 'calendar' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span className="text-[10px]">Calendar</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-lg transition-all ${
              viewMode === 'map' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span className="text-[10px]">Map</span>
          </button>
          <button
            onClick={() => setViewMode('profile')}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-lg transition-all ${
              viewMode === 'profile' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="text-[10px]">Profile</span>
          </button>
        </div>
      </div>
    </header>
  );
};
