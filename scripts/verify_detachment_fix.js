import fs from 'fs';
import { parseAndBifurcatePdf } from '../src/utils/pdfParser.js';
import { applyPdfModifications } from '../src/utils/pdfModifier.js';
import { clonePdfBytes } from '../src/utils/pdfSetup.js';

async function verifyFix() {
  console.log('Testing PDF buffer stability across operations...');

  const rawBytes = fs.readFileSync('public/sample_lab_manual.pdf');
  const masterBytes = new Uint8Array(rawBytes.buffer, rawBytes.byteOffset, rawBytes.byteLength);

  console.log('Step 1: Parse original PDF');
  const parsed = await parseAndBifurcatePdf(clonePdfBytes(masterBytes));
  console.log(`Parsed successfully! Pages: ${parsed.numPages}, Tags found: ${parsed.sections.personalTags.length}`);

  console.log('Step 2: Check masterBytes status');
  console.log(`masterBytes byteLength: ${masterBytes.byteLength}, buffer.detached: ${masterBytes.buffer.detached}`);
  if (masterBytes.buffer.detached) {
    throw new Error('FAILED: masterBytes was detached during parsing!');
  }

  console.log('Step 3: Simulate user modifications (Tejas -> ranjeet epili, 28 -> 12)');
  parsed.sections.personalTags.forEach(tag => {
    if (tag.key.includes('name')) tag.currentValue = 'ranjeet epili';
    if (tag.key.includes('roll')) tag.currentValue = '12';
    if (tag.key.includes('batch')) tag.currentValue = 'B1';
    if (tag.key.includes('div')) tag.currentValue = 'SYECS2';
  });

  const modifiedBytes1 = await applyPdfModifications(clonePdfBytes(masterBytes), parsed.sections);
  console.log(`Modified PDF 1 generated! Bytes: ${modifiedBytes1.byteLength}`);

  console.log('Step 4: Simulate a second modification (e.g. changing experiment title or conclusion)');
  parsed.sections.conclusionLines.forEach(c => {
    c.currentText = 'Conclusion: Verified and Successfully Updated';
  });

  const modifiedBytes2 = await applyPdfModifications(clonePdfBytes(masterBytes), parsed.sections);
  console.log(`Modified PDF 2 generated! Bytes: ${modifiedBytes2.byteLength}`);

  console.log('Step 5: Verify modified PDF 2 can be parsed cleanly');
  const parsed2 = await parseAndBifurcatePdf(clonePdfBytes(modifiedBytes2));
  console.log(`Re-parsed successfully! Pages: ${parsed2.numPages}`);

  console.log('\n✅ ALL DETACHED ARRAYBUFFER TESTS PASSED WITH 100% STABILITY!');
}

verifyFix().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
