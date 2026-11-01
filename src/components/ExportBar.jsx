import React, { useState, useEffect } from 'react';
import { Download, FileText } from 'lucide-react';

export default function ExportBar({
  onDownloadPdf,
  onDownloadDocx,
  defaultFileName,
  sections,
  isExporting,
}) {
  const [fileName, setFileName] = useState('');

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

    setFileName(`${expVal}_Roll${rollVal}_${nameVal}`);
  }, [sections]);

  return (
    <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 py-3 px-4 sm:px-8 z-40">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-gray-500 font-medium">File name:</span>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="border border-gray-300 rounded px-2.5 py-1.5 font-medium text-gray-900 w-full sm:w-64 focus:border-red-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => onDownloadDocx(fileName)}
            disabled={isExporting}
            type="button"
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            Download Word (.docx)
          </button>

          <button
            onClick={() => onDownloadPdf(fileName)}
            disabled={isExporting}
            type="button"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
          >
            {isExporting ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
