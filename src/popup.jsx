import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
  FileText,
  ExternalLink,
  Save,
  Check,
  Layers,
  Edit3,
  Search,
  Eraser,
  Files,
} from 'lucide-react';
import './index.css';

function PopupApp() {
  const [name, setName] = useState('');
  const [refId, setRefId] = useState('');
  const [dept, setDept] = useState('');
  const [category, setCategory] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw =
      localStorage.getItem('iloveswap_fixed_identity') ||
      localStorage.getItem('iloveswap_saved_profile');
    if (raw) {
      try {
        const p = JSON.parse(raw);
        if (p.name) setName(p.name);
        if (p.rollNo || p.refId) setRefId(p.rollNo || p.refId);
        if (p.division || p.dept) setDept(p.division || p.dept);
        if (p.batch || p.category) setCategory(p.batch || p.category);
      } catch (e) {}
    }
  }, []);

  const handleSaveDefaults = () => {
    const data = {
      name,
      rollNo: refId,
      refId,
      division: dept,
      dept,
      batch: category,
      category,
      autoApply: true,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem('iloveswap_fixed_identity', JSON.stringify(data));
    localStorage.setItem('iloveswap_saved_profile', JSON.stringify(data));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleOpenPage = (hash = '') => {
    const targetUrl = chrome?.runtime?.getURL
      ? chrome.runtime.getURL(`index.html${hash ? `#${hash}` : ''}`)
      : `index.html${hash ? `#${hash}` : ''}`;

    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url: targetUrl });
    } else {
      window.open(targetUrl, '_blank');
    }
  };

  return (
    <div className="p-4 w-[360px] bg-white text-gray-900 font-sans selection:bg-red-600 selection:text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-black tracking-tight text-gray-900">
            iLove<span className="text-red-600">Swap</span>
          </span>
          <span className="text-[10px] text-gray-500 font-normal">
            by ranjeet epili
          </span>
        </div>

        <button
          onClick={() => handleOpenPage('')}
          type="button"
          className="flex items-center gap-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-2.5 py-1 rounded transition-colors cursor-pointer"
        >
          <span>Open Full Suite</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Quick Tool Launchers (iLovePDF Style) */}
      <div className="mt-3">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
          Quick Launch Tool
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => handleOpenPage('editor')}
            type="button"
            className="flex items-center gap-2 p-2 rounded border border-gray-200 hover:border-red-500 hover:bg-red-50/30 text-gray-800 text-left transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-red-600" />
            <span className="font-medium">Canvas Editor</span>
          </button>

          <button
            onClick={() => handleOpenPage('bifurcate')}
            type="button"
            className="flex items-center gap-2 p-2 rounded border border-gray-200 hover:border-red-500 hover:bg-red-50/30 text-gray-800 text-left transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-red-600" />
            <span className="font-medium">Bifurcator</span>
          </button>

          <button
            onClick={() => handleOpenPage('replace')}
            type="button"
            className="flex items-center gap-2 p-2 rounded border border-gray-200 hover:border-red-500 hover:bg-red-50/30 text-gray-800 text-left transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-red-600" />
            <span className="font-medium">Find & Replace</span>
          </button>

          <button
            onClick={() => handleOpenPage('redact')}
            type="button"
            className="flex items-center gap-2 p-2 rounded border border-gray-200 hover:border-red-500 hover:bg-red-50/30 text-gray-800 text-left transition-colors cursor-pointer"
          >
            <Eraser className="w-3.5 h-3.5 text-red-600" />
            <span className="font-medium">Redactor</span>
          </button>
        </div>
      </div>

      {/* Quick Default Metadata Section */}
      <div className="mt-3.5 bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-800">
            Document Metadata Defaults
          </span>
          <span className="text-[10px] text-gray-400">
            Offline Storage
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div>
            <label className="text-[11px] font-medium text-gray-600 block mb-0.5">
              Author / Prepared By
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe, Lead Author"
              className="w-full bg-white px-2.5 py-1.5 rounded border border-gray-300 text-gray-900 focus:border-red-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-medium text-gray-600 block mb-0.5">
                Reference / ID
              </label>
              <input
                type="text"
                value={refId}
                onChange={(e) => setRefId(e.target.value)}
                placeholder="e.g. REF-101"
                className="w-full bg-white px-2.5 py-1.5 rounded border border-gray-300 text-gray-900 focus:border-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-gray-600 block mb-0.5">
                Department
              </label>
              <input
                type="text"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                placeholder="e.g. Operations"
                className="w-full bg-white px-2.5 py-1.5 rounded border border-gray-300 text-gray-900 focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleSaveDefaults}
            type="button"
            className="w-full mt-2 py-1.5 rounded text-xs font-semibold text-white bg-gray-900 hover:bg-black transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            {saved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saved as Default</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Defaults</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-3 text-center">
        <p className="text-[10px] text-gray-400">
          100% Client-Side. No files ever leave your device.
        </p>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('popup-root'));
root.render(<PopupApp />);
