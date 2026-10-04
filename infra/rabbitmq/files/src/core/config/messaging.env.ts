const JOB_QUEUES = ['rabbitmq', 'inline'];
// Where the built-in local RabbitMQ address may be used
const LOCAL_ENVIRONMENTS = [undefined, 'development', 'test'];

/** JOB_QUEUE must be known, `inline` is dev-only, and production must say where RabbitMQ is. */
export function validateMessagingEnv(
  config: Record<string, unknown>,
  errors: string[],
): void {
  const jobQueue = (config.JOB_QUEUE ?? 'rabbitmq') as string;

  if (!JOB_QUEUES.includes(jobQueue)) {
    errors.push(
      `JOB_QUEUE must be one of: ${JOB_QUEUES.join(', ')} (got "${jobQueue}")`,
    );
  } else if (jobQueue === 'inline' && config.NODE_ENV === 'production') {
    errors.push(
      'JOB_QUEUE=inline runs background work inside the request and is not allowed in production; use rabbitmq',
    );
  } else if (
    jobQueue === 'rabbitmq' &&
    !LOCAL_ENVIRONMENTS.includes(config.NODE_ENV as string | undefined) &&
    !(typeof config.RABBITMQ_URL === 'string' && config.RABBITMQ_URL.trim())
  ) {
    errors.push(
      'RABBITMQ_URL must be set unless NODE_ENV is development, test or unset, when JOB_QUEUE=rabbitmq',
    );
  }
}
