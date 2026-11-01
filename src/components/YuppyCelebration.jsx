import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, CheckCircle2, ArrowRight, X, Download, PartyPopper } from 'lucide-react';

export default function YuppyCelebration({ changes = [], onClose, onQuickDownload }) {
  useEffect(() => {
    // Fire celebratory confetti!
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.65 },
      colors: ['#e5322d', '#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
    });

    const timer = setTimeout(() => {
      onClose?.();
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md w-full animate-in fade-in slide-in-from-top-6 duration-300">
      <div className="bg-white rounded-3xl border-2 border-emerald-500 shadow-2xl p-5 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-500 via-emerald-500 to-blue-500"></div>

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-black text-slate-900 tracking-tight">
                  Yuppy !! Change is been made 🎉
                </h4>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Target sections have been successfully modified in the PDF document!
              </p>

              {/* Changes list */}
              {changes.length > 0 && (
                <div className="mt-3 space-y-1.5 bg-slate-50/90 rounded-2xl p-2.5 border border-slate-200/80 text-xs">
                  {changes.slice(0, 4).map((ch, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-slate-700">
                      <span className="font-bold text-slate-900">{ch.label}:</span>
                      <span className="line-through text-slate-400 truncate max-w-[85px]">
                        {ch.from}
                      </span>
                      <ArrowRight className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="font-extrabold text-emerald-700 truncate max-w-[130px]">
                        {ch.to}
                      </span>
                    </div>
                  ))}
                  {changes.length > 4 && (
                    <div className="text-[10px] text-slate-500 italic pt-0.5">
                      + {changes.length - 4} more section updates applied
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
