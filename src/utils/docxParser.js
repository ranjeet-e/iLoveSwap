import JSZip from 'jszip';
import mammoth from 'mammoth';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { TAG_REGEXES } from './pdfParser.js';
import { sanitizeForPdf } from './pdfSetup.js';

/**
 * Checks whether a file or filename is a Word document (.docx or .doc)
 */
export function isWordDocument(fileOrName) {
  if (!fileOrName) return false;
  if (typeof fileOrName === 'string') {
    return /\.docx?$/i.test(fileOrName);
  }
  const name = fileOrName.name || '';
  const type = fileOrName.type || '';
  return (
    /\.docx?$/i.test(name) ||
    type.includes('wordprocessingml') ||
    type.includes('msword')
  );
}

/**
 * Synthesizes an A4 PDF document from extracted sections using pdf-lib.
 * This provides the live canvas viewer, zoom, page count, and on-page click-to-edit.
 */
export async function renderSectionsToPdf(sections) {
  const pdfDoc = await PDFDocument.create();
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const courier = await pdfDoc.embedFont(StandardFonts.Courier);

  const pageWidth = 595.28; // A4
  const pageHeight = 841.89; // A4
  const marginX = 60;
  const marginTop = 60;
  const marginBottom = 60;

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let currentY = pageHeight - marginTop;
  let pageIndex = 0;

  const checkPageBreak = (neededHeight) => {
    if (currentY - neededHeight < marginBottom) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      currentY = pageHeight - marginTop;
      pageIndex++;
    }
  };

  const drawLine = (text, fontSize = 11, isBold = false, isMono = false) => {
    checkPageBreak(fontSize + 12);
    const font = isMono ? courier : isBold ? timesBold : timesRoman;
    const cleanText = String(text || '').trim();
    if (!cleanText) {
      currentY -= 10;
      return null;
    }

    const safeText = sanitizeForPdf(cleanText, font);

    currentPage.drawText(safeText, {
      x: marginX,
      y: currentY,
      size: fontSize,
      font: font,
      color: rgb(0.1, 0.1, 0.1),
    });

    const itemWidth = Math.min(cleanText.length * fontSize * 0.6, pageWidth - marginX * 2);
    const coord = {
      x: marginX,
      y: currentY,
      width: itemWidth,
      height: fontSize + 2,
      pageNum: pageIndex + 1,
      pageIndex: pageIndex,
      fontSize: fontSize,
    };

    currentY -= fontSize + 10;
    return coord;
  };

  // 1. Headers
  if (sections.headerLines) {
    sections.headerLines.forEach((h) => {
      if (h.isRemoved) return;
      const coord = drawLine(h.currentText || h.originalText, 13, true);
      if (coord) {
        h.x = coord.x;
        h.y = coord.y;
        h.width = coord.width;
        h.height = coord.height;
        h.pageNum = coord.pageNum;
        h.pageIndex = coord.pageIndex;
      }
    });
    currentY -= 8;
  }

  // 2. Experiment Title
  if (sections.experimentSections) {
    sections.experimentSections.forEach((e) => {
      if (e.isRemoved) return;
      const coord = drawLine(e.currentText || e.originalText, 14, true);
      if (coord) {
        e.x = coord.x;
        e.y = coord.y;
        e.width = coord.width;
        e.height = coord.height;
        e.pageNum = coord.pageNum;
        e.pageIndex = coord.pageIndex;
      }
    });
    currentY -= 8;
  }

  // 3. Student Personal Details
  if (sections.personalTags) {
    sections.personalTags.forEach((t) => {
      if (t.isRemoved) return;
      const full = `${t.prefix || ''}${t.currentValue || t.originalValue}`;
      const coord = drawLine(full, 11, true);
      if (coord) {
        t.x = coord.x;
        t.y = coord.y;
        t.width = coord.width;
        t.height = coord.height;
        t.pageNum = coord.pageNum;
        t.pageIndex = coord.pageIndex;
      }
    });
    currentY -= 12;
  }

  // 4. Problem Statements
  if (sections.problemStatements) {
    sections.problemStatements.forEach((p) => {
      if (p.isRemoved) return;
      const coord = drawLine(p.currentText || p.originalText, 11, true);
      if (coord) {
        p.x = coord.x;
        p.y = coord.y;
        p.width = coord.width;
        p.height = coord.height;
        p.pageNum = coord.pageNum;
        p.pageIndex = coord.pageIndex;
      }
    });
    currentY -= 6;
  }

  // 5. Code Blocks
  if (sections.codeBlocks) {
    sections.codeBlocks.forEach((c) => {
      if (c.isRemoved) return;
      const coord = drawLine(c.currentText || c.originalText, 10, false, true);
      if (coord) {
        c.x = coord.x;
        c.y = coord.y;
        c.width = coord.width;
        c.height = coord.height;
        c.pageNum = coord.pageNum;
        c.pageIndex = coord.pageIndex;
      }
    });
    currentY -= 6;
  }

  // 6. Conclusions
  if (sections.conclusionLines) {
    sections.conclusionLines.forEach((c) => {
      if (c.isRemoved) return;
      const coord = drawLine(c.currentText || c.originalText, 12, true);
      if (coord) {
        c.x = coord.x;
        c.y = coord.y;
        c.width = coord.width;
        c.height = coord.height;
        c.pageNum = coord.pageNum;
        c.pageIndex = coord.pageIndex;
      }
    });
    currentY -= 6;
  }

  // 7. Other general lines
  if (sections.otherLines) {
    sections.otherLines.forEach((o) => {
      if (o.isRemoved) return;
      const coord = drawLine(o.currentText || o.originalText, 11, false);
      if (coord) {
        o.x = coord.x;
        o.y = coord.y;
        o.width = coord.width;
        o.height = coord.height;
        o.pageNum = coord.pageNum;
        o.pageIndex = coord.pageIndex;
      }
    });
  }

  const pdfBytes = await pdfDoc.save();
  return {
    pdfBytes,
    numPages: pageIndex + 1,
  };
}

/**
 * Parses and bifurcates a Word document (.docx) into structured sections.
 */
export async function parseAndBifurcateDocx(arrayBuffer, fileName = 'document.docx') {
  let rawLines = [];

  // 1. Try extracting raw text with mammoth
  try {
    const rawResult = await (typeof window !== 'undefined'
      ? mammoth.extractRawText({ arrayBuffer })
      : mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) }));
    rawLines = (rawResult.value || '')
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  } catch (err) {
    console.warn('Mammoth text extraction note:', err);
  }

  // 2. Fallback: if mammoth returned no text, parse word/document.xml with JSZip
  if (rawLines.length === 0) {
    try {
      const zip = await JSZip.loadAsync(arrayBuffer);
      const xmlFile = zip.file('word/document.xml');
      if (xmlFile) {
        const xml = await xmlFile.async('text');
        const pRegex = /<w:p(?: [^>]*)?>([\s\S]*?)<\/w:p>/g;
        let pMatch;
        while ((pMatch = pRegex.exec(xml)) !== null) {
          const pXml = pMatch[1];
          const tRegex = /<w:t(?: [^>]*)?>([\s\S]*?)<\/w:t>/g;
          let tMatch;
          let pText = '';
          while ((tMatch = tRegex.exec(pXml)) !== null) {
            pText += tMatch[1];
          }
          if (pText.trim()) {
            rawLines.push(pText.trim());
          }
        }
      }
    } catch (e) {
      console.error('JSZip fallback extraction error:', e);
    }
  }

  const personalTags = [];
  const headerLines = [];
  const experimentSections = [];
  const problemStatements = [];
  const codeBlocks = [];
  const outputSections = [];
  const conclusionLines = [];
  const otherLines = [];

  rawLines.forEach((line, idx) => {
    const itemId = `docx_line_${idx}`;

    // Test for personal tags first
    let matchedTag = false;
    for (const tagDef of TAG_REGEXES) {
      const match = line.match(tagDef.regex);
      if (match) {
        const prefix = line.substring(0, line.indexOf(match[1]) === -1 ? line.length : line.indexOf(match[1]));
        const originalVal = match[1] ? match[1].trim() : '';

        personalTags.push({
          id: `tag_${tagDef.key}_${itemId}`,
          itemId,
          category: 'personal',
          key: tagDef.key,
          label: tagDef.label,
          prefix: prefix || `${tagDef.label}: `,
          originalValue: originalVal,
          currentValue: originalVal,
          fullOriginalText: line,
          pageNum: 1,
          pageIndex: 0,
          x: 60,
          y: 700 - idx * 20,
          width: 200,
          height: 14,
          fontSize: 11,
          fontName: 'Helvetica',
        });
        matchedTag = true;
        break;
      }
    }

    if (matchedTag) return;

    // Institution / Header lines
    if (
      idx < 5 &&
      /(?:college|university|institute|school|department|autonomous|engineering|technology)/i.test(line)
    ) {
      headerLines.push({
        id: `header_${itemId}`,
        itemId,
        category: 'header',
        originalText: line,
        currentText: line,
        pageNum: 1,
        pageIndex: 0,
        x: 60,
        y: 780 - idx * 20,
        width: 350,
        height: 16,
        fontSize: 13,
      });
      return;
    }

    // Experiment Title
    if (/^(?:experiment|exp\.?)\s*(?:no\.?|number)?/i.test(line)) {
      experimentSections.push({
        id: `exp_${itemId}`,
        itemId,
        category: 'experiment',
        originalText: line,
        currentText: line,
        pageNum: 1,
        pageIndex: 0,
        x: 60,
        y: 720,
        width: 300,
        height: 16,
        fontSize: 14,
      });
      return;
    }

    // Problem Statements / Questions
    if (/^(?:question|problem|q\d+|aim|objective|task)/i.test(line)) {
      problemStatements.push({
        id: `prob_${itemId}`,
        itemId,
        category: 'problem',
        originalText: line,
        currentText: line,
        pageNum: 1,
        pageIndex: 0,
        x: 60,
        y: 600 - idx * 15,
        width: 400,
        height: 14,
        fontSize: 11,
      });
      return;
    }

    // Code blocks
    if (
      /^(?:reference\s*code|program\s*code|code\s*[:\-])/i.test(line) ||
      /(?:syms|laplace|disp\(|fplot|clc;|clear;|grid\s*on|#include|def\s+|class\s+|console\.log)/i.test(line)
    ) {
      codeBlocks.push({
        id: `code_${itemId}`,
        itemId,
        category: 'code',
        originalText: line,
        currentText: line,
        pageNum: 1,
        pageIndex: 0,
        x: 60,
        y: 500 - idx * 15,
        width: 450,
        height: 14,
        fontSize: 10,
      });
      return;
    }

    // Conclusions
    if (/^(?:conclusion|results?|summary|learning\s*outcome)/i.test(line)) {
      conclusionLines.push({
        id: `concl_${itemId}`,
        itemId,
        category: 'conclusion',
        originalText: line,
        currentText: line,
        pageNum: 1,
        pageIndex: 0,
        x: 60,
        y: 300 - idx * 15,
        width: 350,
        height: 15,
        fontSize: 12,
      });
      return;
    }

    // Other lines
    otherLines.push({
      id: `other_${itemId}`,
      itemId,
      category: 'other',
      originalText: line,
      currentText: line,
      pageNum: 1,
      pageIndex: 0,
      x: 60,
      y: 400 - idx * 15,
      width: 400,
      height: 14,
      fontSize: 11,
    });
  });

  const sections = {
    personalTags,
    headerLines,
    experimentSections,
    problemStatements,
    codeBlocks,
    outputSections,
    conclusionLines,
    otherLines,
  };

  // Generate A4 PDF representation for viewer and direct on-page editing
  const { pdfBytes, numPages } = await renderSectionsToPdf(sections);

  return {
    sections,
    numPages,
    pdfBytes,
    originalDocxBytes: arrayBuffer,
  };
}

/**
 * Modifies an existing Word document (.docx) by replacing tags and text inside word/document.xml.
 * Preserves 100% of the original document's tables, images, headers, footers, styles, and margins!
 */
export async function modifyDocxBytes(originalDocxBytes, sections, customReplacements = []) {
  if (!originalDocxBytes) return null;

  try {
    const zip = await JSZip.loadAsync(originalDocxBytes);
    const docFile = zip.file('word/document.xml');
    if (!docFile) return null;

    let docXml = await docFile.async('text');

    // 1. Personal tags replacements
    if (sections?.personalTags) {
      sections.personalTags.forEach((tag) => {
        if (tag.isRemoved) {
          if (tag.fullOriginalText) {
            docXml = docXml.split(tag.fullOriginalText).join('');
          } else if (tag.originalValue) {
            docXml = docXml.split(tag.originalValue).join('');
          }
        } else if (tag.currentValue && tag.originalValue && tag.currentValue !== tag.originalValue) {
          docXml = docXml.split(tag.originalValue).join(tag.currentValue);
        }
      });
    }

    // 2. Section text line replacements
    const replaceGroup = (lines) => {
      if (!lines) return;
      lines.forEach((l) => {
        if (l.isRemoved) {
          docXml = docXml.split(l.originalText).join('');
        } else if (l.currentText && l.originalText && l.currentText !== l.originalText) {
          docXml = docXml.split(l.originalText).join(l.currentText);
        }
      });
    };

    replaceGroup(sections?.headerLines);
    replaceGroup(sections?.experimentSections);
    replaceGroup(sections?.problemStatements);
    replaceGroup(sections?.codeBlocks);
    replaceGroup(sections?.conclusionLines);
    replaceGroup(sections?.otherLines);

    // 3. Custom global replacements
    if (customReplacements) {
      customReplacements.forEach((c) => {
        if (c.findText && c.replaceWith) {
          docXml = docXml.split(c.findText).join(c.replaceWith);
        }
      });
    }

    zip.file('word/document.xml', docXml);
    return await zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });
  } catch (err) {
    console.error('Error modifying docx directly via JSZip:', err);
    return null;
  }
}
