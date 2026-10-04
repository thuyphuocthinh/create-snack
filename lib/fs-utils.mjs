import fs from 'node:fs';
import path from 'node:path';

/**
 * Files that cannot live under their real name inside a template
 * (git/npm would treat them as config of the *template repo* itself).
 */
const RENAMES = {
  _gitignore: '.gitignore',
  _npmrc: '.npmrc',
};

const SKIP_DIRS = new Set(['node_modules', 'dist', '.git']);

function isBinary(buffer) {
  return buffer.subarray(0, 8000).includes(0);
}

/** Replaces every `{{TOKEN}}` that exists in `vars`. Unknown tokens (e.g. Handlebars) are left alone. */
export function applyVars(text, vars) {
  return text.replace(/\{\{([A-Z_]+)\}\}/g, (match, key) =>
    key in vars ? vars[key] : match,
  );
}

/**
 * Copies a template folder into `dest`, replacing `{{TOKENS}}` in text files.
 * Existing files are kept (never clobbered) unless `overwrite` is true.
 * Returns the list of project-relative paths that were written and skipped.
 */
export function copyTemplateDir(src, dest, vars, { overwrite = true } = {}) {
  const written = [];
  const skipped = [];

  const walk = (from, to) => {
    fs.mkdirSync(to, { recursive: true });
    for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
      if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
      const source = path.join(from, entry.name);
      const target = path.join(to, RENAMES[entry.name] ?? entry.name);

      if (entry.isDirectory()) {
        walk(source, target);
        continue;
      }

      const relative = path.relative(dest, target);
      if (!overwrite && fs.existsSync(target)) {
        skipped.push(relative);
        continue;
      }

      const buffer = fs.readFileSync(source);
      if (isBinary(buffer)) {
        fs.writeFileSync(target, buffer);
      } else {
        fs.writeFileSync(target, applyVars(buffer.toString('utf8'), vars));
      }
      written.push(relative);
    }
  };

  walk(src, dest);
  return { written, skipped };
}

const sortKeys = (object = {}) =>
  Object.fromEntries(Object.entries(object).sort(([a], [b]) => a.localeCompare(b)));

/** Merges dependencies / devDependencies / scripts into the project's package.json. */
export function mergePackageJson(projectDir, patch) {
  const file = path.join(projectDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));

  for (const key of ['dependencies', 'devDependencies']) {
    if (patch[key]) pkg[key] = sortKeys({ ...pkg[key], ...patch[key] });
  }
  if (patch.scripts) pkg.scripts = { ...pkg.scripts, ...patch.scripts };

  fs.writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`);
}

/**
 * Inserts `lines` right above the line that contains `marker`, keeping the marker so more
 * code can be injected later (e.g. `create-my-stack add redis`). The inserted block takes
 * the marker's indentation. Returns false when the file or the marker is missing.
 */
export function injectAtMarker(file, marker, lines) {
  if (!fs.existsSync(file)) return false;
  const text = fs.readFileSync(file, 'utf8');
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`^([ \\t]*)${escaped}.*$`, 'm').exec(text);
  if (!match) return false;

  const indent = match[1];
  const block = lines.map((line) => (line === '' ? '' : indent + line)).join(eol);
  const updated = `${text.slice(0, match.index)}${block}${eol}${text.slice(match.index)}`;
  fs.writeFileSync(file, updated);
  return true;
}

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function writeJson(file, data) {
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

export function appendLines(file, lines) {
  const existing = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const prefix = existing === '' || existing.endsWith('\n') ? '' : '\n';
  fs.writeFileSync(file, `${existing}${prefix}${lines.join('\n')}\n`);
}
