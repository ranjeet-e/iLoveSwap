import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Trash2, RotateCcw, Plus } from 'lucide-react';

export default function SectionList({
  sections = {},
  onSectionTextChange,
  onToggleRemoveItem,
  onHighlightItem,
  onAddCustomReplacement,
}) {
  const [openSections, setOpenSections] = useState({
    header: false,
    experiment: false,
    problem: true,
    code: false,
    output: false,
    conclusion: false,
    other: false,
  });

  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  const [newCustomLine, setNewCustomLine] = useState('');
  const [newCustomPage, setNewCustomPage] = useState(1);
  const [showAddCustom, setShowAddCustom] = useState(false);

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCustomReplaceSubmit = (e) => {
    e.preventDefault();
    if (!findText.trim() || !replaceText.trim()) return;
    onAddCustomReplacement({
      findText: findText.trim(),
      replaceWith: replaceText.trim(),
    });
    setFindText('');
    setReplaceText('');
  };

  const handleAddCustomLineSubmit = (e) => {
    e.preventDefault();
    if (!newCustomLine.trim()) return;
    onAddCustomReplacement({
      findText: '',
      replaceWith: newCustomLine.trim(),
      pageIndex: Math.max(0, parseInt(newCustomPage, 10) - 1 || 0),
      x: 70,
      y: 650,
      fontSize: 11,
    });
    setNewCustomLine('');
    setShowAddCustom(false);
  };

  const sectionDefs = [
    {
      key: 'header',
      title: 'Headers & Organization Details',
      items: sections.headerLines || [],
    },
    {
      key: 'experiment',
      title: 'Document Titles & Headings',
      items: sections.experimentSections || [],
    },
    {
      key: 'problem',
      title: 'Questions & Problem Statements',
      items: sections.problemStatements || [],
    },
    {
      key: 'code',
      title: 'Code Blocks & Listings',
      items: sections.codeBlocks || [],
      isCode: true,
    },
    {
      key: 'output',
      title: 'Output Captions & Figures',
      items: sections.outputSections || [],
    },
    {
      key: 'conclusion',
      title: 'Conclusions & Remarks',
      items: sections.conclusionLines || [],
    },
    {
      key: 'other',
      title: 'Body Text & Paragraphs',
      items: sections.otherLines || [],
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 mt-5">
      <div className="pb-3 mb-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Document Sections & Lines
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Edit text directly or click Remove to erase any line from the PDF.
          </p>
        </div>

        <button
          onClick={() => setShowAddCustom(!showAddCustom)}
          type="button"
          className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Insert Text</span>
        </button>
      </div>

      {showAddCustom && (
        <form
          onSubmit={handleAddCustomLineSubmit}
          className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded text-xs space-y-2"
        >
          <p className="font-semibold text-gray-800">Insert Custom Line on PDF</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Text to insert (e.g. Approved / Reviewed / Confidential)..."
              value={newCustomLine}
              onChange={(e) => setNewCustomLine(e.target.value)}
              className="flex-1 bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:border-red-500 focus:outline-none"
            />
            <input
              type="number"
              min="1"
              max="20"
              title="Page number"
              value={newCustomPage}
              onChange={(e) => setNewCustomPage(e.target.value)}
              className="w-16 bg-white border border-gray-300 rounded px-2 py-1.5 focus:border-red-500 focus:outline-none text-center"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors"
            >
              Insert
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {sectionDefs.map((sec) => {
          if (!sec.items || sec.items.length === 0) return null;
          const isOpen = openSections[sec.key];
          const removedCount = sec.items.filter((i) => i.isRemoved).length;
          const modifiedCount = sec.items.filter(
            (i) => i.currentText !== i.originalText && !i.isRemoved
          ).length;

          return (
            <div key={sec.key} className="border border-gray-200 rounded text-xs">
              <button
                type="button"
                onClick={() => toggleSection(sec.key)}
                className="w-full px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100/70 flex items-center justify-between transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">
                    {sec.title} ({sec.items.length})
                  </span>
                  {removedCount > 0 && (
                    <span className="text-[10px] text-red-600 font-medium">
                      ({removedCount} removed)
                    </span>
                  )}
                  {modifiedCount > 0 && (
                    <span className="text-[10px] text-blue-600 font-medium">
                      ({modifiedCount} edited)
                    </span>
                  )}
                </div>
                <span className="text-gray-400">
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </span>
              </button>

              {isOpen && (
                <div className="p-3 space-y-2.5 bg-white border-t border-gray-200 max-h-96 overflow-y-auto">
                  {sec.items.map((item) => {
                    const isRemoved = !!item.isRemoved;
                    const isModified =
                      item.currentText !== item.originalText && !isRemoved;

                    return (
                      <div
                        key={item.id}
                        onMouseEnter={() => onHighlightItem?.(item.itemId || item.id)}
                        onMouseLeave={() => onHighlightItem?.(null)}
                        className={`p-2.5 border rounded transition-colors ${
                          isRemoved
                            ? 'border-gray-200 bg-gray-100/60 opacity-75'
                            : 'border-gray-200 bg-gray-50/30'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5">
                          <span>Page {item.pageNum || 1}</span>
                          {isRemoved ? (
                            <span className="text-red-600 font-medium">
                              Removed from PDF
                            </span>
                          ) : isModified ? (
                            <span className="text-blue-600 font-medium">
                              Modified
                            </span>
                          ) : null}
                        </div>

                        <div className="flex items-start gap-2">
                          {sec.isCode ? (
                            <textarea
                              disabled={isRemoved}
                              rows={2}
                              value={isRemoved ? '' : item.currentText}
                              placeholder={isRemoved ? '(Erased / Removed)' : ''}
                              onChange={(e) =>
                                onSectionTextChange(item.id, e.target.value)
                              }
                              className={`flex-1 text-xs bg-white border rounded px-2.5 py-1.5 font-mono focus:border-red-500 focus:outline-none resize-y ${
                                isRemoved
                                  ? 'border-gray-200 bg-gray-100 text-gray-400 italic'
                                  : 'border-gray-300 text-gray-900'
                              }`}
                            />
                          ) : (
                            <input
                              type="text"
                              disabled={isRemoved}
                              value={isRemoved ? '' : item.currentText}
                              placeholder={isRemoved ? '(Erased / Removed)' : ''}
                              onChange={(e) =>
                                onSectionTextChange(item.id, e.target.value)
                              }
                              className={`flex-1 text-xs bg-white border rounded px-2.5 py-1.5 focus:border-red-500 focus:outline-none ${
                                isRemoved
                                  ? 'border-gray-200 bg-gray-100 text-gray-400 italic'
                                  : 'border-gray-300 text-gray-900'
                              }`}
                            />
                          )}

                          {isRemoved ? (
                            <button
                              type="button"
                              onClick={() => onToggleRemoveItem?.(item.id, false)}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium rounded transition-colors shrink-0"
                              title="Restore line"
                            >
                              <RotateCcw className="w-3 h-3 text-gray-500" />
                              <span>Restore</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onToggleRemoveItem?.(item.id, true)}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-gray-200 hover:border-red-300 hover:text-red-600 text-gray-500 rounded transition-colors shrink-0"
                              title="Remove / Erase line from PDF"
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
              )}
            </div>
          );
        })}

        {/* Global Find & Replace */}
        <div className="border border-gray-200 rounded p-3 bg-gray-50 text-xs mt-3">
          <p className="font-medium text-gray-800 mb-2">Find & Replace Across Document</p>
          <form onSubmit={handleCustomReplaceSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Find text..."
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              className="flex-1 bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:border-red-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Replace with..."
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              className="flex-1 bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:border-red-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white font-medium rounded transition-colors"
            >
              Replace
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
