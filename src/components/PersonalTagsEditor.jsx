import React, { useState } from 'react';
import { Plus, Trash2, ArrowRight, RotateCcw, Save } from 'lucide-react';

export default function PersonalTagsEditor({
  personalTags = [],
  onTagChange,
  onAddTag,
  onRemoveTag,
  onToggleRemoveTag,
  onApplyChanges,
  onHighlightItem,
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState('');
  const [newTagValue, setNewTagValue] = useState('');

  const handleRevertAll = () => {
    personalTags.forEach((tag) => {
      onTagChange?.(tag.id, tag.originalValue);
      if (tag.isRemoved) {
        onToggleRemoveTag?.(tag.id, false);
      }
    });
    onApplyChanges?.();
  };

  const handleAddNewField = (e) => {
    e.preventDefault();
    if (!newTagLabel.trim() || !newTagValue.trim()) return;

    onAddTag?.({
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

  const modifiedCount = personalTags.filter(
    (t) => t.currentValue !== t.originalValue || t.isRemoved
  ).length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-gray-100">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Document Metadata & Fields
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Modify document identifiers, author tags, and references, or click Remove to erase from the file.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            type="button"
            className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Field</span>
          </button>

          {modifiedCount > 0 && (
            <button
              onClick={handleRevertAll}
              type="button"
              className="px-2.5 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium rounded transition-colors cursor-pointer"
            >
              Revert ({modifiedCount})
            </button>
          )}

          <button
            onClick={onApplyChanges}
            type="button"
            className="flex items-center gap-1 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Apply</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {personalTags.map((tag) => {
          const isModified = tag.currentValue !== tag.originalValue && !tag.isRemoved;
          const isRemoved = !!tag.isRemoved;

          return (
            <div
              key={tag.id}
              onMouseEnter={() => onHighlightItem?.(tag.itemId || tag.id)}
              onMouseLeave={() => onHighlightItem?.(null)}
              className={`p-3 rounded border transition-colors ${
                isRemoved
                  ? 'border-gray-200 bg-gray-100/60 opacity-75'
                  : 'border-gray-200 bg-gray-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <span
                  className={`font-semibold ${
                    isRemoved ? 'line-through text-gray-400' : 'text-gray-700'
                  }`}
                >
                  {tag.label || tag.key}
                </span>

                {isRemoved ? (
                  <span className="text-[11px] text-red-600 font-medium">
                    Removed from Document
                  </span>
                ) : isModified ? (
                  <span className="flex items-center gap-1 text-[11px] text-red-600">
                    <span className="line-through text-gray-400">
                      {tag.originalValue || '(empty)'}
                    </span>
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
                  disabled={isRemoved}
                  value={isRemoved ? '' : tag.currentValue}
                  placeholder={isRemoved ? '(Erased / Removed)' : ''}
                  onChange={(e) => onTagChange(tag.id, e.target.value)}
                  className={`w-full text-xs bg-white border rounded px-2.5 py-1.5 focus:border-red-500 focus:outline-none ${
                    isRemoved
                      ? 'border-gray-200 bg-gray-100 text-gray-400 italic'
                      : 'border-gray-300 text-gray-900'
                  }`}
                />

                {isRemoved ? (
                  <button
                    onClick={() => onToggleRemoveTag?.(tag.id, false)}
                    type="button"
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium rounded transition-colors shrink-0 cursor-pointer"
                    title="Restore tag"
                  >
                    <RotateCcw className="w-3 h-3 text-gray-500" />
                    <span>Restore</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (tag.isCustom) {
                        onRemoveTag?.(tag.id);
                      } else {
                        onToggleRemoveTag?.(tag.id, true);
                      }
                    }}
                    type="button"
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-gray-200 hover:border-red-300 hover:text-red-600 text-gray-500 rounded transition-colors shrink-0 cursor-pointer"
                    title="Erase / Remove from document"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAddNewField}
          className="mt-4 p-3 rounded border border-gray-200 bg-gray-50 text-xs"
        >
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              type="text"
              placeholder="Field name (e.g. Version, Reviewer)"
              value={newTagLabel}
              onChange={(e) => setNewTagLabel(e.target.value)}
              className="bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:border-red-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Value"
              value={newTagValue}
              onChange={(e) => setNewTagValue(e.target.value)}
              className="bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:border-red-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-2.5 py-1 text-gray-600 hover:text-gray-900 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-red-600 text-white rounded font-medium cursor-pointer hover:bg-red-700"
            >
              Add Field
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
