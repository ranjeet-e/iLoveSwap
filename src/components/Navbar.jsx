import React from 'react';
import {
  FileText,
  Sparkles,
  RefreshCw,
  Download,
  Puzzle,
  Layers,
  FileCheck2,
  SlidersHorizontal,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export default function Navbar({
  onLoadSample,
  onReset,
  onOpenGuide,
  onOpenFixedIdentity,
  fixedIdentity,
  hasDocument,
  fileName,
  sectionsCount,
  numPages,
}) {
  return (
    <header className="glass-panel sticky top-0 z-30 border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 flex items-center justify-center text-white shadow-md shadow-red-500/25 group-hover:scale-105 transition-transform duration-200">
              <FileText className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900">
                iLove<span className="text-red-600">Swap</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200/80 px-2 py-0.5 rounded-full shadow-2xs">
                <Sparkles className="w-2.5 h-2.5" />
                <span>PDF Section Editor</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden md:block">
              Bifurcate PDF sections • Replace personal tags • Export to PDF & Word
            </p>
          </div>
        </div>

        {/* Center: Document Loaded Pills */}
        {hasDocument && (
          <div className="hidden lg:flex items-center gap-2 bg-slate-100/80 border border-slate-200/80 px-3.5 py-1.5 rounded-full text-xs shadow-2xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 truncate max-w-[220px]" title={fileName}>
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{fileName}</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span className="text-slate-500 font-medium">
              {numPages || 1} {numPages === 1 ? 'Page' : 'Pages'}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
              {sectionsCount || 0} Sections
            </span>
          </div>
        )}

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Fixed Identity Permanent Button */}
          <button
            onClick={onOpenFixedIdentity}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs border bg-white hover:bg-slate-50 border-slate-200"
            title="Set permanent author details that auto-replace across every uploaded PDF"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
            {fixedIdentity?.name ? (
              <span className="font-bold text-slate-800 truncate max-w-[150px]">
                Fixed: {fixedIdentity.name}
              </span>
            ) : (
              <span className="font-bold text-slate-800">
                Fixed Identity <span className="text-[10px] text-red-600 font-extrabold">(PERMANENT)</span>
              </span>
            )}
          </button>

          <button
            onClick={onLoadSample}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-700 bg-red-50/90 hover:bg-red-100 active:bg-red-200/80 border border-red-200/80 shadow-2xs transition-all cursor-pointer hover:shadow-xs"
            title="Load the Shah & Anchor lab manual with Tejas S. Kamble details"
          >
            <Sparkles className="w-3.5 h-3.5 text-red-600 animate-spin-slow" />
            <span className="hidden sm:inline">Try Sample PDF</span>
            <span className="sm:hidden">Sample</span>
          </button>

          {hasDocument && (
            <button
              onClick={onReset}
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200/60 transition-all cursor-pointer"
              title="Upload a different PDF document"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upload New</span>
            </button>
          )}

          <button
            onClick={onOpenGuide}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/80 shadow-2xs transition-all cursor-pointer"
            title="How to install as Chrome Extension"
          >
            <Puzzle className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Extension Guide</span>
          </button>
        </div>
      </div>
    </header>
  );
}
