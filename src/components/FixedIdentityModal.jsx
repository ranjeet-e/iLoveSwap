import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const FIXED_IDENTITY_STORAGE_KEY = 'iloveswap_fixed_identity';

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
    if (!name.trim()) return;

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
    if (onSave) onSave(fixedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-lg max-w-md w-full p-6 border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Fixed Identity Settings
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Saved details will auto-fill across uploaded documents.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Om Bhalerao"
              className="w-full border border-gray-300 rounded px-3 py-1.5 focus:border-red-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Roll No
              </label>
              <input
                type="text"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                placeholder="e.g. 02"
                className="w-full border border-gray-300 rounded px-3 py-1.5 focus:border-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Batch
              </label>
              <input
                type="text"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                placeholder="e.g. B1"
                className="w-full border border-gray-300 rounded px-3 py-1.5 focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Division / Class
              </label>
              <input
                type="text"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                placeholder="e.g. SYECS2"
                className="w-full border border-gray-300 rounded px-3 py-1.5 focus:border-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                PRN / SAP ID
              </label>
              <input
                type="text"
                value={prn}
                onChange={(e) => setPrn(e.target.value)}
                placeholder="e.g. 125BTEC1158"
                className="w-full border border-gray-300 rounded px-3 py-1.5 focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-gray-600">
            <span>Auto-apply on upload</span>
            <input
              type="checkbox"
              checked={autoApply}
              onChange={(e) => setAutoApply(e.target.checked)}
              className="rounded border-gray-300"
            />
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-gray-600 hover:text-gray-900 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors"
            >
              Save Identity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
