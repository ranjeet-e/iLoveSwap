import React, { useEffect, useRef, useState } from 'react';
import { pdfjsLib, clonePdfBytes } from '../utils/pdfSetup.js';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

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
  const [viewMode, setViewMode] = useState('modified');

  const activeBuffer = viewMode === 'original' && originalPdfBuffer ? originalPdfBuffer : pdfBuffer;

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

  const pageOverlays = [];
  if (showOverlays && sections && viewMode === 'modified') {
    if (sections.personalTags) {
      sections.personalTags.forEach((tag) => {
        if (tag.pageNum === currentPage) {
          const isModified = tag.currentValue !== tag.originalValue;
          pageOverlays.push({
            id: tag.itemId || tag.id,
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

    const checkGroup = (group) => {
      if (!group) return;
      group.forEach((item) => {
        if (item.pageNum === currentPage && item.currentText !== item.originalText) {
          pageOverlays.push({
            id: item.itemId || item.id,
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

    checkGroup(sections.experimentSections);
    checkGroup(sections.problemStatements);
    checkGroup(sections.conclusionLines);
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200 text-xs">
        <div className="flex items-center border border-gray-200 rounded overflow-hidden">
          <button
            type="button"
            onClick={() => setViewMode('modified')}
            className={`px-3 py-1 font-medium ${
              viewMode === 'modified' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Modified
          </button>
          <button
            type="button"
            onClick={() => setViewMode('original')}
            className={`px-3 py-1 font-medium ${
              viewMode === 'original' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Original
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border border-gray-200 rounded">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              type="button"
              className="p-1 text-gray-600 hover:bg-gray-50 disabled:opacity-30"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-gray-700 font-medium">
              {currentPage} / {numPages || 1}
            </span>
            <button
              onClick={() => onPageChange(Math.min(numPages || 1, currentPage + 1))}
              disabled={currentPage >= (numPages || 1)}
              type="button"
              className="p-1 text-gray-600 hover:bg-gray-50 disabled:opacity-30"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center border border-gray-200 rounded">
            <button
              onClick={() => setScale((s) => Math.max(0.7, s - 0.15))}
              type="button"
              className="p-1 text-gray-600 hover:bg-gray-50"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-gray-700">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale((s) => Math.min(2.0, s + 0.15))}
              type="button"
              className="p-1 text-gray-600 hover:bg-gray-50"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex justify-center items-start min-h-[580px] max-h-[820px] bg-gray-50 border border-gray-200 rounded p-4 relative"
      >
        <div
          className="relative bg-white border border-gray-300"
          style={{ width: `${viewportDims.width}px`, height: `${viewportDims.height}px` }}
        >
          <canvas ref={canvasRef} className="block w-full h-full" />

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
                className={`flex items-center ${
                  isHighlighted
                    ? 'border-2 border-red-500 bg-red-50/20'
                    : ov.isModified
                    ? 'border border-gray-800 bg-white px-1 text-gray-900'
                    : 'border border-dashed border-gray-300'
                }`}
              >
                {ov.isModified && (
                  <span
                    className="font-medium text-gray-900 truncate"
                    style={{ fontSize: `${ov.fontSize * scale}px` }}
                  >
                    {ov.text}
                  </span>
                )}
              </div>
            );
          })}

          {isRendering && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-xs text-gray-500">
              Rendering...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
