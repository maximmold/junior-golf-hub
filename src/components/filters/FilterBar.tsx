import React from 'react';
import { FilterState, FilterRegistrationStatus } from '../../types/tournament';
import { Search, RotateCcw, Calendar, Clock, Check, Sparkles, Filter } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalMatches: number;
  totalTotal: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  totalMatches,
  totalTotal,
}) => {
  const selectedStatuses = filters.selectedStatuses || [];

  const isFiltered =
    filters.tour !== 'ALL' ||
    filters.duration !== 'ALL' ||
    selectedStatuses.length > 0 ||
    filters.searchQuery !== '' ||
    filters.maxDriveMinutes !== undefined ||
    (filters.datePreset !== undefined && filters.datePreset !== 'ALL') ||
    filters.startDate !== undefined ||
    filters.endDate !== undefined ||
    filters.selectedMonth !== undefined ||
    !filters.onlyUpcoming;

  const handleReset = () => {
    setFilters({
      tour: 'ALL',
      duration: 'ALL',
      selectedStatuses: [],
      selectedPlayerId: 'ALL',
      onlyUpcoming: true,
      maxDriveMinutes: undefined,
      searchQuery: '',
      datePreset: 'ALL',
      startDate: undefined,
      endDate: undefined,
      selectedMonth: undefined,
    });
  };

  const toggleStatus = (status: FilterRegistrationStatus) => {
    setFilters((prev) => {
      const current = prev.selectedStatuses || [];
      if (current.includes(status)) {
        return { ...prev, selectedStatuses: current.filter((s) => s !== status) };
      } else {
        return { ...prev, selectedStatuses: [...current, status] };
      }
    });
  };

  const clearStatus = () => {
    setFilters((prev) => ({ ...prev, selectedStatuses: [] }));
  };

  const isRegisteredActive = selectedStatuses.includes('registered');
  const isContingentActive = selectedStatuses.includes('contingent');
  const isConsideringActive = selectedStatuses.includes('considering');
  const isOpenActive = selectedStatuses.includes('not_registered');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
      <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl space-y-3">
        
        {/* Top Row: Search Input + Upcoming checkbox + Max Distance select */}
        <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search course (e.g. LinRick, Fripp, Crowfield), city, or tour..."
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-8 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Toggles: Upcoming & Drive Time */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <label className="flex-1 sm:flex-none flex items-center justify-center gap-2 cursor-pointer bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800 text-xs text-slate-300 hover:text-white select-none transition-colors">
              <input
                type="checkbox"
                checked={filters.onlyUpcoming}
                onChange={(e) => setFilters((prev) => ({ ...prev, onlyUpcoming: e.target.checked }))}
                className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900 w-3.5 h-3.5 cursor-pointer accent-emerald-500"
              />
              <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-medium whitespace-nowrap">Upcoming Only</span>
            </label>

            <div className="relative flex-1 sm:flex-none">
              <select
                value={filters.maxDriveMinutes || ''}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    maxDriveMinutes: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                className="w-full sm:w-auto bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none pr-7"
              >
                <option value="">🚗 Any Distance</option>
                <option value="30">🚗 Under 30 mins</option>
                <option value="45">🚗 Under 45 mins</option>
                <option value="60">🚗 Under 1 hour</option>
                <option value="90">🚗 Under 1.5 hours</option>
                <option value="150">🚗 Under 2.5 hours</option>
              </select>
              <Clock className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

        </div>

        {/* Filter Pills Cluster: Responsive Wrapping Layout */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60">
          
          {/* 1. Tour Filter Group */}
          <div className="flex flex-wrap items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5">Tour:</span>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, tour: 'ALL' }))}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                filters.tour === 'ALL'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, tour: 'USKG' }))}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                filters.tour === 'USKG'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-400 hover:bg-emerald-950/40'
              }`}
            >
              U.S. Kids
            </button>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, tour: 'SCJGA' }))}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                filters.tour === 'SCJGA'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-400 hover:bg-blue-950/40'
              }`}
            >
              SCJGA
            </button>
          </div>

          {/* 2. Duration Filter */}
          <div className="flex flex-wrap items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5">Format:</span>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, duration: 'ALL' }))}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                filters.duration === 'ALL'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, duration: '1-Day' }))}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                filters.duration === '1-Day'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-teal-400 hover:bg-teal-950/40'
              }`}
            >
              1-Day
            </button>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, duration: '2-Day' }))}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                filters.duration === '2-Day'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-purple-400 hover:bg-purple-950/40'
              }`}
            >
              2-Day
            </button>
          </div>

          {/* 3. Registration Status Filter (Multi-Select Supported) */}
          <div className="flex flex-wrap items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 gap-1">
            <div className="flex items-center gap-1 px-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400">Status:</span>
              {selectedStatuses.length > 0 && (
                <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                  {selectedStatuses.length}
                </span>
              )}
            </div>
            
            <button
              onClick={clearStatus}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedStatuses.length === 0
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>

            {/* ⭐ Signed Up */}
            <button
              onClick={() => toggleStatus('registered')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                isRegisteredActive
                  ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-400'
                  : 'text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300'
              }`}
              title="Click to toggle Signed Up tournaments"
            >
              <span>⭐ Signed Up</span>
              {isRegisteredActive && <Check className="w-3 h-3 text-white" />}
            </button>

            {/* 🔶 Contingent */}
            <button
              onClick={() => toggleStatus('contingent')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                isContingentActive
                  ? 'bg-orange-600 text-white shadow-md ring-1 ring-orange-400'
                  : 'text-orange-400 hover:bg-orange-950/40 hover:text-orange-300'
              }`}
              title="Click to toggle Contingent tournaments"
            >
              <span>🔶 Contingent</span>
              {isContingentActive && <Check className="w-3 h-3 text-white" />}
            </button>

            {/* 💡 Considering */}
            <button
              onClick={() => toggleStatus('considering')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                isConsideringActive
                  ? 'bg-amber-600 text-white shadow-md ring-1 ring-amber-400'
                  : 'text-amber-400 hover:bg-amber-950/40 hover:text-amber-300'
              }`}
              title="Click to toggle Considering tournaments"
            >
              <span>💡 Considering</span>
              {isConsideringActive && <Check className="w-3 h-3 text-white" />}
            </button>

            {/* ⛳ Open / Available */}
            <button
              onClick={() => toggleStatus('not_registered')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                isOpenActive
                  ? 'bg-slate-700 text-slate-100 shadow-md ring-1 ring-slate-400'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
              title="Click to toggle Available tournaments"
            >
              <span>⛳ Open</span>
              {isOpenActive && <Check className="w-3 h-3 text-slate-300" />}
            </button>
          </div>

          {/* 4. Date Range Presets */}
          <div className="flex flex-wrap items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-400" />
              <span>Date:</span>
            </span>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, datePreset: 'ALL', selectedMonth: undefined, startDate: undefined, endDate: undefined }))}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                (!filters.datePreset || filters.datePreset === 'ALL') && !filters.selectedMonth && !filters.startDate
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, datePreset: '7D', selectedMonth: undefined, startDate: undefined, endDate: undefined }))}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                filters.datePreset === '7D'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-emerald-950/40'
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, datePreset: '14D', selectedMonth: undefined, startDate: undefined, endDate: undefined }))}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                filters.datePreset === '14D'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-emerald-950/40'
              }`}
            >
              14D
            </button>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, datePreset: '30D', selectedMonth: undefined, startDate: undefined, endDate: undefined }))}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                filters.datePreset === '30D'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-emerald-950/40'
              }`}
            >
              30D
            </button>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, selectedMonth: '2026-08', datePreset: undefined, startDate: undefined, endDate: undefined }))}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                filters.selectedMonth === '2026-08'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-teal-950/40'
              }`}
            >
              Aug
            </button>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, selectedMonth: '2026-09', datePreset: undefined, startDate: undefined, endDate: undefined }))}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                filters.selectedMonth === '2026-09'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-teal-950/40'
              }`}
            >
              Sep
            </button>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, selectedMonth: '2026-10', datePreset: undefined, startDate: undefined, endDate: undefined }))}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                filters.selectedMonth === '2026-10'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-teal-950/40'
              }`}
            >
              Oct
            </button>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, selectedMonth: '2026-11', datePreset: undefined, startDate: undefined, endDate: undefined }))}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                filters.selectedMonth === '2026-11'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-teal-950/40'
              }`}
            >
              Nov
            </button>
          </div>

          {/* Matches Count & Reset Filter */}
          <div className="flex items-center gap-3 text-xs ml-auto py-1">
            <span className="text-slate-400 font-medium whitespace-nowrap">
              Showing <span className="text-white font-bold">{totalMatches}</span> of {totalTotal}
            </span>
            {isFiltered && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold transition-all"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3 text-emerald-400" />
                <span>Reset</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
