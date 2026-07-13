const LIVE_HEAD_INSTRUCTION = 'query the live PR head';
const FULL_GIT_REF_PATTERN = /\b[0-9a-f]{40}\b/gi;
const CANDIDATE_CONTEXT_PATTERN = /\b(?:candidate|commit|head|revision|sha)\b/i;
const GIT_REF_PATTERN = /\b[0-9a-f]{4,40}\b/gi;

export function parseStructuredIssueFields(body) {
  const fields = [];
  let activeField = null;
  for (const line of String(body || '').split(/\r?\n/)) {
    const match = /^\s*-\s*([^:\r\n]+):\s*(.*)$/.exec(line)
      || /^\s*((?:current\s+)?(?:candidate|commit|revision|head|sha)|status)\s*:\s*(.*)$/i.exec(line);
    if (match) {
      activeField = {
        name: match[1].trim(),
        value: match[2].trim(),
      };
      fields.push(activeField);
      continue;
    }
    if (activeField
      && line.trim()
      && !/^\s*#{1,6}\s/.test(line)
      && !/^\s*-\s*[^:\r\n]+:\s*/.test(line)) {
      activeField.value = [activeField.value, line.trim()].filter(Boolean).join(' ');
      continue;
    }
    activeField = null;
  }
  return fields;
}

function isCandidateReferenceField(field) {
  return /^(?:current\s+)?(?:candidate|commit|revision|head|sha)(?:\s+(?:commit|state|reference|sha|head))?$/i.test(field.name)
    || /\b(?:current|review) candidate\b/i.test(field.value)
    || /^candidate(?:\s*[:=]|\s+(?:PR\s+#\d+\s+(?:at\s+)?)?[0-9a-f]{4,40}\b)/i.test(field.value);
}

export function hasCandidateReferenceCue(body) {
  const text = String(body || '');
  return parseStructuredIssueFields(text).some(isCandidateReferenceField)
    || text.split(/\r?\n/).some((line) =>
      /^\s*(?:[-*]\s*)?(?:current\s+(?:candidate|commit|revision|head|sha)\b|(?:candidate|commit|revision|head|sha)\s*[:=])/i.test(line));
}

export function findPinnedCandidateRefs(body) {
  const text = String(body || '');
  const refs = [...(text.match(FULL_GIT_REF_PATTERN) ?? [])];
  for (const line of text.split(/\r?\n/)) {
    if (!CANDIDATE_CONTEXT_PATTERN.test(line)) continue;
    refs.push(...(line.match(GIT_REF_PATTERN) ?? []));
  }
  return [...new Set(refs.map((ref) => ref.toLowerCase()))];
}

export function findCandidateReferenceFields(body) {
  return parseStructuredIssueFields(body)
    .map((field) => ({
      ...field,
      refs: [...new Set((field.value.match(GIT_REF_PATTERN) ?? []).map((ref) => ref.toLowerCase()))],
    }))
    .filter((field) => field.refs.length > 0 && isCandidateReferenceField(field));
}

export function hasExactCandidateHeadReferences(body, expectedHead) {
  const head = String(expectedHead || '').toLowerCase();
  const fields = findCandidateReferenceFields(body);
  return /^[0-9a-f]{40}$/.test(head)
    && fields.length > 0
    && fields.every((field) => field.refs.length === 1 && field.refs[0] === head);
}

export function hasLivePrOnlyCandidateReference(body, prNumber) {
  const text = String(body || '');
  return text.includes(`PR #${prNumber}`)
    && text.includes(LIVE_HEAD_INSTRUCTION)
    && findPinnedCandidateRefs(text).length === 0;
}

export function hasValidCandidateHeadReference(body, prNumber, expectedHead) {
  return hasLivePrOnlyCandidateReference(body, prNumber)
    || hasExactCandidateHeadReferences(body, expectedHead);
}
