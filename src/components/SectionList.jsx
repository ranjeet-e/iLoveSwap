import React, { useState } from 'react';
import {
  Building2,
  FlaskConical,
  HelpCircle,
  Code2,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Edit3,
  Search,
  Plus,
  ArrowRight,
  Copy,
  Check,
  Filter,
} from 'lucide-react';

export default function SectionList({
  sections,
  onSectionTextChange,
  onHighlightItem,
  onAddCustomReplacement,
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  const [openSections, setOpenSections] = useState({
    header: true,
    experiment: true,
    problem: true,
    code: true,
    output: false,
    conclusion: true,
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

  const handleCopyCode = (id, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 1500);
  };

  const sectionDefs = [
    {
      key: 'header',
      title: 'College & Institute Header',
      icon: <Building2 className="w-4 h-4 text-blue-600" />,
      items: sections.headerLines || [],
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'College name, trust, autonomous status, and department banner',
    },
    {
      key: 'experiment',
      title: 'Experiment Title & Aim',
      icon: <FlaskConical className="w-4 h-4 text-purple-600" />,
      items: sections.experimentSections || [],
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      description: 'Experiment number, lab topic, and aim/objectives',
    },
    {
      key: 'problem',
      title: 'Problem Statements & Questions',
      icon: <HelpCircle className="w-4 h-4 text-amber-600" />,
      items: sections.problemStatements || [],
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      description: 'Lab questions (Problem N0-1, N0-2, N0-3, For Q1, etc.)',
    },
    {
      key: 'code',
      title: 'Program Code Chunks (MATLAB / Script)',
      icon: <Code2 className="w-4 h-4 text-emerald-600" />,
      items: sections.codeBlocks || [],
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'Reference code, scripts, MATLAB/Python code lines',
      isCode: true,
    },
    {
      key: 'output',
      title: 'Outputs & Plot Titles',
      icon: <BarChart3 className="w-4 h-4 text-sky-600" />,
      items: sections.outputSections || [],
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
      description: 'Output headers, MATLAB plot titles, and graphical results',
    },
    {
      key: 'conclusion',
      title: 'Conclusion & Results',
      icon: <CheckCircle2 className="w-4 h-4 text-teal-600" />,
      items: sections.conclusionLines || [],
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      description: 'Execution outcome, teacher remarks, and conclusion statements',
    },
  ];

  const totalLines = sectionDefs.reduce((acc, s) => acc + s.items.length, 0);

  // Filter sections based on category and search query
  const filteredSections = sectionDefs.filter((sec) => {
    if (activeCategory !== 'all' && sec.key !== activeCategory) return false;
    if (!searchQuery) return sec.items.length > 0;
    return sec.items.some((item) =>
      (item.currentText || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 mt-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Bifurcated Document Sections
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
              {totalLines} Items
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Modify any header, problem statement, MATLAB code line, or conclusion below.
          </p>
        </div>

        {/* In-page search filter */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search text in sections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-red-500 outline-hidden w-full sm:w-56"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 text-xs font-bold no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeCategory === 'all'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All ({totalLines})
        </button>

        {sectionDefs.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setActiveCategory(s.key)}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeCategory === s.key
                ? 'bg-red-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>{s.title.split(' ')[0]}</span>
            <span className="opacity-70 text-[10px]">({s.items.length})</span>
          </button>
        ))}
      </div>

      {/* Accordion Sections */}
      <div className="space-y-3.5">
        {filteredSections.map((sec) => {
          const isOpen = openSections[sec.key];
          const displayItems = searchQuery
            ? sec.items.filter((item) =>
                (item.currentText || '').toLowerCase().includes(searchQuery.toLowerCase())
              )
            : sec.items;

          if (displayItems.length === 0) return null;

          return (
            <div
              key={sec.key}
              className="border border-slate-200/90 rounded-2xl overflow-hidden transition-all bg-white shadow-2xs"
            >
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => toggleSection(sec.key)}
                className="w-full px-4 sm:px-5 py-3.5 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="p-1.5 rounded-xl bg-white shadow-2xs border border-slate-200/80">
                    {sec.icon}
                  </span>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">
                      {sec.title}
                    </span>
                    <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-md border text-slate-500 bg-white shadow-2xs">
                      {displayItems.length} lines
                    </span>
                  </div>
                </div>

                <div className="text-slate-400">
                  {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>
              </button>

              {/* Accordion Content */}
              {isOpen && (
                <div className="p-4 space-y-2.5 bg-white border-t border-slate-100">
                  <p className="text-[11px] text-slate-400 mb-2">{sec.description}</p>

                  {displayItems.map((item, idx) => {
                    const isModified = item.currentText !== item.originalText;

                    return (
                      <div
                        key={item.id}
                        onMouseEnter={() => onHighlightItem?.(item.itemId || item.id)}
                        onMouseLeave={() => onHighlightItem?.(null)}
                        className={`p-3 rounded-xl border transition-all ${
                          isModified
                            ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-400/20'
                            : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-1.5">
                          <span className="flex items-center gap-1.5">
                            <span className="bg-slate-200/70 text-slate-600 px-1.5 py-0.5 rounded">
                              Line #{idx + 1}
                            </span>
                            <span>Page {item.pageNum || 1}</span>
                          </span>

                          <div className="flex items-center gap-2">
                            {isModified && (
                              <span className="text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-md text-[10px]">
                                Modified
                              </span>
                            )}
                            {sec.isCode && (
                              <button
                                type="button"
                                onClick={() => handleCopyCode(item.id, item.currentText)}
                                className="text-slate-400 hover:text-slate-700 p-0.5"
                                title="Copy code"
                              >
                                {copiedCodeId === item.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {sec.isCode ? (
                          <div className="relative font-mono bg-slate-900 text-emerald-400 rounded-lg p-2.5 text-xs flex items-center border border-slate-800">
                            <span className="text-slate-500 mr-2 select-none">$</span>
                            <input
                              type="text"
                              value={item.currentText}
                              onChange={(e) => onSectionTextChange(item.id, e.target.value)}
                              className="w-full bg-transparent text-emerald-400 outline-hidden font-mono"
                            />
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={item.currentText}
                            onChange={(e) => onSectionTextChange(item.id, e.target.value)}
                            className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-hidden shadow-2xs"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Global Find & Replace Card */}
        <div className="border border-dashed border-slate-300 rounded-2xl p-5 bg-gradient-to-br from-slate-50 to-white shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-4 h-4 text-slate-700" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Universal Find & Replace in PDF
            </h4>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">
            Want to replace any word or phrase anywhere in the document?
          </p>

          <form onSubmit={handleCustomReplaceSubmit} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              placeholder="Find text (e.g. TEJAS)"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              className="text-xs flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 outline-hidden focus:border-red-500 shadow-2xs"
            />
            <input
              type="text"
              placeholder="Replace with (e.g. ranjeet)"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              className="text-xs flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 outline-hidden focus:border-red-500 shadow-2xs"
            />
            <button
              type="submit"
              className="text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              Replace in PDF
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
