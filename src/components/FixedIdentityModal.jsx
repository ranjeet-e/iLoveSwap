import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  X,
  User,
  Hash,
  Bookmark,
  Users,
  CreditCard,
  Save,
  CheckCircle,
} from 'lucide-react';

export const FIXED_IDENTITY_STORAGE_KEY = 'iloveswap_fixed_identity';

/**
 * Helper to get the saved fixed identity from localStorage
 */
export function getSavedFixedIdentity() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(FIXED_IDENTITY_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export default function FixedIdentityModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [batch, setBatch] = useState('');
  const [division, setDivision] = useState('');
  const [prn, setPrn] = useState('');
  const [autoApply, setAutoApply] = useState(true);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const saved = getSavedFixedIdentity();
      if (saved) {
        setName(saved.name || '');
        setRollNo(saved.rollNo || '');
        setBatch(saved.batch || '');
        setDivision(saved.division || '');
        setPrn(saved.prn || '');
        setAutoApply(saved.autoApply !== false);
      } else {
        // Sensible initial demo defaults (from user's screenshot)
        setName('Om Bhalerao');
        setRollNo('02');
        setBatch('B1');
        setDivision('SYECS2');
        setPrn('125BTEC1158');
        setAutoApply(true);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter your full name.');
      return;
    }

    const fixedData = {
      name: name.trim(),
      rollNo: rollNo.trim(),
      batch: batch.trim(),
      division: division.trim(),
      prn: prn.trim(),
      autoApply,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(FIXED_IDENTITY_STORAGE_KEY, JSON.stringify(fixedData));
    setJustSaved(true);

    if (onSave) {
      onSave(fixedData);
    }

    setTimeout(() => {
      setJustSaved(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200/90 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header (Exact Match to Screenshot) */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-500/25">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Fixed Identity Settings
              </h3>
              <span className="text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">
                PERMANENT
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Save your name once here. It will automatically replace the original author's details in every document you upload!
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Field */}
          <div>
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <User className="w-3.5 h-3.5 text-rose-500" />
              <span>Full Name (Fixed) *</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Om Bhalerao or ranjeet epili"
              className="w-full text-sm font-bold text-slate-900 bg-white border border-slate-300 focus:border-red-500 focus:ring-3 focus:ring-red-500/15 rounded-2xl px-4 py-2.5 outline-hidden transition-all shadow-2xs"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              This name will stay fixed permanently. You will not have to write it every time.
            </p>
          </div>

          {/* Roll No & Batch Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Hash className="w-3.5 h-3.5 text-blue-500" />
                <span>Roll No</span>
              </label>
              <input
                type="text"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                placeholder="e.g. 02 or 12"
                className="w-full text-sm font-bold text-slate-900 bg-white border border-slate-300 focus:border-red-500 focus:ring-3 focus:ring-red-500/15 rounded-2xl px-4 py-2.5 outline-hidden transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                <span>Batch</span>
              </label>
              <input
                type="text"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                placeholder="e.g. B1"
                className="w-full text-sm font-bold text-slate-900 bg-white border border-slate-300 focus:border-red-500 focus:ring-3 focus:ring-red-500/15 rounded-2xl px-4 py-2.5 outline-hidden transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Division & PRN Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Users className="w-3.5 h-3.5 text-purple-500" />
                <span>Division / Class</span>
              </label>
              <input
                type="text"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                placeholder="e.g. SYECS2"
                className="w-full text-sm font-bold text-slate-900 bg-white border border-slate-300 focus:border-red-500 focus:ring-3 focus:ring-red-500/15 rounded-2xl px-4 py-2.5 outline-hidden transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                <span>PRN / SAP ID</span>
              </label>
              <input
                type="text"
                value={prn}
                onChange={(e) => setPrn(e.target.value)}
                placeholder="e.g. 125BTEC1158"
                className="w-full text-sm font-bold text-slate-900 bg-white border border-slate-300 focus:border-red-500 focus:ring-3 focus:ring-red-500/15 rounded-2xl px-4 py-2.5 outline-hidden transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Auto-apply toggle */}
          <div className="pt-2 flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-bold text-slate-700">
                Auto-apply permanently to every uploaded document
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoApply}
              onChange={(e) => setAutoApply(e.target.checked)}
              className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
            />
          </div>

          {/* Footer (Exact Match to Screenshot) */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 font-medium text-center sm:text-left">
              Stored securely in local browser storage
            </span>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 active:scale-98 shadow-md shadow-red-600/30 transition-all cursor-pointer"
              >
                {justSaved ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save My Fixed Name</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
