import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  ImageRun,
} from 'docx';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { sanitizeForPdf } from './pdfSetup.js';

/**
 * Converts a base64 DataURL or raw base64 string to Uint8Array.
 */
export function base64ToUint8Array(dataUrlOrBase64) {
  if (!dataUrlOrBase64) return new Uint8Array(0);
  let base64 = dataUrlOrBase64;
  if (base64.includes(',')) {
    base64 = base64.split(',')[1];
  }
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Converts extracted PDF sections & images into an authentic Microsoft Word (.docx) Uint8Array.
 * Preserves document hierarchy, titles, metadata table, paragraphs, and figures.
 */
export async function convertPdfSectionsToDocxBytes(sections, title = 'Document') {
  if (!sections) return null;

  const children = [];

  // 1. Organization Headers (College / Company letterhead)
  const headers = (sections.headerLines || []).filter(
    (h) => !h.isRemoved && (h.currentText || h.originalText)
  );
  if (headers.length > 0) {
    for (const h of headers) {
      const text = (h.currentText || h.originalText).trim();
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [
            new TextRun({
              text,
              bold: true,
              size: 24, // 12pt
              font: 'Times New Roman',
              color: '1E293B',
            }),
          ],
        })
      );
    }
    children.push(new Paragraph({ spacing: { after: 160 } }));
  }

  // 2. Embedded Images (e.g. Logos, figures)
  const images = (sections.images || []).filter((img) => !img.isRemoved && img.dataUrl);
  if (images.length > 0) {
    for (const img of images) {
      try {
        const imgBytes = base64ToUint8Array(img.dataUrl);
        if (imgBytes.length > 0) {
          const width = Math.min(img.width || 250, 480);
          const height = Math.min(img.height || 150, 300);
          children.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 180 },
              children: [
                new ImageRun({
                  data: imgBytes,
                  transformation: { width, height },
                }),
              ],
            })
          );
        }
      } catch (err) {
        console.warn('Failed embedding image in docx:', err);
      }
    }
  }

  // 3. Document / Project Title
  const titles = (sections.experimentSections || []).filter(
    (e) => !e.isRemoved && (e.currentText || e.originalText)
  );
  if (titles.length > 0) {
    for (const t of titles) {
      const text = (t.currentText || t.originalText).trim();
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 160 },
          children: [
            new TextRun({
              text,
              bold: true,
              underline: {},
              size: 28, // 14pt
              font: 'Times New Roman',
              color: '0F172A',
            }),
          ],
        })
      );
    }
    children.push(new Paragraph({ spacing: { after: 200 } }));
  }

  // 4. Metadata / Tags Table (Author, PRN, Roll No, Dept, Date)
  const tags = (sections.personalTags || []).filter(
    (t) => !t.isRemoved && (t.currentValue || t.originalValue)
  );
  if (tags.length > 0) {
    const tableRows = tags.map((t) => {
      const label = t.label || t.prefix?.replace(/[:\-–.]/g, '').trim() || 'Detail';
      const val = (t.currentValue || t.originalValue || '').trim();

      return new TableRow({
        children: [
          new TableCell({
            width: { size: 35, type: WidthType.PERCENTAGE },
            shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
            margins: { top: 100, bottom: 100, left: 140, right: 140 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: label + ':',
                    bold: true,
                    size: 22,
                    font: 'Calibri',
                    color: '334155',
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 65, type: WidthType.PERCENTAGE },
            margins: { top: 100, bottom: 100, left: 140, right: 140 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: val,
                    bold: true,
                    size: 22,
                    font: 'Calibri',
                    color: '0F172A',
                  }),
                ],
              }),
            ],
          }),
        ],
      });
    });

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
          bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
          left: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
          right: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
          insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
        },
        rows: tableRows,
      })
    );
    children.push(new Paragraph({ spacing: { after: 240 } }));
  }

  // 5. Problem Statements, Aim, Objectives
  const problems = (sections.problemStatements || []).filter(
    (p) => !p.isRemoved && (p.currentText || p.originalText)
  );
  if (problems.length > 0) {
    for (const p of problems) {
      const text = (p.currentText || p.originalText).trim();
      const isHeading = /^(?:aim|objective|objectives|problem|task|question)/i.test(text);

      children.push(
        new Paragraph({
          spacing: { before: isHeading ? 160 : 60, after: 80 },
          children: [
            new TextRun({
              text,
              bold: isHeading,
              size: isHeading ? 24 : 22,
              font: 'Calibri',
              color: isHeading ? '0F172A' : '1E293B',
            }),
          ],
        })
      );
    }
  }

  // 6. Body Paragraphs & General Content
  const bodyLines = (sections.otherLines || []).filter(
    (l) => !l.isRemoved && (l.currentText || l.originalText)
  );
  if (bodyLines.length > 0) {
    for (const b of bodyLines) {
      const text = (b.currentText || b.originalText).trim();
      const isBullet = /^[\u2022\u25E6\u25AA\u2023\-\*]\s*/.test(text);
      const clean = text.replace(/^[\u2022\u25E6\u25AA\u2023\-\*]\s*/, '');

      children.push(
        new Paragraph({
          bullet: isBullet ? { level: 0 } : undefined,
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: isBullet ? clean : text,
              size: 22, // 11pt
              font: 'Calibri',
              color: '1E293B',
            }),
          ],
        })
      );
    }
  }

  // 7. Program Code Blocks
  const codeLines = (sections.codeBlocks || []).filter(
    (c) => !c.isRemoved && (c.currentText || c.originalText)
  );
  if (codeLines.length > 0) {
    children.push(
      new Paragraph({
        spacing: { before: 180, after: 60 },
        children: [
          new TextRun({
            text: 'Source Code / Implementation:',
            bold: true,
            size: 22,
            font: 'Calibri',
          }),
        ],
      })
    );

    for (const c of codeLines) {
      const text = (c.currentText || c.originalText).trim();
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
          children: [
            new TextRun({
              text,
              size: 19, // 9.5pt
              font: 'Courier New',
              color: '0F172A',
            }),
          ],
        })
      );
    }
  }

  // 8. Conclusions & Results
  const conclusions = (sections.conclusionLines || []).filter(
    (c) => !c.isRemoved && (c.currentText || c.originalText)
  );
  if (conclusions.length > 0) {
    children.push(
      new Paragraph({
        spacing: { before: 200, after: 80 },
        children: [
          new TextRun({
            text: 'Conclusion & Summary:',
            bold: true,
            size: 24,
            font: 'Calibri',
            color: '0F172A',
          }),
        ],
      })
    );

    for (const c of conclusions) {
      const text = (c.currentText || c.originalText).trim();
      children.push(
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({
              text,
              size: 22,
              font: 'Calibri',
              color: '1E293B',
            }),
          ],
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }, // 1 inch
          },
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toArrayBuffer(doc);
  return new Uint8Array(buffer);
}

/**
 * Converts structured sections into semantic HTML for the Word Document Editor.
 */
export function convertSectionsToHtml(sections) {
  if (!sections) return '<p>No document content available.</p>';

  const parts = [];

  // 1. Organization Headers
  const headers = (sections.headerLines || []).filter(
    (h) => !h.isRemoved && (h.currentText || h.originalText)
  );
  if (headers.length > 0) {
    parts.push('<div class="doc-header-block text-center mb-4">');
    headers.forEach((h) => {
      const val = (h.currentText || h.originalText).trim();
      parts.push(`<h2 class="text-base font-bold text-gray-800 uppercase tracking-wide my-1" data-section-id="${h.id}">${val}</h2>`);
    });
    parts.push('</div>');
  }

  // 2. Images
  const images = (sections.images || []).filter((img) => !img.isRemoved && img.dataUrl);
  if (images.length > 0) {
    images.forEach((img) => {
      parts.push(
        `<div class="doc-image-block text-center my-4 group relative inline-block max-w-full" data-img-id="${img.id}">
          <img src="${img.dataUrl}" alt="Document Figure" class="mx-auto rounded border border-gray-200 max-h-72 object-contain" />
        </div>`
      );
    });
  }

  // 3. Document Title
  const titles = (sections.experimentSections || []).filter(
    (t) => !t.isRemoved && (t.currentText || t.originalText)
  );
  if (titles.length > 0) {
    titles.forEach((t) => {
      const val = (t.currentText || t.originalText).trim();
      parts.push(`<h1 class="text-xl font-bold text-gray-900 text-center my-3 underline" data-section-id="${t.id}">${val}</h1>`);
    });
  }

  // 4. Metadata Details Table
  const tags = (sections.personalTags || []).filter(
    (t) => !t.isRemoved && (t.currentValue || t.originalValue)
  );
  if (tags.length > 0) {
    parts.push('<table class="doc-meta-table w-full border border-gray-300 my-4 text-sm bg-white">');
    parts.push('<tbody>');
    tags.forEach((t) => {
      const label = t.label || t.prefix?.replace(/[:\-–.]/g, '').trim() || 'Detail';
      const val = (t.currentValue || t.originalValue || '').trim();
      parts.push(
        `<tr class="border-b border-gray-200" data-tag-id="${t.id}">
          <td class="w-1/3 px-3 py-2 font-semibold text-gray-700 bg-gray-50 border-r border-gray-200">${label}:</td>
          <td class="w-2/3 px-3 py-2 font-medium text-gray-900">${val}</td>
        </tr>`
      );
    });
    parts.push('</tbody></table>');
  }

  // 5. Problem Statements, Aim, Objectives
  const problems = (sections.problemStatements || []).filter(
    (p) => !p.isRemoved && (p.currentText || p.originalText)
  );
  if (problems.length > 0) {
    problems.forEach((p) => {
      const text = (p.currentText || p.originalText).trim();
      const isAim = /^(?:aim|objective|objectives|problem\s*statement|task)/i.test(text);
      if (isAim) {
        parts.push(`<h3 class="text-base font-bold text-gray-900 mt-4 mb-1" data-section-id="${p.id}">${text}</h3>`);
      } else {
        parts.push(`<p class="text-sm text-gray-800 my-1.5 leading-relaxed" data-section-id="${p.id}">${text}</p>`);
      }
    });
  }

  // 6. Body Paragraphs & Bullet Points
  const body = (sections.otherLines || []).filter(
    (l) => !l.isRemoved && (l.currentText || l.originalText)
  );
  if (body.length > 0) {
    body.forEach((b) => {
      const text = (b.currentText || b.originalText).trim();
      const isBullet = /^[\u2022\u25E6\u25AA\u2023\-\*]\s*/.test(text);
      if (isBullet) {
        const clean = text.replace(/^[\u2022\u25E6\u25AA\u2023\-\*]\s*/, '');
        parts.push(`<p class="text-sm text-gray-800 my-1 ml-4 list-item list-disc" data-section-id="${b.id}">${clean}</p>`);
      } else {
        parts.push(`<p class="text-sm text-gray-800 my-2 leading-relaxed" data-section-id="${b.id}">${text}</p>`);
      }
    });
  }

  // 7. Code Blocks
  const code = (sections.codeBlocks || []).filter(
    (c) => !c.isRemoved && (c.currentText || c.originalText)
  );
  if (code.length > 0) {
    parts.push('<h3 class="text-base font-bold text-gray-900 mt-4 mb-2">Source Code:</h3>');
    parts.push('<pre class="doc-code-block bg-gray-50 border border-gray-200 rounded p-3 text-xs font-mono text-gray-800 overflow-x-auto my-3 leading-snug">');
    code.forEach((c) => {
      parts.push((c.currentText || c.originalText).trim());
    });
    parts.push('</pre>');
  }

  // 8. Conclusions & Results
  const conclusions = (sections.conclusionLines || []).filter(
    (c) => !c.isRemoved && (c.currentText || c.originalText)
  );
  if (conclusions.length > 0) {
    parts.push('<h3 class="text-base font-bold text-gray-900 mt-5 mb-2">Conclusion:</h3>');
    conclusions.forEach((c) => {
      const text = (c.currentText || c.originalText).trim();
      parts.push(`<p class="text-sm text-gray-800 my-1.5 leading-relaxed" data-section-id="${c.id}">${text}</p>`);
    });
  }

  return parts.join('\n');
}

/**
 * Parses modified HTML from the Word Document Editor and compiles it into an authentic .docx file.
 */
export async function convertHtmlToDocxBytes(htmlString, title = 'Document') {
  if (!htmlString) return null;

  if (typeof DOMParser === 'undefined') {
    return null;
  }

  const parser = new DOMParser();
  const docDom = parser.parseFromString(htmlString, 'text/html');
  const body = docDom.body;

  const children = [];

  const parseNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const txt = node.textContent?.trim();
      if (txt) {
        return [new TextRun({ text: txt })];
      }
      return [];
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return [];

    const tagName = node.tagName.toLowerCase();

    // 1. Headings
    if (tagName === 'h1') {
      return [
        new Paragraph({
          text: node.textContent?.trim() || '',
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { before: 180, after: 180 },
        }),
      ];
    }
    if (tagName === 'h2') {
      return [
        new Paragraph({
          text: node.textContent?.trim() || '',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 160, after: 120 },
        }),
      ];
    }
    if (tagName === 'h3') {
      return [
        new Paragraph({
          text: node.textContent?.trim() || '',
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 140, after: 80 },
        }),
      ];
    }

    // 2. Images
    if (tagName === 'img') {
      const src = node.getAttribute('src');
      if (src && src.startsWith('data:image')) {
        try {
          const imgBytes = base64ToUint8Array(src);
          const width = parseInt(node.getAttribute('width') || '350', 10);
          const height = parseInt(node.getAttribute('height') || '200', 10);
          return [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 140 },
              children: [
                new ImageRun({
                  data: imgBytes,
                  transformation: { width: Math.min(width, 480), height: Math.min(height, 300) },
                }),
              ],
            }),
          ];
        } catch (e) {
          console.warn('Image parse failed:', e);
        }
      }
      return [];
    }

    // 3. Tables
    if (tagName === 'table') {
      const trs = node.querySelectorAll('tr');
      const tableRows = [];

      trs.forEach((tr) => {
        const tds = tr.querySelectorAll('td, th');
        if (tds.length === 0) return;

        const cells = [];
        tds.forEach((td, colIdx) => {
          const isHeader = td.tagName.toLowerCase() === 'th' || colIdx === 0;
          cells.push(
            new TableCell({
              width: { size: Math.floor(100 / tds.length), type: WidthType.PERCENTAGE },
              shading: isHeader ? { fill: 'F8FAFC', type: ShadingType.CLEAR } : undefined,
              margins: { top: 100, bottom: 100, left: 140, right: 140 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: td.textContent?.trim() || '',
                      bold: isHeader,
                      size: 22,
                      font: 'Calibri',
                    }),
                  ],
                }),
              ],
            })
          );
        });

        tableRows.push(new TableRow({ children: cells }));
      });

      if (tableRows.length > 0) {
        return [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
              left: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
              right: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
              insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
            },
            rows: tableRows,
          }),
          new Paragraph({ spacing: { after: 160 } }),
        ];
      }
      return [];
    }

    // 4. Code / Preformatted
    if (tagName === 'pre' || tagName === 'code') {
      const lines = (node.textContent || '').split('\n');
      const paras = [];
      lines.forEach((line) => {
        if (!line.trim()) return;
        paras.push(
          new Paragraph({
            spacing: { after: 30 },
            shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
            children: [
              new TextRun({
                text: line,
                size: 19,
                font: 'Courier New',
                color: '0F172A',
              }),
            ],
          })
        );
      });
      return paras;
    }

    // 5. Lists (ul, ol, li)
    if (tagName === 'li') {
      return [
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: node.textContent?.trim() || '', size: 22, font: 'Calibri' })],
        }),
      ];
    }

    // 6. Paragraphs & Generic Divs
    if (tagName === 'p' || tagName === 'div') {
      // Check if this container contains image or sub-elements
      const img = node.querySelector('img');
      if (img && node.childNodes.length === 1) {
        return parseNode(img);
      }

      const text = node.textContent?.trim() || '';
      if (!text) return [];

      const isBullet = node.classList?.contains('list-item') || /^[\u2022\u25E6\u25AA\u2023\-\*]\s*/.test(text);
      const clean = text.replace(/^[\u2022\u25E6\u25AA\u2023\-\*]\s*/, '');

      return [
        new Paragraph({
          bullet: isBullet ? { level: 0 } : undefined,
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: isBullet ? clean : text,
              size: 22,
              font: 'Calibri',
              color: '1E293B',
            }),
          ],
        }),
      ];
    }

    // Default: traverse child nodes
    const subChildren = [];
    Array.from(node.childNodes).forEach((child) => {
      const parsed = parseNode(child);
      if (Array.isArray(parsed)) {
        subChildren.push(...parsed);
      }
    });
    return subChildren;
  };

  Array.from(body.childNodes).forEach((node) => {
    const parsed = parseNode(node);
    if (Array.isArray(parsed)) {
      children.push(...parsed);
    }
  });

  if (children.length === 0) {
    children.push(
      new Paragraph({
        text: 'Document Content',
        children: [new TextRun({ text: 'Empty Document' })],
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toArrayBuffer(doc);
  return new Uint8Array(buffer);
}

/**
 * Synthesizes a high-fidelity PDF from the Word Mode HTML document using pdf-lib.
 */
export async function convertHtmlToPdfBytes(htmlString, title = 'Document') {
  const pdfDoc = await PDFDocument.create();
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const courier = await pdfDoc.embedFont(StandardFonts.Courier);

  const pageWidth = 595.28; // A4
  const pageHeight = 841.89; // A4
  const marginX = 54;
  const marginTop = 54;
  const marginBottom = 54;

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let currentY = pageHeight - marginTop;

  const checkPageBreak = (neededHeight) => {
    if (currentY - neededHeight < marginBottom) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      currentY = pageHeight - marginTop;
    }
  };

  const drawTextLine = (text, fontSize = 11, isBold = false, isMono = false, align = 'left') => {
    checkPageBreak(fontSize + 10);
    const font = isMono ? courier : isBold ? timesBold : timesRoman;
    const clean = sanitizeForPdf(String(text || '').trim(), font);
    if (!clean) {
      currentY -= 8;
      return;
    }

    let x = marginX;
    if (align === 'center') {
      const textWidth = font.widthOfTextAtSize(clean, fontSize);
      x = Math.max(marginX, (pageWidth - textWidth) / 2);
    }

    currentPage.drawText(clean, {
      x,
      y: currentY,
      size: fontSize,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });

    currentY -= fontSize + 8;
  };

  if (typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const docDom = parser.parseFromString(htmlString || '', 'text/html');
    const elements = docDom.body.querySelectorAll('h1, h2, h3, p, pre, table, img');

    for (const el of elements) {
      const tag = el.tagName.toLowerCase();

      if (tag === 'h1') {
        currentY -= 12;
        drawTextLine(el.textContent, 15, true, false, 'center');
        currentY -= 8;
      } else if (tag === 'h2') {
        currentY -= 8;
        drawTextLine(el.textContent, 13, true, false, 'center');
      } else if (tag === 'h3') {
        currentY -= 6;
        drawTextLine(el.textContent, 12, true, false, 'left');
      } else if (tag === 'table') {
        const rows = el.querySelectorAll('tr');
        rows.forEach((r) => {
          const cells = r.querySelectorAll('td, th');
          if (cells.length >= 2) {
            const label = cells[0].textContent?.trim() || '';
            const val = cells[1].textContent?.trim() || '';
            drawTextLine(`${label} ${val}`, 10.5, false, false, 'left');
          }
        });
        currentY -= 10;
      } else if (tag === 'img') {
        const src = el.getAttribute('src');
        if (src && src.startsWith('data:image/png')) {
          try {
            const bytes = base64ToUint8Array(src);
            const pngImage = await pdfDoc.embedPng(bytes);
            const scale = Math.min(250 / pngImage.width, 140 / pngImage.height, 1);
            const w = pngImage.width * scale;
            const h = pngImage.height * scale;
            checkPageBreak(h + 20);
            currentPage.drawImage(pngImage, {
              x: (pageWidth - w) / 2,
              y: currentY - h,
              width: w,
              height: h,
            });
            currentY -= h + 16;
          } catch (e) {
            // image embed fallback
          }
        }
      } else if (tag === 'pre') {
        const codeLines = (el.textContent || '').split('\n');
        codeLines.forEach((cl) => {
          if (cl.trim()) drawTextLine(cl, 9, false, true, 'left');
        });
        currentY -= 8;
      } else {
        const isBullet = el.classList?.contains('list-item') || el.classList?.contains('list-disc');
        drawTextLine(isBullet ? `• ${el.textContent}` : el.textContent, 10.5, false, false, 'left');
      }
    }
  } else {
    drawTextLine(title, 14, true, false, 'center');
  }

  return await pdfDoc.save();
}
