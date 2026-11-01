import { pdfjsLib, clonePdfBytes } from './pdfSetup.js';

/**
 * Common patterns for Indian Engineering / University Lab Reports & Academic documents
 */
const TAG_REGEXES = [
  { key: 'name', label: 'Name', regex: /^(?:student\s+)?name\s*[:\-]\s*(.*)$/i },
  { key: 'rollNo', label: 'Roll No', regex: /^(?:roll\s*(?:no|number)?)\s*[:\-]\s*(.*)$/i },
  { key: 'batch', label: 'Batch', regex: /^batch\s*[:\-]\s*(.*)$/i },
  { key: 'division', label: 'Division / Class', regex: /^(?:division|div|class)\s*[:\-]\s*(.*)$/i },
  { key: 'prn', label: 'PRN / SAP ID', regex: /^(?:prn(?:\s*no)?|sap\s*id|uin|reg(?:istration)?\s*no)\s*[:\-]\s*(.*)$/i },
  { key: 'expNo', label: 'Experiment No', regex: /^(?:experiment|exp)\s*(?:no\.?|number)?\s*[:\-–]\s*(.*)$/i },
  { key: 'date', label: 'Date', regex: /^(?:date(?:\s*of\s*submission)?)\s*[:\-]\s*(.*)$/i },
  { key: 'academicYear', label: 'Academic Year', regex: /^(?:a\.?y\.?|academic\s*year)\s*[:\-]\s*(.*)$/i },
  { key: 'subject', label: 'Subject / Course', regex: /^(?:subject|course)\s*[:\-]\s*(.*)$/i },
];

/**
 * Parses a PDF buffer and bifurcates it into structured sections and editable tags.
 * @param {ArrayBuffer|Uint8Array} inputData 
 * @returns {Promise<Object>}
 */
export async function parseAndBifurcatePdf(inputData) {
  // Always use a safe clone to avoid detached ArrayBuffer issues
  const safeData = clonePdfBytes(inputData);

  const loadingTask = pdfjsLib.getDocument({
    data: safeData,
  });

  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  const rawPages = [];
  const allExtractedItems = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent();

    // Group items into lines
    const items = textContent.items
      .filter((item) => item.str && item.str.trim().length > 0)
      .map((item, idx) => ({
        id: `p${pageNum}_item_${idx}`,
        pageIndex: pageNum - 1,
        pageNum,
        str: item.str,
        x: item.transform[4],
        y: item.transform[5],
        width: item.width || item.str.length * 6,
        height: item.height || 12,
        fontName: item.fontName,
        fontSize: Math.round(Math.hypot(item.transform[0], item.transform[1]) || 11),
      }));

    // Sort items top-to-bottom, left-to-right
    // Note: PDF coordinate system (0,0) is bottom-left
    items.sort((a, b) => {
      const yDiff = b.y - a.y;
      if (Math.abs(yDiff) > 4) return yDiff;
      return a.x - b.x;
    });

    rawPages.push({
      pageNum,
      pageIndex: pageNum - 1,
      width: viewport.width,
      height: viewport.height,
      items,
    });

    allExtractedItems.push(...items);
  }

  // Bifurcate sections
  const personalTags = [];
  const headerLines = [];
  const experimentSections = [];
  const problemStatements = [];
  const codeBlocks = [];
  const outputSections = [];
  const conclusionLines = [];
  const otherLines = [];

  const matchedItemIds = new Set();

  // 1. Detect Personal Identity Tags (Name, Roll No, Batch, Division, PRN, etc.)
  for (const item of allExtractedItems) {
    const trimmed = item.str.trim();
    for (const tagDef of TAG_REGEXES) {
      const match = trimmed.match(tagDef.regex);
      if (match) {
        matchedItemIds.add(item.id);
        const prefix = trimmed.substring(0, trimmed.indexOf(match[1]));
        const originalVal = match[1].trim();

        // Calculate approximate x offset for the value part
        const prefixWidth = (prefix.length / (trimmed.length || 1)) * item.width;

        personalTags.push({
          id: `tag_${tagDef.key}_${item.id}`,
          itemId: item.id,
          category: 'personal',
          key: tagDef.key,
          label: tagDef.label,
          prefix: prefix,
          originalValue: originalVal,
          currentValue: originalVal,
          fullOriginalText: item.str,
          pageNum: item.pageNum,
          pageIndex: item.pageIndex,
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          fontSize: item.fontSize,
          fontName: item.fontName,
          valueX: item.x + prefixWidth,
          valueWidth: Math.max(item.width - prefixWidth, 60),
        });
        break;
      }
    }
  }

  // Fallback: If no explicit personal tags were found by regex, scan for "TEJAS", "KAMBLE", or typical patterns
  if (personalTags.length === 0) {
    for (const item of allExtractedItems) {
      if (/name|roll|batch|div/i.test(item.str)) {
        personalTags.push({
          id: `tag_custom_${item.id}`,
          itemId: item.id,
          category: 'personal',
          key: 'custom_tag',
          label: item.str.split(':')[0] || 'Tag',
          prefix: item.str.split(':')[0] ? item.str.split(':')[0] + ':' : '',
          originalValue: item.str.split(':')[1]?.trim() || item.str,
          currentValue: item.str.split(':')[1]?.trim() || item.str,
          fullOriginalText: item.str,
          pageNum: item.pageNum,
          pageIndex: item.pageIndex,
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          fontSize: item.fontSize,
          fontName: item.fontName,
        });
        matchedItemIds.add(item.id);
      }
    }
  }

  // 2. Classify Remaining Items
  for (const page of rawPages) {
    let currentCodeBlock = null;

    for (const item of page.items) {
      if (matchedItemIds.has(item.id)) continue;

      const str = item.str.trim();

      // Header: Top of Page 1 (e.g., college trust, college name, department)
      if (page.pageNum === 1 && item.y > 680 && !/experiment/i.test(str)) {
        headerLines.push({
          id: `hdr_${item.id}`,
          itemId: item.id,
          category: 'header',
          originalText: str,
          currentText: str,
          pageNum: item.pageNum,
          pageIndex: item.pageIndex,
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          fontSize: item.fontSize,
        });
        matchedItemIds.add(item.id);
        continue;
      }

      // Experiment No & Title
      if (/experiment\s*(?:no\.?|number)?|laplace\s*transform|aim\s*[:\-]|title\s*[:\-]/i.test(str) && item.y > 450) {
        experimentSections.push({
          id: `exp_${item.id}`,
          itemId: item.id,
          category: 'experiment',
          originalText: str,
          currentText: str,
          pageNum: item.pageNum,
          pageIndex: item.pageIndex,
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          fontSize: item.fontSize,
        });
        matchedItemIds.add(item.id);
        continue;
      }

      // Problem statements (e.g. "Problem N0-1...", "Problem N0-2...", "For Q1", "For Q2")
      if (/^(?:problem\s*n[0o]?[-–\d]+|for\s*q\d+|question\s*\d+)/i.test(str)) {
        problemStatements.push({
          id: `prob_${item.id}`,
          itemId: item.id,
          category: 'problem',
          originalText: str,
          currentText: str,
          pageNum: item.pageNum,
          pageIndex: item.pageIndex,
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          fontSize: item.fontSize,
        });
        matchedItemIds.add(item.id);
        continue;
      }

      // Conclusion / Results
      if (/^(?:conclusion|result|inference|summary)\s*[:\-]/i.test(str)) {
        conclusionLines.push({
          id: `concl_${item.id}`,
          itemId: item.id,
          category: 'conclusion',
          originalText: str,
          currentText: str,
          pageNum: item.pageNum,
          pageIndex: item.pageIndex,
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          fontSize: item.fontSize,
        });
        matchedItemIds.add(item.id);
        continue;
      }

      // Output & Figure captions
      if (/^(?:output\s*[:\-]|matlab\s*r\d+|figure\s*\d+|plot)/i.test(str)) {
        outputSections.push({
          id: `out_${item.id}`,
          itemId: item.id,
          category: 'output',
          originalText: str,
          currentText: str,
          pageNum: item.pageNum,
          pageIndex: item.pageIndex,
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          fontSize: item.fontSize,
        });
        matchedItemIds.add(item.id);
        continue;
      }

      // Code snippets (MATLAB / Python / C / equations)
      if (
        /^(?:reference\s*code|program\s*code|code\s*[:\-])/i.test(str) ||
        /(?:syms|laplace|disp\(|fplot|clc;|clear;|grid\s*on|xlabel|ylabel|title\(|function|=|\+=)/i.test(str)
      ) {
        codeBlocks.push({
          id: `code_${item.id}`,
          itemId: item.id,
          category: 'code',
          originalText: str,
          currentText: str,
          pageNum: item.pageNum,
          pageIndex: item.pageIndex,
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          fontSize: item.fontSize,
        });
        matchedItemIds.add(item.id);
        continue;
      }

      // Other regular lines
      otherLines.push({
        id: `other_${item.id}`,
        itemId: item.id,
        category: 'other',
        originalText: str,
        currentText: str,
        pageNum: item.pageNum,
        pageIndex: item.pageIndex,
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        fontSize: item.fontSize,
      });
    }
  }

  return {
    numPages,
    rawPages,
    sections: {
      personalTags,
      headerLines,
      experimentSections,
      problemStatements,
      codeBlocks,
      outputSections,
      conclusionLines,
      otherLines,
    },
    summary: {
      tagsFound: personalTags.length,
      headersFound: headerLines.length,
      problemsFound: problemStatements.length,
      codeLinesFound: codeBlocks.length,
      pages: numPages,
    },
  };
}
