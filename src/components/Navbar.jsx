import React from 'react';
import { FileText, RefreshCw, Puzzle, Shield } from 'lucide-react';

export default function Navbar({
  onLoadSample,
  onReset,
  onOpenGuide,
  onOpenFixedIdentity,
  fixedIdentity,
  hasDocument,
  fileName,
  sectionsCount,
  numPages,
}) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-tight text-gray-900">
            iLove<span className="text-red-600">Swap</span>
          </span>

          {hasDocument && (
            <span className="hidden sm:inline text-xs text-gray-500 border-l border-gray-200 pl-3 truncate max-w-xs">
              {fileName} ({numPages} {numPages === 1 ? 'page' : 'pages'})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={onOpenFixedIdentity}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-gray-600" />
            <span>{fixedIdentity?.name ? `Identity: ${fixedIdentity.name}` : 'Fixed Identity'}</span>
          </button>

          <button
            onClick={onLoadSample}
            type="button"
            className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Load Sample
          </button>

          {hasDocument && (
            <button
              onClick={onReset}
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={onOpenGuide}
            type="button"
            className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Puzzle className="w-3.5 h-3.5" />
            <span>Extension</span>
          </button>
        </div>
      </div>
    </header>
  );
}
