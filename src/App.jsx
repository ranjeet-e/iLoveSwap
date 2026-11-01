import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import Navbar from './components/Navbar';
import DropZone from './components/DropZone';
import PersonalTagsEditor from './components/PersonalTagsEditor';
import SectionList from './components/SectionList';
import PdfViewer from './components/PdfViewer';
import ExportBar from './components/ExportBar';
import YuppyCelebration from './components/YuppyCelebration';
import ExtensionGuideModal from './components/ExtensionGuideModal';

import { parseAndBifurcatePdf } from './utils/pdfParser';
import { applyPdfModifications } from './utils/pdfModifier';
import { exportToDocx } from './utils/docxExporter';
import { clonePdfBytes } from './utils/pdfSetup';

export default function App() {
  const [pdfBuffer, setPdfBuffer] = useState(null);
  const [modifiedPdfBuffer, setModifiedPdfBuffer] = useState(null);
  const [fileName, setFileName] = useState('');
  const [numPages, setNumPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const [sections, setSections] = useState(null);
  const [customReplacements, setCustomReplacements] = useState([]);
  const [highlightedItemId, setHighlightedItemId] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationChanges, setCelebrationChanges] = useState([]);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Load sample lab manual
  const loadSamplePdf = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/sample_lab_manual.pdf');
      const arrayBuffer = await res.arrayBuffer();
      const masterBytes = new Uint8Array(arrayBuffer);

      setFileName('Shah_Anchor_Lab_Manual_Exp1.pdf');
      setPdfBuffer(clonePdfBytes(masterBytes));
      setModifiedPdfBuffer(clonePdfBytes(masterBytes));

      const parsed = await parseAndBifurcatePdf(clonePdfBytes(masterBytes));
      setNumPages(parsed.numPages);
      setSections(parsed.sections);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error loading sample pdf:', err);
      alert('Could not load sample PDF: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Process uploaded PDF
  const handleFileSelected = async (file) => {
    try {
      setIsLoading(true);
      setFileName(file.name);
      const arrayBuffer = await file.arrayBuffer();
      const masterBytes = new Uint8Array(arrayBuffer);

      setPdfBuffer(clonePdfBytes(masterBytes));
      setModifiedPdfBuffer(clonePdfBytes(masterBytes));

      const parsed = await parseAndBifurcatePdf(clonePdfBytes(masterBytes));
      setNumPages(parsed.numPages);
      setSections(parsed.sections);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error parsing uploaded pdf:', err);
      alert('Failed to parse PDF document: ' + (err.message || 'Please verify it is a valid PDF.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Update a personal identity tag
  const handleTagChange = (tagId, newValue) => {
    setSections((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        personalTags: prev.personalTags.map((t) =>
          t.id === tagId ? { ...t, currentValue: newValue } : t
        ),
      };
    });
  };

  // Add custom personal tag
  const handleAddTag = (newTag) => {
    const id = `custom_tag_${Date.now()}`;
    setSections((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        personalTags: [
          ...prev.personalTags,
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
      };
    });
  };

  // Remove custom tag
  const handleRemoveTag = (tagId) => {
    setSections((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        personalTags: prev.personalTags.filter((t) => t.id !== tagId),
      };
    });
  };

  // Update any section line text
  const handleSectionTextChange = (itemId, newText) => {
    setSections((prev) => {
      if (!prev) return prev;
      const updateList = (list) =>
        list?.map((item) => (item.id === itemId ? { ...item, currentText: newText } : item)) || [];

      return {
        ...prev,
        headerLines: updateList(prev.headerLines),
        experimentSections: updateList(prev.experimentSections),
        problemStatements: updateList(prev.problemStatements),
        codeBlocks: updateList(prev.codeBlocks),
        outputSections: updateList(prev.outputSections),
        conclusionLines: updateList(prev.conclusionLines),
      };
    });
  };

  // Add global custom replacement
  const handleAddCustomReplacement = (item) => {
    setCustomReplacements((prev) => [...prev, item]);
    handleApplyChanges();
  };

  // Apply changes into PDF with celebratory feedback (Yuppy!)
  const handleApplyChanges = async () => {
    if (!pdfBuffer || !sections) return;
    try {
      setIsExporting(true);
      const modifiedBytes = await applyPdfModifications(
        clonePdfBytes(pdfBuffer),
        sections,
        customReplacements
      );

      const safeModified = clonePdfBytes(modifiedBytes);
      setModifiedPdfBuffer(safeModified);

      // Collect changes for celebration toast
      const diffs = [];
      if (sections.personalTags) {
        sections.personalTags.forEach((t) => {
          if (t.currentValue !== t.originalValue) {
            diffs.push({
              label: t.label || t.key,
              from: t.originalValue || '(empty)',
              to: t.currentValue,
            });
          }
        });
      }

      setCelebrationChanges(diffs);
      setShowCelebration(true);
    } catch (err) {
      console.error('Error applying pdf modifications:', err);
      alert('Could not update PDF: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Download Modified PDF
  const handleDownloadPdf = async (customName) => {
    if (!pdfBuffer || !sections) return;
    try {
      setIsExporting(true);
      const modifiedBytes = await applyPdfModifications(
        clonePdfBytes(pdfBuffer),
        sections,
        customReplacements
      );
      const safeDownloadBytes = clonePdfBytes(modifiedBytes);
      const blob = new Blob([safeDownloadBytes], { type: 'application/pdf' });
      const outName = customName.endsWith('.pdf') ? customName : `${customName}.pdf`;
      saveAs(blob, outName);
    } catch (err) {
      console.error('Error downloading pdf:', err);
      alert('Download error: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Download Word (.docx)
  const handleDownloadDocx = async (customName) => {
    if (!sections) return;
    try {
      setIsExporting(true);
      const outName = customName.endsWith('.docx') ? customName : `${customName}.docx`;
      await exportToDocx(sections, outName);
    } catch (err) {
      console.error('Error exporting docx:', err);
      alert('Docx export error: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Reset to initial dropzone
  const handleReset = () => {
    setPdfBuffer(null);
    setModifiedPdfBuffer(null);
    setSections(null);
    setFileName('');
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
  }, [pdfBuffer, sections, customReplacements]);

  // Total sections count
  const sectionsCount = sections
    ? (sections.personalTags?.length || 0) +
      (sections.headerLines?.length || 0) +
      (sections.experimentSections?.length || 0) +
      (sections.problemStatements?.length || 0) +
      (sections.codeBlocks?.length || 0) +
      (sections.outputSections?.length || 0) +
      (sections.conclusionLines?.length || 0)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-red-500 selection:text-white bg-grid-pattern">
      {/* Top Navbar */}
      <Navbar
        onLoadSample={loadSamplePdf}
        onReset={handleReset}
        onOpenGuide={() => setShowGuideModal(true)}
        hasDocument={!!pdfBuffer}
        fileName={fileName}
        sectionsCount={sectionsCount}
        numPages={numPages}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-32">
        {!pdfBuffer || !sections ? (
          <DropZone
            onFileSelected={handleFileSelected}
            onLoadSample={loadSamplePdf}
            isLoading={isLoading}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Sections & Tags Editor (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Primary Identity Tags Editor */}
              <PersonalTagsEditor
                personalTags={sections.personalTags || []}
                onTagChange={handleTagChange}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
                onApplyChanges={handleApplyChanges}
                onHighlightItem={setHighlightedItemId}
              />

              {/* Bifurcated Sections Navigator */}
              <SectionList
                sections={sections}
                onSectionTextChange={handleSectionTextChange}
                onHighlightItem={setHighlightedItemId}
                onAddCustomReplacement={handleAddCustomReplacement}
              />
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
              />
            </div>
          </div>
        )}
      </main>

      {/* Floating Export & Renaming Toolbar */}
      {pdfBuffer && sections && (
        <ExportBar
          onDownloadPdf={handleDownloadPdf}
          onDownloadDocx={handleDownloadDocx}
          defaultFileName={fileName}
          sections={sections}
          isExporting={isExporting}
        />
      )}

      {/* Celebratory Feedback Banner ("Yuppy !! Change is been made") */}
      {showCelebration && (
        <YuppyCelebration
          changes={celebrationChanges}
          onClose={() => setShowCelebration(false)}
        />
      )}

      {/* Extension Install Guide Modal */}
      {showGuideModal && (
        <ExtensionGuideModal onClose={() => setShowGuideModal(false)} />
      )}
    </div>
  );
}
