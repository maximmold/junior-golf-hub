import React, { useState } from 'react';
import { Tournament, Player, UserLocation } from '../../types/tournament';
import { calculateDistanceAndETA } from '../../services/distanceService';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, Sparkles, MapPin, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarViewProps {
  tournaments: Tournament[];
  players: Player[];
  selectedPlayerId: string;
  userLocation: UserLocation;
  onSelectTournament: (t: Tournament) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tournaments,
  players,
  selectedPlayerId,
  userLocation,
  onSelectTournament,
}) => {
  // Default calendar month: start at August 2026 or current month
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 7, 1)); // August 2026

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  // Helper to find tournaments on a given day
  const getTournamentsForDay = (day: Date): Tournament[] => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return tournaments.filter((t) => {
      if (t.startDate === dayStr) return true;
      if (t.endDate >= dayStr && t.startDate <= dayStr) return true;
      return false;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Calendar Header & Month Navigation */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/40">
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <p className="text-xs text-slate-400">
                Explore junior tournaments month by month
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
            >
              Today
            </button>
            <div className="flex items-center bg-slate-800/80 rounded-xl border border-slate-700 p-0.5">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Days of the Week Header */}
        <div className="grid grid-cols-7 border-b border-slate-800 text-center bg-slate-950/60 text-slate-400 text-[11px] font-bold uppercase tracking-wider py-2.5">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Month Day Grid */}
        <div className="grid grid-cols-7 auto-rows-fr bg-slate-950/20 divide-x divide-y divide-slate-800/60">
          {days.map((day, idx) => {
            const dayTournaments = getTournamentsForDay(day);
            const inMonth = isSameMonth(day, currentMonth);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={idx}
                className={`min-h-[110px] sm:min-h-[135px] p-1.5 sm:p-2 flex flex-col justify-between transition-colors ${
                  inMonth ? 'bg-slate-900/40 hover:bg-slate-900/80' : 'bg-slate-950/70 text-slate-600'
                } ${isCurrentDay ? 'ring-2 ring-emerald-500 ring-inset' : ''}`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                      isCurrentDay
                        ? 'bg-emerald-500 text-white shadow-md'
                        : inMonth
                        ? 'text-slate-300'
                        : 'text-slate-600'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayTournaments.length > 0 && (
                    <span className="text-[10px] text-emerald-400 font-extrabold px-1 bg-emerald-950/40 rounded border border-emerald-900/40">
                      {dayTournaments.length} {dayTournaments.length === 1 ? 'event' : 'events'}
                    </span>
                  )}
                </div>

                {/* Tournament Badges on this day */}
                <div className="space-y-1 overflow-y-auto max-h-[85px] sm:max-h-[95px] pr-0.5 custom-scrollbar">
                  {dayTournaments.map((t) => {
                    const isUSKG = t.tour === 'USKG';
                    const isSignedUp =
                      selectedPlayerId === 'ALL'
                        ? Object.values(t.playerRegistrations).some((s) => s === 'registered')
                        : t.playerRegistrations[selectedPlayerId] === 'registered';

                    const isContingent =
                      selectedPlayerId === 'ALL'
                        ? Object.values(t.playerRegistrations).some((s) => s === 'contingent')
                        : t.playerRegistrations[selectedPlayerId] === 'contingent';

                    const isConsidering =
                      selectedPlayerId === 'ALL'
                        ? Object.values(t.playerRegistrations).some((s) => s === 'considering')
                        : t.playerRegistrations[selectedPlayerId] === 'considering';

                    const isMultiDay = t.duration === '2-Day';

                    return (
                      <button
                        key={t.id}
                        onClick={() => onSelectTournament(t)}
                        className={`w-full text-left p-1 sm:p-1.5 rounded-lg text-[10px] sm:text-[11px] font-semibold transition-all border block truncate shadow-sm group ${
                          isSignedUp
                            ? 'bg-amber-950/50 text-amber-300 border-amber-500/60 hover:border-amber-400'
                            : isContingent
                            ? 'bg-orange-950/60 text-orange-300 border-orange-500/70 hover:border-orange-400'
                            : isUSKG
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50 hover:border-emerald-500'
                            : 'bg-blue-950/60 text-blue-300 border-blue-700/50 hover:border-blue-500'
                        }`}
                        title={`${t.name} at ${t.course.name}`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate flex items-center gap-1">
                            {isSignedUp && <span>⭐</span>}
                            {isContingent && <span>🔶</span>}
                            {isConsidering && <span>❔</span>}
                            {t.course.name.replace(' Golf Club', '').replace(' Country Club', ' CC')}
                          </span>
                          {isMultiDay && (
                            <span className="text-[9px] uppercase px-1 rounded bg-purple-900/60 text-purple-200 shrink-0 font-bold">
                              2D
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
