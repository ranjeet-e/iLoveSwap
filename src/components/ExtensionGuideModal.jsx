import React from 'react';
import { X } from 'lucide-react';

export default function ExtensionGuideModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 border border-gray-200">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Install Extension
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Run iLoveSwap directly in Chromium browsers
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 my-4 text-xs text-gray-600">
          <div className="p-3 rounded border border-gray-200 bg-gray-50">
            <p className="font-semibold text-gray-800">1. Open Extensions</p>
            <p className="text-gray-500 mt-0.5">
              Go to <code className="bg-white px-1 py-0.5 rounded border border-gray-300 font-mono text-[11px]">chrome://extensions</code>
            </p>
          </div>

          <div className="p-3 rounded border border-gray-200 bg-gray-50">
            <p className="font-semibold text-gray-800">2. Enable Developer Mode</p>
            <p className="text-gray-500 mt-0.5">
              Turn on the Developer mode toggle in the top-right corner.
            </p>
          </div>

          <div className="p-3 rounded border border-gray-200 bg-gray-50">
            <p className="font-semibold text-gray-800">3. Load Unpacked</p>
            <p className="text-gray-500 mt-0.5">
              Click <b>Load unpacked</b> and select the project or build folder.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white font-medium text-xs rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
