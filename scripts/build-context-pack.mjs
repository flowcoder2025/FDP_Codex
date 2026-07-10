#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parseManifest } from './lib/manifest.mjs';

const repoRoot = process.cwd();
const ledgerPath = '.flowset/context-ledger.jsonl';

const selectionRuleTable = [
  {
    id: 'always-on.reference',
    trigger: 'always_on',
    reason: 'always-on reference',
    selectAlwaysOn: true,
  },
  {
    id: 'flow.wi-state',
    trigger: 'wi-start',
    reason: 'WI start flow state',
    chunkIds: ['flow.state-snapshot', 'flow.current-wi', 'flow.fix-plan', 'flow.handoff'],
  },
  {
    id: 'risk.r2-r3-policy-baseline',
    trigger: 'risk:R2|R3',
    reason: (request) => `${request.risk_level} policy baseline`,
    riskLevels: ['R2', 'R3'],
    chunkIds: [
      'policy.context-hygiene',
      'policy.work-item-lifecycle',
      'policy.naming-and-commits',
      'policy.autonomy-and-approval',
      'policy.triage-strategy',
      'policy.verification-economy',
    ],
  },
  {
    id: 'changed.manifest',
    trigger: 'changed:docs/manifest.yaml',
    reason: 'manifest changed',
    changedPathPattern: /docs\/manifest\.yaml/,
    chunkIds: ['registry.manifest', 'policy.context-hygiene', 'spec.knowledge-system'],
  },
  {
    id: 'changed.tooling',
    trigger: 'changed:scripts/**|package.json',
    reason: 'tooling changed',
    changedPathPattern: /(^| )scripts\/|(^| )package\.json/,
    chunkIds: ['tool.package', 'tool.validate-repo'],
  },
  {
    id: 'intent.context-pack',
    trigger: 'token:any(context,pack,building)',
    reason: 'context pack request',
    tokens: ['context', 'pack', 'building'],
    chunkIds: ['spec.knowledge-system', 'policy.context-hygiene'],
  },
  {
    id: 'intent.github',
    trigger: 'token:any(github,issue,pr)',
    reasonByChunkId: {
      'policy.git-workflow': 'GitHub or PR request',
      'policy.github-issue-governance': 'GitHub or issue request',
    },
    tokens: ['github', 'issue', 'pr'],
    chunkIds: ['policy.git-workflow', 'policy.github-issue-governance'],
  },
  {
    id: 'intent.validation',
    trigger: 'token:any(validation,validator,ci)',
    reason: 'validation request',
    tokens: ['validation', 'validator', 'ci'],
    chunkIds: ['tool.validate-repo'],
  },
];

const loadsForRule = {
  id: 'manifest.loads-for-token-match',
  trigger: 'manifest.loads_for exact intent-tag match',
};

const explicitReferenceRule = {
  id: 'manifest.explicit-reference-match',
  trigger: 'explicit chunk id, source path, or WI id reference',
};

const broadLoadsForTags = new Set(['audit', 'handoff', 'validation', 'wi-start']);
const maxDynamicLoadsForChunks = 24;
const maxSelectedChunks = 40;

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8').replace(/\r\n/g, '\n');
}

function exists(relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

function sha256(relativePath) {
  const buffer = readFileSync(path.join(repoRoot, relativePath));
  return `sha256:${createHash('sha256').update(buffer).digest('hex')}`;
}

function parseArgs(argv) {
  const args = {
    changed: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg.startsWith('--') && arg.includes('=')) {
      const [key, value] = arg.slice(2).split(/=(.*)/s);
      if (key === 'changed') args.changed.push(value);
      else args[key] = value;
      continue;
    }
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = argv[index + 1];
      if (value === undefined || value.startsWith('--')) {
        args[key] = true;
      } else {
        if (key === 'changed') args.changed.push(value);
        else args[key] = value;
        index += 1;
      }
    }
  }

  return args;
}

function parseCurrentWi() {
  if (!exists('.flowset/current-wi.md')) return {};
  const text = read('.flowset/current-wi.md');
  return {
    wi_id: /^WI id: (.+)$/m.exec(text)?.[1]?.trim(),
    risk_level: /^Risk: (.+)$/m.exec(text)?.[1]?.trim(),
    title: /^Title: (.+)$/m.exec(text)?.[1]?.trim(),
  };
}

function tokenize(values) {
  return values
    .filter(Boolean)
    .flatMap((value) => String(value).toLowerCase().split(/[^a-z0-9]+/))
    .filter(Boolean);
}

function normalizeTag(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function explicitIntentTags(value) {
  return String(value ?? '')
    .split(/[\s,]+/)
    .map(normalizeTag)
    .filter((tag) => tag.includes('-') && !broadLoadsForTags.has(tag));
}

function normalizedPath(value) {
  return String(value).replace(/\\/g, '/').toLowerCase();
}

function explicitReferenceReason(chunk, request) {
  const chunkSource = normalizedPath(chunk.source);
  const changedPaths = new Set(request.changed_paths.map(normalizedPath));
  if (changedPaths.has(chunkSource)) return 'changed path exactly matched chunk source';

  const intent = String(request.task_intent ?? '').toLowerCase();
  if (intent.includes(String(chunk.id).toLowerCase())) return 'intent explicitly referenced chunk id';
  if (intent.includes(chunkSource)) return 'intent explicitly referenced chunk source';

  const requestedWiIds = intent.match(/wi-[a-z0-9]+\d{4}-[a-z]+/g) ?? [];
  const chunkReferenceText = [chunk.id, chunk.title, chunk.source].filter(Boolean).join(' ').toLowerCase();
  if (requestedWiIds.some((wiId) => chunkReferenceText.includes(wiId))) {
    return 'intent explicitly referenced WI id';
  }
  return null;
}

function addSelection(selections, item, rule, loadReason) {
  if (!item?.id || !item.source) return;
  const existing = selections.get(item.id);
  const reasons = new Set(existing?.load_reasons ?? []);
  const ruleIds = new Set(existing?.selection_rules ?? []);
  reasons.add(loadReason);
  ruleIds.add(rule.id);
  selections.set(item.id, {
    id: item.id,
    source: item.source,
    type: item.type ?? 'always-on',
    layer: item.layer ?? 'layer1',
    status: item.status ?? 'live',
    hash: exists(item.source) ? sha256(item.source) : null,
    load_reasons: [...reasons],
    selection_rules: [...ruleIds],
    decision_ref: item.id.startsWith('decision.') ? item.id : null,
  });
}

function normalizeChangedPaths(changedPaths) {
  return changedPaths.map((changedPath) => changedPath.replace(/\\/g, '/')).join(' ');
}

function ruleMatches(rule, request, requestTokens, changedText) {
  if (rule.selectAlwaysOn) return true;
  if (rule.riskLevels?.includes(request.risk_level)) return true;
  if (rule.changedPathPattern?.test(changedText)) return true;
  if (rule.tokens?.some((token) => requestTokens.has(token))) return true;
  if (!rule.riskLevels && !rule.changedPathPattern && !rule.tokens) return true;
  return false;
}

function reasonFor(rule, request, chunkId) {
  if (rule.reasonByChunkId?.[chunkId]) return rule.reasonByChunkId[chunkId];
  return typeof rule.reason === 'function' ? rule.reason(request) : rule.reason;
}

function applyStaticRule(selections, byId, alwaysOn, rule, request, requestTokens, changedText) {
  if (!ruleMatches(rule, request, requestTokens, changedText)) return;

  if (rule.selectAlwaysOn) {
    for (const item of alwaysOn) {
      addSelection(selections, item, rule, reasonFor(rule, request, item.id));
    }
    return;
  }

  for (const chunkId of rule.chunkIds ?? []) {
    addSelection(selections, byId.get(chunkId), rule, reasonFor(rule, request, chunkId));
  }
}

function selectChunks({ alwaysOn, chunks }, request) {
  const selections = new Map();
  const byId = new Map(chunks.map((chunk) => [chunk.id, chunk]));
  const intentTokens = tokenize([request.intent, request.task_intent, request.wi_id, request.title]);
  const changedTokens = tokenize(request.changed_paths);
  const requestTokens = new Set([...intentTokens, ...changedTokens]);
  const changedText = normalizeChangedPaths(request.changed_paths);
  const requestedLoadsForTags = new Set(explicitIntentTags(request.task_intent));
  const explicitReferenceChunkIds = new Set();
  const dynamicLoadsForChunkIds = new Set();

  for (const rule of selectionRuleTable) {
    applyStaticRule(selections, byId, alwaysOn, rule, request, requestTokens, changedText);
  }

  for (const chunk of chunks) {
    const referenceReason = explicitReferenceReason(chunk, request);
    if (!referenceReason) continue;
    addSelection(selections, chunk, explicitReferenceRule, referenceReason);
    explicitReferenceChunkIds.add(chunk.id);
  }

  for (const chunk of chunks) {
    const loadsFor = chunk.loads_for ?? [];
    const matchedTags = loadsFor
      .map(normalizeTag)
      .filter((tag) => tag.includes('-') && requestedLoadsForTags.has(tag));
    if (matchedTags.length > 0) {
      addSelection(
        selections,
        chunk,
        loadsForRule,
        `loads_for exactly matched intent tags: ${matchedTags.join(', ')}`,
      );
      dynamicLoadsForChunkIds.add(chunk.id);
    }
  }

  const selected = [...selections.values()].sort((a, b) => a.id.localeCompare(b.id));
  const breadthGuard = {
    policy: 'exact-specialized-intent-tags-v1',
    max_dynamic_loads_for_chunks: maxDynamicLoadsForChunks,
    max_selected_chunks: maxSelectedChunks,
    dynamic_loads_for_chunk_count: dynamicLoadsForChunkIds.size,
    explicit_reference_chunk_count: explicitReferenceChunkIds.size,
    total_selected_chunk_count: selected.length,
    status: dynamicLoadsForChunkIds.size <= maxDynamicLoadsForChunks
      && selected.length <= maxSelectedChunks
      ? 'passed'
      : 'rejected',
  };
  return { selected, breadthGuard };
}

function appendLedger(contextPack, actor) {
  const lines = contextPack.selected_chunks.map((chunk) => JSON.stringify({
    timestamp: contextPack.generated_at,
    wi_id: contextPack.wi_id,
    chunk_id: chunk.id,
    source: chunk.source,
    hash: chunk.hash,
    load_reason: chunk.load_reasons.join('; '),
    decision_ref: chunk.decision_ref,
    actor,
  }));

  appendFileSync(path.join(repoRoot, ledgerPath), `${lines.join('\n')}\n`, 'utf8');
  return lines.length;
}

const args = parseArgs(process.argv.slice(2));
const currentWi = parseCurrentWi();
const request = {
  wi_id: args.wi ?? currentWi.wi_id ?? 'WI-CX0000-docs',
  risk_level: args.risk ?? currentWi.risk_level ?? 'R2',
  task_intent: args.intent ?? currentWi.title ?? 'wi-start',
  title: currentWi.title,
  changed_paths: args.changed,
};

const manifest = parseManifest(read('docs/manifest.yaml'));
const generatedAt = new Date().toISOString();
const { selected, breadthGuard } = selectChunks(manifest, request);
if (breadthGuard.status === 'rejected') {
  console.error(JSON.stringify({
    ok: false,
    error: 'context_selection_breadth_guard_rejected',
    message: 'Narrow --intent to fewer exact specialized loads_for tags before appending the ledger.',
    wi_id: request.wi_id,
    breadth_guard: breadthGuard,
  }, null, 2));
  process.exit(1);
}
const appendRequested = args['append-ledger'] === true;
const actor = args.actor || 'codex';
const contextPack = {
  schema_version: 0,
  context_pack_id: `ctx-${request.wi_id.toLowerCase()}-${generatedAt.replace(/[-:.TZ]/g, '').slice(0, 14)}`,
  generated_at: generatedAt,
  wi_id: request.wi_id,
  risk_level: request.risk_level,
  task_intent: request.task_intent,
  changed_paths: request.changed_paths,
  selected_chunk_ids: selected.map((chunk) => chunk.id),
  selection_rule_ids: [...new Set(selected.flatMap((chunk) => chunk.selection_rules))].sort(),
  selected_chunks: selected,
  breadth_guard: breadthGuard,
  ledger_append: {
    requested: appendRequested,
    status: appendRequested ? 'appended' : 'not_requested',
    path: ledgerPath,
    actor,
    entry_count: appendRequested ? selected.length : 0,
  },
  body_storage: 'forbidden',
  contains_chunk_bodies: false,
  forbidden_output: manifest.hookContract.forbidden_output,
};

if (appendRequested) {
  contextPack.ledger_append.entry_count = appendLedger(contextPack, actor);
}

console.log(JSON.stringify(contextPack, null, 2));
