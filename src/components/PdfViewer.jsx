import React, { useEffect, useRef, useState } from 'react';
import { pdfjsLib, clonePdfBytes } from '../utils/pdfSetup.js';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  Layers,
  Sparkles,
  FileText,
  CheckCircle2,
  Minimize2,
} from 'lucide-react';

export default function PdfViewer({
  pdfBuffer,
  originalPdfBuffer,
  highlightedItemId,
  sections,
  currentPage,
  onPageChange,
  numPages,
  showOverlays = true,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1.15);
  const [isRendering, setIsRendering] = useState(false);
  const [viewportDims, setViewportDims] = useState({ width: 595, height: 842 });
  const [pdfDoc, setPdfDoc] = useState(null);
  const [viewMode, setViewMode] = useState('modified'); // 'modified' or 'original'

  const activeBuffer = viewMode === 'original' && originalPdfBuffer ? originalPdfBuffer : pdfBuffer;

  // Load PDF document in pdfjs
  useEffect(() => {
    if (!activeBuffer) return;
    let isCancelled = false;

    const loadDoc = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({
          data: clonePdfBytes(activeBuffer),
        });
        const doc = await loadingTask.promise;
        if (!isCancelled) {
          setPdfDoc(doc);
        }
      } catch (err) {
        console.error('Error loading pdf in viewer:', err);
      }
    };

    loadDoc();
    return () => {
      isCancelled = true;
    };
  }, [activeBuffer]);

  // Render current page to canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    let renderTask = null;
    let isCancelled = false;

    const renderPage = async () => {
      try {
        setIsRendering(true);
        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale });
        setViewportDims({ width: viewport.width, height: viewport.height });

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // High DPI canvas support
        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        context.scale(pixelRatio, pixelRatio);

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        renderTask = page.render(renderContext);
        await renderTask.promise;
      } catch (err) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('Error rendering page:', err);
        }
      } finally {
        if (!isCancelled) {
          setIsRendering(false);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, currentPage, scale]);

  // Collect overlay items for current page
  const pageOverlays = [];
  if (showOverlays && sections && viewMode === 'modified') {
    // 1. Personal tags
    if (sections.personalTags) {
      sections.personalTags.forEach((tag) => {
        if (tag.pageNum === currentPage) {
          const isModified = tag.currentValue !== tag.originalValue;
          pageOverlays.push({
            id: tag.itemId || tag.id,
            type: 'personal',
            label: tag.label || tag.key,
            text: isModified ? `${tag.prefix || ''}${tag.currentValue}` : tag.fullOriginalText,
            isModified,
            x: tag.x,
            y: tag.y,
            width: tag.width,
            height: tag.height,
            fontSize: tag.fontSize || 12,
            pdfPageHeight: 841.89,
          });
        }
      });
    }

    // 2. Experiment / Header / Conclusion lines if on this page
    const checkGroup = (group, type) => {
      if (!group) return;
      group.forEach((item) => {
        if (item.pageNum === currentPage && item.currentText !== item.originalText) {
          pageOverlays.push({
            id: item.itemId || item.id,
            type,
            text: item.currentText,
            isModified: true,
            x: item.x,
            y: item.y,
            width: item.width,
            height: item.height,
            fontSize: item.fontSize || 11,
            pdfPageHeight: 841.89,
          });
        }
      });
    };

    checkGroup(sections.experimentSections, 'experiment');
    checkGroup(sections.problemStatements, 'problem');
    checkGroup(sections.conclusionLines, 'conclusion');
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-5 flex flex-col h-full">
      {/* Viewer Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 mb-3 border-b border-slate-100 text-xs">
        {/* View Mode Toggle: Modified vs Original */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode('modified')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'modified'
                ? 'bg-white text-red-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modified View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('original')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'original'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Original PDF</span>
          </button>
        </div>

        {/* Page Switcher & Zoom */}
        <div className="flex items-center gap-2">
          {/* Page Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shadow-2xs">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              type="button"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-800 px-2 min-w-[65px] text-center text-xs">
              {currentPage} / {numPages || 1}
            </span>
            <button
              onClick={() => onPageChange(Math.min(numPages || 1, currentPage + 1))}
              disabled={currentPage >= (numPages || 1)}
              type="button"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shadow-2xs">
            <button
              onClick={() => setScale((s) => Math.max(0.65, s - 0.15))}
              type="button"
              className="p-1.5 rounded-lg text-slate-600 hover:bg-white cursor-pointer transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-700 px-1.5 min-w-[42px] text-center text-[11px]">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale((s) => Math.min(2.2, s + 0.15))}
              type="button"
              className="p-1.5 rounded-lg text-slate-600 hover:bg-white cursor-pointer transition-all"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Page Thumbnails Bar */}
      {numPages > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-2 no-scrollbar">
          {Array.from({ length: numPages }, (_, i) => i + 1).map((pNum) => (
            <button
              key={pNum}
              type="button"
              onClick={() => onPageChange(pNum)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                currentPage === pNum
                  ? 'bg-red-600 text-white shadow-2xs scale-102'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Page {pNum}
            </button>
          ))}
        </div>
      )}

      {/* Canvas and Interactive Overlay Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex justify-center items-start min-h-[580px] max-h-[820px] bg-slate-100/70 rounded-2xl p-4 sm:p-6 relative border border-slate-200/80"
      >
        <div
          className="relative bg-white shadow-2xl rounded-sm transition-all"
          style={{ width: `${viewportDims.width}px`, height: `${viewportDims.height}px` }}
        >
          {/* PDF Page Canvas */}
          <canvas ref={canvasRef} className="block w-full h-full" />

          {/* Overlays Layer */}
          {pageOverlays.map((ov) => {
            const pdfPageH = ov.pdfPageHeight || 841.89;
            const topPx = (pdfPageH - ov.y - ov.height) * scale;
            const leftPx = ov.x * scale;
            const widthPx = Math.max(ov.width * scale, 120 * scale);
            const heightPx = Math.max((ov.height + 4) * scale, 16 * scale);

            const isHighlighted = highlightedItemId === ov.id;

            return (
              <div
                key={ov.id}
                style={{
                  position: 'absolute',
                  top: `${topPx}px`,
                  left: `${leftPx}px`,
                  width: `${widthPx}px`,
                  height: `${heightPx}px`,
                }}
                className={`transition-all rounded flex items-center ${
                  isHighlighted
                    ? 'ring-2 ring-red-500 bg-red-500/25 z-20 shadow-lg'
                    : ov.isModified
                    ? 'ring-1.5 ring-emerald-500 bg-white/95 text-slate-900 shadow-2xs z-10 px-1'
                    : 'border border-dashed border-red-300/40 hover:border-red-500 hover:bg-red-50/20'
                }`}
                title={`${ov.label || 'Item'}: ${ov.text}`}
              >
                {ov.isModified && (
                  <span
                    className="font-bold text-slate-900 truncate"
                    style={{ fontSize: `${ov.fontSize * scale}px` }}
                  >
                    {ov.text}
                  </span>
                )}
              </div>
            );
          })}

          {isRendering && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-xs flex items-center justify-center z-30">
              <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-200">
                <span className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
                <span className="text-xs font-bold text-slate-700">Rendering preview...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
