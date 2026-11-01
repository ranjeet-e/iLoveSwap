import React, { useState } from 'react';
import { Plus, Trash2, Check, ArrowRight } from 'lucide-react';

export default function PersonalTagsEditor({
  personalTags,
  onTagChange,
  onAddTag,
  onRemoveTag,
  onApplyChanges,
  onHighlightItem,
  fixedIdentity,
  onOpenFixedIdentityModal,
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState('');
  const [newTagValue, setNewTagValue] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const applyFixedIdentity = () => {
    if (!fixedIdentity || !fixedIdentity.name) {
      onOpenFixedIdentityModal?.();
      return;
    }

    personalTags.forEach((tag) => {
      const key = (tag.key || '').toLowerCase();
      const label = (tag.label || '').toLowerCase();

      if (key.includes('name') || label.includes('name')) {
        if (fixedIdentity.name) onTagChange(tag.id, fixedIdentity.name);
      } else if (key.includes('roll') || label.includes('roll')) {
        if (fixedIdentity.rollNo) onTagChange(tag.id, fixedIdentity.rollNo);
      } else if (key.includes('batch') || label.includes('batch')) {
        if (fixedIdentity.batch) onTagChange(tag.id, fixedIdentity.batch);
      } else if (key.includes('division') || key.includes('class') || label.includes('div')) {
        if (fixedIdentity.division) onTagChange(tag.id, fixedIdentity.division);
      } else if (key.includes('prn') || label.includes('prn') || key.includes('sap')) {
        if (fixedIdentity.prn) onTagChange(tag.id, fixedIdentity.prn);
      }
    });

    onApplyChanges?.();
  };

  const handleRevertAll = () => {
    personalTags.forEach((tag) => {
      onTagChange(tag.id, tag.originalValue);
    });
    onApplyChanges?.();
  };

  const handleSaveProfile = () => {
    const profile = {};
    personalTags.forEach((t) => {
      profile[t.key || t.label] = t.currentValue;
    });
    localStorage.setItem('iloveswap_saved_profile', JSON.stringify(profile));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleLoadSavedProfile = () => {
    const raw =
      localStorage.getItem('iloveswap_fixed_identity') ||
      localStorage.getItem('iloveswap_saved_profile');
    if (!raw) return;
    try {
      const profile = JSON.parse(raw);
      personalTags.forEach((tag) => {
        const val = profile[tag.key || tag.label];
        if (val !== undefined) {
          onTagChange(tag.id, val);
        }
      });
      onApplyChanges?.();
    } catch (e) {}
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

  const modifiedCount = personalTags.filter((t) => t.currentValue !== t.originalValue).length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-gray-100">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Student Details
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Detected tags from Page 1.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          {fixedIdentity?.name ? (
            <button
              onClick={applyFixedIdentity}
              type="button"
              className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors"
            >
              Apply Fixed Details
            </button>
          ) : (
            <button
              onClick={onOpenFixedIdentityModal}
              type="button"
              className="px-2.5 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors"
            >
              Set Fixed Identity
            </button>
          )}

          <button
            onClick={handleLoadSavedProfile}
            type="button"
            className="px-2.5 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors"
          >
            Load Saved
          </button>

          <button
            onClick={handleSaveProfile}
            type="button"
            className="px-2.5 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors"
          >
            {savedSuccess ? 'Saved' : 'Save'}
          </button>

          {modifiedCount > 0 && (
            <button
              onClick={handleRevertAll}
              type="button"
              className="px-2.5 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded transition-colors"
            >
              Revert
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {personalTags.map((tag) => {
          const isModified = tag.currentValue !== tag.originalValue;

          return (
            <div
              key={tag.id}
              onMouseEnter={() => onHighlightItem?.(tag.itemId || tag.id)}
              onMouseLeave={() => onHighlightItem?.(null)}
              className="p-3 rounded border border-gray-200 bg-gray-50/50"
            >
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <span className="font-medium text-gray-700">
                  {tag.label || tag.key}
                </span>

                {isModified ? (
                  <span className="flex items-center gap-1 text-[11px] text-red-600">
                    <span className="line-through text-gray-400">{tag.originalValue || '(empty)'}</span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="font-medium">{tag.currentValue}</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-gray-400">
                    Original: {tag.originalValue || '-'}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tag.currentValue}
                  onChange={(e) => onTagChange(tag.id, e.target.value)}
                  className="w-full text-xs bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:border-red-500 focus:outline-none"
                />

                {tag.isCustom && (
                  <button
                    onClick={() => onRemoveTag(tag.id)}
                    type="button"
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showAddForm ? (
        <form onSubmit={handleAddNewField} className="mt-4 p-3 rounded border border-gray-200 bg-gray-50 text-xs">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              type="text"
              placeholder="Label (e.g. Subject)"
              value={newTagLabel}
              onChange={(e) => setNewTagLabel(e.target.value)}
              className="bg-white border border-gray-300 rounded px-2 py-1.5 focus:border-red-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Value"
              value={newTagValue}
              onChange={(e) => setNewTagValue(e.target.value)}
              className="bg-white border border-gray-300 rounded px-2 py-1.5 focus:border-red-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-2.5 py-1 text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-gray-900 text-white rounded hover:bg-black"
            >
              Add
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-4 pt-3 flex items-center justify-between border-t border-gray-100 text-xs">
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Field</span>
          </button>

          <button
            type="button"
            onClick={onApplyChanges}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors"
          >
            Apply Changes
          </button>
        </div>
      )}
    </div>
  );
}
