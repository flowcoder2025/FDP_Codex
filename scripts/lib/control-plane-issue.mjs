const LIVE_HEAD_INSTRUCTION = 'query the live PR head';
const PINNED_CANDIDATE_PATTERN = /\b[0-9a-f]{7,40}\b/gi;
const SHORT_LABELED_CANDIDATE_PATTERN = /\b(?:candidate|commit|head|sha)\b[^\r\n]{0,32}?\b([0-9a-f]{4,6})\b/gi;

export function findPinnedCandidateRefs(body) {
  const text = String(body || '');
  const refs = [...(text.match(PINNED_CANDIDATE_PATTERN) ?? [])];
  for (const match of text.matchAll(SHORT_LABELED_CANDIDATE_PATTERN)) refs.push(match[1]);
  return [...new Set(refs.map((ref) => ref.toLowerCase()))];
}

export function hasLivePrOnlyCandidateReference(body, prNumber) {
  const text = String(body || '');
  return text.includes(`PR #${prNumber}`)
    && text.includes(LIVE_HEAD_INSTRUCTION)
    && findPinnedCandidateRefs(text).length === 0;
}