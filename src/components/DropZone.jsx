import React, { useRef, useState } from 'react';
import { Upload, FileText } from 'lucide-react';

export default function DropZone({
  onFileSelected,
  onLoadSample,
  isLoading,
  fixedIdentity,
  onOpenFixedIdentityModal,
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        onFileSelected(file);
      }
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
          PDF Section & Identity Editor
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Upload a lab manual or report to extract sections, edit personal tags, and export.
        </p>
      </div>

      {fixedIdentity?.name && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded text-xs flex items-center justify-between text-gray-700">
          <span>
            Fixed Identity: <b>{fixedIdentity.name}</b> (Roll {fixedIdentity.rollNo || '-'}, {fixedIdentity.division || '-'})
          </span>
          <button
            type="button"
            onClick={onOpenFixedIdentityModal}
            className="text-red-600 hover:underline"
          >
            Edit
          </button>
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
          isDragging ? 'border-red-500 bg-red-50/20' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileInputChange}
        />

        <div className="flex flex-col items-center justify-center">
          <Upload className="w-8 h-8 text-gray-400 mb-3" />
          <p className="text-sm font-medium text-gray-800">
            Drag and drop your PDF here
          </p>
          <p className="text-xs text-gray-500 mt-1 mb-5">
            Supported format: PDF
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              type="button"
              className="px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
            >
              Select PDF
            </button>

            <span className="text-xs text-gray-400">or</span>

            <button
              onClick={onLoadSample}
              disabled={isLoading}
              type="button"
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded transition-colors"
            >
              Load Sample Document
            </button>
          </div>

          {isLoading && (
            <p className="mt-4 text-xs text-red-600 font-medium">
              Processing document...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
