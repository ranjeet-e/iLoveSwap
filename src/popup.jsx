import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
  FileText,
  ExternalLink,
  Sparkles,
  User,
  Save,
  Zap,
} from 'lucide-react';
import './index.css';

function PopupApp() {
  const [name, setName] = useState('Om Bhalerao');
  const [rollNo, setRollNo] = useState('02');
  const [batch, setBatch] = useState('B1');
  const [division, setDivision] = useState('SYECS2');
  const [prn, setPrn] = useState('125BTEC1158');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw =
      localStorage.getItem('iloveswap_fixed_identity') ||
      localStorage.getItem('iloveswap_saved_profile') ||
      localStorage.getItem('ilvescam_saved_profile') ||
      localStorage.getItem('easeway_saved_profile');
    if (raw) {
      try {
        const p = JSON.parse(raw);
        if (p.name || p.Name) setName(p.name || p.Name);
        if (p.rollNo || p.Roll || p['Roll No']) setRollNo(p.rollNo || p.Roll || p['Roll No']);
        if (p.batch || p.Batch) setBatch(p.batch || p.Batch);
        if (p.division || p.Division) setDivision(p.division || p.Division);
        if (p.prn || p.PRN) setPrn(p.prn || p.PRN);
      } catch (e) {}
    }
  }, []);

  const handleSaveProfile = () => {
    const data = {
      name,
      rollNo,
      batch,
      division,
      prn,
      autoApply: true,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem('iloveswap_fixed_identity', JSON.stringify(data));
    localStorage.setItem('iloveswap_saved_profile', JSON.stringify(data));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleOpenFullDashboard = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
    } else {
      window.open('index.html', '_blank');
    }
  };

  return (
    <div className="p-4 w-[380px] bg-slate-50 text-slate-900 font-sans selection:bg-red-500 selection:text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 text-white flex items-center justify-center shadow-md shadow-red-500/25">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-black text-slate-900 tracking-tight">
                iLove<span className="text-red-600">Swap</span>
              </h1>
              <span className="text-[9px] font-bold bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.2 rounded-full">
                EXT
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Smart Lab Report Chunker</p>
          </div>
        </div>

        <button
          onClick={handleOpenFullDashboard}
          type="button"
          className="flex items-center gap-1 text-[11px] font-black text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-xl transition-all cursor-pointer shadow-2xs"
        >
          <span>Open Studio</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Quick Profile Section */}
      <div className="mt-3.5 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-current" />
            <span>Default Student Profile</span>
          </span>
          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
            Auto-Sync
          </span>
        </div>

        <div className="space-y-2.5 text-xs">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Student Full Name
            </label>
            <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/10 mt-1">
              <User className="w-3.5 h-3.5 text-rose-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent font-bold text-slate-900 outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Roll No
              </label>
              <input
                type="text"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                className="w-full bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-900 outline-hidden focus:border-red-500 mt-1"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Batch
              </label>
              <input
                type="text"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-900 outline-hidden focus:border-red-500 mt-1"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Div
              </label>
              <input
                type="text"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-900 outline-hidden focus:border-red-500 mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              PRN / SAP ID
            </label>
            <input
              type="text"
              value={prn}
              onChange={(e) => setPrn(e.target.value)}
              placeholder="e.g. 125BTEC1158"
              className="w-full bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-900 outline-hidden focus:border-red-500 mt-1"
            />
          </div>

          <button
            onClick={handleSaveProfile}
            type="button"
            className="w-full mt-2 py-2 rounded-xl text-xs font-black text-white bg-slate-900 hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saved ? '✓ Saved as Default!' : 'Save Profile'}</span>
          </button>
        </div>
      </div>

      {/* Launch full app button */}
      <div className="mt-3.5">
        <button
          onClick={handleOpenFullDashboard}
          type="button"
          className="w-full py-3 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 shadow-md shadow-red-600/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Open Full iLoveSwap PDF Studio</span>
        </button>
      </div>

      <p className="text-[10px] text-center text-slate-400 mt-3 font-medium">
        Bifurcate PDF sections, replace personal tags & export
      </p>
    </div>
  );
}

const root = createRoot(document.getElementById('popup-root'));
root.render(<PopupApp />);
