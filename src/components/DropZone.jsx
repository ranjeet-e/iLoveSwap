import React, { useRef, useState } from 'react';
import { Upload, ShieldCheck } from 'lucide-react';
import { isWordDocument } from '../utils/docxParser';

export default function DropZone({
  onFilesSelected,
  isLoading,
  loadingStatus,
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const filterSupportedFiles = (fileList) => {
    return Array.from(fileList).filter((f) => {
      const name = f.name.toLowerCase();
      return (
        name.endsWith('.pdf') ||
        name.endsWith('.docx') ||
        name.endsWith('.doc') ||
        f.type === 'application/pdf' ||
        isWordDocument(f)
      );
    });
  };

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
      const valid = filterSupportedFiles(e.dataTransfer.files);
      if (valid.length > 0) {
        onFilesSelected(valid);
      }
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const valid = filterSupportedFiles(e.target.files);
      if (valid.length > 0) {
        onFilesSelected(valid);
      }
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="py-12 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf, .docx, .doc, application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Hero Title Section */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Edit, redact, and transform PDF and Word documents
        </h1>
        <p className="mt-3 text-base text-gray-500 leading-relaxed">
          100% free, private, and running entirely inside your browser.
        </p>
      </div>

      {/* Central iLovePDF-style Upload Target */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-12 border-2 border-dashed rounded-xl bg-white transition-all text-center shadow-xs ${
          isDragging
            ? 'border-red-600 bg-red-50/40'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <div className="flex flex-col items-center justify-center">
          <button
            onClick={triggerUpload}
            disabled={isLoading}
            type="button"
            className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-base rounded shadow-xs transition-colors cursor-pointer flex items-center gap-2.5"
          >
            <Upload className="w-5 h-5" />
            <span>Select PDF or Word files</span>
          </button>

          <p className="text-xs text-gray-500 mt-3 font-medium">
            or drop PDF or Word documents here
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] text-gray-400">
            <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-600 font-mono font-medium">PDF</span>
            <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-600 font-mono font-medium">DOCX</span>
            <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-600 font-mono font-medium">DOC</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero server uploads (100% Client-Side)</span>
            </span>
          </div>

          {isLoading && (
            <p className="mt-4 text-xs text-red-600 font-semibold animate-pulse">
              {loadingStatus || 'Processing documents in browser memory...'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
