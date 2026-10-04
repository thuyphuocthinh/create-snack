import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  appendLines,
  copyTemplateDir,
  injectAtMarker,
  mergePackageJson,
  readJson,
  writeJson,
} from './fs-utils.mjs';
import { resolveInfra } from './registry.mjs';

export const LOCK_FILE = '.my-stack.json';

const COMPOSE_SKELETON = `services:
  # @infra:services

volumes:
  # @infra:volumes
`;

/** Names usable inside templates: {{PROJECT_NAME}}, {{PROJECT_NAME_PASCAL}}, {{PROJECT_NAME_SNAKE}}. */
export function buildVars(projectName) {
  const words = projectName.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  const lower = words.map((word) => word.toLowerCase());
  return {
    PROJECT_NAME: projectName,
    PROJECT_NAME_PASCAL: lower.map((w) => w[0].toUpperCase() + w.slice(1)).join(''),
    PROJECT_NAME_SNAKE: lower.join('_'),
  };
}

export function isValidProjectName(name) {
  return /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(name);
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  return result.status === 0;
}

/** Applies one infra module (files, deps, env, docker service, injections) onto a project. */
function applyInfra(projectDir, infra, vars, log) {
  const filesDir = path.join(infra.dir, 'files');
  if (fs.existsSync(filesDir)) {
    const { skipped } = copyTemplateDir(filesDir, projectDir, vars, { overwrite: false });
    for (const file of skipped) log(`  skipped existing file: ${file}`);
  }

  mergePackageJson(projectDir, infra);

  if (infra.env?.length) {
    appendLines(path.join(projectDir, '.env.example'), ['', ...infra.env]);
  }

  if (infra.docker) {
    const composeFile = path.join(projectDir, 'docker-compose.yml');
    if (!fs.existsSync(composeFile)) fs.writeFileSync(composeFile, COMPOSE_SKELETON);
    const service = fs
      .readFileSync(path.join(infra.dir, infra.docker.file), 'utf8')
      .replace(/\{\{([A-Z_]+)\}\}/g, (m, key) => vars[key] ?? m)
      .trimEnd()
      .split(/\r?\n/);
    injectAtMarker(composeFile, '# @infra:services', [...service, '']);
    const volumes = (infra.docker.volumes ?? []).map((name) => `${name}:`);
    if (volumes.length) injectAtMarker(composeFile, '# @infra:volumes', volumes);
  }

  for (const step of infra.inject ?? []) {
    const file = path.join(projectDir, step.file);
    if (!injectAtMarker(file, step.marker, step.lines)) {
      log(`  ! marker "${step.marker}" not found in ${step.file} (add it by hand)`);
    }
  }
}

/**
 * Creates `projectDir` from `template`, then layers the requested infra on top.
 * Returns what happened so the CLI can print an accurate summary.
 */
export function createProject({ template, infra: requested = [], projectDir, availableInfra, log = () => {} }) {
  const projectName = path.basename(projectDir);
  const vars = buildVars(projectName);
  const { ordered, added } = resolveInfra(requested, availableInfra);

  const unsupported = ordered.filter(
    (infra) => infra.templates && !infra.templates.includes(template.id),
  );
  if (unsupported.length) {
    throw new Error(
      `Infra not available for ${template.id}: ${unsupported.map((i) => i.id).join(', ')}`,
    );
  }

  fs.mkdirSync(projectDir, { recursive: true });
  copyTemplateDir(path.join(template.dir, 'files'), projectDir, vars);

  for (const infra of ordered) {
    log(`+ infra: ${infra.id}`);
    applyInfra(projectDir, infra, vars, log);
  }

  if (fs.existsSync(path.join(projectDir, '.env.example'))) {
    const envFile = path.join(projectDir, '.env');
    if (!fs.existsSync(envFile)) {
      fs.copyFileSync(path.join(projectDir, '.env.example'), envFile);
    }
  }

  writeJson(path.join(projectDir, LOCK_FILE), {
    template: template.id,
    infra: ordered.map((infra) => infra.id),
  });

  return { projectName, vars, infra: ordered, autoAdded: added };
}

/** `create-my-stack add <infra>` — layers more infra onto a project created earlier. */
export function addInfraToProject({ projectDir, infra: requested, availableInfra, log = () => {} }) {
  const lockPath = path.join(projectDir, LOCK_FILE);
  if (!fs.existsSync(lockPath)) {
    throw new Error(`${LOCK_FILE} not found in ${projectDir}; was it created by create-my-stack?`);
  }
  const lock = readJson(lockPath);
  const installed = new Set(lock.infra ?? []);
  const vars = buildVars(path.basename(projectDir));

  const { ordered, added } = resolveInfra(requested, availableInfra);
  const pending = ordered.filter((infra) => !installed.has(infra.id));
  for (const infra of pending) {
    if (infra.templates && !infra.templates.includes(lock.template)) {
      throw new Error(`Infra "${infra.id}" does not support template ${lock.template}`);
    }
  }

  for (const infra of pending) {
    log(`+ infra: ${infra.id}`);
    applyInfra(projectDir, infra, vars, log);
  }

  writeJson(lockPath, { ...lock, infra: [...installed, ...pending.map((infra) => infra.id)] });
  return { added: pending, autoAdded: added.filter((a) => !installed.has(a.id)) };
}

export function initGit(projectDir) {
  if (run('git', ['--version'], projectDir) === false) return false;
  return run('git', ['init', '-q'], projectDir);
}

export function installDependencies(projectDir, packageManager) {
  return run(packageManager, ['install'], projectDir);
}
