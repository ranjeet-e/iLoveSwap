import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import fs from 'fs';

async function testDocx() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "Shah & Anchor Kutchhi Engineering College",
            heading: HeadingLevel.TITLE,
            alignment: "center",
          }),
          new Paragraph({
            text: "DEPARTMENT OF ELECTRONICS AND COMPUTER SCIENCE",
            alignment: "center",
          }),
          new Paragraph({
            text: "Experiment No. – 1: Laplace transform of time-domain functions",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Name: ", bold: true }),
              new TextRun("ranjeet epili\n"),
              new TextRun({ text: "Roll No: ", bold: true }),
              new TextRun("12\n"),
              new TextRun({ text: "Batch: ", bold: true }),
              new TextRun("B1\n"),
              new TextRun({ text: "Division: ", bold: true }),
              new TextRun("SYECS2\n"),
            ],
          }),
          new Paragraph({
            text: "Reference Code:",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "syms t s\nf = exp(-t)*cos(2*t);\nF = laplace(f,t,s);",
                font: "Courier New",
              }),
            ],
          }),
          new Paragraph({
            text: "Conclusion: Successfully Executed",
            heading: HeadingLevel.HEADING_2,
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync('public/test_sample.docx', buffer);
  console.log('DOCX generated successfully! Size:', buffer.length);
}

testDocx().catch(console.error);
