import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';

export default function SectionList({
  sections,
  onSectionTextChange,
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
  });

  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

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

  const sectionDefs = [
    {
      key: 'header',
      title: 'Header & Institution',
      items: sections.headerLines || [],
    },
    {
      key: 'experiment',
      title: 'Experiment & Aim',
      items: sections.experimentSections || [],
    },
    {
      key: 'problem',
      title: 'Problems & Questions',
      items: sections.problemStatements || [],
    },
    {
      key: 'code',
      title: 'Code Blocks',
      items: sections.codeBlocks || [],
      isCode: true,
    },
    {
      key: 'output',
      title: 'Output Captions',
      items: sections.outputSections || [],
    },
    {
      key: 'conclusion',
      title: 'Conclusion',
      items: sections.conclusionLines || [],
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 mt-5">
      <div className="pb-3 mb-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">
          Document Sections
        </h3>
        <span className="text-xs text-gray-400">
          Click any section to expand
        </span>
      </div>

      <div className="space-y-2">
        {sectionDefs.map((sec) => {
          if (sec.items.length === 0) return null;
          const isOpen = openSections[sec.key];

          return (
            <div key={sec.key} className="border border-gray-200 rounded text-xs">
              <button
                type="button"
                onClick={() => toggleSection(sec.key)}
                className="w-full px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100/70 flex items-center justify-between transition-colors text-left"
              >
                <span className="font-medium text-gray-800">
                  {sec.title} ({sec.items.length})
                </span>
                <span className="text-gray-400">
                  {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </span>
              </button>

              {isOpen && (
                <div className="p-3 space-y-2 bg-white border-t border-gray-200">
                  {sec.items.map((item, idx) => (
                    <div
                      key={item.id}
                      onMouseEnter={() => onHighlightItem?.(item.itemId || item.id)}
                      onMouseLeave={() => onHighlightItem?.(null)}
                      className="p-2 border border-gray-200 rounded bg-gray-50/30"
                    >
                      <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                        <span>Page {item.pageNum || 1}</span>
                        {item.currentText !== item.originalText && (
                          <span className="text-red-600 font-medium">Modified</span>
                        )}
                      </div>

                      <input
                        type="text"
                        value={item.currentText}
                        onChange={(e) => onSectionTextChange(item.id, e.target.value)}
                        className={`w-full text-xs bg-white border border-gray-300 rounded px-2.5 py-1.5 focus:border-red-500 focus:outline-none ${
                          sec.isCode ? 'font-mono' : ''
                        }`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div className="border border-gray-200 rounded p-3 bg-gray-50 text-xs mt-3">
          <p className="font-medium text-gray-800 mb-2">Find & Replace</p>
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
