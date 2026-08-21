import React, { useState } from 'react';
import { Tournament, TourType, EventDuration, Player, Course } from '../../types/tournament';
import { COURSES } from '../../data/courses';
import { findMatchingCourse } from '../../services/ingestService';
import { Plus, X, Calendar as CalendarIcon, Check } from 'lucide-react';

interface AddTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  onAddTournament: (tournament: Tournament) => void;
}

export const AddTournamentModal: React.FC<AddTournamentModalProps> = ({
  isOpen,
  onClose,
  players,
  onAddTournament,
}) => {
  const [name, setName] = useState('');
  const [tour, setTour] = useState<TourType>('USKG');
  const [tourSeries, setTourSeries] = useState('Charleston Local Tour');
  const [courseKey, setCourseKey] = useState(Object.keys(COURSES)[0]);
  const [customCourseName, setCustomCourseName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState<EventDuration>('1-Day');
  const [entryFee, setEntryFee] = useState<string>('65');
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [yardageOrFormat, setYardageOrFormat] = useState('Stroke Play');
  const [notes, setNotes] = useState('');
  const [registeredPlayerIds, setRegisteredPlayerIds] = useState<string[]>([players[0]?.id || 'p1']);

  if (!isOpen) return null;

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    if (duration === '1-Day') {
      setEndDate(val);
    }
  };

  const handleDurationChange = (d: EventDuration) => {
    setDuration(d);
    if (d === '2-Day' && startDate === endDate) {
      const nextDay = new Date(startDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setEndDate(nextDay.toISOString().split('T')[0]);
    } else if (d === '1-Day') {
      setEndDate(startDate);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let course: Course;
    if (courseKey === 'custom') {
      course = findMatchingCourse(customCourseName || name);
    } else {
      course = COURSES[courseKey];
    }

    const playerRegistrations: Record<string, 'registered' | 'not_registered'> = {};
    players.forEach((p) => {
      playerRegistrations[p.id] = registeredPlayerIds.includes(p.id) ? 'registered' : 'not_registered';
    });

    const newTournament: Tournament = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      tour,
      tourSeries,
      courseId: course.id,
      course,
      startDate,
      endDate: duration === '1-Day' ? startDate : endDate,
      duration,
      entryFee: entryFee ? parseFloat(entryFee) : undefined,
      registrationUrl: registrationUrl.trim() || undefined,
      yardageOrFormat: yardageOrFormat.trim() || undefined,
      notes: notes.trim() || undefined,
      playerRegistrations,
    };

    onAddTournament(newTournament);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Add Custom Tournament</h3>
              <p className="text-xs text-slate-400">Add an upcoming qualifier, practice tournament or event</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="py-4 space-y-3.5 text-xs">
          
          {/* Tournament Name */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">Tournament Name</label>
            <input
              type="text"
              required
              placeholder="e.g. U.S. Kids Golf Charleston Invitational"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Tour & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Tour Organization</label>
              <select
                value={tour}
                onChange={(e) => {
                  const t = e.target.value as TourType;
                  setTour(t);
                  if (t === 'USKG') setTourSeries('Charleston Local Tour');
                  else if (t === 'SCJGA') setTourSeries(duration === '2-Day' ? 'Players Series' : 'One-Day Series');
                }}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="USKG">U.S. Kids Golf</option>
                <option value="SCJGA">SCJGA</option>
                <option value="OTHER">Other / Invitational</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Duration</label>
              <select
                value={duration}
                onChange={(e) => handleDurationChange(e.target.value as EventDuration)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="1-Day">1-Day Event (18/9 Holes)</option>
                <option value="2-Day">2-Day Major (36 Holes)</option>
              </select>
            </div>
          </div>

          {/* Course Selector */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">Course Venue</label>
            <select
              value={courseKey}
              onChange={(e) => setCourseKey(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {Object.values(COURSES).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.city}, SC)
                </option>
              ))}
              <option value="custom">Other / Custom Course...</option>
            </select>
            {courseKey === 'custom' && (
              <input
                type="text"
                placeholder="Enter custom course name & city"
                value={customCourseName}
                onChange={(e) => setCustomCourseName(e.target.value)}
                className="mt-2 w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            )}
          </div>

          {/* Start Date & End Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">End Date</label>
              <input
                type="date"
                required
                disabled={duration === '1-Day'}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white disabled:opacity-50 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Fee & Registration URL */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Entry Fee ($)</label>
              <input
                type="number"
                placeholder="e.g. 65"
                value={entryFee}
                onChange={(e) => setEntryFee(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Registration Link</label>
              <input
                type="url"
                placeholder="https://..."
                value={registrationUrl}
                onChange={(e) => setRegistrationUrl(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Player Sign Up Checkboxes */}
          <div>
            <label className="block font-bold text-slate-300 mb-1.5">Mark Golfers as Signed Up</label>
            <div className="flex flex-wrap gap-2">
              {players.map((p) => {
                const isSelected = registeredPlayerIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setRegisteredPlayerIds(registeredPlayerIds.filter((id) => id !== p.id));
                      } else {
                        setRegisteredPlayerIds([...registeredPlayerIds, p.id]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl border font-semibold flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60'
                        : 'bg-slate-950/50 text-slate-400 border-slate-800'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span>{p.name}</span>
                    {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">Notes & Yardages</label>
            <textarea
              rows={2}
              placeholder="e.g. Tee times starting at 8:00 AM. Range balls provided."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-950/50 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add to Schedule
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
