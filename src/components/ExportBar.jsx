import React, { useState, useEffect } from 'react';
import { FileArchive } from 'lucide-react';

export default function ExportBar({
  onDownloadPdf,
  onDownloadDocx,
  onDownloadAllZip,
  totalDocs = 1,
  defaultFileName,
  sections,
  isExporting,
}) {
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    let nameVal = '';
    let idVal = '';
    let titleVal = '';

    if (sections?.personalTags) {
      sections.personalTags.forEach((tag) => {
        const k = (tag.key || tag.label || '').toLowerCase();
        if ((k.includes('author') || k.includes('name')) && tag.currentValue) {
          nameVal = tag.currentValue.replace(/\s+/g, '_');
        }
        if ((k.includes('ref') || k.includes('id') || k.includes('code')) && tag.currentValue) {
          idVal = tag.currentValue.replace(/\s+/g, '');
        }
        if ((k.includes('title') || k.includes('subject') || k.includes('doc')) && tag.currentValue) {
          titleVal = tag.currentValue.replace(/\s+/g, '_');
        }
      });
    }

    if (defaultFileName) {
      const base = defaultFileName.replace(/\.(pdf|docx?)$/i, '');
      if (nameVal && idVal) {
        setFileName(`${base}_${nameVal}_${idVal}`);
      } else if (nameVal) {
        setFileName(`${base}_${nameVal}`);
      } else {
        setFileName(`${base}_Modified`);
      }
    } else if (titleVal) {
      setFileName(`${titleVal}_Modified`);
    } else {
      setFileName('Document_Modified');
    }
  }, [sections, defaultFileName]);

  return (
    <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 py-3 px-4 sm:px-8 z-40">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-gray-500 font-medium shrink-0">Current file:</span>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="border border-gray-300 rounded px-2.5 py-1.5 font-medium text-gray-900 w-full sm:w-64 focus:border-red-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          <button
            onClick={() => onDownloadDocx(fileName)}
            disabled={isExporting}
            type="button"
            className="px-3.5 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            Download Word (.docx)
          </button>

          <button
            onClick={() => onDownloadPdf(fileName)}
            disabled={isExporting}
            type="button"
            className={`px-3.5 py-1.5 rounded font-medium transition-colors ${
              totalDocs > 1
                ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isExporting ? 'Generating...' : totalDocs > 1 ? 'Download Current PDF' : 'Download PDF'}
          </button>

          {totalDocs > 1 && (
            <button
              onClick={onDownloadAllZip}
              disabled={isExporting}
              type="button"
              className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
            >
              <FileArchive className="w-3.5 h-3.5" />
              <span>Download All {totalDocs} (.zip)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
