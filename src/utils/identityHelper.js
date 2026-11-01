/**
 * Updates composite fields like:
 * - "SYECS2 / 28 [BATCH - A]" -> "SYECS2 / 12 [BATCH - B1]"
 * - "28 / B1" -> "12 / B1"
 */
export function updateCompositeTag(tagKey, originalVal, fixed) {
  if (!originalVal || !fixed) return originalVal;

  if (tagKey === 'composite_roll_batch') {
    const m = originalVal.match(/^([a-zA-Z0-9_\-]+)\s*[\/&]\s*([a-zA-Z0-9_\-]+)/);
    if (m) {
      const targetRoll = fixed.rollNo || m[1];
      const targetBatch = fixed.batch || m[2];
      return `${targetRoll} / ${targetBatch}`;
    }
    return originalVal;
  }

  // composite_class_roll (e.g. "SYECS2 / 28 [BATCH - A]" or "SYECS2 / 28")
  const m1 = originalVal.match(/^([a-zA-Z0-9_\-]+)\s*[\/&]\s*([a-zA-Z0-9_\-]+)(?:\s*\[\s*(?:batch\s*[:\-–]?\s*)?([a-zA-Z0-9_\-]+)\s*\])?/i);
  if (m1) {
    const origDiv = m1[1];
    const origRoll = m1[2];
    const origBatch = m1[3];

    const targetDiv = fixed.division || origDiv;
    const targetRoll = fixed.rollNo || origRoll;
    const targetBatch = fixed.batch || origBatch;

    if (origBatch) {
      const hasBatchPrefix = /batch\s*[:\-–]?/i.test(originalVal);
      return `${targetDiv} / ${targetRoll} [${hasBatchPrefix ? 'BATCH - ' : ''}${targetBatch}]`;
    }
    return `${targetDiv} / ${targetRoll}`;
  }

  return originalVal;
}

/**
 * Maps fixed identity properties across detected section personal tags.
 */
export function applyFixedToSections(secList, fixed) {
  if (!fixed || !fixed.name || !secList?.personalTags) return secList;
  const updatedTags = secList.personalTags.map((tag) => {
    const k = (tag.key || '').toLowerCase();
    const l = (tag.label || '').toLowerCase();
    let newVal = tag.currentValue;

    if (k === 'composite_class_roll' || (l.includes('class') && l.includes('roll'))) {
      newVal = updateCompositeTag('composite_class_roll', tag.originalValue, fixed);
    } else if (k === 'composite_roll_batch' || (l.includes('batch') && l.includes('roll'))) {
      newVal = updateCompositeTag('composite_roll_batch', tag.originalValue, fixed);
    } else if (k.includes('name') || l.includes('name')) {
      if (fixed.name) newVal = fixed.name;
    } else if (k.includes('prn') || l.includes('prn') || k.includes('sap') || l.includes('sap')) {
      if (fixed.prn) newVal = fixed.prn;
    } else if (k.includes('roll') || l.includes('roll')) {
      if (fixed.rollNo) newVal = fixed.rollNo;
    } else if (k.includes('batch') || l.includes('batch')) {
      if (fixed.batch) newVal = fixed.batch;
    } else if (k.includes('div') || k.includes('class') || l.includes('div') || l.includes('class')) {
      if (fixed.division) newVal = fixed.division;
    }
    return { ...tag, currentValue: newVal };
  });

  return { ...secList, personalTags: updatedTags };
}
