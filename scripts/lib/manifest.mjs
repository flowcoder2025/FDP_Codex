export function parseManifest(manifestText) {
  const normalized = manifestText.replace(/\r\n/g, '\n');
  return {
    alwaysOn: parseAlwaysOn(normalized),
    chunks: parseChunks(normalized),
    hookContract: parseHookContract(normalized),
  };
}

function parseAlwaysOn(manifestText) {
  const alwaysOn = [];
  let inAlwaysOn = false;
  let current = null;

  for (const line of manifestText.split('\n')) {
    if (line === 'always_on:') {
      inAlwaysOn = true;
      continue;
    }
    if (inAlwaysOn && /^[a-z_]+:/.test(line)) {
      if (current) alwaysOn.push(current);
      break;
    }
    if (!inAlwaysOn) continue;

    const idMatch = /^  - id: (.+)$/.exec(line);
    if (idMatch) {
      if (current) alwaysOn.push(current);
      current = { id: idMatch[1].trim() };
      continue;
    }
    if (!current) continue;

    const sourceMatch = /^    source: (.+)$/.exec(line);
    if (sourceMatch) current.source = sourceMatch[1].trim();

    const reasonMatch = /^    reason: (.+)$/.exec(line);
    if (reasonMatch) current.reason = reasonMatch[1].trim();
  }

  return alwaysOn;
}

function parseChunks(manifestText) {
  const chunks = [];
  let inChunks = false;
  let current = null;
  let activeList = null;

  for (const line of manifestText.split('\n')) {
    if (line === 'chunks:') {
      inChunks = true;
      continue;
    }
    if (inChunks && /^[a-z_]+:/.test(line)) {
      if (current) chunks.push(current);
      break;
    }
    if (!inChunks) continue;

    const idMatch = /^  - id: (.+)$/.exec(line);
    if (idMatch) {
      if (current) chunks.push(current);
      current = { id: idMatch[1].trim(), loads_for: [] };
      activeList = null;
      continue;
    }
    if (!current) continue;

    const fieldMatch = /^    ([a-z_]+):(?: (.*))?$/.exec(line);
    if (fieldMatch) {
      const [, key, value] = fieldMatch;
      if (value === undefined || value === '') {
        activeList = key;
        if (!Array.isArray(current[key])) current[key] = [];
      } else {
        current[key] = value.trim();
        activeList = null;
      }
      continue;
    }

    const listMatch = /^      - (.+)$/.exec(line);
    if (listMatch && activeList) {
      current[activeList].push(listMatch[1].trim());
    }
  }

  return chunks;
}

function parseHookContract(manifestText) {
  const hook = { input: [], output: [], forbidden_output: [] };
  let inHook = false;
  let activeList = null;

  for (const line of manifestText.split('\n')) {
    if (line === 'hook_contract:') {
      inHook = true;
      continue;
    }
    if (!inHook) continue;

    const fieldMatch = /^  ([a-z_]+):(?: (.*))?$/.exec(line);
    if (fieldMatch) {
      const [, key, value] = fieldMatch;
      if (value === undefined || value === '') {
        activeList = key;
        if (!Array.isArray(hook[key])) hook[key] = [];
      } else {
        hook[key] = value.trim();
        activeList = null;
      }
      continue;
    }

    const listMatch = /^    - (.+)$/.exec(line);
    if (listMatch && activeList) {
      hook[activeList].push(listMatch[1].trim());
    }
  }

  return hook;
}
