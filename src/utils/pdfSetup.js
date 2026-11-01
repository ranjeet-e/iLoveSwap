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

/**
 * Sanitizes any string for safe WinAnsi encoding in pdf-lib StandardFonts.
 * Converts characters outside Windows-1252 (such as Indian Rupee "₹", Greek letters,
 * math symbols, smart quotes, etc.) to safe printable equivalents, preventing
 * "WinAnsi cannot encode" crashes.
 * 
 * @param {string} text 
 * @param {Object} [fontInstance] - pdf-lib embedded font
 * @returns {string} Safe WinAnsi string
 */
export function sanitizeForPdf(text, fontInstance) {
  if (!text) return '';
  let str = String(text);

  // Quick return for pure standard ASCII
  if (/^[\x20-\x7E\t\r\n]*$/.test(str)) {
    return str;
  }

  // Common Unicode mappings to safe ASCII / WinAnsi equivalents
  const map = {
    '₹': 'Rs. ',
    '–': '-',
    '—': '--',
    '‘': "'",
    '’': "'",
    '“': '"',
    '”': '"',
    '•': '*',
    '…': '...',
    '™': '(TM)',
    '©': '(C)',
    '®': '(R)',
    '≠': '!=',
    '≤': '<=',
    '≥': '>=',
    '×': 'x',
    '÷': '/',
    '±': '+/-',
    'µ': 'u',
    'π': 'pi',
    'θ': 'theta',
    'λ': 'lambda',
    'σ': 'sigma',
    'ω': 'omega',
    'Ω': 'Ohm',
    '∆': 'delta',
    '√': 'sqrt',
    '∞': 'inf',
    '→': '->',
    '←': '<-',
    '↔': '<->',
    '\u00A0': ' ', // Non-breaking space
    '\u200B': '',  // Zero-width space
  };

  for (const [k, v] of Object.entries(map)) {
    if (str.includes(k)) {
      str = str.split(k).join(v);
    }
  }

  // Check again after common replacements
  if (/^[\x20-\x7E\t\r\n]*$/.test(str)) {
    return str;
  }

  // Fallback: verify every character against font encoder or strip non-encodable
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const code = char.charCodeAt(0);
    if ((code >= 32 && code <= 126) || code === 9 || code === 10 || code === 13) {
      result += char;
    } else if (fontInstance && fontInstance.encodeText) {
      try {
        fontInstance.encodeText(char);
        result += char;
      } catch (e) {
        result += ' ';
      }
    } else {
      if (code >= 160 && code <= 255) {
        result += char;
      } else {
        result += ' ';
      }
    }
  }

  return result;
}

export { pdfjsLib };
