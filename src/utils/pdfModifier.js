import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { clonePdfBytes, sanitizeForPdf } from './pdfSetup.js';

/**
 * Modifies an existing PDF buffer by applying edited personal tags and section text changes.
 * Preserves all original vector graphics, images (MATLAB plots), formulas, and formatting.
 * Supports manual removal/deletion of any line or section via clean whiteout masking.
 * 
 * @param {ArrayBuffer|Uint8Array} originalPdfBuffer 
 * @param {Object} sections - The sections object containing updated tags & lines
 * @param {Array} customReplacements - Any user-defined custom replacements
 * @returns {Promise<Uint8Array>} modified PDF bytes
 */
export async function applyPdfModifications(originalPdfBuffer, sections, customReplacements = []) {
  const safeData = clonePdfBytes(originalPdfBuffer);
  const pdfDoc = await PDFDocument.load(safeData, { ignoreEncryption: true });
  
  // Embed standard fonts for crisp replacement rendering
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const courier = await pdfDoc.embedFont(StandardFonts.Courier);

  const pages = pdfDoc.getPages();

  // Helper to pick font based on original font name or style
  const getFont = (fontName, isBold) => {
    if (fontName && /courier/i.test(fontName)) return courier;
    if (fontName && /helvetica|arial|sans/i.test(fontName)) {
      return isBold ? helveticaBold : helveticaRegular;
    }
    return isBold ? timesBold : timesRegular;
  };

  // 1. Apply Personal Identity Tags modifications (Name, Roll, Batch, Division, PRN, etc.)
  if (sections.personalTags) {
    for (const tag of sections.personalTags) {
      const isRemoved = !!tag.isRemoved || tag.currentValue === '';
      const isModified = tag.currentValue !== tag.originalValue;

      if (!isRemoved && !isModified) continue;

      const page = pages[tag.pageIndex];
      if (!page) continue;

      const newFullText = isRemoved ? '' : `${tag.prefix || ''}${tag.currentValue}`;
      const originalFullText = tag.fullOriginalText || `${tag.prefix || ''}${tag.originalValue}`;

      if (!isRemoved && newFullText.trim() === originalFullText.trim()) continue;

      const fontSize = tag.fontSize || 12;
      const font = getFont(tag.fontName, true);

      // Mask width must cover original text completely
      const maskWidth = Math.max(tag.width + 25, newFullText.length * fontSize * 0.65 + 30);
      const maskHeight = Math.max(tag.height + 4, fontSize + 4);

      // Whiteout mask to erase old text
      page.drawRectangle({
        x: Math.max(tag.x - 2, 0),
        y: tag.y - 3,
        width: maskWidth,
        height: maskHeight,
        color: rgb(1, 1, 1),
      });

      // Draw updated text if not removed
      if (!isRemoved && newFullText.trim()) {
        const safeText = sanitizeForPdf(newFullText, font);
        page.drawText(safeText, {
          x: tag.x,
          y: tag.y,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        });
      }
    }
  }

  // 2. Helper to process standard text line arrays
  const processLineGroup = (lines, defaultFontSize, isBold, fontOverride) => {
    if (!lines) return;
    for (const item of lines) {
      const isRemoved = !!item.isRemoved || item.currentText === '';
      const isModified = item.currentText !== item.originalText;

      if (!isRemoved && !isModified) continue;

      const page = pages[item.pageIndex];
      if (!page) continue;

      const fontSize = item.fontSize || defaultFontSize;
      const font = fontOverride || getFont(item.fontName, isBold);

      const targetText = isRemoved ? '' : (item.currentText || '');
      const maskWidth = Math.max(item.width + 20, targetText.length * fontSize * 0.65 + 20);
      const maskHeight = Math.max(item.height + 4, fontSize + 4);

      // Whiteout mask
      page.drawRectangle({
        x: Math.max(item.x - 2, 0),
        y: item.y - 3,
        width: maskWidth,
        height: maskHeight,
        color: rgb(1, 1, 1),
      });

      // Draw replacement text if not removed
      if (!isRemoved && targetText.trim()) {
        const safeText = sanitizeForPdf(targetText, font);
        page.drawText(safeText, {
          x: item.x,
          y: item.y,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        });
      }
    }
  };

  // 2. Apply Header Lines modifications
  processLineGroup(sections.headerLines, 10, true);

  // 3. Apply Experiment Title / Section modifications
  processLineGroup(sections.experimentSections, 14, true);

  // 4. Apply Problem Statements modifications
  processLineGroup(sections.problemStatements, 10.5, true);

  // 5. Apply Output Sections modifications
  processLineGroup(sections.outputSections, 10.5, true);

  // 6. Apply Conclusion modifications
  processLineGroup(sections.conclusionLines, 13, true);

  // 7. Apply Code Blocks modifications
  processLineGroup(sections.codeBlocks, 10, false, courier);

  // 8. Apply General / Other Lines modifications
  processLineGroup(sections.otherLines, 11, false);

  // 9. Apply Custom User Replacements
  for (const custom of customReplacements) {
    if (!custom.findText && !custom.replaceWith) continue;
    const targetPage = pages[custom.pageIndex || 0];
    if (!targetPage) continue;

    const x = custom.x || 70;
    const y = custom.y || 700;
    const fontSize = custom.fontSize || 12;

    targetPage.drawRectangle({
      x: x - 2,
      y: y - 3,
      width: Math.max((custom.width || 150) + 20, (custom.replaceWith || '').length * fontSize * 0.6 + 20),
      height: fontSize + 4,
      color: rgb(1, 1, 1),
    });

    if (custom.replaceWith && custom.replaceWith.trim()) {
      const safeText = sanitizeForPdf(custom.replaceWith, helveticaBold);
      targetPage.drawText(safeText, {
        x,
        y,
        size: fontSize,
        font: helveticaBold,
        color: rgb(0, 0, 0),
      });
    }
  }

  return await pdfDoc.save();
}
