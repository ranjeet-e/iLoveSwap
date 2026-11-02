import React, { useEffect } from 'react';
import { X, Check } from 'lucide-react';

export default function NotificationToast({ changes = [], onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed top-16 right-4 z-50 max-w-sm w-full">
      <div className="bg-white rounded border border-gray-300 p-3 shadow-sm text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-800 font-medium">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Changes applied</span>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {changes.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-100 text-[11px] text-gray-600 space-y-1">
            {changes.slice(0, 3).map((ch, idx) => (
              <div key={idx} className="truncate">
                <span className="font-medium text-gray-700">{ch.label}:</span>{' '}
                <span className="line-through text-gray-400">{ch.from}</span> &rarr; {ch.to}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
