import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

// Background jobs run inside the request here, so e2e tests need no broker.
// (Only read when the rabbitmq infra is installed.)
process.env.JOB_QUEUE ??= 'inline';
