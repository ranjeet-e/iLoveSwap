import { pdfjsLib, clonePdfBytes } from './pdfSetup.js';

/**
 * Robust document metadata and section identification patterns.
 * Supports standard enterprise, academic, and professional document structures.
 */
export const TAG_REGEXES = [
  // 1. Author / Name
  {
    key: 'name',
    label: 'Author / Name',
    regex: /^(?:(?:student|author|candidate|creator|prepared\s*by|submitted\s*by)\s+)?name\s*[:\-–.]\s*(.+)$/i,
  },

  // 2. Composite: Division / Class & Roll No (e.g. "Div & Roll No.: SYECS-2, 12", "Class / Roll: A-14")
  {
    key: 'composite_class_roll',
    label: 'Division & Roll No',
    regex: /^(?:(?:div(?:ision)?|class|dept|department)\s*(?:[\/&]|and)\s*roll\s*(?:no\.?|number)?|roll\s*(?:no\.?|number)?\s*(?:[\/&]|and)\s*(?:div(?:ision)?|class|dept|department))\s*[:\-–.]\s*(.+)$/i,
  },

  // 3. Composite: Roll No & Batch (e.g. "Roll / Batch: 12 / A2")
  {
    key: 'composite_roll_batch',
    label: 'Roll No & Batch',
    regex: /^(?:roll\s*(?:no\.?|number)?\s*(?:[\/&]|and)\s*(?:batch|group)|(?:batch|group)\s*(?:[\/&]|and)\s*roll\s*(?:no\.?|number)?)\s*[:\-–.]\s*(.+)$/i,
  },

  // 4. PRN / Registration / SAP ID / Document Code (e.g. "PRN No.: 125BTEC1097")
  {
    key: 'prn',
    label: 'PRN / ID No',
    regex: /^(?:p\.?r\.?n\.?(?:\s*no\.?)?|sap\s*id\.?|uin\.?|uid\.?|reg(?:istration)?\.?\s*(?:no\.?)?|doc(?:ument)?\s*id|identifier|code)\s*[:\-–.]\s*(.+)$/i,
  },

  // 5. Standalone Roll No / Reference No
  {
    key: 'rollNo',
    label: 'Roll / Reference No',
    regex: /^(?:roll\s*(?:no\.?|number)?|reference\s*(?:no\.?|number)?|ref\.?\s*(?:no\.?)?)\s*[:\-–.]\s*(.+)$/i,
  },

  // 6. Department / Division / Branch (e.g. "Department : Electronics and Computer Science")
  {
    key: 'department',
    label: 'Department',
    regex: /^(?:department|dept\.?|branch|stream|faculty)\s*[:\-–.]\s*(.+)$/i,
  },

  // 7. Experiment / Document No (e.g. "Experiment No.: 01")
  {
    key: 'expNo',
    label: 'Experiment / Doc No',
    regex: /^(?:experiment|exp\.?|assignment|assgn\.?|lab|doc(?:ument)?|chapter|section)\s*(?:no\.?|number)?\s*[:\-–.]\s*(.+)$/i,
  },

  // 8. Experiment Title / Topic (e.g. "Experiment Title: Career Self Assessment & Path Mapping")
  {
    key: 'expTitle',
    label: 'Experiment Title',
    regex: /^(?:(?:experiment|exp\.?|assignment|project|doc(?:ument)?)\s+)?title\s*[:\-–.]\s*(.+)$/i,
  },

  // 9. Batch / Group
  {
    key: 'batch',
    label: 'Batch / Group',
    regex: /^(?:batch|group|cohort)\s*(?:no\.?|number)?\s*[:\-–.]\s*(.+)$/i,
  },

  // 10. Date of submission / issue
  {
    key: 'date',
    label: 'Date',
    regex: /^(?:date(?:\s*of\s*(?:submission|performance|conduction|issue|creation|event))?)\s*[:\-–.]\s*(.+)$/i,
  },

  // 11. Academic Year / Semester / Term
  {
    key: 'academicYear',
    label: 'Academic Year / Sem',
    regex: /^(?:academic\s*year|a\.?y\.?|semester|sem\.?|term)\s*[:\-–.]\s*(.+)$/i,
  },

  // 12. Subject / Course
  {
    key: 'subject',
    label: 'Subject / Course',
    regex: /^(?:subject|course(?:\s*name)?|topic)\s*[:\-–.]\s*(.+)$/i,
  },
];

/**
 * Assembles fragmented PDF.js glyphs/runs into cohesive visual horizontal lines.
 * Resolves split characters (e.g. "N" + "ame: Ranjeet Epili" -> "Name: Ranjeet Epili").
 */
function assembleVisualLines(rawItems, pageHeight) {
  if (!rawItems || rawItems.length === 0) return [];

  // Filter out completely empty tokens
  const valid = rawItems.filter((it) => it.str && it.str.length > 0);
  if (valid.length === 0) return [];

  // 1. Sort all items from top to bottom (y descending in PDF coords)
  valid.sort((a, b) => {
    const yDiff = b.y - a.y;
    if (Math.abs(yDiff) > 3.5) return yDiff;
    return a.x - b.x;
  });

  // 2. Group items that share approximately the same baseline (tolerance 3.5 points)
  const lineClusters = [];
  let currentCluster = [];
  let clusterY = null;

  for (const item of valid) {
    if (clusterY === null) {
      currentCluster.push(item);
      clusterY = item.y;
    } else if (Math.abs(item.y - clusterY) <= 3.5) {
      currentCluster.push(item);
    } else {
      lineClusters.push(currentCluster);
      currentCluster = [item];
      clusterY = item.y;
    }
  }
  if (currentCluster.length > 0) {
    lineClusters.push(currentCluster);
  }

  // 3. For each line cluster, connect tokens horizontally
  const assembledLines = [];

  lineClusters.forEach((cluster, lineIdx) => {
    // Sort items horizontally from left to right
    cluster.sort((a, b) => a.x - b.x);

    // Group items into segments (split if gap > 45px to support multi-column layouts)
    let currentSegment = [];

    const flushSegment = (seg) => {
      if (!seg || seg.length === 0) return;

      let fullStr = '';
      let minX = seg[0].x;
      let maxX = seg[0].x + seg[0].width;
      let minY = seg[0].y;
      let maxY = seg[0].y + (seg[0].height || 12);
      let maxFontSize = seg[0].fontSize || 11;
      let fontName = seg[0].fontName;
      let pageNum = seg[0].pageNum;
      let pageIndex = seg[0].pageIndex;

      for (let i = 0; i < seg.length; i++) {
        const it = seg[i];
        minX = Math.min(minX, it.x);
        maxX = Math.max(maxX, it.x + it.width);
        minY = Math.min(minY, it.y);
        maxY = Math.max(maxY, it.y + (it.height || 12));
        maxFontSize = Math.max(maxFontSize, it.fontSize || 11);
        if (it.str.length > 2) fontName = it.fontName;

        if (i === 0) {
          fullStr = it.str;
        } else {
          const prev = seg[i - 1];
          const gap = it.x - (prev.x + prev.width);

          const prevEndsSpace = /\s$/.test(fullStr);
          const currStartsSpace = /^\s/.test(it.str);

          if (!prevEndsSpace && !currStartsSpace) {
            // If gap between bounding boxes > 1.8px, insert space; otherwise join cleanly
            if (gap > 1.8) {
              fullStr += ' ' + it.str;
            } else {
              fullStr += it.str;
            }
          } else {
            fullStr += it.str;
          }
        }
      }

      fullStr = fullStr.trim();
      if (fullStr.length > 0) {
        assembledLines.push({
          id: `p${pageNum}_line_${lineIdx}_${assembledLines.length}`,
          pageIndex,
          pageNum,
          str: fullStr,
          x: minX,
          y: minY,
          width: Math.max(maxX - minX, fullStr.length * (maxFontSize * 0.5)),
          height: Math.max(maxY - minY, maxFontSize + 2),
          fontSize: maxFontSize,
          fontName,
          pdfPageHeight: pageHeight,
        });
      }
    };

    for (let i = 0; i < cluster.length; i++) {
      const it = cluster[i];
      if (currentSegment.length === 0) {
        currentSegment.push(it);
      } else {
        const prev = currentSegment[currentSegment.length - 1];
        const gap = it.x - (prev.x + prev.width);

        if (gap > 45) {
          flushSegment(currentSegment);
          currentSegment = [it];
        } else {
          currentSegment.push(it);
        }
      }
    }
    flushSegment(currentSegment);
  });

  return assembledLines;
}

/**
 * Parses a PDF buffer and bifurcates it into structured sections and editable tags.
 * Uses visual line assembly to guarantee high-accuracy reading.
 * 
 * @param {ArrayBuffer|Uint8Array} inputData 
 * @returns {Promise<Object>}
 */
export async function parseAndBifurcatePdf(inputData) {
  const safeData = clonePdfBytes(inputData);
  const loadingTask = pdfjsLib.getDocument({
    data: safeData,
  });

  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  const rawPages = [];
  const allExtractedLines = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent();

    // Map raw items
    const rawItems = textContent.items.map((item, idx) => ({
      id: `p${pageNum}_raw_${idx}`,
      pageIndex: pageNum - 1,
      pageNum,
      str: item.str,
      x: item.transform[4],
      y: item.transform[5],
      width: item.width || item.str.length * 6,
      height: item.height || 12,
      fontName: item.fontName,
      fontSize: Math.round(Math.hypot(item.transform[0], item.transform[1]) || 11),
      pdfPageHeight: viewport.height,
    }));

    // Assemble lines
    const lines = assembleVisualLines(rawItems, viewport.height);

    rawPages.push({
      pageNum,
      pageIndex: pageNum - 1,
      width: viewport.width,
      height: viewport.height,
      items: lines,
    });

    allExtractedLines.push(...lines);
  }

  // Section Buckets
  const personalTags = [];
  const headerLines = [];
  const experimentSections = [];
  const problemStatements = [];
  const codeBlocks = [];
  const outputSections = [];
  const conclusionLines = [];
  const otherLines = [];

  const matchedItemIds = new Set();

  // 1. Detect Metadata & Identity Tags
  for (let i = 0; i < allExtractedLines.length; i++) {
    const item = allExtractedLines[i];
    if (matchedItemIds.has(item.id)) continue;
    const trimmed = item.str.trim();

    for (const tagDef of TAG_REGEXES) {
      const match = trimmed.match(tagDef.regex);
      if (match) {
        matchedItemIds.add(item.id);

        let originalVal = match[1] ? match[1].trim() : '';
        let prefix = trimmed;
        if (originalVal && trimmed.indexOf(originalVal) !== -1) {
          prefix = trimmed.substring(0, trimmed.indexOf(originalVal));
        }

        // If value was empty or next to label, check adjacent line
        if (!originalVal && i + 1 < allExtractedLines.length) {
          const nextItem = allExtractedLines[i + 1];
          if (
            nextItem.pageNum === item.pageNum &&
            !matchedItemIds.has(nextItem.id) &&
            Math.abs(nextItem.y - item.y) <= 4
          ) {
            originalVal = nextItem.str.trim();
            matchedItemIds.add(nextItem.id);
          }
        }

        personalTags.push({
          id: `tag_${tagDef.key}_${item.id}`,
          itemId: item.id,
          category: 'personal',
          key: tagDef.key,
          label: tagDef.label,
          prefix: prefix,
          originalValue: originalVal,
          currentValue: originalVal,
          fullOriginalText: item.str,
          pageNum: item.pageNum,
          pageIndex: item.pageIndex,
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          fontSize: item.fontSize,
          fontName: item.fontName,
          pdfPageHeight: item.pdfPageHeight,
        });
        break;
      }
    }
  }

  // 2. Classify Remaining Lines into Semantic Sections
  for (const page of rawPages) {
    for (const item of page.items) {
      if (matchedItemIds.has(item.id)) continue;
      const str = item.str.trim();
      if (!str) continue;

      // Header: Page 1 top institutional / company lines (y > 670 on A4)
      if (page.pageNum === 1 && item.y > 670 && !/experiment|aim|title/i.test(str)) {
        headerLines.push({
          id: `hdr_${item.id}`,
          itemId: item.id,
          category: 'header',
          originalText: str,
          currentText: str,
          pageNum: item.pageNum,
          pageIndex: item.pageIndex,
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          fontSize: item.fontSize,
          fontName: item.fontName,
          pdfPageHeight: item.pdfPageHeight,
        });
        matchedItemIds.add(item.id);
        continue;
      }

      // Experiment / Document Titles & Headings
      if (
        /^(?:experiment|exp\.?)\s*(?:title|name|no\.?|number)?\s*[:\-–.]/i.test(str) ||
        /^(?:document|project|assignment)\s*title\s*[:\-–.]/i.test(str)
      ) {
        experimentSections.push({
          id: `exp_${item.id}`,
          itemId: item.id,
          category: 'experiment',
          originalText: str,
          currentText: str,
          pageNum: item.pageNum,
          pageIndex: item.pageIndex,
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          fontSize: item.fontSize,
          fontName: item.fontName,
          pdfPageHeight: item.pdfPageHeight,
        });
        matchedItemIds.add(item.id);
        continue;
      }

      // Problem Statements, Questions, Aim, Objectives
      if (
        /^(?:aim|objective|objectives|problem\s*statement|problem\s*n[0o]?[-–\d]+|for\s*q\d+|question\s*\d+|q\d+)\s*[:\-–.]?/i.test(str) ||
        /^task\s*[:\-–.]/i.test(str)
      ) {
        problemStatements.push({
          id: `prob_${item.id}`,
          itemId: item.id,
          category: 'problem',
          originalText: str,
          currentText: str,
          pageNum: item.pageNum,
          pageIndex: item.pageIndex,
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          fontSize: item.fontSize,
          fontName: item.fontName,
          pdfPageHeight: item.pdfPageHeight,
        });
        matchedItemIds.add(item.id);
        continue;
      }

      // Conclusion / Results / Inference / Summary
      if (/^(?:conclusion|inferences?|results?|summary|remarks?)\s*[:\-–.]?/i.test(str)) {
        conclusionLines.push({
          id: `concl_${item.id}`,
          itemId: item.id,
          category: 'conclusion',
          originalText: str,
          currentText: str,
          pageNum: item.pageNum,
          pageIndex: item.pageIndex,
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          fontSize: item.fontSize,
          fontName: item.fontName,
          pdfPageHeight: item.pdfPageHeight,
        });
        matchedItemIds.add(item.id);
        continue;
      }

      // Output, Figure, Plot Captions
      if (/^(?:output\s*[:\-–.]|matlab\s*r\d+|figure\s*\d+|plot|graph)\s*[:\-–.]?/i.test(str)) {
        outputSections.push({
          id: `out_${item.id}`,
          itemId: item.id,
          category: 'output',
          originalText: str,
          currentText: str,
          pageNum: item.pageNum,
          pageIndex: item.pageIndex,
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          fontSize: item.fontSize,
          fontName: item.fontName,
          pdfPageHeight: item.pdfPageHeight,
        });
        matchedItemIds.add(item.id);
        continue;
      }

      // Program Code / Monospace blocks / Script listings
      if (
        /^(?:reference\s*code|program\s*code|source\s*code|code\s*[:\-–.])/i.test(str) ||
        /(?:syms|laplace|disp\(|fplot|clc;|clear;|grid\s*on|xlabel|ylabel|title\(|function|=|\+=|#include|import\s+sys)/i.test(str) ||
        (item.fontName && /courier|mono|consolas/i.test(item.fontName))
      ) {
        codeBlocks.push({
          id: `code_${item.id}`,
          itemId: item.id,
          category: 'code',
          originalText: str,
          currentText: str,
          pageNum: item.pageNum,
          pageIndex: item.pageIndex,
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          fontSize: item.fontSize,
          fontName: item.fontName,
          pdfPageHeight: item.pdfPageHeight,
        });
        matchedItemIds.add(item.id);
        continue;
      }

      // General Body Text & Paragraphs
      otherLines.push({
        id: `other_${item.id}`,
        itemId: item.id,
        category: 'other',
        originalText: str,
        currentText: str,
        pageNum: item.pageNum,
        pageIndex: item.pageIndex,
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        fontSize: item.fontSize,
        fontName: item.fontName,
        pdfPageHeight: item.pdfPageHeight,
      });
      matchedItemIds.add(item.id);
    }
  }

  return {
    numPages,
    rawPages,
    sections: {
      personalTags,
      headerLines,
      experimentSections,
      problemStatements,
      codeBlocks,
      outputSections,
      conclusionLines,
      otherLines,
    },
    summary: {
      tagsFound: personalTags.length,
      headersFound: headerLines.length,
      problemsFound: problemStatements.length,
      codeLinesFound: codeBlocks.length,
      pages: numPages,
    },
  };
}
