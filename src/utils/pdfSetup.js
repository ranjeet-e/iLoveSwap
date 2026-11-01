import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// Configure the worker URL reliably for Vite dev, preview, and Chrome Extension
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.mjs',
      import.meta.url
    ).toString();
  } catch (e) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.0.379'}/pdf.worker.min.mjs`;
  }
}

/**
 * Safely clones any Uint8Array or ArrayBuffer to prevent detachment errors
 * when passing data across Web Workers or PDF libraries.
 * 
 * @param {Uint8Array|ArrayBuffer} data 
 * @returns {Uint8Array} Fresh, independent clone
 */
export function clonePdfBytes(data) {
  if (!data) return new Uint8Array(0);
  if (data instanceof Uint8Array) {
    return new Uint8Array(data);
  }
  if (data instanceof ArrayBuffer) {
    return new Uint8Array(data.slice(0));
  }
  return new Uint8Array(data);
}

export { pdfjsLib };
