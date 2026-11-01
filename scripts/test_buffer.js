import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

const bytes = fs.readFileSync('public/sample_lab_manual.pdf');
const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);

console.log('Original buffer byteLength:', buffer.byteLength);
console.log('Is buffer detached?', buffer.detached);

// When we create a clone:
const clone = buffer.slice(0);
console.log('Clone byteLength:', clone.byteLength);
