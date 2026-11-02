import React, { useEffect, useRef, useState } from 'react';
import { pdfjsLib, clonePdfBytes } from '../utils/pdfSetup.js';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Edit3,
  Trash2,
  Check,
  X,
} from 'lucide-react';

export default function PdfViewer({
  pdfBuffer,
  originalPdfBuffer,
  highlightedItemId,
  sections,
  currentPage,
  onPageChange,
  numPages,
  onSectionTextChange,
  onToggleRemoveItem,
  onApplyChanges,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1.15);
  const [isRendering, setIsRendering] = useState(false);
  const [viewportDims, setViewportDims] = useState({ width: 595, height: 842 });
  const [pdfDoc, setPdfDoc] = useState(null);
  const [viewMode, setViewMode] = useState('modified');
  const [isWordMode, setIsWordMode] = useState(false);

  // Direct on-page editing state
  const [activeEditingItem, setActiveEditingItem] = useState(null);
  const [inlineEditText, setInlineEditText] = useState('');

  const activeBuffer =
    viewMode === 'original' && originalPdfBuffer ? originalPdfBuffer : pdfBuffer;

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

  // Collect all items belonging to currentPage
  const pageItems = [];
  if (sections) {
    const addGroup = (list, type) => {
      if (!list) return;
      list.forEach((it) => {
        if (it.pageNum === currentPage) {
          pageItems.push({
            ...it,
            itemType: type,
          });
        }
      });
    };

    addGroup(sections.personalTags, 'personal');
    addGroup(sections.headerLines, 'header');
    addGroup(sections.experimentSections, 'experiment');
    addGroup(sections.problemStatements, 'problem');
    addGroup(sections.outputSections, 'output');
    addGroup(sections.conclusionLines, 'conclusion');
    addGroup(sections.codeBlocks, 'code');
    addGroup(sections.otherLines, 'other');
  }

  // Handle inline edit save
  const handleSaveInline = () => {
    if (!activeEditingItem) return;
    if (activeEditingItem.itemType === 'personal') {
      onSectionTextChange?.(activeEditingItem.id, inlineEditText);
    } else {
      onSectionTextChange?.(activeEditingItem.id, inlineEditText);
    }
    setActiveEditingItem(null);
    onApplyChanges?.();
  };

  // Handle inline remove
  const handleRemoveInline = (itemId) => {
    onToggleRemoveItem?.(itemId, true);
    setActiveEditingItem(null);
    onApplyChanges?.();
  };

  // Handle inline restore
  const handleRestoreInline = (itemId) => {
    onToggleRemoveItem?.(itemId, false);
    onApplyChanges?.();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col h-full">
      {/* Viewer Header Toolbar */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200 text-xs flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-gray-200 rounded overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode('modified')}
              className={`px-3 py-1 font-medium transition-colors ${
                viewMode === 'modified'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Modified
            </button>
            <button
              type="button"
              onClick={() => setViewMode('original')}
              className={`px-3 py-1 font-medium transition-colors ${
                viewMode === 'original'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Original
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsWordMode(!isWordMode);
              setActiveEditingItem(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 border rounded text-xs font-medium transition-colors ${
              isWordMode
                ? 'bg-red-600 border-red-600 text-white'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            title="Click any text on the page to edit or remove it like Microsoft Word"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isWordMode ? 'Exit Word Mode' : 'Word Mode'}</span>
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
            <span className="px-2 text-gray-700 font-mono text-[11px]">
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

      {isWordMode && (
        <div className="mb-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded text-xs text-red-800 flex items-center justify-between">
          <span>
            <b>Word Mode Active:</b> Click on any text on the page to edit or remove it.
          </span>
          <button
            onClick={() => setIsWordMode(false)}
            className="text-red-700 hover:underline font-medium"
          >
            Done
          </button>
        </div>
      )}

      {/* Canvas & Overlay Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex justify-center items-start min-h-[580px] max-h-[820px] bg-gray-50 border border-gray-200 rounded p-4 relative"
      >
        <div
          className="relative bg-white border border-gray-300"
          style={{ width: `${viewportDims.width}px`, height: `${viewportDims.height}px` }}
        >
          <canvas ref={canvasRef} className="block w-full h-full" />

          {/* Interactive Text Layer (Word Mode & Highlighting) */}
          {pageItems.map((item) => {
            const pdfPageH = item.pdfPageHeight || 841.89;
            const topPx = (pdfPageH - item.y - item.height) * scale;
            const leftPx = item.x * scale;
            const widthPx = Math.max(item.width * scale, 75 * scale);
            const heightPx = Math.max((item.height + 4) * scale, 15 * scale);

            const isHighlighted = highlightedItemId === (item.itemId || item.id);
            const isRemoved = !!item.isRemoved;
            const isEditing = activeEditingItem?.id === item.id;

            return (
              <div
                key={item.id}
                style={{
                  position: 'absolute',
                  top: `${topPx}px`,
                  left: `${leftPx}px`,
                  width: `${widthPx}px`,
                  height: `${heightPx}px`,
                }}
                onClick={(e) => {
                  if (isWordMode) {
                    e.stopPropagation();
                    if (isRemoved) {
                      handleRestoreInline(item.id);
                    } else {
                      setActiveEditingItem(item);
                      setInlineEditText(
                        item.itemType === 'personal'
                          ? item.currentValue
                          : item.currentText
                      );
                    }
                  }
                }}
                className={`transition-colors select-none ${
                  isWordMode
                    ? isRemoved
                      ? 'border border-dashed border-red-500 bg-red-50/50 cursor-pointer'
                      : 'hover:border hover:border-gray-900 hover:bg-gray-100/40 cursor-pointer'
                    : isHighlighted
                    ? 'border-2 border-red-500 bg-red-50/20'
                    : ''
                }`}
                title={
                  isWordMode
                    ? isRemoved
                      ? 'Click to Restore'
                      : 'Click to Edit or Remove'
                    : undefined
                }
              >
                {isRemoved && isWordMode && (
                  <span className="text-[10px] text-red-600 font-bold px-1 py-0.5 bg-white/90 border border-red-300 rounded shadow-xs truncate block">
                    [Removed - Click to Restore]
                  </span>
                )}

                {/* Inline Editing Popover */}
                {isEditing && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute z-40 -top-12 left-0 bg-white border border-gray-900 rounded p-1.5 shadow-lg flex items-center gap-1.5 min-w-[280px]"
                  >
                    <input
                      autoFocus
                      type="text"
                      value={inlineEditText}
                      onChange={(e) => setInlineEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveInline();
                        if (e.key === 'Escape') setActiveEditingItem(null);
                      }}
                      className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:border-red-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSaveInline}
                      className="flex items-center gap-1 px-2.5 py-1 bg-gray-900 hover:bg-black text-white rounded text-xs font-medium"
                    >
                      <Check className="w-3 h-3" />
                      <span>Save</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveInline(item.id)}
                      className="flex items-center gap-1 px-2 py-1 border border-red-300 text-red-600 hover:bg-red-50 rounded text-xs font-medium"
                      title="Erase / Remove line from document"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveEditingItem(null)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
