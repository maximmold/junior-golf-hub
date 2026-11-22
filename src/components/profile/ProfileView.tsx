import React from 'react';
import { 
  User, 
  Trophy, 
  TrendingUp, 
  Calendar, 
  Award,
  Star,
  Target,
  CalendarDays
} from 'lucide-react';
import {
  PROFILE_HEADER,
  HONORS,
  TOP_FINISHES,
  SCJGA_2026_RESULTS,
  WANDO_HS_2026_RESULTS,
  STATS,
  SOURCES_NOTE
} from '../../data/playerProfile';
import { HeroCarousel } from './HeroCarousel';

interface ProfileViewProps {
  onNavigateToSchedule?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigateToSchedule }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6 overflow-x-hidden">
      
      {/* Navigate to Schedule Button */}
      {onNavigateToSchedule && (
        <div className="flex justify-center sm:justify-end">
          <button
            onClick={onNavigateToSchedule}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg transition-all"
          >
            <CalendarDays className="w-4 h-4" />
            <span>View Tournament Schedule</span>
          </button>
        </div>
      )}

      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Header Card */}
      <div className="bg-gradient-to-br from-emerald-950 to-slate-950 border border-emerald-800/50 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <User className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
              {PROFILE_HEADER.name}
            </h1>
            <div className="space-y-1 text-sm sm:text-base text-slate-300">
              <p className="flex items-center gap-2">
                <span className="text-emerald-400">📍</span>
                <span>{PROFILE_HEADER.location}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-blue-400">🏫</span>
                <span>{PROFILE_HEADER.school} freshman, {PROFILE_HEADER.classYear}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-amber-400">⛳</span>
                <span>
                  Handicap Index <strong className="text-white">{PROFILE_HEADER.handicapIndex}</strong>
                  {' '}({PROFILE_HEADER.handicapAsOf})
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <div className="text-3xl font-black text-emerald-400 mb-1">{STATS.bestRounds[0]}</div>
          <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Best Round</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <div className="text-3xl font-black text-blue-400 mb-1">{STATS.scoringAverage}</div>
          <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Scoring Avg</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <div className="text-3xl font-black text-purple-400 mb-1">{STATS.hcfRanking}</div>
          <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">HCF Ranking</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <div className="text-3xl font-black text-amber-400 mb-1">{STATS.eventsPlayed}</div>
          <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Events (2026)</div>
        </div>
      </div>

      {/* Honors & Achievements */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Trophy className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Honors & Achievements
          </h2>
        </div>
        <div className="space-y-3">
          {HONORS.map((honor) => (
            <div
              key={honor.id}
              className="bg-slate-950/60 border border-slate-800 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <Star className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-white text-sm sm:text-base">
                    {honor.title}
                  </div>
                  {honor.details && (
                    <div className="text-xs sm:text-sm text-slate-400 mt-1">
                      {honor.details}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Finishes */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Award className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Top Finishes
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TOP_FINISHES.map((finish) => (
            <div
              key={finish.id}
              className="bg-slate-950/60 border border-slate-800 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-lg bg-emerald-600 text-white text-xs font-bold">
                  {finish.placement}
                </span>
                <span className="text-xs text-slate-500">{finish.date}</span>
              </div>
              <div className="font-bold text-white text-sm mb-1">{finish.event}</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-emerald-400">{finish.score}</span>
                {finish.note && (
                  <span className="text-xs text-amber-400 font-semibold">({finish.note})</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2026 SCJGA Results */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Target className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            2026 SCJGA Results
          </h2>
        </div>
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase text-slate-400 tracking-wider">
                    Event
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase text-slate-400 tracking-wider">
                    Date
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-bold uppercase text-slate-400 tracking-wider">
                    Finish
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-bold uppercase text-slate-400 tracking-wider">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {SCJGA_2026_RESULTS.map((result) => (
                  <tr key={result.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="px-3 py-3 text-sm text-white font-medium">
                      {result.event}
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-400 whitespace-nowrap">
                      {result.date}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex px-2 py-0.5 rounded-lg bg-blue-950/60 text-blue-300 text-xs font-bold border border-blue-800/40">
                        {result.finish}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center text-sm font-bold text-emerald-400">
                      {result.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Wando High School 2026 Results */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Calendar className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Wando High School 2026
          </h2>
        </div>
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase text-slate-400 tracking-wider">
                    Event
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-bold uppercase text-slate-400 tracking-wider">
                    Finish
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-bold uppercase text-slate-400 tracking-wider">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {WANDO_HS_2026_RESULTS.map((result) => (
                  <tr key={result.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="px-3 py-3 text-sm text-white font-medium">
                      {result.event}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex px-2 py-0.5 rounded-lg bg-purple-950/60 text-purple-300 text-xs font-bold border border-purple-800/40">
                        {result.finish}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center text-sm font-bold text-emerald-400">
                      {result.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Best Rounds Highlight */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-blue-900/40 border border-emerald-700/30 rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase font-bold text-emerald-400 tracking-wider mb-1">
              Best Rounds (2026)
            </div>
            <div className="flex items-center gap-2 text-2xl sm:text-3xl font-black text-white">
              {STATS.bestRounds.map((round, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-slate-600">•</span>}
                  <span className="text-emerald-400">{round}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase font-bold text-blue-400 tracking-wider mb-1">
              Season Stats
            </div>
            <div className="text-sm text-slate-300">
              {STATS.eventsPlayed} events • {STATS.scoringAverage} avg
            </div>
          </div>
        </div>
      </div>

      {/* Sources Footer */}
      <div className="text-center text-xs text-slate-500 pt-4">
        {SOURCES_NOTE}
      </div>

    </div>
  );
};
