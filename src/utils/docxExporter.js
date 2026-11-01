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
} from 'docx';
import { saveAs } from 'file-saver';

/**
 * Exports bifurcated and edited sections into a clean, editable Microsoft Word (.docx) document.
 * 
 * @param {Object} sections - parsed & modified sections
 * @param {string} fileName - output file name (e.g. "report.docx")
 */
export async function exportToDocx(sections, fileName = 'Document.docx') {
  const children = [];

  // 1. Institution Header
  if (sections.headerLines && sections.headerLines.length > 0) {
    for (const h of sections.headerLines) {
      children.push(
        new Paragraph({
          text: h.currentText || h.originalText,
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: h.currentText || h.originalText,
              bold: h.fontSize >= 11,
              size: Math.max((h.fontSize || 10) * 2, 20),
              font: 'Times New Roman',
              color: '1E293B',
            }),
          ],
        })
      );
    }
    // Add divider spacing
    children.push(new Paragraph({ spacing: { after: 200 } }));
  }

  // 2. Experiment / Project Title
  if (sections.experimentSections && sections.experimentSections.length > 0) {
    for (const exp of sections.experimentSections) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 120 },
          children: [
            new TextRun({
              text: exp.currentText || exp.originalText,
              bold: true,
              underline: true,
              size: 28, // 14pt
              font: 'Times New Roman',
              color: '0F172A',
            }),
          ],
        })
      );
    }
    children.push(new Paragraph({ spacing: { after: 240 } }));
  }

  // 3. Student Identity Box / Table (Highlight section!)
  if (sections.personalTags && sections.personalTags.length > 0) {
    const tableRows = sections.personalTags.map((tag) => {
      const label = tag.label || tag.prefix.replace(/[:\-]/g, '').trim() || 'Detail';
      const val = tag.currentValue || tag.originalValue;

      return new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
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
            width: { size: 70, type: WidthType.PERCENTAGE },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
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

    const infoTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 8, color: 'CBD5E1' },
        bottom: { style: BorderStyle.SINGLE, size: 8, color: 'CBD5E1' },
        left: { style: BorderStyle.SINGLE, size: 8, color: 'CBD5E1' },
        right: { style: BorderStyle.SINGLE, size: 8, color: 'CBD5E1' },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
        insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
      },
      rows: tableRows,
    });

    children.push(infoTable);
    children.push(new Paragraph({ spacing: { after: 360 } }));
  }

  // 4. Problem Statements
  if (sections.problemStatements && sections.problemStatements.length > 0) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 120 },
        children: [
          new TextRun({
            text: 'Problem Statements & Questions',
            bold: true,
            size: 26,
            font: 'Calibri',
            color: '1E293B',
          }),
        ],
      })
    );

    for (const prob of sections.problemStatements) {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 80 },
          children: [
            new TextRun({
              text: '•  ' + (prob.currentText || prob.originalText),
              size: 22,
              font: 'Calibri',
              bold: true,
            }),
          ],
        })
      );
    }
    children.push(new Paragraph({ spacing: { after: 240 } }));
  }

  // 5. Code Blocks
  if (sections.codeBlocks && sections.codeBlocks.length > 0) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 120 },
        children: [
          new TextRun({
            text: 'Program Code & Implementation',
            bold: true,
            size: 26,
            font: 'Calibri',
            color: '1E293B',
          }),
        ],
      })
    );

    const codeText = sections.codeBlocks
      .map((c) => c.currentText || c.originalText)
      .join('\n');

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 6, color: 'E2E8F0' },
          bottom: { style: BorderStyle.SINGLE, size: 6, color: 'E2E8F0' },
          left: { style: BorderStyle.SINGLE, size: 18, color: '3B82F6' },
          right: { style: BorderStyle.SINGLE, size: 6, color: 'E2E8F0' },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
                margins: { top: 160, bottom: 160, left: 180, right: 180 },
                children: codeText.split('\n').map(
                  (line) =>
                    new Paragraph({
                      spacing: { before: 20, after: 20 },
                      children: [
                        new TextRun({
                          text: line || ' ',
                          font: 'Consolas',
                          size: 19,
                          color: '1E293B',
                        }),
                      ],
                    })
                ),
              }),
            ],
          }),
        ],
      })
    );
    children.push(new Paragraph({ spacing: { after: 280 } }));
  }

  // 6. Conclusion
  if (sections.conclusionLines && sections.conclusionLines.length > 0) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
        children: [
          new TextRun({
            text: 'Conclusion & Results',
            bold: true,
            size: 26,
            font: 'Calibri',
            color: '1E293B',
          }),
        ],
      })
    );

    for (const concl of sections.conclusionLines) {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 80 },
          children: [
            new TextRun({
              text: concl.currentText || concl.originalText,
              bold: true,
              size: 22,
              font: 'Calibri',
              color: '15803D',
            }),
          ],
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const outName = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`;
  saveAs(blob, outName);
  return blob;
}
