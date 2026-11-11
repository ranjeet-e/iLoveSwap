import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 text-xs text-gray-500 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="font-black text-gray-900 tracking-tight text-sm">
            iLove<span className="text-red-600">Swap</span>
          </span>
          <span className="text-gray-500 font-normal text-xs">
            by ranjeet epili
          </span>
        </div>

        <div className="text-[11px] text-gray-400">
          100% Client-Side. No files ever leave your device.
        </div>
      </div>
    </footer>
  );
}
