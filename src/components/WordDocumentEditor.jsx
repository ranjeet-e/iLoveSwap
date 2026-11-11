import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Image as ImageIcon,
  Plus,
  Table as TableIcon,
  Undo,
  Redo,
  Save,
  FileText,
  Eye,
  Trash2,
  Maximize2,
  Minimize2,
  Check,
} from 'lucide-react';
import {
  convertHtmlToDocxBytes,
  convertHtmlToPdfBytes,
  convertSectionsToHtml,
} from '../utils/docxConverter';

export default function WordDocumentEditor({
  sections,
  fileName,
  onSwitchToPdf,
  onDocxUpdated,
  isExporting,
}) {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const replaceImgInputRef = useRef(null);

  const [htmlContent, setHtmlContent] = useState('');
  const [selectedImg, setSelectedImg] = useState(null);
  const [isSaved, setIsSaved] = useState(true);
  const [lastSavedTime, setLastSavedTime] = useState('All changes in sync');

  // Initialize HTML content from sections
  useEffect(() => {
    if (sections) {
      const initialHtml = convertSectionsToHtml(sections);
      setHtmlContent(initialHtml);
      if (editorRef.current) {
        editorRef.current.innerHTML = initialHtml;
      }
    }
  }, [sections]);

  // Synchronize edits back to DOCX and PDF
  const syncDocument = useCallback(
    async (content) => {
      try {
        setIsSaved(false);
        const docxBytes = await convertHtmlToDocxBytes(content, fileName);
        const pdfBytes = await convertHtmlToPdfBytes(content, fileName);

        if (docxBytes && onDocxUpdated) {
          onDocxUpdated({
            htmlContent: content,
            modifiedDocxBytes: docxBytes,
            modifiedPdfBytes: pdfBytes,
          });
        }
        setIsSaved(true);
        setLastSavedTime(`Synced ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      } catch (err) {
        console.error('Auto-sync error:', err);
      }
    },
    [fileName, onDocxUpdated]
  );

  // Debounced auto-save on input
  const debounceTimerRef = useRef(null);
  const handleEditorInput = () => {
    if (!editorRef.current) return;
    const currentHtml = editorRef.current.innerHTML;
    setHtmlContent(currentHtml);
    setIsSaved(false);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      syncDocument(currentHtml);
    }, 800);
  };

  // Text formatting execution
  const executeCommand = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      editorRef.current.focus();
    }
    handleEditorInput();
  };

  // Insert custom image from user device
  const handleInsertImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (!dataUrl || !editorRef.current) return;

      const imgWrapper = document.createElement('div');
      imgWrapper.className = 'doc-image-block text-center my-4 group relative inline-block max-w-full';
      imgWrapper.innerHTML = `
        <img src="${dataUrl}" alt="Inserted Image" class="mx-auto rounded border border-gray-300 max-h-72 object-contain shadow-sm cursor-pointer" />
      `;

      // Insert at selection or append to bottom
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && editorRef.current.contains(selection.anchorNode)) {
        const range = selection.getRangeAt(0);
        range.insertNode(imgWrapper);
      } else {
        editorRef.current.appendChild(imgWrapper);
      }

      handleEditorInput();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Replace existing clicked image
  const handleReplaceImage = (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedImg) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        selectedImg.src = dataUrl;
        handleEditorInput();
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Delete clicked image
  const handleDeleteImage = () => {
    if (!selectedImg) return;
    const parentBlock = selectedImg.closest('.doc-image-block') || selectedImg;
    parentBlock.remove();
    setSelectedImg(null);
    handleEditorInput();
  };

  // Resize clicked image
  const handleResizeImage = (widthPercent) => {
    if (!selectedImg) return;
    selectedImg.style.width = widthPercent;
    selectedImg.style.height = 'auto';
    handleEditorInput();
  };

  // Insert a new structured section (Aim, Objectives, Discussion, Conclusion)
  const handleInsertSection = (sectionType) => {
    if (!editorRef.current) return;
    const secDiv = document.createElement('div');
    secDiv.className = 'my-4';

    if (sectionType === 'aim') {
      secDiv.innerHTML = `
        <h3 class="text-base font-bold text-gray-900 mt-4 mb-1">Aim:</h3>
        <p class="text-sm text-gray-800 my-1 leading-relaxed">Enter aim description here...</p>
      `;
    } else if (sectionType === 'objectives') {
      secDiv.innerHTML = `
        <h3 class="text-base font-bold text-gray-900 mt-4 mb-1">Objectives:</h3>
        <ul class="list-disc ml-5 text-sm text-gray-800 space-y-1 my-1">
          <li>Objective 1</li>
          <li>Objective 2</li>
        </ul>
      `;
    } else if (sectionType === 'table') {
      secDiv.innerHTML = `
        <table class="w-full border border-gray-300 my-3 text-sm">
          <thead>
            <tr class="bg-gray-100 border-b border-gray-300">
              <th class="px-3 py-1.5 text-left font-bold text-gray-800 border-r border-gray-300">Item / Parameter</th>
              <th class="px-3 py-1.5 text-left font-bold text-gray-800">Value / Specification</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-gray-200">
              <td class="px-3 py-1.5 border-r border-gray-200 font-medium text-gray-700">Name / Identifier</td>
              <td class="px-3 py-1.5 text-gray-900">Value here</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="px-3 py-1.5 border-r border-gray-200 font-medium text-gray-700">Code / Status</td>
              <td class="px-3 py-1.5 text-gray-900">Active</td>
            </tr>
          </tbody>
        </table>
      `;
    } else if (sectionType === 'conclusion') {
      secDiv.innerHTML = `
        <h3 class="text-base font-bold text-gray-900 mt-5 mb-1">Conclusion:</h3>
        <p class="text-sm text-gray-800 my-1 leading-relaxed">In this experiment/document, the core objectives were successfully achieved.</p>
      `;
    }

    editorRef.current.appendChild(secDiv);
    handleEditorInput();
  };

  // Click on image inside editor to select and show float toolbar
  const handleEditorClick = (e) => {
    if (e.target.tagName?.toLowerCase() === 'img') {
      setSelectedImg(e.target);
    } else {
      setSelectedImg(null);
    }
  };

  return (
    <div className="bg-gray-100 rounded-lg border border-gray-300 flex flex-col min-h-[840px] shadow-sm">
      {/* 1. Top Microsoft Word Ribbon Toolbar */}
      <div className="bg-white border-b border-gray-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2 sticky top-16 z-30 shadow-xs">
        {/* Left Toolbar: Styling & Formats */}
        <div className="flex items-center flex-wrap gap-1.5 text-xs text-gray-700">
          {/* Mode Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 font-semibold rounded border border-red-200 mr-1">
            <FileText className="w-3.5 h-3.5 text-red-600" />
            <span>Word Mode (.docx)</span>
          </div>

          <div className="h-4 w-px bg-gray-300 mx-1" />

          {/* Undo / Redo */}
          <button
            type="button"
            onClick={() => executeCommand('undo')}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-600 cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('redo')}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-600 cursor-pointer"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-gray-300 mx-1" />

          {/* Heading Selector */}
          <select
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'p') executeCommand('formatBlock', '<p>');
              else if (val === 'h1') executeCommand('formatBlock', '<h1>');
              else if (val === 'h2') executeCommand('formatBlock', '<h2>');
              else if (val === 'h3') executeCommand('formatBlock', '<h3>');
              else if (val === 'pre') executeCommand('formatBlock', '<pre>');
            }}
            className="border border-gray-300 rounded px-2 py-1 text-xs bg-white text-gray-700 focus:outline-none"
          >
            <option value="p">Normal Text</option>
            <option value="h1">Document Title (H1)</option>
            <option value="h2">Section Header (H2)</option>
            <option value="h3">Subheading (H3)</option>
            <option value="pre">Code Block</option>
          </select>

          <div className="h-4 w-px bg-gray-300 mx-1" />

          {/* Bold, Italic, Underline, Strikethrough */}
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            className="p-1.5 hover:bg-gray-100 rounded font-bold text-gray-700 cursor-pointer"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            className="p-1.5 hover:bg-gray-100 rounded italic text-gray-700 cursor-pointer"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('underline')}
            className="p-1.5 hover:bg-gray-100 rounded underline text-gray-700 cursor-pointer"
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('strikeThrough')}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700 cursor-pointer"
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-gray-300 mx-1" />

          {/* Alignments */}
          <button
            type="button"
            onClick={() => executeCommand('justifyLeft')}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700 cursor-pointer"
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('justifyCenter')}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700 cursor-pointer"
            title="Align Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('justifyRight')}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700 cursor-pointer"
            title="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('justifyFull')}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700 cursor-pointer"
            title="Justify"
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-gray-300 mx-1" />

          {/* Bullet / Numbered lists */}
          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700 cursor-pointer"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-700 cursor-pointer"
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-gray-300 mx-1" />

          {/* Insert Image Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded text-gray-700 cursor-pointer"
            title="Upload and insert an image from your device"
          >
            <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>Image</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleInsertImage}
            accept="image/*"
            className="hidden"
          />

          {/* Insert Section Dropdown */}
          <div className="relative group inline-block">
            <button
              type="button"
              className="flex items-center gap-1 px-2 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded text-gray-700 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Section</span>
            </button>
            <div className="hidden group-hover:block absolute left-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded shadow-lg py-1 z-50">
              <button
                type="button"
                onClick={() => handleInsertSection('aim')}
                className="w-full text-left px-3 py-1 hover:bg-gray-100 text-gray-800 text-xs"
              >
                + Aim
              </button>
              <button
                type="button"
                onClick={() => handleInsertSection('objectives')}
                className="w-full text-left px-3 py-1 hover:bg-gray-100 text-gray-800 text-xs"
              >
                + Objectives
              </button>
              <button
                type="button"
                onClick={() => handleInsertSection('table')}
                className="w-full text-left px-3 py-1 hover:bg-gray-100 text-gray-800 text-xs"
              >
                + Metadata Table
              </button>
              <button
                type="button"
                onClick={() => handleInsertSection('conclusion')}
                className="w-full text-left px-3 py-1 hover:bg-gray-100 text-gray-800 text-xs"
              >
                + Conclusion
              </button>
            </div>
          </div>
        </div>

        {/* Right Toolbar: Sync Status & Switch View */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-gray-500 font-medium">
            {isSaved ? (
              <span className="flex items-center gap-1 text-emerald-600">
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lastSavedTime}</span>
              </span>
            ) : (
              <span className="text-amber-600 animate-pulse">Syncing...</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => syncDocument(editorRef.current?.innerHTML || '')}
            className="flex items-center gap-1 px-2.5 py-1 bg-gray-900 hover:bg-black text-white rounded font-medium cursor-pointer transition-colors"
            title="Save changes to DOCX & PDF"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Apply</span>
          </button>

          <button
            type="button"
            onClick={onSwitchToPdf}
            className="flex items-center gap-1 px-2.5 py-1 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded font-medium cursor-pointer transition-colors"
            title="Preview standard PDF layout"
          >
            <Eye className="w-3.5 h-3.5 text-red-600" />
            <span>PDF Preview</span>
          </button>
        </div>
      </div>

      {/* Floating Selected Image Controls */}
      {selectedImg && (
        <div className="bg-gray-900 text-white text-xs px-3 py-1.5 flex items-center justify-between gap-3 shadow-md sticky top-28 z-40">
          <span className="font-semibold text-gray-200">Selected Image:</span>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Width:</span>
            <button
              onClick={() => handleResizeImage('25%')}
              className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 rounded"
            >
              25%
            </button>
            <button
              onClick={() => handleResizeImage('50%')}
              className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 rounded"
            >
              50%
            </button>
            <button
              onClick={() => handleResizeImage('75%')}
              className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 rounded"
            >
              75%
            </button>
            <button
              onClick={() => handleResizeImage('100%')}
              className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 rounded"
            >
              100%
            </button>
            <button
              onClick={() => replaceImgInputRef.current?.click()}
              className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 rounded font-medium ml-2"
            >
              Replace
            </button>
            <button
              onClick={handleDeleteImage}
              className="px-2 py-0.5 bg-red-600 hover:bg-red-700 rounded font-medium flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete</span>
            </button>
          </div>
          <input
            type="file"
            ref={replaceImgInputRef}
            onChange={handleReplaceImage}
            accept="image/*"
            className="hidden"
          />
        </div>
      )}

      {/* 2. Document Page Canvas (A4 Sheet Simulation) */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start bg-gray-100">
        <div
          ref={editorRef}
          contentEditable={true}
          suppressContentEditableWarning={true}
          onInput={handleEditorInput}
          onClick={handleEditorClick}
          className="w-full max-w-[820px] min-h-[1120px] bg-white border border-gray-300 shadow-xl rounded-sm p-10 sm:p-14 text-gray-900 leading-relaxed outline-none focus:ring-1 focus:ring-red-400 font-sans transition-shadow"
          style={{ fontFamily: 'Calibri, Arial, sans-serif' }}
        />
      </div>
    </div>
  );
}
