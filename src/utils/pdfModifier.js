import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { clonePdfBytes } from './pdfSetup.js';

/**
 * Modifies an existing PDF buffer by applying edited personal tags and section text changes.
 * Preserves all original vector graphics, images (MATLAB plots), formulas, and formatting.
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
      if (!tag.currentValue || tag.currentValue === tag.originalValue) {
        // Even if value is unchanged, if user modified prefix, check
        if (tag.prefix === undefined) continue;
      }

      const page = pages[tag.pageIndex];
      if (!page) continue;

      const newFullText = `${tag.prefix || ''}${tag.currentValue}`;
      const originalFullText = tag.fullOriginalText || `${tag.prefix || ''}${tag.originalValue}`;

      if (newFullText.trim() === originalFullText.trim()) continue;

      const fontSize = tag.fontSize || 12;
      const font = getFont(tag.fontName, true);

      // Calculate width to mask
      // Mask sufficiently wide to clear the original text and allow new text
      const maskWidth = Math.max(tag.width + 25, newFullText.length * fontSize * 0.65 + 30);
      const maskHeight = Math.max(tag.height + 4, fontSize + 4);

      // Mask old text with white rectangle
      page.drawRectangle({
        x: Math.max(tag.x - 2, 0),
        y: tag.y - 3,
        width: maskWidth,
        height: maskHeight,
        color: rgb(1, 1, 1),
      });

      // Draw updated text
      page.drawText(newFullText, {
        x: tag.x,
        y: tag.y,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
    }
  }

  // 2. Apply Header Lines modifications
  if (sections.headerLines) {
    for (const line of sections.headerLines) {
      if (!line.currentText || line.currentText === line.originalText) continue;
      const page = pages[line.pageIndex];
      if (!page) continue;

      const fontSize = line.fontSize || 10;
      const isBold = fontSize >= 11;
      const font = getFont(line.fontName, isBold);

      const maskWidth = Math.max(line.width + 20, line.currentText.length * fontSize * 0.6 + 20);
      const maskHeight = Math.max(line.height + 4, fontSize + 4);

      page.drawRectangle({
        x: Math.max(line.x - 2, 0),
        y: line.y - 3,
        width: maskWidth,
        height: maskHeight,
        color: rgb(1, 1, 1),
      });

      page.drawText(line.currentText, {
        x: line.x,
        y: line.y,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
    }
  }

  // 3. Apply Experiment Title / Section modifications
  if (sections.experimentSections) {
    for (const exp of sections.experimentSections) {
      if (!exp.currentText || exp.currentText === exp.originalText) continue;
      const page = pages[exp.pageIndex];
      if (!page) continue;

      const fontSize = exp.fontSize || 14;
      const font = getFont(exp.fontName, true);

      const maskWidth = Math.max(exp.width + 30, exp.currentText.length * fontSize * 0.65 + 20);
      const maskHeight = Math.max(exp.height + 6, fontSize + 6);

      page.drawRectangle({
        x: Math.max(exp.x - 2, 0),
        y: exp.y - 3,
        width: maskWidth,
        height: maskHeight,
        color: rgb(1, 1, 1),
      });

      page.drawText(exp.currentText, {
        x: exp.x,
        y: exp.y,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
    }
  }

  // 4. Apply Problem Statements modifications
  if (sections.problemStatements) {
    for (const prob of sections.problemStatements) {
      if (!prob.currentText || prob.currentText === prob.originalText) continue;
      const page = pages[prob.pageIndex];
      if (!page) continue;

      const fontSize = prob.fontSize || 10.5;
      const font = getFont(prob.fontName, true);

      const maskWidth = Math.max(prob.width + 20, prob.currentText.length * fontSize * 0.6 + 20);
      const maskHeight = Math.max(prob.height + 4, fontSize + 4);

      page.drawRectangle({
        x: Math.max(prob.x - 2, 0),
        y: prob.y - 3,
        width: maskWidth,
        height: maskHeight,
        color: rgb(1, 1, 1),
      });

      page.drawText(prob.currentText, {
        x: prob.x,
        y: prob.y,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
    }
  }

  // 5. Apply Conclusion modifications
  if (sections.conclusionLines) {
    for (const concl of sections.conclusionLines) {
      if (!concl.currentText || concl.currentText === concl.originalText) continue;
      const page = pages[concl.pageIndex];
      if (!page) continue;

      const fontSize = concl.fontSize || 13;
      const font = getFont(concl.fontName, true);

      const maskWidth = Math.max(concl.width + 30, concl.currentText.length * fontSize * 0.65 + 20);
      const maskHeight = Math.max(concl.height + 6, fontSize + 6);

      page.drawRectangle({
        x: Math.max(concl.x - 2, 0),
        y: concl.y - 3,
        width: maskWidth,
        height: maskHeight,
        color: rgb(1, 1, 1),
      });

      page.drawText(concl.currentText, {
        x: concl.x,
        y: concl.y,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
    }
  }

  // 6. Apply Code Blocks modifications
  if (sections.codeBlocks) {
    for (const codeItem of sections.codeBlocks) {
      if (!codeItem.currentText || codeItem.currentText === codeItem.originalText) continue;
      const page = pages[codeItem.pageIndex];
      if (!page) continue;

      const fontSize = codeItem.fontSize || 10;
      const font = courier;

      const maskWidth = Math.max(codeItem.width + 20, codeItem.currentText.length * fontSize * 0.6 + 20);
      const maskHeight = Math.max(codeItem.height + 4, fontSize + 4);

      page.drawRectangle({
        x: Math.max(codeItem.x - 2, 0),
        y: codeItem.y - 3,
        width: maskWidth,
        height: maskHeight,
        color: rgb(1, 1, 1),
      });

      page.drawText(codeItem.currentText, {
        x: codeItem.x,
        y: codeItem.y,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
    }
  }

  // 7. Apply Custom User Replacements
  for (const custom of customReplacements) {
    if (!custom.findText || !custom.replaceWith) continue;
    const targetPage = pages[custom.pageIndex || 0];
    if (!targetPage) continue;

    const x = custom.x || 70;
    const y = custom.y || 700;
    const fontSize = custom.fontSize || 12;

    targetPage.drawRectangle({
      x: x - 2,
      y: y - 3,
      width: Math.max((custom.width || 150) + 20, custom.replaceWith.length * fontSize * 0.6 + 20),
      height: fontSize + 4,
      color: rgb(1, 1, 1),
    });

    targetPage.drawText(custom.replaceWith, {
      x,
      y,
      size: fontSize,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
  }

  return await pdfDoc.save();
}
