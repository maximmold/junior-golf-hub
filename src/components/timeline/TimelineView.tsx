import React from 'react';
import { Tournament, Player, RegistrationStatus, UserLocation } from '../../types/tournament';
import { TournamentCard } from './TournamentCard';
import { format, parseISO } from 'date-fns';
import { Trophy, Frown, Sparkles, Filter } from 'lucide-react';

interface TimelineViewProps {
  tournaments: Tournament[];
  players: Player[];
  selectedPlayerId: string;
  userLocation: UserLocation;
  onSetRegistration: (tournamentId: string, playerId: string, status: RegistrationStatus) => void;
  onOpenDetails: (tournament: Tournament) => void;
  onResetFilters: () => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  tournaments,
  players,
  selectedPlayerId,
  userLocation,
  onSetRegistration,
  onOpenDetails,
  onResetFilters,
}) => {
  if (tournaments.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 max-w-lg mx-auto shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
            <Frown className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-extrabold text-white mb-2">No Tournaments Match Your Filters</h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Try adjusting your tour filters, duration (1-Day / 2-Day), drive time radius, or search query.
          </p>
          <button
            onClick={onResetFilters}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/60 transition-all"
          >
            Reset All Filters
          </button>
        </div>
      </div>
    );
  }

  // Group tournaments by Month Year (e.g. "August 2026", "September 2026")
  const groupedTournaments: { monthKey: string; monthLabel: string; items: Tournament[] }[] = [];

  tournaments.forEach((t) => {
    let monthKey = 'Other';
    let monthLabel = 'Upcoming';
    try {
      const dateObj = parseISO(t.startDate);
      monthKey = format(dateObj, 'yyyy-MM');
      monthLabel = format(dateObj, 'MMMM yyyy');
    } catch {
      monthKey = 'unknown';
      monthLabel = 'Upcoming Events';
    }

    let existingGroup = groupedTournaments.find((g) => g.monthKey === monthKey);
    if (!existingGroup) {
      existingGroup = { monthKey, monthLabel, items: [] };
      groupedTournaments.push(existingGroup);
    }
    existingGroup.items.push(t);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
      {groupedTournaments.map((group) => (
        <div key={group.monthKey} className="space-y-4">
          
          {/* Month Section Header */}
          <div className="flex items-center gap-3 sticky top-16 sm:top-20 z-10 bg-slate-950/90 backdrop-blur-sm py-2 px-1">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-400"></div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2 font-['Plus_Jakarta_Sans']">
              {group.monthLabel}
              <span className="text-xs font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                {group.items.length} {group.items.length === 1 ? 'event' : 'events'}
              </span>
            </h2>
            <div className="flex-1 h-px bg-slate-800/80 ml-2"></div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {group.items.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                players={players}
                selectedPlayerId={selectedPlayerId}
                userLocation={userLocation}
                onSetRegistration={onSetRegistration}
                onOpenDetails={onOpenDetails}
              />
            ))}
          </div>

        </div>
      ))}
    </div>
  );
};
