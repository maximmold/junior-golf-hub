import React from 'react';
import { Tournament, Player, RegistrationStatus, UserLocation } from '../../types/tournament';
import { calculateDistanceAndETA } from '../../services/distanceService';
import { generateICalendar, downloadFile } from '../../services/calendarExport';
import { 
  X, 
  MapPin, 
  Calendar as CalendarIcon, 
  Clock, 
  Navigation, 
  ExternalLink, 
  Phone, 
  Globe, 
  DollarSign, 
  FileText, 
  Trophy, 
  Check, 
  HelpCircle, 
  CalendarPlus,
  Compass
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface TournamentDrawerProps {
  tournament: Tournament | null;
  onClose: () => void;
  players: Player[];
  userLocation: UserLocation;
  onSetRegistration: (tournamentId: string, playerId: string, status: RegistrationStatus) => void;
}

export const TournamentDrawer: React.FC<TournamentDrawerProps> = ({
  tournament,
  onClose,
  players,
  userLocation,
  onSetRegistration,
}) => {
  if (!tournament) return null;

  const eta = calculateDistanceAndETA(userLocation, tournament.course);
  const isUSKG = tournament.tour === 'USKG';
  const is2Day = tournament.duration === '2-Day';

  let formattedDate = tournament.startDate;
  try {
    const startDateObj = parseISO(tournament.startDate);
    formattedDate = format(startDateObj, 'EEEE, MMMM d, yyyy');
    if (tournament.startDate !== tournament.endDate) {
      const endDateObj = parseISO(tournament.endDate);
      formattedDate = `${format(startDateObj, 'MMM d')} - ${format(endDateObj, 'MMMM d, yyyy')}`;
    }
  } catch {
    formattedDate = tournament.startDate;
  }

  const handleExportICal = () => {
    const ics = generateICalendar([tournament], players);
    downloadFile(ics, `${tournament.name.replace(/[^a-z0-9]/gi, '_')}.ics`, 'text/calendar;charset=utf-8');
  };

  return (
    <div className="fixed inset-0 z-[3000] overflow-hidden bg-slate-950/80 backdrop-blur-sm flex justify-end animate-in fade-in">
      <div 
        className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
              isUSKG
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                : 'bg-blue-950/80 text-blue-300 border-blue-700/60'
            }`}>
              {tournament.tour === 'USKG' ? 'U.S. Kids Golf' : 'SCJGA'}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-800">
              {tournament.duration}
            </span>
            {tournament.isTourChampionship && (
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                🏆 Championship
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="p-5 sm:p-6 space-y-6 flex-1">
          
          {/* Title and Course */}
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {tournament.name}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-sm text-emerald-400 font-semibold">
              <Compass className="w-4 h-4" />
              <span>{tournament.tourSeries}</span>
            </div>
          </div>

          {/* Key Facts Matrix */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <CalendarIcon className="w-4 h-4 text-emerald-400" />
                <span>Tournament Date</span>
              </div>
              <div className="text-sm font-bold text-white">{formattedDate}</div>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span>Drive Time & ETA</span>
              </div>
              <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                <span>{eta.driveTimeFormatted}</span>
                <span className="text-xs text-slate-400 font-normal">({eta.distanceMiles} mi)</span>
              </div>
            </div>
          </div>

          {/* Turn-by-Turn Navigation Launchers */}
          <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="text-xs">
              <span className="text-slate-400">Directions from </span>
              <span className="font-bold text-white">{userLocation.label || 'Home'}</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={eta.googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors flex items-center gap-1"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <a
                href={eta.appleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors flex items-center gap-1"
              >
                <span>Apple Maps</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Golfer Registration Status Manager */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Golfer Registration Status
              </h4>
            </div>

            <div className="space-y-3">
              {players.map((p) => {
                const currentStatus = tournament.playerRegistrations[p.id] || 'not_registered';

                return (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3.5 h-3.5 rounded-full ring-2 ring-emerald-500/40" style={{ backgroundColor: p.color }} />
                        <div>
                          <div className="text-sm font-bold text-white">{p.name}</div>
                          <div className="text-[11px] text-slate-400">
                            {isUSKG ? p.uskidsDivision : p.scjgaDivision}
                          </div>
                        </div>
                      </div>

                      {/* Current Status Badge */}
                      <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${
                        currentStatus === 'registered'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60'
                          : currentStatus === 'contingent'
                          ? 'bg-orange-950 text-orange-300 border-orange-500/60'
                          : currentStatus === 'considering'
                          ? 'bg-amber-950 text-amber-300 border-amber-500/60'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}>
                        {currentStatus === 'registered' ? '⭐ Signed Up' : currentStatus === 'contingent' ? '🔶 Contingent' : currentStatus === 'considering' ? '💡 Considering' : '⛳ Not Signed Up'}
                      </span>
                    </div>

                    {/* 4-way Status Selector Buttons */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-slate-800/80">
                      <button
                        onClick={() => onSetRegistration(tournament.id, p.id, 'registered')}
                        className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 text-center ${
                          currentStatus === 'registered'
                            ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
                        }`}
                      >
                        <span>⭐</span>
                        <span>Signed Up</span>
                      </button>
                      <button
                        onClick={() => onSetRegistration(tournament.id, p.id, 'contingent')}
                        className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 text-center ${
                          currentStatus === 'contingent'
                            ? 'bg-orange-600 text-white shadow-md ring-2 ring-orange-400'
                            : 'bg-slate-900 hover:bg-slate-800 text-orange-300 hover:text-white border border-slate-800'
                        }`}
                      >
                        <span>🔶</span>
                        <span>Contingent</span>
                      </button>
                      <button
                        onClick={() => onSetRegistration(tournament.id, p.id, 'considering')}
                        className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 text-center ${
                          currentStatus === 'considering'
                            ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400'
                            : 'bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-white border border-slate-800'
                        }`}
                      >
                        <span>💡</span>
                        <span>Considering</span>
                      </button>
                      <button
                        onClick={() => onSetRegistration(tournament.id, p.id, 'not_registered')}
                        className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 text-center ${
                          currentStatus === 'not_registered'
                            ? 'bg-slate-800 text-slate-200 border border-slate-600'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-slate-300 border border-slate-800'
                        }`}
                      >
                        <span>✖</span>
                        <span>Clear</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Course Details Card */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs">
            <h4 className="font-bold text-white uppercase text-[10px] tracking-wider text-slate-400">
              Course Information
            </h4>
            
            <div className="flex items-start gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{tournament.course.address}, {tournament.course.city}, {tournament.course.state} {tournament.course.zip}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-slate-400">
              {tournament.course.facilityType && (
                <div>Facility: <span className="text-white font-medium">{tournament.course.facilityType}</span></div>
              )}
              {tournament.course.holes && (
                <div>Holes: <span className="text-white font-medium">{tournament.course.holes} Holes</span></div>
              )}
              {tournament.course.par && (
                <div>Par: <span className="text-white font-medium">{tournament.course.par}</span></div>
              )}
              {tournament.entryFee && (
                <div>Entry Fee: <span className="text-emerald-400 font-bold">${tournament.entryFee}</span></div>
              )}
            </div>

            {tournament.course.phone && (
              <div className="pt-1 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <a href={`tel:${tournament.course.phone}`} className="text-emerald-400 hover:underline font-medium">
                  {tournament.course.phone}
                </a>
              </div>
            )}

            {tournament.course.website && (
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <a 
                  href={tournament.course.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-emerald-400 hover:underline font-medium truncate max-w-[280px]"
                >
                  {tournament.course.website.replace('https://', '')}
                </a>
              </div>
            )}
          </div>

          {/* Notes & Format */}
          {(tournament.notes || tournament.yardageOrFormat) && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-xs space-y-1.5">
              <h4 className="font-bold text-[10px] uppercase tracking-wider text-slate-400">
                Tournament Notes & Format
              </h4>
              {tournament.yardageOrFormat && (
                <div className="text-slate-300 font-medium">{tournament.yardageOrFormat}</div>
              )}
              {tournament.notes && (
                <p className="text-slate-400 leading-relaxed">{tournament.notes}</p>
              )}
            </div>
          )}

        </div>

        {/* Drawer Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/80 sticky bottom-0 z-20 flex items-center gap-2">
          
          <button
            onClick={handleExportICal}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-700"
          >
            <CalendarPlus className="w-4 h-4 text-emerald-400" />
            <span>Add to Calendar (.ics)</span>
          </button>

          {tournament.registrationUrl && (
            <a
              href={tournament.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/60 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Register on {isUSKG ? 'US Kids' : 'SCJGA'}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

        </div>

      </div>
    </div>
  );
};
