import React from 'react';
import { Tournament, DistanceInfo } from '../../types/tournament';
import { Trophy, CalendarCheck2, Clock, Car, ChevronRight } from 'lucide-react';
import { format, parseISO, differenceInCalendarDays } from 'date-fns';

interface StatsBarProps {
  totalUpcoming: number;
  registeredCount: number;
  contingentCount: number;
  consideringCount: number;
  totalRegisteredMiles: number;
  nextTournament?: Tournament;
  nextTournamentETA?: DistanceInfo;
  nextSignup?: Tournament;
  onSelectTournament: (t: Tournament) => void;
  onFilterSignedUpOnly: () => void;
  onFilterContingentOnly: () => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  totalUpcoming,
  registeredCount,
  contingentCount,
  consideringCount,
  totalRegisteredMiles,
  nextTournament,
  nextTournamentETA,
  nextSignup,
  onSelectTournament,
  onFilterSignedUpOnly,
  onFilterContingentOnly,
}) => {
  // Compute relative days for Next Up
  let relativeNextText = 'No upcoming event';
  if (nextTournament) {
    try {
      const targetDate = parseISO(nextTournament.startDate);
      const days = differenceInCalendarDays(targetDate, new Date());
      if (days === 0) relativeNextText = 'Today!';
      else if (days === 1) relativeNextText = 'Tomorrow!';
      else if (days < 7) relativeNextText = `In ${days} days`;
      else relativeNextText = format(targetDate, 'MMM d');
    } catch {
      relativeNextText = nextTournament.startDate;
    }
  }

  // Compute deadline info for Next Sign-up
  let nextSignupDaysLeft = 0;
  let nextSignupDeadlineText = '';
  if (nextSignup && nextSignup.registrationDeadline) {
    try {
      const deadlineDate = parseISO(nextSignup.registrationDeadline);
      nextSignupDaysLeft = differenceInCalendarDays(deadlineDate, new Date());
      if (nextSignupDaysLeft === 0) nextSignupDeadlineText = 'Today!';
      else if (nextSignupDaysLeft === 1) nextSignupDeadlineText = 'Tomorrow';
      else if (nextSignupDaysLeft < 7) nextSignupDeadlineText = `${nextSignupDaysLeft} days`;
      else nextSignupDeadlineText = format(deadlineDate, 'MMM d');
    } catch {
      nextSignupDeadlineText = nextSignup.registrationDeadline;
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      
      {/* 1. Total Upcoming Events */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 sm:p-4 flex items-center gap-3.5 hover:border-slate-700 transition-all">
        <div className="p-2.5 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
          <Trophy className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-black text-white">{totalUpcoming}</div>
          <div className="text-xs text-slate-400 font-medium">Upcoming Events</div>
        </div>
      </div>

      {/* 2. Signed Up / Registered Tournaments */}
      <button 
        onClick={onFilterSignedUpOnly}
        className="text-left bg-gradient-to-br from-slate-900 to-emerald-950/30 border border-emerald-800/40 hover:border-emerald-500/60 rounded-xl p-3 sm:p-4 flex items-center gap-3.5 transition-all group shadow-sm hover:shadow-emerald-950/40"
      >
        <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 group-hover:scale-105 transition-transform">
          <CalendarCheck2 className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 flex items-center gap-1.5">
            {registeredCount}
            <span className="text-xs font-normal text-slate-400 group-hover:text-emerald-300">⭐</span>
          </div>
          <div className="text-xs text-slate-300 font-semibold group-hover:text-white">
            Signed Up <span className="text-[10px] text-emerald-500 underline ml-1">Filter</span>
          </div>
        </div>
      </button>

      {/* 3. Contingent Tournaments */}
      <button 
        onClick={onFilterContingentOnly}
        className="text-left bg-gradient-to-br from-slate-900 to-orange-950/30 border border-orange-800/40 hover:border-orange-500/60 rounded-xl p-3 sm:p-4 flex items-center gap-3.5 transition-all group shadow-sm hover:shadow-orange-950/40"
      >
        <div className="p-2.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/40 group-hover:scale-105 transition-transform">
          <span className="text-base font-black">🔶</span>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-black text-orange-400 flex items-center gap-1.5">
            {contingentCount}
          </div>
          <div className="text-xs text-slate-300 font-semibold group-hover:text-white">
            Contingent <span className="text-[10px] text-orange-400 underline ml-1">Filter</span>
          </div>
        </div>
      </button>

      {/* 4. Considering / Shortlist */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 sm:p-4 flex items-center gap-3.5">
        <div className="p-2.5 rounded-lg bg-amber-950/60 text-amber-400 border border-amber-800/40">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-black text-amber-400">{consideringCount}</div>
          <div className="text-xs text-slate-400 font-medium">Considering</div>
        </div>
      </div>

      {/* 5. Total Travel Mileage (Roundtrip) */}
      <div className="hidden md:flex bg-slate-900/70 border border-slate-800 rounded-xl p-3 sm:p-4 items-center gap-3.5">
        <div className="p-2.5 rounded-lg bg-blue-950/60 text-blue-400 border border-blue-800/40">
          <Car className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-black text-white">{totalRegisteredMiles} <span className="text-xs font-semibold text-slate-400">mi</span></div>
          <div className="text-xs text-slate-400 font-medium">Registered Travel</div>
        </div>
      </div>

      {/* 6. Next Event Spotlight Card */}
      {nextTournament && (
        <div 
          onClick={() => onSelectTournament(nextTournament)}
          className="col-span-2 md:col-span-4 lg:col-span-1 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 hover:border-emerald-600/50 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Next Up: {relativeNextText}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
          </div>

          <div className="mt-1">
            <div className="text-xs font-bold text-white truncate group-hover:text-emerald-300">
              {nextTournament.name}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
              <span>{nextTournament.tour === 'USKG' ? 'US Kids' : 'SCJGA'}</span>
              <span>•</span>
              {nextTournamentETA && (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  🚗 {nextTournamentETA.driveTimeFormatted}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. Next Sign-up Deadline Card */}
      {nextSignup && nextSignup.registrationDeadline && (
        <div 
          onClick={() => onSelectTournament(nextSignup)}
          className="col-span-2 md:col-span-4 lg:col-span-1 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 hover:border-amber-600/50 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Next Sign-up: {nextSignupDeadlineText}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
          </div>

          <div className="mt-1">
            <div className="text-xs font-bold text-white truncate group-hover:text-amber-300">
              {nextSignup.name}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
              <span>Deadline {format(parseISO(nextSignup.registrationDeadline), 'MMM d')}</span>
              {nextSignupDaysLeft >= 0 && nextSignupDaysLeft <= 7 && (
                <>
                  <span>•</span>
                  <span className={`font-medium ${nextSignupDaysLeft <= 2 ? 'text-red-400' : 'text-amber-400'}`}>
                    {nextSignupDaysLeft === 0 ? 'Today!' : `${nextSignupDaysLeft}d left`}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
