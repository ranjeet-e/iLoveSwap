import React from 'react';
import { X, Puzzle, CheckCircle, FolderOpen, ToggleRight, ArrowRight } from 'lucide-react';

export default function ExtensionGuideModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Puzzle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Install iLoveSwap as a Chrome Extension
            </h3>
            <p className="text-xs text-slate-500">
              Run iLoveSwap directly in Google Chrome, Edge, or Brave
            </p>
          </div>
        </div>

        <div className="space-y-3.5 my-5 text-xs text-slate-600">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
              1
            </span>
            <div>
              <p className="font-bold text-slate-900">Open Chrome Extensions Manager</p>
              <p className="text-slate-500 mt-0.5">
                In Chrome / Brave / Edge address bar, type <code className="bg-white px-1.5 py-0.5 rounded border text-indigo-700 font-mono">chrome://extensions</code> and hit Enter.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
              2
            </span>
            <div>
              <p className="font-bold text-slate-900">Enable Developer Mode</p>
              <p className="text-slate-500 mt-0.5">
                Toggle the <b>Developer mode</b> switch in the top-right corner of the Extensions page.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
              3
            </span>
            <div>
              <p className="font-bold text-slate-900">Click "Load unpacked"</p>
              <p className="text-slate-500 mt-0.5">
                Click <b>Load unpacked</b> in the top-left, and select the <code className="bg-white px-1.5 py-0.5 rounded border text-indigo-700 font-mono">iLoveSwap</code> directory (or the <b>dist</b> folder)!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
              ✓
            </span>
            <div>
              <p className="font-bold text-slate-900">Ready to Go!</p>
              <p className="text-slate-500 mt-0.5">
                Pin the iLoveSwap icon to your toolbar. You can now customize any PDF lab report with 1 click!
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          type="button"
          className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Got it, let's edit PDFs!
        </button>
      </div>
    </div>
  );
}
