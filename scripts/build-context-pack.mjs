#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parseManifest } from './lib/manifest.mjs';

const repoRoot = process.cwd();

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

function addSelection(selections, item, loadReason) {
  if (!item?.id || !item.source) return;
  const existing = selections.get(item.id);
  const reasons = new Set(existing?.load_reasons ?? []);
  reasons.add(loadReason);
  selections.set(item.id, {
    id: item.id,
    source: item.source,
    type: item.type ?? 'always-on',
    layer: item.layer ?? 'layer1',
    status: item.status ?? 'live',
    hash: exists(item.source) ? sha256(item.source) : null,
    load_reasons: [...reasons],
    decision_ref: item.id.startsWith('decision.') ? item.id : null,
  });
}

function selectChunks({ alwaysOn, chunks }, request) {
  const selections = new Map();
  const byId = new Map(chunks.map((chunk) => [chunk.id, chunk]));
  const intentTokens = tokenize([request.intent, request.task_intent, request.wi_id, request.title]);
  const changedTokens = tokenize(request.changed_paths);
  const risk = request.risk_level;

  for (const item of alwaysOn) {
    addSelection(selections, item, 'always-on reference');
  }

  for (const id of ['flow.current-wi', 'flow.fix-plan', 'flow.handoff']) {
    addSelection(selections, byId.get(id), 'WI start flow state');
  }

  if (risk === 'R2' || risk === 'R3') {
    for (const id of [
      'policy.context-hygiene',
      'policy.work-item-lifecycle',
      'policy.naming-and-commits',
      'policy.autonomy-and-approval',
      'policy.triage-strategy',
      'policy.verification-economy',
    ]) {
      addSelection(selections, byId.get(id), `${risk} policy baseline`);
    }
  }

  const requestTokens = new Set([...intentTokens, ...changedTokens]);
  for (const chunk of chunks) {
    const loadsFor = chunk.loads_for ?? [];
    const loadTokens = tokenize(loadsFor);
    const matched = loadTokens.some((token) => requestTokens.has(token));
    if (matched) addSelection(selections, chunk, `loads_for matched request tokens: ${loadsFor.join(', ')}`);
  }

  const changed = request.changed_paths.join(' ');
  if (/docs\/manifest\.yaml/.test(changed)) {
    addSelection(selections, byId.get('registry.manifest'), 'manifest changed');
    addSelection(selections, byId.get('policy.context-hygiene'), 'manifest changed');
    addSelection(selections, byId.get('spec.knowledge-system'), 'manifest changed');
  }
  if (/(^| )scripts\//.test(changed) || /package\.json/.test(changed)) {
    addSelection(selections, byId.get('tool.package'), 'tooling changed');
    addSelection(selections, byId.get('tool.validate-repo'), 'tooling changed');
  }
  if (requestTokens.has('context') || requestTokens.has('pack') || requestTokens.has('building')) {
    addSelection(selections, byId.get('spec.knowledge-system'), 'context pack request');
    addSelection(selections, byId.get('policy.context-hygiene'), 'context pack request');
  }
  if (requestTokens.has('github') || requestTokens.has('issue') || requestTokens.has('pr')) {
    addSelection(selections, byId.get('policy.git-workflow'), 'GitHub or PR request');
    addSelection(selections, byId.get('policy.github-issue-governance'), 'GitHub or issue request');
  }
  if (requestTokens.has('validation') || requestTokens.has('validator') || requestTokens.has('ci')) {
    addSelection(selections, byId.get('tool.validate-repo'), 'validation request');
  }

  return [...selections.values()].sort((a, b) => a.id.localeCompare(b.id));
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
const contextPack = {
  schema_version: 0,
  context_pack_id: `ctx-${request.wi_id.toLowerCase()}-${generatedAt.replace(/[-:.TZ]/g, '').slice(0, 14)}`,
  generated_at: generatedAt,
  wi_id: request.wi_id,
  risk_level: request.risk_level,
  task_intent: request.task_intent,
  changed_paths: request.changed_paths,
  selected_chunk_ids: selected.map((chunk) => chunk.id),
  selected_chunks: selected,
  body_storage: 'forbidden',
  contains_chunk_bodies: false,
  forbidden_output: manifest.hookContract.forbidden_output,
};

console.log(JSON.stringify(contextPack, null, 2));
