import React, { useState } from 'react';
import { UserLocation } from '../../types/tournament';
import { MapPin, Navigation, Check, X, Loader2, Compass } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: UserLocation;
  presetLocations: { address: string; lat: number; lng: number; label: string }[];
  onSelectPreset: (address: string) => void;
  onSetCustomAddress: (address: string) => Promise<boolean>;
  isGeocoding: boolean;
  geocodeError: string | null;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  userLocation,
  presetLocations,
  onSelectPreset,
  onSetCustomAddress,
  isGeocoding,
  geocodeError,
}) => {
  const [customInput, setCustomInput] = useState('');

  if (!isOpen) return null;

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    const success = await onSetCustomAddress(customInput.trim());
    if (success) {
      setCustomInput('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Your Starting Address</h3>
              <p className="text-xs text-slate-400">Used to calculate drive distance & ETAs to all tournaments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Location Badge */}
        <div className="my-4 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>{userLocation.label || 'Home Location'}</span>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800/60">
                    Active
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-medium mt-0.5">{userLocation.address}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Address Input */}
        <form onSubmit={handleCustomSubmit} className="mb-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Set or Update Starting Address
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 2561 Rivertowne Pkwy, Mount Pleasant, SC 29466"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="flex-1 bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-inner"
            />
            <button
              type="submit"
              disabled={isGeocoding || !customInput.trim()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition-all flex items-center gap-1.5 shrink-0"
            >
              {isGeocoding ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Locating...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save as Default</span>
                </>
              )}
            </button>
          </div>
          {geocodeError && (
            <p className="text-xs text-rose-400 mt-1.5 font-medium">{geocodeError}</p>
          )}
        </form>

        {/* Quick Pick Charleston & SC Presets */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Quick Location Presets:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
            {presetLocations.map((preset) => {
              const isSelected = userLocation.address === preset.address || userLocation.label === preset.label;
              const isDefaultHome = preset.address.includes('2561 Rivertowne');

              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    onSelectPreset(preset.address);
                    onClose();
                  }}
                  className={`text-left p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/60 ring-1 ring-emerald-500/40'
                      : 'bg-slate-950/50 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      {isDefaultHome ? '🏠' : '📍'}
                      <span>{preset.label}</span>
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{preset.address}</div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
