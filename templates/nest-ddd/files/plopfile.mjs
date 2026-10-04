import fs from 'node:fs';

/**
 * Generators for the NestJS DDD + CQRS structure.
 *
 *   pnpm gen module     a whole bounded context (domain / application / infrastructure / presentation)
 *   pnpm gen command    a command + handler inside an existing module (auto-registered)
 *   pnpm gen query      a query + handler inside an existing module (auto-registered)
 *
 * Templates live in plop-templates/. The `// @plop:*` comments in the generated files are
 * the anchors these generators write into — keep them.
 */

const MODULES_DIR = 'src/modules';
const hasPrisma = fs.existsSync('prisma/schema.prisma');

const listModules = () =>
  fs.existsSync(MODULES_DIR)
    ? fs
        .readdirSync(MODULES_DIR, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
    : [];

const pluralize = (word) => {
  if (/[^aeiou]y$/.test(word)) return `${word.slice(0, -1)}ies`;
  if (/(s|x|z|ch|sh)$/.test(word)) return `${word}es`;
  return `${word}s`;
};

const requiredKebab = (label) => (value) =>
  /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(value) ||
  `${label} must be kebab-case, e.g. "order-item"`;

export default function (plop) {
  const pascal = plop.getHelper('pascalCase');
  const camel = plop.getHelper('camelCase');
  const constant = plop.getHelper('constantCase');
  const kebab = plop.getHelper('kebabCase');

  // ── module ────────────────────────────────────────────────────────────────
  plop.setGenerator('module', {
    description: 'Bounded context: entity, repository port, CQRS handlers, controller, module',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Module name (singular, kebab-case, e.g. "order" or "order-item"):',
        validate: requiredKebab('Name'),
      },
      {
        type: 'list',
        name: 'persistence',
        message: 'Persistence adapter:',
        choices: [
          { name: 'Prisma (adds a model to prisma/schema.prisma)', value: 'prisma' },
          { name: 'In-memory (swap for a real adapter later)', value: 'memory' },
        ],
        default: hasPrisma ? 'prisma' : 'memory',
      },
    ],
    actions: (answers) => {
      Object.assign(answers, {
        kebab: kebab(answers.name),
        Pascal: pascal(answers.name),
        camel: camel(answers.name),
        CONSTANT: constant(answers.name),
        CODE: answers.name.replace(/[^a-z]/g, '').slice(0, 3).toUpperCase().padEnd(3, 'X'),
        plural: pluralize(kebab(answers.name)),
      });
      const target = 'src/modules/{{kebab}}';
      const actions = [
        {
          type: 'addMany',
          destination: target,
          base: 'plop-templates/module',
          templateFiles: 'plop-templates/module/**/*',
          globOptions: { dot: true },
          abortOnFail: true,
        },
        {
          type: 'addMany',
          destination: target,
          base: `plop-templates/persistence-${answers.persistence}`,
          templateFiles: `plop-templates/persistence-${answers.persistence}/**/*`,
          abortOnFail: true,
        },
        {
          type: 'modify',
          path: 'src/app.module.ts',
          pattern: /\/\/ @plop:module-imports/,
          template:
            "import { {{Pascal}}Module } from './modules/{{kebab}}/{{kebab}}.module.js';\n// @plop:module-imports",
        },
        {
          type: 'modify',
          path: 'src/app.module.ts',
          pattern: /\/\/ @plop:modules/,
          template: '{{Pascal}}Module,\n    // @plop:modules',
        },
        {
          type: 'modify',
          path: 'src/core/domain/exceptions/error-codes.ts',
          pattern: /\/\/ @plop:error-codes/,
          templateFile: 'plop-templates/snippets/error-codes.hbs',
        },
      ];
      if (answers.persistence === 'prisma' && hasPrisma) {
        actions.push({
          type: 'append',
          path: 'prisma/schema.prisma',
          templateFile: 'plop-templates/snippets/prisma-model.hbs',
        });
      }
      return actions;
    },
  });

  // ── command / query ───────────────────────────────────────────────────────
  for (const kind of ['command', 'query']) {
    const isCommand = kind === 'command';
    plop.setGenerator(kind, {
      description: isCommand
        ? 'Command + handler in an existing module (a write use case)'
        : 'Query + handler in an existing module (a read use case)',
      prompts: [
        {
          type: 'list',
          name: 'module',
          message: 'Which module?',
          choices: listModules,
        },
        {
          type: 'input',
          name: 'name',
          message: isCommand
            ? 'Command name in kebab-case (e.g. "publish-order"):'
            : 'Query name in kebab-case (e.g. "get-order-by-id"):',
          validate: requiredKebab('Name'),
        },
      ],
      actions: (answers) => {
        Object.assign(answers, {
          kebab: kebab(answers.name),
          Pascal: pascal(answers.name),
          ModulePascal: pascal(answers.module),
          moduleKebab: kebab(answers.module),
        });
        const dir = isCommand ? 'commands' : 'queries';
        const base = `src/modules/{{module}}/application/${dir}`;
        const array = isCommand ? 'command-handlers' : 'query-handlers';
        const modulePath = 'src/modules/{{module}}/{{module}}.module.ts';
        return [
          {
            type: 'add',
            path: `${base}/{{kebab}}.${kind}.ts`,
            templateFile: `plop-templates/${kind}/${kind}.ts.hbs`,
          },
          {
            type: 'add',
            path: `${base}/{{kebab}}.handler.ts`,
            templateFile: `plop-templates/${kind}/handler.ts.hbs`,
          },
          {
            type: 'modify',
            path: 'src/modules/{{module}}/application/index.ts',
            pattern: /\/\/ @plop:exports/,
            template: `export * from './${dir}/{{kebab}}.${kind}.js';\nexport * from './${dir}/{{kebab}}.handler.js';\n// @plop:exports`,
          },
          {
            type: 'modify',
            path: modulePath,
            pattern: /\/\/ @plop:handler-imports/,
            template: '{{Pascal}}Handler,\n  // @plop:handler-imports',
          },
          {
            type: 'modify',
            path: modulePath,
            pattern: new RegExp(`// @plop:${array}`),
            template: `{{Pascal}}Handler,\n  // @plop:${array}`,
          },
        ];
      },
    });
  }
}
