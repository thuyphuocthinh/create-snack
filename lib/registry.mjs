import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJson } from './fs-utils.mjs';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const TEMPLATES_DIR = path.join(ROOT, 'templates');
export const INFRA_DIR = path.join(ROOT, 'infra');

function loadAll(baseDir, manifestName) {
  if (!fs.existsSync(baseDir)) return [];
  return fs
    .readdirSync(baseDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const dir = path.join(baseDir, entry.name);
      const manifest = path.join(dir, manifestName);
      if (!fs.existsSync(manifest)) return null;
      return { ...readJson(manifest), dir };
    })
    .filter(Boolean);
}

/** Every template under `templates/`, described by its `template.json`. */
export const loadTemplates = () => loadAll(TEMPLATES_DIR, 'template.json');

/** Every infra module under `infra/`, described by its `infra.json`. */
export const loadInfra = () => loadAll(INFRA_DIR, 'infra.json');

/**
 * Expands the requested infra ids with everything they `require`
 * (e.g. email -> rabbitmq), preserving order and removing duplicates.
 */
export function resolveInfra(requested, available) {
  const byId = new Map(available.map((infra) => [infra.id, infra]));
  const ordered = [];
  const added = [];

  const visit = (id, parent) => {
    const infra = byId.get(id);
    if (!infra) throw new Error(`Unknown infra "${id}". Run "list" to see what exists.`);
    if (ordered.some((item) => item.id === id)) return;
    for (const dependency of infra.requires ?? []) visit(dependency, id);
    ordered.push(infra);
    if (!requested.includes(id)) added.push({ id, because: parent });
  };

  for (const id of requested) visit(id);
  return { ordered, added };
}
