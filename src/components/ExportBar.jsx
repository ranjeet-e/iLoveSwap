import React, { useState, useEffect } from 'react';
import {
  Download,
  FileDown,
  FileType,
  Edit3,
  Check,
  Sparkles,
  FileText,
  Copy,
} from 'lucide-react';

export default function ExportBar({
  onDownloadPdf,
  onDownloadDocx,
  defaultFileName,
  sections,
  isExporting,
}) {
  const [fileName, setFileName] = useState('');

  // Compute smart default name from detected/modified tags
  useEffect(() => {
    let nameVal = 'Student';
    let rollVal = 'Roll';
    let expVal = 'Exp1';

    if (sections?.personalTags) {
      sections.personalTags.forEach((tag) => {
        const k = (tag.key || tag.label || '').toLowerCase();
        if (k.includes('name')) nameVal = tag.currentValue.replace(/\s+/g, '_');
        if (k.includes('roll')) rollVal = tag.currentValue.replace(/\s+/g, '');
        if (k.includes('exp')) expVal = tag.currentValue.replace(/\s+/g, '_');
      });
    }

    const smartName = `${expVal}_Roll${rollVal}_${nameVal}`;
    setFileName(smartName);
  }, [sections]);

  const applyTemplate = (template) => {
    let nameVal = 'Student';
    let rollVal = '12';
    let expVal = 'Exp1';
    let divVal = 'Div';

    if (sections?.personalTags) {
      sections.personalTags.forEach((tag) => {
        const k = (tag.key || tag.label || '').toLowerCase();
        if (k.includes('name')) nameVal = tag.currentValue.replace(/\s+/g, '_');
        if (k.includes('roll')) rollVal = tag.currentValue.replace(/\s+/g, '');
        if (k.includes('exp')) expVal = tag.currentValue.replace(/\s+/g, '_');
        if (k.includes('div')) divVal = tag.currentValue.replace(/\s+/g, '');
      });
    }

    if (template === 'exp_roll_name') setFileName(`${expVal}_Roll${rollVal}_${nameVal}`);
    if (template === 'name_roll_div') setFileName(`${nameVal}_${rollVal}_${divVal}`);
    if (template === 'clean') setFileName(`iLoveSwap_Report_${rollVal}`);
  };

  return (
    <div className="fixed bottom-4 inset-x-4 sm:inset-x-8 z-40 max-w-7xl mx-auto pointer-events-none">
      <div className="glass-panel pointer-events-auto rounded-3xl border border-slate-200/90 shadow-2xl p-3.5 sm:p-4 transition-all">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3.5">
          {/* File Renaming Box */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-slate-100/90 hover:bg-slate-200/80 px-3.5 py-2 rounded-2xl border border-slate-200/80 transition-colors w-full sm:w-auto">
              <Edit3 className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="text-xs font-bold text-slate-500 shrink-0">
                Rename:
              </span>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Output File Name..."
                className="text-xs sm:text-sm font-extrabold text-slate-900 bg-transparent outline-hidden w-full sm:w-60"
              />
            </div>

            {/* Quick preset chips */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold">
              <button
                onClick={() => applyTemplate('exp_roll_name')}
                type="button"
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer border border-slate-200/60"
              >
                [Exp]_[Roll]_[Name]
              </button>
              <button
                onClick={() => applyTemplate('name_roll_div')}
                type="button"
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer border border-slate-200/60"
              >
                [Name]_[Roll]_[Div]
              </button>
            </div>
          </div>

          {/* Download Buttons (PDF & Word DOCX) */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            {/* Download as DOCX */}
            <button
              onClick={() => onDownloadDocx(fileName)}
              disabled={isExporting}
              type="button"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm text-blue-700 bg-blue-50/90 hover:bg-blue-100 active:scale-98 border border-blue-200/80 shadow-2xs transition-all cursor-pointer"
              title="Export complete document to editable Microsoft Word (.docx)"
            >
              <FileType className="w-4 h-4 text-blue-600" />
              <span>Download Word (.docx)</span>
            </button>

            {/* Download as PDF (Primary iLovePDF Red Button) */}
            <button
              onClick={() => onDownloadPdf(fileName)}
              disabled={isExporting}
              type="button"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-2xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 active:scale-98 shadow-lg shadow-red-600/30 transition-all cursor-pointer"
              title="Download modified PDF with all replaced tags & sections"
            >
              {isExporting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Download Modified PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
