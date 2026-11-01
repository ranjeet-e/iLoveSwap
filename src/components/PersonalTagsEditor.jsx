import React, { useState } from 'react';
import {
  User,
  Hash,
  Bookmark,
  Users,
  CreditCard,
  Calendar,
  Sparkles,
  CheckCircle,
  Plus,
  Trash2,
  Save,
  ArrowRight,
  Zap,
  RotateCcw,
  Copy,
  Check,
} from 'lucide-react';

export default function PersonalTagsEditor({
  personalTags,
  onTagChange,
  onAddTag,
  onRemoveTag,
  onApplyChanges,
  onHighlightItem,
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState('');
  const [newTagValue, setNewTagValue] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Quick preset: Ranjeet Epili's details (from user's prompt!)
  const applyRanjeetPreset = () => {
    personalTags.forEach((tag) => {
      const key = (tag.key || '').toLowerCase();
      const label = (tag.label || '').toLowerCase();

      if (key.includes('name') || label.includes('name')) {
        onTagChange(tag.id, 'ranjeet epili');
      } else if (key.includes('roll') || label.includes('roll')) {
        onTagChange(tag.id, '12');
      } else if (key.includes('batch') || label.includes('batch')) {
        onTagChange(tag.id, 'B1');
      } else if (key.includes('division') || key.includes('class') || label.includes('div')) {
        onTagChange(tag.id, 'SYECS2');
      } else if (key.includes('prn') || label.includes('prn')) {
        onTagChange(tag.id, '202301640001234');
      }
    });

    onApplyChanges?.();
  };

  // Revert all tags back to original values from PDF
  const handleRevertAll = () => {
    personalTags.forEach((tag) => {
      onTagChange(tag.id, tag.originalValue);
    });
    onApplyChanges?.();
  };

  // Save current profile to localStorage
  const handleSaveProfile = () => {
    const profile = {};
    personalTags.forEach((t) => {
      profile[t.key || t.label] = t.currentValue;
    });
    localStorage.setItem('iloveswap_saved_profile', JSON.stringify(profile));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Load saved profile from localStorage
  const handleLoadSavedProfile = () => {
    const raw =
      localStorage.getItem('iloveswap_saved_profile') ||
      localStorage.getItem('ilvescam_saved_profile') ||
      localStorage.getItem('easeway_saved_profile');
    if (!raw) {
      alert('No saved profile found. Fill in your details and click "Save Profile" first!');
      return;
    }
    try {
      const profile = JSON.parse(raw);
      personalTags.forEach((tag) => {
        const val = profile[tag.key || tag.label];
        if (val !== undefined) {
          onTagChange(tag.id, val);
        }
      });
      onApplyChanges?.();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyValue = (id, val) => {
    navigator.clipboard?.writeText(val);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleAddNewField = (e) => {
    e.preventDefault();
    if (!newTagLabel.trim() || !newTagValue.trim()) return;

    onAddTag({
      label: newTagLabel.trim(),
      prefix: `${newTagLabel.trim()}: `,
      originalValue: '',
      currentValue: newTagValue.trim(),
      key: newTagLabel.trim().toLowerCase().replace(/\s+/g, '_'),
    });

    setNewTagLabel('');
    setNewTagValue('');
    setShowAddForm(false);
  };

  // Popular field presets to quick add
  const quickAddPresets = [
    { label: 'PRN No', key: 'prn', defaultVal: '202301640001234' },
    { label: 'Subject', key: 'subject', defaultVal: 'Applied Mathematics' },
    { label: 'Date', key: 'date', defaultVal: '15/02/2025' },
    { label: 'Academic Year', key: 'ay', defaultVal: 'A.Y. 2024-25' },
  ];

  // Helper icon for tag keys
  const getTagIcon = (key, label) => {
    const text = `${key} ${label}`.toLowerCase();
    if (text.includes('name')) return <User className="w-4 h-4 text-rose-600" />;
    if (text.includes('roll')) return <Hash className="w-4 h-4 text-blue-600" />;
    if (text.includes('batch')) return <Bookmark className="w-4 h-4 text-amber-600" />;
    if (text.includes('div') || text.includes('class')) return <Users className="w-4 h-4 text-purple-600" />;
    if (text.includes('prn') || text.includes('sap') || text.includes('uin'))
      return <CreditCard className="w-4 h-4 text-emerald-600" />;
    if (text.includes('date') || text.includes('year'))
      return <Calendar className="w-4 h-4 text-sky-600" />;
    return <Sparkles className="w-4 h-4 text-slate-500" />;
  };

  const modifiedCount = personalTags.filter((t) => t.currentValue !== t.originalValue).length;

  return (
    <div className="bg-white rounded-3xl border-2 border-red-500/30 shadow-card p-6 relative overflow-hidden transition-all">
      {/* Decorative top accent badge */}
      <div className="absolute top-0 right-0 bg-gradient-to-l from-red-600 to-rose-600 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
        <Zap className="w-3 h-3 fill-current" />
        <span>Core Identity Section</span>
      </div>

      {/* Header & Description */}
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-600 ring-4 ring-red-100"></span>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Student Identity & Personal Labels
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Isolated metadata tags detected on Page 1. Update your name, roll no, batch, and division below.
        </p>

        {/* Quick Presets Bar */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <button
            onClick={applyRanjeetPreset}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 active:scale-98 shadow-md shadow-red-500/25 transition-all cursor-pointer"
            title="Auto-fill: Name: ranjeet epili | Roll: 12 | Batch: B1 | Div: SYECS2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Apply "Ranjeet Epili" Preset</span>
          </button>

          <button
            onClick={handleLoadSavedProfile}
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-98 transition-all cursor-pointer border border-slate-200/80"
            title="Load your saved profile from localStorage"
          >
            <span>My Profile</span>
          </button>

          <button
            onClick={handleSaveProfile}
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
            title="Save current fields as my default profile"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savedSuccess ? 'Saved!' : 'Save Profile'}</span>
          </button>

          {modifiedCount > 0 && (
            <button
              onClick={handleRevertAll}
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 transition-all cursor-pointer border border-amber-200/60"
              title="Revert back to Tejas S. Kamble / Roll 28"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Revert to Original</span>
            </button>
          )}
        </div>
      </div>

      {/* Tags Form Grid */}
      <div className="space-y-3.5">
        {personalTags.map((tag) => {
          const isModified = tag.currentValue !== tag.originalValue;

          return (
            <div
              key={tag.id}
              onMouseEnter={() => onHighlightItem?.(tag.itemId || tag.id)}
              onMouseLeave={() => onHighlightItem?.(null)}
              className={`p-3.5 rounded-2xl border transition-all ${
                isModified
                  ? 'bg-red-50/40 border-red-300/80 shadow-xs ring-1 ring-red-400/20'
                  : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-white shadow-2xs border border-slate-200/80">
                    {getTagIcon(tag.key, tag.label)}
                  </span>
                  <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    {tag.label || tag.key}
                  </label>
                  {tag.pageNum && (
                    <span className="text-[10px] text-slate-400 font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200/60">
                      Page {tag.pageNum}
                    </span>
                  )}
                </div>

                {/* Diff Pill */}
                {isModified ? (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-700 bg-red-100/80 border border-red-200/60 px-2.5 py-0.5 rounded-lg shadow-2xs">
                    <span className="line-through text-slate-500 opacity-70 truncate max-w-[110px]" title={tag.originalValue}>
                      {tag.originalValue || '(empty)'}
                    </span>
                    <ArrowRight className="w-3 h-3 text-red-600 shrink-0" />
                    <span className="truncate max-w-[130px]" title={tag.currentValue}>
                      {tag.currentValue}
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium">
                    Original in PDF: <b className="text-slate-600">{tag.originalValue || '(none)'}</b>
                  </span>
                )}
              </div>

              {/* Input row */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={tag.currentValue}
                    onChange={(e) => onTagChange(tag.id, e.target.value)}
                    placeholder={`Enter new ${tag.label || tag.key}...`}
                    className="w-full text-sm font-bold text-slate-900 bg-white border border-slate-300 focus:border-red-500 focus:ring-3 focus:ring-red-500/15 rounded-xl px-3.5 py-2.5 transition-all outline-hidden shadow-2xs"
                  />
                </div>

                {/* Copy button */}
                <button
                  onClick={() => handleCopyValue(tag.id, tag.currentValue)}
                  type="button"
                  className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
                  title="Copy value"
                >
                  {copiedId === tag.id ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                {tag.isCustom && (
                  <button
                    onClick={() => onRemoveTag(tag.id)}
                    type="button"
                    className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Remove custom field"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Add Preset Chips */}
      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-bold text-slate-400">Quick Add:</span>
        {quickAddPresets.map((preset) => (
          <button
            key={preset.key}
            type="button"
            onClick={() =>
              onAddTag({
                label: preset.label,
                prefix: `${preset.label}: `,
                originalValue: '',
                currentValue: preset.defaultVal,
                key: preset.key,
              })
            }
            className="text-[11px] font-bold text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 border border-slate-200/60 hover:border-red-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            + {preset.label}
          </button>
        ))}
      </div>

      {/* Add Custom Tag Form */}
      {showAddForm ? (
        <form onSubmit={handleAddNewField} className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <h4 className="text-xs font-bold text-slate-800 mb-2.5">Add Custom Label Field</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
            <input
              type="text"
              placeholder="Field Label (e.g. Faculty Name, Seat No)"
              value={newTagLabel}
              onChange={(e) => setNewTagLabel(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 outline-hidden focus:border-red-500"
            />
            <input
              type="text"
              placeholder="Your Desired Value"
              value={newTagValue}
              onChange={(e) => setNewTagValue(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 outline-hidden focus:border-red-500"
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-1.5 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl cursor-pointer shadow-sm"
            >
              Add Field
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-red-600 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Label</span>
          </button>

          <button
            type="button"
            onClick={onApplyChanges}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 active:scale-98 shadow-md shadow-red-600/30 transition-all cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Apply Changes (Yuppy!)</span>
          </button>
        </div>
      )}
    </div>
  );
}
