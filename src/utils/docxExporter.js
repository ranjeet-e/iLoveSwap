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
 * Omit any removed lines or tags so the Word file matches the modified PDF.
 * 
 * @param {Object} sections - parsed & modified sections
 * @param {string} fileName - output file name (e.g. "report.docx")
 */
export async function exportToDocx(sections, fileName = 'Document.docx') {
  const children = [];

  // 1. Organization Header
  const activeHeaders = (sections.headerLines || []).filter(
    (h) => !h.isRemoved && (h.currentText || h.originalText)
  );
  if (activeHeaders.length > 0) {
    for (const h of activeHeaders) {
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
    children.push(new Paragraph({ spacing: { after: 200 } }));
  }

  // 2. Document / Project Title
  const activeExp = (sections.experimentSections || []).filter(
    (exp) => !exp.isRemoved && (exp.currentText || exp.originalText)
  );
  if (activeExp.length > 0) {
    for (const exp of activeExp) {
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

  // 3. Document Metadata & Details Table
  const activeTags = (sections.personalTags || []).filter(
    (t) => !t.isRemoved && (t.currentValue || t.originalValue)
  );
  if (activeTags.length > 0) {
    const tableRows = activeTags.map((tag) => {
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
  const activeProblems = (sections.problemStatements || []).filter(
    (p) => !p.isRemoved && (p.currentText || p.originalText)
  );
  if (activeProblems.length > 0) {
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

    for (const prob of activeProblems) {
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
  const activeCode = (sections.codeBlocks || []).filter(
    (c) => !c.isRemoved && (c.currentText || c.originalText)
  );
  if (activeCode.length > 0) {
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

    const codeText = activeCode.map((c) => c.currentText || c.originalText).join('\n');

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
  const activeConcl = (sections.conclusionLines || []).filter(
    (c) => !c.isRemoved && (c.currentText || c.originalText)
  );
  if (activeConcl.length > 0) {
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

    for (const concl of activeConcl) {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 80 },
          children: [
            new TextRun({
              text: concl.currentText || concl.originalText,
              size: 22,
              font: 'Calibri',
            }),
          ],
        })
      );
    }
    children.push(new Paragraph({ spacing: { after: 240 } }));
  }

  // 7. General Document Text (Other lines)
  const activeOther = (sections.otherLines || []).filter(
    (o) => !o.isRemoved && (o.currentText || o.originalText)
  );
  if (activeOther.length > 0) {
    for (const o of activeOther) {
      children.push(
        new Paragraph({
          spacing: { before: 60, after: 60 },
          children: [
            new TextRun({
              text: o.currentText || o.originalText,
              size: 21,
              font: 'Calibri',
              color: '334155',
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
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const outName = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`;
  saveAs(blob, outName);
}
