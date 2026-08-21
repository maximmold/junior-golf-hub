import React, { useState, useRef } from 'react';
import { Tournament, Player } from '../../types/tournament';
import { parseCSV, parseJSON, generateSampleCSV } from '../../services/ingestService';
import { downloadFile } from '../../services/calendarExport';
import confetti from 'canvas-confetti';
import { 
  UploadCloud, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Sparkles, 
  ArrowRight,
  ClipboardCheck
} from 'lucide-react';

interface IngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournaments: Tournament[];
  players: Player[];
  onImportSuccess: (tournaments: Tournament[]) => void;
}

export const IngestionModal: React.FC<IngestionModalProps> = ({
  isOpen,
  onClose,
  tournaments,
  players,
  onImportSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [pasteContent, setPasteContent] = useState('');
  const [previewTournaments, setPreviewTournaments] = useState<Tournament[] | null>(null);
  const [importSummary, setImportSummary] = useState<{ added: number; updated: number; warnings: string[] } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadSample = () => {
    const csv = generateSampleCSV(players);
    downloadFile(csv, 'junior_golf_tournaments_template.csv', 'text/csv;charset=utf-8');
  };

  const processFileContent = (content: string, fileName: string) => {
    setErrorMessage(null);
    setImportSummary(null);

    let result;
    if (fileName.endsWith('.json') || content.trim().startsWith('{') || content.trim().startsWith('[')) {
      result = parseJSON(content, tournaments, players);
    } else {
      result = parseCSV(content, tournaments, players);
    }

    if (result.success) {
      setPreviewTournaments(result.importedTournaments);
      setImportSummary({
        added: result.addedCount,
        updated: result.updatedCount,
        warnings: result.warnings,
      });
    } else {
      setErrorMessage(result.errors.join(' '));
      setPreviewTournaments(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processFileContent(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processFileContent(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handlePasteSubmit = () => {
    if (!pasteContent.trim()) return;
    processFileContent(pasteContent, 'pasted_data.csv');
  };

  const handleApplyImport = () => {
    if (!previewTournaments) return;
    onImportSuccess(previewTournaments);

    // Fire celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Confetti fallback
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Ingest Tournament Schedule</h3>
              <p className="text-xs text-slate-400">Import CSV or JSON to automatically mark signed up tournaments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher & Sample Template Download */}
        <div className="flex items-center justify-between py-3 shrink-0">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'upload' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Upload File (.csv / .json)
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'paste' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Paste Raw Data
            </button>
          </div>

          <button
            onClick={handleDownloadSample}
            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold px-2 py-1 rounded hover:bg-emerald-950/40 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Template</span>
          </button>
        </div>

        {/* Ingestion Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          
          {activeTab === 'upload' && !previewTournaments && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                dragActive ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-800 hover:border-emerald-600/60 bg-slate-950/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .json, .txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div>
                <div className="font-bold text-sm text-white">Click to browse or drag & drop file</div>
                <div className="text-xs text-slate-400 mt-1">Supports CSV and JSON tournament schedules</div>
              </div>
            </div>
          )}

          {activeTab === 'paste' && !previewTournaments && (
            <div className="space-y-3">
              <textarea
                rows={6}
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                placeholder="Paste CSV rows here, e.g.:
Tournament Name,Course,Start Date,Status
U.S. Kids Golf Charleston Fall Opener,Charleston Municipal,2026-08-23,registered"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handlePasteSubmit}
                disabled={!pasteContent.trim()}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition-all flex items-center justify-center gap-2"
              >
                <ClipboardCheck className="w-4 h-4" />
                Parse Pasted Data
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Preview Table when Parsed */}
          {previewTournaments && importSummary && (
            <div className="space-y-3">
              
              {/* Summary Banner */}
              <div className="p-3 rounded-2xl bg-emerald-950/50 border border-emerald-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white">Parsed Successfully!</div>
                    <div className="text-[11px] text-emerald-300">
                      {importSummary.updated} tournaments updated • {importSummary.added} new tournaments added
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => { setPreviewTournaments(null); setImportSummary(null); }}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Change File
                </button>
              </div>

              {/* Parsed Tournaments Preview List */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden max-h-[260px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] sticky top-0 border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">Tournament</th>
                      <th className="py-2 px-3">Course</th>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Duration</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {previewTournaments.slice(0, 8).map((t) => {
                      const isSignedUp = Object.values(t.playerRegistrations).some((st) => st === 'registered');
                      return (
                        <tr key={t.id} className="hover:bg-slate-800/40 text-slate-200">
                          <td className="py-2 px-3 font-semibold truncate max-w-[150px]">{t.name}</td>
                          <td className="py-2 px-3 text-slate-400 truncate max-w-[120px]">{t.course.name}</td>
                          <td className="py-2 px-3 text-slate-300 whitespace-nowrap">{t.startDate}</td>
                          <td className="py-2 px-3">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800">
                              {t.duration}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSignedUp ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {isSignedUp ? '⭐ Signed Up' : 'Available'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
          >
            Cancel
          </button>
          {previewTournaments && (
            <button
              onClick={handleApplyImport}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/60 transition-all flex items-center gap-1.5"
            >
              <span>Apply & Ingest Schedule</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
