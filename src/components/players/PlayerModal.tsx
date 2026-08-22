import React, { useState } from 'react';
import { Player } from '../../types/tournament';
import { Users, Plus, Trash2, Edit3, Check, X, Shield, Sparkles } from 'lucide-react';

interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  onAddPlayer: (player: Omit<Player, 'id'>) => void;
  onUpdatePlayer: (id: string, player: Partial<Player>) => void;
  onDeletePlayer: (id: string) => void;
}

const PRESET_COLORS = [
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#6366f1', // Indigo
];

const US_KIDS_DIVISIONS = [
  'Boys 6 & Under',
  'Boys 7',
  'Boys 8',
  'Boys 9',
  'Boys 10',
  'Boys 11',
  'Boys 12',
  'Boys 13-14',
  'Girls 7 & Under',
  'Girls 8',
  'Girls 9',
  'Girls 10',
  'Girls 11-12',
  'Girls 13-14',
  'Girls 15-18',
];

const SCJGA_DIVISIONS = [
  'Boys 7-9 (9 Holes)',
  'Boys 10-12 (9/18 Holes)',
  'Boys 13-14 (18 Holes)',
  'Boys 15-18 (18 Holes)',
  'Girls 7-9 (9 Holes)',
  'Girls 10-12 (9 Holes)',
  'Girls 13-18 (18 Holes)',
];

export const PlayerModal: React.FC<PlayerModalProps> = ({
  isOpen,
  onClose,
  players,
  onAddPlayer,
  onUpdatePlayer,
  onDeletePlayer,
}) => {
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [uskidsDivision, setUskidsDivision] = useState(US_KIDS_DIVISIONS[3]); // Boys 9
  const [scjgaDivision, setScjgaDivision] = useState(SCJGA_DIVISIONS[1]); // Boys 10-12
  const [yardage, setYardage] = useState('1,850 yds (9-holes)');
  const [warmupMinutes, setWarmupMinutes] = useState<number>(65); // Default 1h 5m
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [avatarEmoji, setAvatarEmoji] = useState('🏌️‍♂️');

  if (!isOpen) return null;

  const handleStartEdit = (player: Player) => {
    setEditingPlayerId(player.id);
    setName(player.name);
    setUskidsDivision(player.uskidsDivision);
    setScjgaDivision(player.scjgaDivision);
    setYardage(player.yardage || '');
    setWarmupMinutes(player.warmupMinutes !== undefined ? player.warmupMinutes : 65);
    setColor(player.color);
    setAvatarEmoji(player.avatarEmoji || '🏌️‍♂️');
    setIsCreating(false);
  };

  const handleStartCreate = () => {
    setIsCreating(true);
    setEditingPlayerId(null);
    setName('');
    setUskidsDivision(US_KIDS_DIVISIONS[3]);
    setScjgaDivision(SCJGA_DIVISIONS[1]);
    setYardage('1,850 yds (9-holes)');
    setWarmupMinutes(65);
    setColor(PRESET_COLORS[players.length % PRESET_COLORS.length]);
    setAvatarEmoji('🏌️‍♂️');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isCreating) {
      onAddPlayer({
        name: name.trim(),
        uskidsDivision,
        scjgaDivision,
        yardage,
        warmupMinutes: Number(warmupMinutes) || 65,
        color,
        avatarEmoji,
        isDefault: players.length === 0,
      });
      setIsCreating(false);
    } else if (editingPlayerId) {
      onUpdatePlayer(editingPlayerId, {
        name: name.trim(),
        uskidsDivision,
        scjgaDivision,
        yardage,
        warmupMinutes: Number(warmupMinutes) || 65,
        color,
        avatarEmoji,
      });
      setEditingPlayerId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Player Profiles</h3>
              <p className="text-xs text-slate-400">Configure junior golfers, age divisions & yardages</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Players List */}
        {!isCreating && !editingPlayerId && (
          <div className="py-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Configured Golfers</span>
              <button
                onClick={handleStartCreate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Golfer
              </button>
            </div>

            {players.map((p) => (
              <div
                key={p.id}
                className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-md font-bold"
                    style={{ backgroundColor: `${p.color}25`, borderColor: p.color, borderWidth: 1 }}
                  >
                    {p.avatarEmoji || '🏌️'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">{p.name}</span>
                      {p.isDefault && (
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-semibold">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="text-emerald-400">USK: {p.uskidsDivision}</span>
                      <span>•</span>
                      <span className="text-blue-400">SCJGA: {p.scjgaDivision}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400">
                      {p.yardage && <span>📏 {p.yardage}</span>}
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold">
                        ⏱️ {p.warmupMinutes !== undefined ? (p.warmupMinutes < 60 ? `${p.warmupMinutes}m` : `${Math.floor(p.warmupMinutes / 60)}h ${p.warmupMinutes % 60}m`) : '1h 5m'} warm-up
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(p)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Edit Player"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {players.length > 1 && (
                    <button
                      onClick={() => onDeletePlayer(p.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete Player"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add / Edit Form */}
        {(isCreating || editingPlayerId) && (
          <form onSubmit={handleSave} className="py-4 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
              {isCreating ? '➕ Add New Player' : '✏️ Edit Player Profile'}
            </div>

            {/* Name & Emoji */}
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-3">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Golfer Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Leo Moldenhauer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Avatar</label>
                <input
                  type="text"
                  value={avatarEmoji}
                  onChange={(e) => setAvatarEmoji(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white text-center focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* US Kids Division */}
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1">
                U.S. Kids Golf Age Division
              </label>
              <select
                value={uskidsDivision}
                onChange={(e) => setUskidsDivision(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {US_KIDS_DIVISIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* SCJGA Division */}
            <div>
              <label className="block text-xs font-semibold text-blue-400 mb-1">
                SCJGA Tournament Division
              </label>
              <select
                value={scjgaDivision}
                onChange={(e) => setScjgaDivision(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {SCJGA_DIVISIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Target Yardage / Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Approximate Playing Yardage
              </label>
              <input
                type="text"
                placeholder="e.g. 1,850 yds (9-holes) or 5,400 yds (18-holes)"
                value={yardage}
                onChange={(e) => setYardage(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Warm-Up / Arrival Buffer Setting */}
            <div className="bg-slate-950/60 border border-slate-800/90 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-emerald-400">
                    ⏱️ Pre-Round Arrival & Warm-Up Buffer
                  </label>
                  <p className="text-[11px] text-slate-400">
                    How long before tee time to arrive at the course (range, putting, check-in)
                  </p>
                </div>
                <span className="text-xs font-black text-emerald-300 px-2 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-500/30 whitespace-nowrap">
                  {warmupMinutes < 60 ? `${warmupMinutes}m` : `${Math.floor(warmupMinutes / 60)}h ${warmupMinutes % 60}m`}
                </span>
              </div>

              {/* Quick Warm-Up Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {[
                  { label: '30m', mins: 30 },
                  { label: '45m', mins: 45 },
                  { label: '1 hour', mins: 60 },
                  { label: '1h 5m ⭐', mins: 65 },
                  { label: '1h 15m', mins: 75 },
                  { label: '1.5 hrs', mins: 90 },
                ].map((preset) => (
                  <button
                    key={preset.mins}
                    type="button"
                    onClick={() => setWarmupMinutes(preset.mins)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      warmupMinutes === preset.mins
                        ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-400">Custom minutes:</span>
                <input
                  type="number"
                  min={10}
                  max={240}
                  step={5}
                  value={warmupMinutes}
                  onChange={(e) => setWarmupMinutes(parseInt(e.target.value, 10) || 65)}
                  className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[11px] text-slate-500">mins before tee time</span>
              </div>
            </div>

            {/* Accent Color Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Profile Accent Color</label>
              <div className="flex items-center gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingPlayerId(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Save Golfer
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
