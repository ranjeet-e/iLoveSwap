import React from 'react';
import { Download, RefreshCw, Puzzle } from 'lucide-react';

export default function Navbar({
  onReset,
  onDownloadExtension,
  onOpenExtensionPage,
  hasDocument,
  fileName,
  totalDocs = 1,
  numPages,
}) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & beside-logo attribution */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            onClick={onReset}
            className="flex items-baseline gap-2.5 cursor-pointer group"
          >
            <span className="text-2xl font-black tracking-tight text-gray-900 group-hover:text-black transition-colors">
              iLove<span className="text-red-600">Swap</span>
            </span>
            <span className="text-xs text-gray-500 font-normal tracking-normal">
              by ranjeet epili
            </span>
          </div>
        </div>

        {/* Center: intentionally empty (middle nav removed per user request) */}

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5 text-xs">
          {hasDocument && (
            <div className="hidden sm:flex items-center text-xs text-gray-500 mr-2 max-w-[220px] truncate">
              <span className="truncate font-medium text-gray-800">
                {totalDocs > 1 ? `${totalDocs} docs loaded` : fileName}
              </span>
              {numPages && (
                <span className="text-gray-400 ml-1">({numPages}p)</span>
              )}
            </div>
          )}

          {/* Option to view/download extension */}
          <button
            onClick={onOpenExtensionPage}
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded font-medium transition-colors cursor-pointer"
            title="View Chrome Extension Setup & Features"
          >
            <Puzzle className="w-3.5 h-3.5 text-gray-600" />
            <span className="hidden sm:inline">Extension Guide</span>
            <span className="sm:hidden">Extension</span>
          </button>

          <button
            onClick={onDownloadExtension}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition-colors cursor-pointer shadow-xs"
            title="Download iLoveSwap Chrome Extension as ZIP"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download Extension</span>
            <span className="sm:hidden">ZIP</span>
          </button>

          {hasDocument && (
            <button
              onClick={onReset}
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium transition-colors cursor-pointer ml-1"
              title="Close files and return to home"
            >
              <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
              <span>Close</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
