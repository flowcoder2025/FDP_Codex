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
    chunkIds: ['flow.current-wi', 'flow.fix-plan', 'flow.handoff'],
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
  trigger: 'manifest.loads_for token intersection',
};

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

  for (const rule of selectionRuleTable) {
    applyStaticRule(selections, byId, alwaysOn, rule, request, requestTokens, changedText);
  }

  for (const chunk of chunks) {
    const loadsFor = chunk.loads_for ?? [];
    const loadTokens = tokenize(loadsFor);
    const matched = loadTokens.some((token) => requestTokens.has(token));
    if (matched) {
      addSelection(
        selections,
        chunk,
        loadsForRule,
        `loads_for matched request tokens: ${loadsFor.join(', ')}`,
      );
    }
  }

  return [...selections.values()].sort((a, b) => a.id.localeCompare(b.id));
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
const selected = selectChunks(manifest, request);
const generatedAt = new Date().toISOString();
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