import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Layers,
  CheckCircle2,
  Zap,
  Building,
  Settings,
} from 'lucide-react';

export default function DropZone({
  onFileSelected,
  onLoadSample,
  isLoading,
  fixedIdentity,
  onOpenFixedIdentityModal,
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        onFileSelected(file);
      } else {
        alert('Please drop a valid PDF file.');
      }
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 relative">
      {/* Decorative background blurs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-1/3 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Hero Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200/80 text-red-600 text-xs font-bold mb-4 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-red-600 animate-pulse" />
          <span>Next-Gen Academic Document Customizer</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Bifurcate, Edit & Replace <br />
          <span className="bg-gradient-to-r from-red-600 via-rose-600 to-red-500 bg-clip-text text-transparent underline decoration-red-300 decoration-wavy">
            Any Lab Report in Seconds
          </span>
        </h1>
        <p className="mt-3.5 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Drop any PDF lab manual, assignment, or project journal. <b>iLoveSwap</b> automatically chunk-bifurcates the document into sections — isolating student details, headers, questions, codes, and conclusions so you can replace them effortlessly!
        </p>
      </div>

      {/* Fixed Identity Permanent Status Bar */}
      <div className="mb-6 flex justify-center">
        {fixedIdentity?.name ? (
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white border border-slate-200/90 shadow-2xs text-xs">
            <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="text-slate-600">
              Permanent Identity Active: <b className="text-slate-900">{fixedIdentity.name}</b> (Roll {fixedIdentity.rollNo || '-'}, {fixedIdentity.division || '-'})
            </span>
            <button
              type="button"
              onClick={onOpenFixedIdentityModal}
              className="ml-1 text-[11px] font-bold text-red-600 hover:text-red-700 underline cursor-pointer"
            >
              Change
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenFixedIdentityModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs text-xs font-bold text-slate-700 transition-all cursor-pointer hover:border-red-300"
          >
            <ShieldCheck className="w-4 h-4 text-red-600" />
            <span>Set Your Fixed Identity Once (Permanent)</span>
            <span className="text-[10px] bg-red-100 text-red-700 font-extrabold px-1.5 py-0.2 rounded-md">
              PERMANENT
            </span>
          </button>
        )}
      </div>

      {/* Main Upload Box (iLovePDF Modernized) */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-14 text-center transition-all bg-white/90 backdrop-blur-md ${
          isDragging
            ? 'border-red-500 bg-red-50/50 shadow-2xl scale-[1.01]'
            : 'border-slate-300 hover:border-red-400 hover:shadow-xl shadow-card'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileInputChange}
        />

        <div className="flex flex-col items-center justify-center">
          <div className="relative mb-5 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 via-rose-600 to-red-600 flex items-center justify-center text-white shadow-xl shadow-red-500/30 group-hover:scale-105 transition-transform duration-200">
              <UploadCloud className="w-10 h-10" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Drop your PDF document here
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 mb-7">
            Lab manuals, journals, assignments, project reports, or any PDF file
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3.5">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-black text-sm text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 active:scale-98 shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Select PDF File</span>
            </button>

            <span className="text-xs font-bold text-slate-400">or</span>

            <button
              onClick={onLoadSample}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-98 border border-slate-200 shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Try Demo Lab Manual (Tejas ➔ Ranjeet)</span>
            </button>
          </div>

          {isLoading && (
            <div className="mt-7 flex items-center gap-2.5 text-sm text-red-600 font-bold bg-red-50 border border-red-200 px-4 py-2 rounded-xl animate-pulse">
              <span className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
              <span>Bifurcating document sections & extracting identity tags...</span>
            </div>
          )}
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card shadow-card-hover transition-all flex flex-col items-start">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-black text-slate-900 text-sm">Semantic Bifurcation</h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Automatically categorizes document elements into Identity, College Headers, Problem Questions, Monospace Code, and Conclusions.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card shadow-card-hover transition-all flex flex-col items-start">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-black text-slate-900 text-sm">Pixel-Perfect In-Place Masking</h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Replaces old text with exact baseline coordinates and standard fonts without altering your MATLAB screenshots or page layout.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card shadow-card-hover transition-all flex flex-col items-start">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-black text-slate-900 text-sm">Dual PDF & Word Export</h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Download your customized result as a pristine PDF or a structured Microsoft Word (.docx) file with dynamic file renaming!
          </p>
        </div>
      </div>
    </div>
  );
}
