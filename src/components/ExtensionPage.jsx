import React, { useState } from 'react';
import { Download, Puzzle, CheckCircle, ArrowLeft, Shield, Zap, Sparkles } from 'lucide-react';
import { downloadExtensionZip } from '../utils/extensionDownloader';

export default function ExtensionPage({ onBackToHome }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadExtensionZip();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to bundle extension zip:', err);
      alert('Could not download extension zip: ' + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      <div className="mb-6">
        <button
          onClick={onBackToHome}
          type="button"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Tools</span>
        </button>
      </div>

      {/* Main Extension Banner */}
      <div className="bg-white border border-gray-200 rounded-lg p-8 sm:p-10 text-center mb-8">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Puzzle className="w-6 h-6" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          iLoveSwap for Google Chrome
        </h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl mx-auto">
          Process PDFs and Word documents directly inside your browser. Works completely offline with zero data uploads.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            type="button"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded shadow-sm transition-colors cursor-pointer w-full sm:w-auto"
          >
            <Download className="w-4 h-4" />
            <span>
              {isDownloading
                ? 'Packaging Extension...'
                : downloadSuccess
                ? 'Extension Downloaded!'
                : 'Download Extension (.zip)'}
            </span>
          </button>
        </div>

        {downloadSuccess && (
          <p className="mt-3 text-xs text-emerald-600 font-medium flex items-center justify-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>ZIP downloaded. Follow the 3 steps below to load it into Chrome.</span>
          </p>
        )}
      </div>

      {/* 3 Step Setup Guide */}
      <div className="mb-10">
        <h2 className="text-base font-bold text-gray-900 mb-4 text-center sm:text-left">
          How to install the extension in 3 steps
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="w-7 h-7 rounded bg-gray-900 text-white font-bold text-xs flex items-center justify-center mb-3">
              1
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Extract the ZIP
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Click the button above to download <code className="bg-gray-100 px-1 py-0.5 rounded text-[11px] font-mono">iLoveSwap-Chrome-Extension.zip</code> and unzip it to a folder on your computer.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="w-7 h-7 rounded bg-gray-900 text-white font-bold text-xs flex items-center justify-center mb-3">
              2
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Open Extensions
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              In Google Chrome, navigate to <code className="bg-gray-100 px-1 py-0.5 rounded text-[11px] font-mono">chrome://extensions</code> and turn <b>ON</b> the <b>Developer mode</b> switch in the top-right corner.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="w-7 h-7 rounded bg-gray-900 text-white font-bold text-xs flex items-center justify-center mb-3">
              3
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Click Load Unpacked
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Click the <b>Load unpacked</b> button in the top-left corner and select the extracted folder. The iLoveSwap icon is now ready in your toolbar!
            </p>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-200 pt-6 text-xs text-gray-600">
        <div className="flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-gray-900 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-900">100% Private & Local</p>
            <p className="text-gray-500 mt-0.5">Operates entirely in-browser. Zero server uploads.</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Zap className="w-4 h-4 text-gray-900 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-900">Instant Access</p>
            <p className="text-gray-500 mt-0.5">Click the extension icon anytime to bifurcate or edit.</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-gray-900 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-900">Dual PDF & Word</p>
            <p className="text-gray-500 mt-0.5">Compatible with both PDF and Word (.docx) files.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
