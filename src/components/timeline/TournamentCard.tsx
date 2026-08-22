import React from 'react';
import { Tournament, Player, RegistrationStatus, UserLocation } from '../../types/tournament';
import { calculateDistanceAndETA, calculateDepartureSchedule } from '../../services/distanceService';
import { generateICalendar, downloadFile } from '../../services/calendarExport';
import { 
  MapPin, 
  Calendar as CalendarIcon, 
  Clock, 
  DollarSign, 
  Check, 
  HelpCircle, 
  Navigation, 
  ExternalLink, 
  Plus,
  Share2,
  CalendarPlus,
  Car
} from 'lucide-react';
import { format, parseISO, differenceInCalendarDays } from 'date-fns';

interface TournamentCardProps {
  tournament: Tournament;
  players: Player[];
  selectedPlayerId: string;
  userLocation: UserLocation;
  onSetRegistration: (tournamentId: string, playerId: string, status: RegistrationStatus) => void;
  onOpenDetails: (tournament: Tournament) => void;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  players,
  selectedPlayerId,
  userLocation,
  onSetRegistration,
  onOpenDetails,
}) => {
  const eta = calculateDistanceAndETA(userLocation, tournament.course, selectedPlayerId);

  // Active target player
  const targetPlayer = players.find((p) => p.id === selectedPlayerId) || players[0];
  const activeStatus = tournament.playerRegistrations[targetPlayer?.id || 'p1'] || 'not_registered';
  const playerTeeTime = targetPlayer ? tournament.playerTeeTimes?.[targetPlayer.id] : undefined;
  const departureSchedule = playerTeeTime 
    ? calculateDepartureSchedule(playerTeeTime, targetPlayer?.warmupMinutes || 65, eta.driveTimeMinutes)
    : null;

  // Format date range
  let formattedDate = tournament.startDate;
  let relativeCountdown = '';
  try {
    const startDateObj = parseISO(tournament.startDate);
    formattedDate = format(startDateObj, 'EEE, MMM d, yyyy');
    if (tournament.startDate !== tournament.endDate) {
      const endDateObj = parseISO(tournament.endDate);
      formattedDate = `${format(startDateObj, 'MMM d')} - ${format(endDateObj, 'MMM d, yyyy')}`;
    }

    const daysAway = differenceInCalendarDays(startDateObj, new Date());
    if (daysAway === 0) relativeCountdown = 'Today!';
    else if (daysAway === 1) relativeCountdown = 'Tomorrow!';
    else if (daysAway === 2) relativeCountdown = `In 2 days (${format(startDateObj, 'EEE')})`;
    else if (daysAway > 2 && daysAway < 7) relativeCountdown = `This ${format(startDateObj, 'EEEE')}`;
    else if (daysAway >= 7 && daysAway < 30) relativeCountdown = `In ${daysAway} days`;
    else if (daysAway < 0) relativeCountdown = 'Past event';
  } catch {
    formattedDate = tournament.startDate;
  }

  const isUSKG = tournament.tour === 'USKG';
  const is2Day = tournament.duration === '2-Day';

  const handleExportSingle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const icsContent = generateICalendar([tournament], players);
    downloadFile(icsContent, `${tournament.name.replace(/[^a-z0-9]/gi, '_')}.ics`, 'text/calendar;charset=utf-8');
  };

  return (
    <div 
      onClick={() => onOpenDetails(tournament)}
      className={`bg-slate-900/90 border rounded-2xl p-4 sm:p-5 shadow-lg hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden ${
        activeStatus === 'registered'
          ? 'border-amber-500/50 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20'
          : isUSKG
          ? 'border-slate-800 hover:border-emerald-500/60'
          : 'border-slate-800 hover:border-blue-500/60'
      }`}
    >
      {/* Top Banner: Badges & Relative Countdown */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          
          {/* Tour Badge */}
          <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
            isUSKG
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
              : 'bg-blue-950/80 text-blue-300 border-blue-700/60'
          }`}>
            {isUSKG ? 'U.S. Kids Golf' : 'SCJGA'}
          </span>

          {/* Duration Badge */}
          <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-lg border ${
            is2Day
              ? 'bg-purple-950/80 text-purple-300 border-purple-700/50'
              : 'bg-teal-950/80 text-teal-300 border-teal-700/50'
          }`}>
            {tournament.duration === '2-Day' ? '🏆 2-Day Event' : '⚡ 1-Day Event'}
          </span>

          {tournament.isTourChampionship && (
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Tour Championship
            </span>
          )}
        </div>

        {/* Countdown */}
        {relativeCountdown && (
          <span className="text-[11px] font-extrabold text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded-full border border-slate-800 flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-400" />
            {relativeCountdown}
          </span>
        )}
      </div>

      {/* Main Info: Title & Course */}
      <div className="mb-3">
        <h3 className="text-base sm:text-lg font-black text-white group-hover:text-emerald-300 transition-colors leading-snug">
          {tournament.name}
        </h3>
        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
          <span className="font-semibold text-slate-200 flex items-center gap-1">
            ⛳ {tournament.course.name}
          </span>
          <span>•</span>
          <span>{tournament.course.city}, {tournament.course.state}</span>
          {tournament.course.par && (
            <>
              <span>•</span>
              <span className="text-slate-500">Par {tournament.course.par}</span>
            </>
          )}
        </div>
      </div>

      {/* Highlights Grid: Date, ETA / Drive Time, Entry Fee */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-4 text-xs">
        
        {/* Date */}
        <div className="flex items-center gap-2 text-slate-300">
          <CalendarIcon className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium truncate">{formattedDate}</span>
        </div>

        {/* ETA & Driving Distance */}
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <Navigation className="w-3.5 h-3.5" />
            <span>{eta.driveTimeFormatted}</span>
            <span className="text-[11px] text-slate-400 font-normal">({eta.distanceMiles} mi)</span>
          </div>

          {/* Quick directions links */}
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <a
              href={eta.googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded transition-colors"
              title="Open directions in Google Maps"
            >
              Google
            </a>
            <a
              href={eta.appleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded transition-colors"
              title="Open directions in Apple Maps"
            >
              Apple
            </a>
          </div>
        </div>

        {/* Fee & Format */}
        <div className="flex items-center justify-between sm:justify-end gap-2 text-slate-400">
          {tournament.entryFee && (
            <span className="font-bold text-slate-200">
              ${tournament.entryFee}
            </span>
          )}
          {tournament.season && (
            <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-800">
              {tournament.season}
            </span>
          )}
        </div>

      </div>

      {/* Day-of Departure & Tee Time Spotlight Callout */}
      {departureSchedule && (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(tournament);
          }}
          className="mb-3 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-2 text-xs hover:bg-emerald-950/60 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-emerald-300 flex items-center gap-1">
              🏌️ Tee Off: <span className="text-white">{departureSchedule.teeTimeFormatted}</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 text-[11px]">
              Arrive by {departureSchedule.targetArrivalTimeFormatted} ({departureSchedule.warmupFormatted} warm-up)
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold bg-emerald-900/90 text-emerald-200 px-2.5 py-1 rounded-lg border border-emerald-400/40 shadow-sm ml-auto">
            <Car className="w-3.5 h-3.5" />
            <span>Depart:</span>
            <span className="text-white font-black">{departureSchedule.departureTimeFormatted}</span>
          </div>
        </div>
      )}

      {/* Player Status & Registration Actions */}
      <div 
        className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Player Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {players.map((p) => {
            const status = tournament.playerRegistrations[p.id] || 'not_registered';
            const isReg = status === 'registered';
            const isCont = status === 'contingent';
            const isCons = status === 'considering';

            return (
              <div 
                key={p.id}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold border ${
                  isReg
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 shadow-sm'
                    : isCont
                    ? 'bg-orange-950/80 text-orange-300 border-orange-500/60 shadow-sm'
                    : isCons
                    ? 'bg-amber-950/80 text-amber-300 border-amber-500/60'
                    : 'bg-slate-950/50 text-slate-400 border-slate-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                <span>{p.name.split(' ')[0]}:</span>
                <span className="font-bold">
                  {isReg ? '⭐ Signed Up' : isCont ? '🔶 Contingent' : isCons ? '💡 Considering' : 'Available'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Quick Registration Status Toggle Buttons */}
        <div className="flex items-center gap-1.5 ml-auto">
          
          {/* Signed Up Toggle */}
          <button
            onClick={() => {
              const newStatus: RegistrationStatus = activeStatus === 'registered' ? 'not_registered' : 'registered';
              onSetRegistration(tournament.id, targetPlayer.id, newStatus);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
              activeStatus === 'registered'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-slate-800 hover:bg-emerald-600/80 text-slate-200 hover:text-white border border-slate-700'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{activeStatus === 'registered' ? 'Signed Up' : 'Signed Up'}</span>
          </button>

          {/* Contingent Toggle */}
          <button
            onClick={() => {
              const newStatus: RegistrationStatus = activeStatus === 'contingent' ? 'not_registered' : 'contingent';
              onSetRegistration(tournament.id, targetPlayer.id, newStatus);
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 ${
              activeStatus === 'contingent'
                ? 'bg-orange-600 text-white border-orange-500 shadow-md'
                : 'bg-slate-800 hover:bg-orange-600/80 text-orange-300 hover:text-white border-slate-700'
            }`}
            title="Mark as Contingent"
          >
            <span>🔶</span>
            <span className="hidden sm:inline">Contingent</span>
          </button>

          {/* Considering Toggle */}
          <button
            onClick={() => {
              const newStatus: RegistrationStatus = activeStatus === 'considering' ? 'not_registered' : 'considering';
              onSetRegistration(tournament.id, targetPlayer.id, newStatus);
            }}
            className={`p-1.5 rounded-xl text-xs border transition-all ${
              activeStatus === 'considering'
                ? 'bg-amber-600 text-white border-amber-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Mark as Considering"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Add to Calendar */}
          <button
            onClick={handleExportSingle}
            className="p-1.5 rounded-xl text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
            title="Add to Calendar (.ics)"
          >
            <CalendarPlus className="w-4 h-4" />
          </button>

        </div>
      </div>

    </div>
  );
};
