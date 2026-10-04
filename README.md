# create-easy-stack 🚀

An elegant and powerful CLI tool to scaffold modern full-stack projects instantly. Whether you want a strictly structured NestJS DDD backend, a Feature-Sliced React frontend, or simply need to plug in Redis and RabbitMQ to your project, `create-easy-stack` has you covered.

## Installation & Usage

You don't need to install anything globally. Just use `npm create`:

```bash
# Scaffold a new project interactively
npm create easy-stack <project-name>
```

### List all available templates
```bash
npx create-easy-stack list
```

## Available Templates

### Backend 🖥️
- **`nest-ddd`**: NestJS with Domain-Driven Design (DDD) & CQRS (Clean Architecture). Includes Husky, Oxlint, Vitest, and a solid modular structure.
- **`node-express`**: Standard Node.js Express backend (TipsJS practice architecture).

### Frontend 🎨
- **`react-fsd`**: React + Vite + TypeScript (Feature Sliced Design architecture).
- **`react-monolithic`**: Standard React + Vite + TypeScript.
- **`vue-fsd`**: Vue + Vite + TypeScript (Feature Sliced Design architecture).
- **`vue-monolithic`**: Standard Vue + Vite + TypeScript.

## Infrastructure Modules (Pluggable) ⚙️

After scaffolding a backend project (like `nest-ddd`), you can effortlessly inject infrastructure modules. The CLI will automatically update your `app.module.ts`, `docker-compose.yml`, `.env`, and `package.json` for you!

```bash
cd <your-project-name>
npx create-easy-stack add <infra-name>
```

**Supported Infra Modules:**
- **`prisma-postgres`**: PostgreSQL database with Prisma ORM.
- **`redis`**: Redis cache, distributed lock, rate-limiting, and idempotency setup.
- **`rabbitmq`**: RabbitMQ message broker and background job queue.
- **`email`**: SMTP email service (sent through RabbitMQ job queue).
- **`storage-cloudinary`**: Image storage integration with Cloudinary.

*Example: Adding Redis to your new NestJS project:*
```bash
npm create easy-stack my-api nest-ddd
cd my-api
npx create-easy-stack add redis
```

## Built-in Code Generators (Plop.js)

For `nest-ddd` templates, the project comes pre-configured with `plop` to generate boilerplate code rapidly. Inside your generated project, simply run:

```bash
npm run plop
```
You can automatically generate Modules, Commands (CQRS), and Queries (CQRS) without writing repetitive code!

## License
MIT License © Thuy Phuoc Thinh
