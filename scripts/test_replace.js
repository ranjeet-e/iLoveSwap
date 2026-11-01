import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

async function testReplace() {
  const inputBytes = fs.readFileSync('public/sample_lab_manual.pdf');
  const pdfDoc = await PDFDocument.load(inputBytes);
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  // We want to replace "Name: TEJAS S. KAMBLE" with "Name: ranjeet epili"
  // and "Roll No: 28" with "Roll No: 12"
  const page = pdfDoc.getPages()[0];

  // Coordinates from test_parse:
  // [x=70.0, y=590.9] "Name: TEJAS S. KAMBLE"
  // [x=70.0, y=572.9] "Roll No: 28"

  // 1. Cover Name line
  page.drawRectangle({
    x: 68,
    y: 588,
    width: 250,
    height: 18,
    color: rgb(1, 1, 1),
  });
  page.drawText('Name: ranjeet epili', {
    x: 70,
    y: 590.9,
    size: 13,
    font: timesBold,
    color: rgb(0, 0, 0),
  });

  // 2. Cover Roll No line
  page.drawRectangle({
    x: 68,
    y: 570,
    width: 150,
    height: 18,
    color: rgb(1, 1, 1),
  });
  page.drawText('Roll No: 12', {
    x: 70,
    y: 572.9,
    size: 13,
    font: timesBold,
    color: rgb(0, 0, 0),
  });

  const modifiedBytes = await pdfDoc.save();
  fs.writeFileSync('public/test_modified.pdf', modifiedBytes);
  console.log('Modified PDF saved successfully! Size:', modifiedBytes.length);

  // Now verify with pdfjs
  const reparse = await pdfjsLib.getDocument({ data: new Uint8Array(modifiedBytes) }).promise;
  const p1 = await reparse.getPage(1);
  const tc = await p1.getTextContent();
  const foundName = tc.items.find(i => i.str.includes('ranjeet'));
  const foundRoll = tc.items.find(i => i.str.includes('12'));
  console.log('Verified in text stream:', foundName?.str, '|', foundRoll?.str);
}

testReplace().catch(console.error);
