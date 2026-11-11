import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DropZone from './components/DropZone';
import DocumentTabs from './components/DocumentTabs';
import PersonalTagsEditor from './components/PersonalTagsEditor';
import SectionList from './components/SectionList';
import PdfViewer from './components/PdfViewer';
import ExportBar from './components/ExportBar';
import ExtensionPage from './components/ExtensionPage';
import NotificationToast from './components/NotificationToast';
import { downloadExtensionZip } from './utils/extensionDownloader';

import { parseAndBifurcatePdf } from './utils/pdfParser';
import { applyPdfModifications } from './utils/pdfModifier';
import { exportToDocx } from './utils/docxExporter';
import { clonePdfBytes } from './utils/pdfSetup';
import { applyFixedToSections } from './utils/identityHelper';
import {
  isWordDocument,
  parseAndBifurcateDocx,
  modifyDocxBytes,
  renderSectionsToPdf,
} from './utils/docxParser';

export function computeDocName(sections, originalName, ext = '.pdf') {
  let nameVal = '';
  let idVal = '';
  let titleVal = '';

  if (sections?.personalTags) {
    sections.personalTags.forEach((tag) => {
      const k = (tag.key || tag.label || '').toLowerCase();
      if ((k.includes('author') || k.includes('name')) && tag.currentValue) {
        nameVal = tag.currentValue.replace(/\s+/g, '_');
      }
      if ((k.includes('ref') || k.includes('id') || k.includes('code')) && tag.currentValue) {
        idVal = tag.currentValue.replace(/\s+/g, '');
      }
      if ((k.includes('title') || k.includes('subject') || k.includes('doc')) && tag.currentValue) {
        titleVal = tag.currentValue.replace(/\s+/g, '_');
      }
    });
  }

  const extension = ext.startsWith('.') ? ext : `.${ext}`;

  if (originalName) {
    const base = originalName.replace(/\.(pdf|docx?)$/i, '');
    if (nameVal && idVal) {
      return `${base}_${nameVal}_${idVal}${extension}`;
    }
    if (nameVal) {
      return `${base}_${nameVal}${extension}`;
    }
    return `${base}_Modified${extension}`;
  }

  if (titleVal) {
    return `${titleVal}_Modified${extension}`;
  }
  return `Document_Modified${extension}`;
}

export default function App() {
  const [currentTab, setCurrentTab] = useState('home'); // 'home' | 'editor' | 'extension'
  const [editorFocus, setEditorFocus] = useState('all'); // 'all' | 'sections' | 'metadata'

  const [documents, setDocuments] = useState([]);
  const [activeDocIndex, setActiveDocIndex] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [highlightedItemId, setHighlightedItemId] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastChanges, setToastChanges] = useState([]);

  const activeDoc = documents[activeDocIndex] || null;
  const pdfBuffer = activeDoc?.originalBytes || null;
  const modifiedPdfBuffer = activeDoc?.modifiedBytes || null;
  const fileName = activeDoc?.fileName || '';
  const numPages = activeDoc?.numPages || 1;
  const sections = activeDoc?.sections || null;
  const customReplacements = activeDoc?.customReplacements || [];

  // Reset page when switching active document
  useEffect(() => {
    setCurrentPage(1);
  }, [activeDocIndex]);

  // Process a single file (PDF or DOCX) into document object
  const processFileToDoc = async (file) => {
    const isDocx = isWordDocument(file);
    const arrayBuffer = await file.arrayBuffer();

    if (isDocx) {
      const parsed = await parseAndBifurcateDocx(arrayBuffer, file.name);
      const finalSections = parsed.sections;

      const { pdfBytes, numPages } = await renderSectionsToPdf(finalSections);
      let modDocxBytes = null;
      try {
        modDocxBytes = await modifyDocxBytes(arrayBuffer, finalSections);
      } catch (e) {
        console.error('Error modifying docx bytes:', e);
      }

      return {
        id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        fileName: file.name,
        docType: 'docx',
        originalDocxBytes: arrayBuffer,
        modifiedDocxBytes: modDocxBytes || arrayBuffer,
        originalBytes: clonePdfBytes(pdfBytes),
        modifiedBytes: clonePdfBytes(pdfBytes),
        numPages,
        sections: finalSections,
        customReplacements: [],
      };
    } else {
      const masterBytes = new Uint8Array(arrayBuffer);
      const parsed = await parseAndBifurcatePdf(clonePdfBytes(masterBytes));

      return {
        id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        fileName: file.name,
        docType: 'pdf',
        originalBytes: clonePdfBytes(masterBytes),
        modifiedBytes: clonePdfBytes(masterBytes),
        numPages: parsed.numPages,
        sections: parsed.sections,
        customReplacements: [],
      };
    }
  };

  // Process multiple uploaded files
  const handleFilesSelected = async (files) => {
    if (!files || files.length === 0) return;
    try {
      setIsLoading(true);
      const newDocs = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setLoadingStatus(`Processing ${i + 1} of ${files.length}: ${file.name}`);
        const doc = await processFileToDoc(file);
        newDocs.push(doc);
      }

      setDocuments(newDocs);
      setActiveDocIndex(0);
      setCurrentPage(1);
      setCurrentTab('editor');
    } catch (err) {
      console.error('Error parsing uploaded documents:', err);
      alert('Failed to parse document: ' + (err.message || 'Please verify valid PDF or Word files.'));
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  // Add more files to list
  const handleAddFiles = async (files) => {
    if (!files || files.length === 0) return;
    try {
      setIsLoading(true);
      const appended = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setLoadingStatus(`Adding ${i + 1} of ${files.length}: ${file.name}`);
        const doc = await processFileToDoc(file);
        appended.push(doc);
      }

      setDocuments((prev) => [...prev, ...appended]);
    } catch (err) {
      console.error('Error adding documents:', err);
      alert('Failed to add document: ' + err.message);
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  // Remove a document
  const handleRemoveDoc = (indexToRemove) => {
    setDocuments((prev) => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      if (updated.length === 0) {
        setActiveDocIndex(0);
        setCurrentTab('home');
        return [];
      }
      if (activeDocIndex >= updated.length) {
        setActiveDocIndex(updated.length - 1);
      } else if (indexToRemove < activeDocIndex) {
        setActiveDocIndex((curr) => curr - 1);
      }
      return updated;
    });
  };

  // Update a personal metadata tag
  const handleTagChange = (tagId, newValue) => {
    setDocuments((prev) =>
      prev.map((doc, idx) => {
        if (idx !== activeDocIndex || !doc.sections) return doc;
        return {
          ...doc,
          sections: {
            ...doc.sections,
            personalTags: doc.sections.personalTags.map((t) =>
              t.id === tagId ? { ...t, currentValue: newValue } : t
            ),
          },
        };
      })
    );
  };

  // Add custom tag
  const handleAddTag = (newTag) => {
    const id = `custom_tag_${Date.now()}`;
    setDocuments((prev) =>
      prev.map((doc, idx) => {
        if (idx !== activeDocIndex || !doc.sections) return doc;
        return {
          ...doc,
          sections: {
            ...doc.sections,
            personalTags: [
              ...doc.sections.personalTags,
              {
                id,
                itemId: id,
                category: 'personal',
                key: newTag.key,
                label: newTag.label,
                prefix: newTag.prefix,
                originalValue: newTag.originalValue,
                currentValue: newTag.currentValue,
                fullOriginalText: `${newTag.prefix}${newTag.currentValue}`,
                pageNum: 1,
                pageIndex: 0,
                x: 70,
                y: 500,
                width: 150,
                height: 14,
                fontSize: 12,
                isCustom: true,
              },
            ],
          },
        };
      })
    );
  };

  // Remove custom tag
  const handleRemoveTag = (tagId) => {
    setDocuments((prev) =>
      prev.map((doc, idx) => {
        if (idx !== activeDocIndex || !doc.sections) return doc;
        return {
          ...doc,
          sections: {
            ...doc.sections,
            personalTags: doc.sections.personalTags.filter((t) => t.id !== tagId),
          },
        };
      })
    );
  };

  // Update section text
  const handleSectionTextChange = (itemId, newText) => {
    setDocuments((prev) =>
      prev.map((doc, idx) => {
        if (idx !== activeDocIndex || !doc.sections) return doc;
        const updateList = (list) =>
          list?.map((item) =>
            item.id === itemId || item.itemId === itemId
              ? { ...item, currentText: newText, isRemoved: false }
              : item
          ) || [];

        const updateTags = (tags) =>
          tags?.map((tag) =>
            tag.id === itemId || tag.itemId === itemId
              ? { ...tag, currentValue: newText, isRemoved: false }
              : tag
          ) || [];

        return {
          ...doc,
          sections: {
            ...doc.sections,
            personalTags: updateTags(doc.sections.personalTags),
            headerLines: updateList(doc.sections.headerLines),
            experimentSections: updateList(doc.sections.experimentSections),
            problemStatements: updateList(doc.sections.problemStatements),
            codeBlocks: updateList(doc.sections.codeBlocks),
            outputSections: updateList(doc.sections.outputSections),
            conclusionLines: updateList(doc.sections.conclusionLines),
            otherLines: updateList(doc.sections.otherLines),
          },
        };
      })
    );
  };

  // Toggle remove/restore for any item
  const handleToggleRemoveItem = async (itemId, isRemoved) => {
    let updatedSections = null;

    setDocuments((prev) => {
      return prev.map((doc, idx) => {
        if (idx !== activeDocIndex || !doc.sections) return doc;
        const updateList = (list) =>
          list?.map((item) =>
            item.id === itemId || item.itemId === itemId
              ? {
                  ...item,
                  isRemoved: isRemoved !== undefined ? isRemoved : !item.isRemoved,
                  currentText:
                    (isRemoved !== undefined ? isRemoved : !item.isRemoved)
                      ? ''
                      : item.currentText || item.originalText,
                }
              : item
          ) || [];

        const updateTags = (tags) =>
          tags?.map((tag) =>
            tag.id === itemId || tag.itemId === itemId
              ? {
                  ...tag,
                  isRemoved: isRemoved !== undefined ? isRemoved : !tag.isRemoved,
                  currentValue:
                    (isRemoved !== undefined ? isRemoved : !tag.isRemoved)
                      ? ''
                      : tag.currentValue || tag.originalValue,
                }
              : tag
          ) || [];

        const newSecs = {
          ...doc.sections,
          personalTags: updateTags(doc.sections.personalTags),
          headerLines: updateList(doc.sections.headerLines),
          experimentSections: updateList(doc.sections.experimentSections),
          problemStatements: updateList(doc.sections.problemStatements),
          codeBlocks: updateList(doc.sections.codeBlocks),
          outputSections: updateList(doc.sections.outputSections),
          conclusionLines: updateList(doc.sections.conclusionLines),
          otherLines: updateList(doc.sections.otherLines),
        };
        updatedSections = newSecs;
        return {
          ...doc,
          sections: newSecs,
        };
      });
    });

    if (pdfBuffer && updatedSections) {
      try {
        const modBytes = await applyPdfModifications(
          clonePdfBytes(pdfBuffer),
          updatedSections,
          customReplacements
        );
        const safeModified = clonePdfBytes(modBytes);
        setDocuments((prev) =>
          prev.map((doc, idx) =>
            idx === activeDocIndex ? { ...doc, modifiedBytes: safeModified } : doc
          )
        );
      } catch (e) {
        console.error('Error applying whiteout mask:', e);
      }
    }
  };

  // Add global custom replacement
  const handleAddCustomReplacement = (item) => {
    setDocuments((prev) =>
      prev.map((doc, idx) => {
        if (idx !== activeDocIndex) return doc;
        return {
          ...doc,
          customReplacements: [...(doc.customReplacements || []), item],
        };
      })
    );
    handleApplyChanges();
  };

  // Apply changes to active document
  const handleApplyChanges = async () => {
    if (!activeDoc || !sections) return;
    try {
      setIsExporting(true);

      if (activeDoc.docType === 'docx') {
        const { pdfBytes } = await renderSectionsToPdf(sections);
        let modDocx = null;
        try {
          modDocx = await modifyDocxBytes(
            activeDoc.originalDocxBytes,
            sections,
            customReplacements
          );
        } catch (e) {
          console.error('Error modifying docx bytes:', e);
        }

        setDocuments((prev) =>
          prev.map((doc, idx) =>
            idx === activeDocIndex
              ? {
                  ...doc,
                  modifiedBytes: clonePdfBytes(pdfBytes),
                  modifiedDocxBytes: modDocx || doc.modifiedDocxBytes,
                }
              : doc
          )
        );
      } else {
        const modifiedBytes = await applyPdfModifications(
          clonePdfBytes(pdfBuffer),
          sections,
          customReplacements
        );
        const safeModified = clonePdfBytes(modifiedBytes);
        setDocuments((prev) =>
          prev.map((doc, idx) =>
            idx === activeDocIndex ? { ...doc, modifiedBytes: safeModified } : doc
          )
        );
      }

      // Collect changes for toast
      const diffs = [];
      if (sections.personalTags) {
        sections.personalTags.forEach((t) => {
          if (t.currentValue !== t.originalValue || t.isRemoved) {
            diffs.push({
              label: t.label || t.key,
              from: t.originalValue || '(empty)',
              to: t.isRemoved ? '(Redacted)' : t.currentValue,
            });
          }
        });
      }

      setToastChanges(diffs);
      setShowToast(true);
    } catch (err) {
      console.error('Error applying modifications:', err);
      alert('Could not update document: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Apply batch metadata to all documents
  const handleApplyFixedToAll = async (batchData) => {
    if (documents.length === 0 || !batchData) return;

    try {
      setIsExporting(true);
      const updatedDocs = [];

      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        const updatedSecs = applyFixedToSections(doc.sections, batchData);

        let newModBytes = doc.modifiedBytes;
        let newDocxBytes = doc.modifiedDocxBytes;

        try {
          if (doc.docType === 'docx') {
            const { pdfBytes } = await renderSectionsToPdf(updatedSecs);
            newModBytes = clonePdfBytes(pdfBytes);
            newDocxBytes = await modifyDocxBytes(
              doc.originalDocxBytes,
              updatedSecs,
              doc.customReplacements || []
            );
          } else {
            const mod = await applyPdfModifications(
              clonePdfBytes(doc.originalBytes),
              updatedSecs,
              doc.customReplacements || []
            );
            newModBytes = clonePdfBytes(mod);
          }
        } catch (err) {
          console.error(`Error updating document ${doc.fileName}:`, err);
        }

        updatedDocs.push({
          ...doc,
          sections: updatedSecs,
          modifiedBytes: newModBytes,
          modifiedDocxBytes: newDocxBytes || doc.modifiedDocxBytes,
        });
      }

      setDocuments(updatedDocs);
      setToastChanges([
        { label: 'Metadata applied', from: 'All documents', to: batchData.name || 'Updated' },
      ]);
      setShowToast(true);
    } catch (err) {
      console.error('Batch apply failed:', err);
      alert('Batch apply failed: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Download active document as PDF
  const handleDownloadPdf = async (customName) => {
    if (!activeDoc || !sections) return;
    try {
      setIsExporting(true);
      let safeBytes = activeDoc.modifiedBytes || activeDoc.originalBytes;

      if (!safeBytes) {
        if (activeDoc.docType === 'docx') {
          const { pdfBytes } = await renderSectionsToPdf(sections);
          safeBytes = clonePdfBytes(pdfBytes);
        } else {
          const mod = await applyPdfModifications(
            clonePdfBytes(activeDoc.originalBytes),
            sections,
            customReplacements
          );
          safeBytes = clonePdfBytes(mod);
        }
      }

      const blob = new Blob([clonePdfBytes(safeBytes)], { type: 'application/pdf' });
      const outName = customName.endsWith('.pdf') ? customName : `${customName}.pdf`;
      saveAs(blob, outName);
    } catch (err) {
      console.error('Error downloading pdf:', err);
      alert('Download error: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Download active document as Word (.docx)
  const handleDownloadDocx = async (customName) => {
    if (!activeDoc || !sections) return;
    try {
      setIsExporting(true);
      const outName = customName.endsWith('.docx') ? customName : `${customName}.docx`;

      if (activeDoc.docType === 'docx' && activeDoc.originalDocxBytes) {
        let docxData = activeDoc.modifiedDocxBytes;
        if (!docxData) {
          docxData = await modifyDocxBytes(
            activeDoc.originalDocxBytes,
            sections,
            customReplacements
          );
        }
        if (docxData) {
          const blob = new Blob([docxData], {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          });
          saveAs(blob, outName);
          return;
        }
      }

      await exportToDocx(sections, outName);
    } catch (err) {
      console.error('Error exporting docx:', err);
      alert('Docx export error: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Download ALL documents as a single .zip file
  const handleDownloadAllZip = async () => {
    if (documents.length === 0) return;
    try {
      setIsExporting(true);
      const zip = new JSZip();
      const usedNames = new Set();

      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];

        if (doc.docType === 'docx') {
          const docxName = computeDocName(doc.sections, doc.fileName, '.docx');
          let docxData = doc.modifiedDocxBytes;
          if (!docxData && doc.originalDocxBytes) {
            docxData = await modifyDocxBytes(
              doc.originalDocxBytes,
              doc.sections,
              doc.customReplacements || []
            );
          }
          if (docxData) {
            zip.file(docxName, docxData);
          }

          const pdfName = computeDocName(doc.sections, doc.fileName, '.pdf');
          let pdfData = doc.modifiedBytes;
          if (!pdfData) {
            const { pdfBytes } = await renderSectionsToPdf(doc.sections);
            pdfData = pdfBytes;
          }
          if (pdfData) {
            zip.file(pdfName, clonePdfBytes(pdfData));
          }
        } else {
          let finalBytes = doc.modifiedBytes;
          if (!finalBytes) {
            finalBytes = await applyPdfModifications(
              clonePdfBytes(doc.originalBytes),
              doc.sections,
              doc.customReplacements || []
            );
          }

          let outName = computeDocName(doc.sections, doc.fileName, '.pdf');
          if (usedNames.has(outName)) {
            let count = 2;
            const base = outName.replace(/\.pdf$/i, '');
            while (usedNames.has(`${base}_(${count}).pdf`)) {
              count++;
            }
            outName = `${base}_(${count}).pdf`;
          }
          usedNames.add(outName);

          zip.file(outName, clonePdfBytes(finalBytes));
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'iLoveSwap_Documents.zip');
    } catch (err) {
      console.error('ZIP export error:', err);
      alert('ZIP export failed: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Reset to initial dropzone
  const handleReset = () => {
    setDocuments([]);
    setActiveDocIndex(0);
    setCurrentTab('home');
  };

  // Keyboard shortcut listener: Cmd/Ctrl + S to apply changes
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleApplyChanges();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pdfBuffer, sections, customReplacements, activeDocIndex]);

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-red-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onReset={handleReset}
        onDownloadExtension={downloadExtensionZip}
        onOpenExtensionPage={() => setCurrentTab('extension')}
        hasDocument={documents.length > 0}
        fileName={fileName}
        totalDocs={documents.length}
        numPages={numPages}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-32">
        {currentTab === 'extension' ? (
          <ExtensionPage
            onBackToHome={() => setCurrentTab(documents.length > 0 ? 'editor' : 'home')}
          />
        ) : documents.length === 0 || currentTab === 'home' ? (
          <DropZone
            onFilesSelected={handleFilesSelected}
            isLoading={isLoading}
            loadingStatus={loadingStatus}
          />
        ) : (
          <div>
            {/* Multi-Document Navigation Bar */}
            <DocumentTabs
              documents={documents}
              activeDocIndex={activeDocIndex}
              onSelectDoc={setActiveDocIndex}
              onRemoveDoc={handleRemoveDoc}
              onAddFiles={handleAddFiles}
              onApplyFixedToAll={handleApplyFixedToAll}
              isLoading={isLoading || isExporting}
            />

            {/* Workflow Focus Sub-Tabs */}
            <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2 text-xs font-semibold">
              <span className="text-gray-400 uppercase tracking-wider text-[11px] mr-2">Focus:</span>
              <button
                type="button"
                onClick={() => setEditorFocus('all')}
                className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
                  editorFocus === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All Tools
              </button>
              <button
                type="button"
                onClick={() => setEditorFocus('sections')}
                className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
                  editorFocus === 'sections'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Sections & Content
              </button>
              <button
                type="button"
                onClick={() => setEditorFocus('metadata')}
                className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
                  editorFocus === 'metadata'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Document Metadata & Tags
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Sections & Tags Editor (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Primary Metadata Tags Editor */}
                {(editorFocus === 'all' || editorFocus === 'metadata') && (
                  <PersonalTagsEditor
                    personalTags={sections?.personalTags || []}
                    onTagChange={handleTagChange}
                    onAddTag={handleAddTag}
                    onRemoveTag={handleRemoveTag}
                    onToggleRemoveTag={handleToggleRemoveItem}
                    onApplyChanges={handleApplyChanges}
                    onHighlightItem={setHighlightedItemId}
                  />
                )}

                {/* Bifurcated Sections Navigator */}
                {(editorFocus === 'all' || editorFocus === 'sections') && (
                  <SectionList
                    sections={sections}
                    onSectionTextChange={handleSectionTextChange}
                    onToggleRemoveItem={handleToggleRemoveItem}
                    onHighlightItem={setHighlightedItemId}
                    onAddCustomReplacement={handleAddCustomReplacement}
                  />
                )}
              </div>

              {/* Right Column: Live PDF Document Canvas Viewer (5 Cols) */}
              <div className="lg:col-span-5 sticky top-20">
                <PdfViewer
                  pdfBuffer={modifiedPdfBuffer || pdfBuffer}
                  originalPdfBuffer={pdfBuffer}
                  highlightedItemId={highlightedItemId}
                  sections={sections}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  numPages={numPages}
                  onSectionTextChange={handleSectionTextChange}
                  onToggleRemoveItem={handleToggleRemoveItem}
                  onApplyChanges={handleApplyChanges}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Export & Renaming Toolbar */}
      {documents.length > 0 && sections && currentTab !== 'extension' && (
        <ExportBar
          onDownloadPdf={handleDownloadPdf}
          onDownloadDocx={handleDownloadDocx}
          onDownloadAllZip={handleDownloadAllZip}
          totalDocs={documents.length}
          defaultFileName={fileName}
          sections={sections}
          isExporting={isExporting}
        />
      )}

      {/* Status Toast */}
      {showToast && (
        <NotificationToast
          changes={toastChanges}
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Clean Minimal Footer */}
      <Footer />
    </div>
  );
}
