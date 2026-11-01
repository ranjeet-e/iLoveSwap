import React, { useRef } from 'react';
import { Plus, X, Layers, ShieldCheck } from 'lucide-react';

export default function DocumentTabs({
  documents = [],
  activeDocIndex = 0,
  onSelectDoc,
  onRemoveDoc,
  onAddFiles,
  onApplyFixedToAll,
  hasFixedIdentity,
  isLoading,
}) {
  const fileInputRef = useRef(null);

  const handleFiles = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const pdfs = Array.from(e.target.files).filter(
        (f) => f.type === 'application/pdf' || f.name.endsWith('.pdf')
      );
      if (pdfs.length > 0) {
        onAddFiles?.(pdfs);
      }
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 mb-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 mb-2.5 border-b border-gray-100 text-xs">
        <div className="flex items-center gap-2 text-gray-700">
          <Layers className="w-4 h-4 text-gray-500" />
          <span className="font-semibold">
            {documents.length} {documents.length === 1 ? 'Document' : 'Documents'} Loaded
          </span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-500">
            Click a document tab to view and edit
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasFixedIdentity && documents.length > 1 && (
            <button
              onClick={onApplyFixedToAll}
              disabled={isLoading}
              type="button"
              className="flex items-center gap-1 px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors text-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Apply Fixed Identity to All</span>
            </button>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded transition-colors text-xs"
          >
            <Plus className="w-3.5 h-3.5 text-gray-500" />
            <span>Add PDF</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={handleFiles}
          />
        </div>
      </div>

      {/* Document Chips / Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {documents.map((doc, idx) => {
          const isActive = idx === activeDocIndex;
          const isModified = doc.sections?.personalTags?.some(
            (t) => t.currentValue !== t.originalValue
          );

          return (
            <div
              key={doc.id || idx}
              onClick={() => onSelectDoc(idx)}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded border cursor-pointer select-none transition-colors shrink-0 ${
                isActive
                  ? 'bg-white border-gray-900 text-gray-950 font-semibold'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="text-[11px] text-gray-400 font-mono">
                {idx + 1}.
              </span>
              <span className="truncate max-w-[160px]" title={doc.fileName}>
                {doc.fileName}
              </span>

              {isModified && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" title="Modified" />
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveDoc(idx);
                }}
                className="text-gray-400 hover:text-red-600 p-0.5 rounded transition-colors"
                title="Remove document"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
