#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import prompts from 'prompts';
import { loadInfra, loadTemplates } from '../lib/registry.mjs';
import {
  addInfraToProject,
  createProject,
  initGit,
  installDependencies,
  isValidProjectName,
} from '../lib/scaffold.mjs';

const c = {
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
};

const HELP = `
${c.bold('create-my-stack')} — personal project generator

${c.bold('Usage')}
  create-my-stack [name] [options]      create a project
  create-my-stack add <infra...>        add infra to the project in --dir (default: .)
  create-my-stack list                  show templates and infra

${c.bold('Options')}
  -t, --template <id>     template id (see "list")
  -i, --infra <a,b,c>     infra modules, comma separated (backend templates)
      --no-infra          skip the infra question
      --pm <pnpm|npm|yarn|bun>   package manager (default: the one that launched the CLI, else pnpm)
      --install / --no-install   run the install step
      --git / --no-git           run "git init"
  -d, --dir <path>        target directory for "add"
  -y, --yes               accept defaults, never prompt
  -h, --help
`;

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    template: { type: 'string', short: 't' },
    infra: { type: 'string', short: 'i' },
    'no-infra': { type: 'boolean' },
    pm: { type: 'string' },
    install: { type: 'boolean' },
    'no-install': { type: 'boolean' },
    git: { type: 'boolean' },
    'no-git': { type: 'boolean' },
    dir: { type: 'string', short: 'd' },
    yes: { type: 'boolean', short: 'y' },
    help: { type: 'boolean', short: 'h' },
  },
});

const interactive = !values.yes && process.stdin.isTTY && process.stdout.isTTY;
const onCancel = () => {
  console.log(c.yellow('\nCancelled.'));
  process.exit(1);
};
const log = (message) => console.log(c.dim(message));

function detectPackageManager() {
  const agent = process.env.npm_config_user_agent ?? '';
  const match = /^(pnpm|yarn|bun|npm)\//.exec(agent);
  return match ? match[1] : 'pnpm';
}

function printList() {
  const templates = loadTemplates();
  const infra = loadInfra();
  console.log(`\n${c.bold('Templates')}`);
  for (const t of templates) {
    console.log(`  ${c.cyan(t.id.padEnd(18))} ${t.label} ${c.dim(`— ${t.description}`)}`);
  }
  console.log(`\n${c.bold('Infra')} ${c.dim('(backend templates)')}`);
  for (const i of infra) {
    const requires = i.requires?.length ? c.dim(` (needs ${i.requires.join(', ')})`) : '';
    console.log(`  ${c.cyan(i.id.padEnd(18))} ${i.label}${requires}`);
  }
  console.log();
}

async function runAdd() {
  const projectDir = path.resolve(values.dir ?? '.');
  const requested = positionals.slice(1);
  if (requested.length === 0) {
    console.error(c.red('Usage: create-my-stack add <infra...>'));
    process.exit(1);
  }
  const result = addInfraToProject({
    projectDir,
    infra: requested,
    availableInfra: loadInfra(),
    log,
  });
  for (const { id, because } of result.autoAdded) {
    console.log(c.yellow(`  ${id} was added too because ${because} needs it`));
  }
  console.log(
    c.green(`\nAdded: ${result.added.map((i) => i.id).join(', ') || 'nothing new'}`),
  );
  console.log(c.dim('Run the install step again, then review .env.example / docker-compose.yml.\n'));
}

async function runCreate() {
  const templates = loadTemplates();
  const availableInfra = loadInfra();

  // 1. Project name
  let name = positionals[0];
  if (!name && interactive) {
    ({ name } = await prompts(
      {
        type: 'text',
        name: 'name',
        message: 'Project name',
        initial: 'my-app',
        validate: (v) => isValidProjectName(v) || 'Use lowercase letters, digits, - . _ ~',
      },
      { onCancel },
    ));
  }
  name ??= 'my-app';
  if (!isValidProjectName(path.basename(name))) {
    console.error(c.red(`Invalid project name "${name}"`));
    process.exit(1);
  }
  const projectDir = path.resolve(name);
  if (fs.existsSync(projectDir) && fs.readdirSync(projectDir).length > 0) {
    console.error(c.red(`Directory ${projectDir} already exists and is not empty.`));
    process.exit(1);
  }

  // 2. Template
  let templateId = values.template;
  if (!templateId && interactive) {
    ({ templateId } = await prompts(
      {
        type: 'select',
        name: 'templateId',
        message: 'Template',
        choices: templates.map((t) => ({
          title: `${t.label}`,
          description: t.description,
          value: t.id,
        })),
      },
      { onCancel },
    ));
  }
  const template = templates.find((t) => t.id === templateId);
  if (!template) {
    console.error(c.red(`Pick a template with --template. Available: ${templates.map((t) => t.id).join(', ')}`));
    process.exit(1);
  }

  // 3. Infra (backend templates only)
  let infra = [];
  if (template.supportsInfra) {
    const choices = availableInfra.filter(
      (i) => !i.templates || i.templates.includes(template.id),
    );
    if (values.infra) {
      infra = values.infra.split(',').map((s) => s.trim()).filter(Boolean);
    } else if (!values['no-infra'] && interactive) {
      ({ infra } = await prompts(
        {
          type: 'multiselect',
          name: 'infra',
          message: 'Infra to include',
          hint: '- space to select, enter to confirm',
          instructions: false,
          choices: choices.map((i) => ({
            title: i.label,
            value: i.id,
            selected: i.default === true,
          })),
        },
        { onCancel },
      ));
    } else if (!values['no-infra']) {
      infra = choices.filter((i) => i.default).map((i) => i.id);
    }
  }

  // 4. Install / git
  const packageManager = values.pm ?? detectPackageManager();
  const ask = async (flagOn, flagOff, message, initial) => {
    if (values[flagOn]) return true;
    if (values[flagOff]) return false;
    if (!interactive) return initial;
    const { answer } = await prompts(
      { type: 'confirm', name: 'answer', message, initial },
      { onCancel },
    );
    return answer;
  };
  const doGit = await ask('git', 'no-git', 'Initialise a git repository?', true);
  const doInstall = await ask('install', 'no-install', `Install dependencies with ${packageManager}?`, false);

  // 5. Go
  console.log(`\n${c.bold(`Creating ${name}`)} ${c.dim(`from ${template.id}`)}`);
  const result = createProject({ template, infra, projectDir, availableInfra, log });
  for (const { id, because } of result.autoAdded) {
    console.log(c.yellow(`  ${id} was added too because ${because} needs it`));
  }
  if (doGit) initGit(projectDir);
  if (doInstall) {
    console.log(c.dim(`\n${packageManager} install ...`));
    if (!installDependencies(projectDir, packageManager)) {
      console.log(c.yellow('Install failed — run it yourself after fixing the error above.'));
    }
  }

  const rel = path.relative(process.cwd(), projectDir) || '.';
  const run = (script) => (packageManager === 'npm' ? `npm run ${script}` : `${packageManager} ${script}`);
  console.log(`\n${c.green('Done!')} Next steps:\n`);
  console.log(`  cd ${rel}`);
  if (!doInstall) console.log(`  ${packageManager} install`);
  if (result.infra.some((i) => i.docker)) console.log('  docker compose up -d');
  for (const step of template.nextSteps ?? []) console.log(`  ${run(step)}`);
  console.log(`\n${c.dim('Generators: ')}${run('gen')} ${c.dim('(plop) — see README.md in the project.')}\n`);
}

try {
  if (values.help) {
    console.log(HELP);
  } else if (positionals[0] === 'list') {
    printList();
  } else if (positionals[0] === 'add') {
    await runAdd();
  } else {
    await runCreate();
  }
} catch (error) {
  console.error(c.red(`\n${error.message}`));
  process.exit(1);
}
