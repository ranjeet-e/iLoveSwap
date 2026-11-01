import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

async function testParse() {
  const data = new Uint8Array(fs.readFileSync('public/sample_lab_manual.pdf'));
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdfDoc = await loadingTask.promise;
  console.log('Total pages:', pdfDoc.numPages);

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    console.log(`\n--- PAGE ${pageNum} (${textContent.items.length} items) ---`);
    for (const item of textContent.items) {
      if (item.str && item.str.trim()) {
        console.log(`[x=${item.transform[4].toFixed(1)}, y=${item.transform[5].toFixed(1)}, font=${item.fontName}] "${item.str}"`);
      }
    }
  }
}

testParse().catch(console.error);
