// Domain — pure business primitives, no framework dependencies
export * from './domain/base/entity.base.js';
export * from './domain/base/aggregate-root.base.js';
export * from './domain/base/domain-event.base.js';
export * from './domain/base/value-object.base.js';
export * from './domain/exceptions/domain.exception.js';
export * from './domain/exceptions/error-codes.js';
export * from './domain/types/pagination.js';

// HTTP — web-layer framework glue (filters, interceptors, shared DTOs, logging)
export * from './http/filters/all-exceptions.filter.js';
export * from './http/interceptors/logging.interceptor.js';
export * from './http/interceptors/response.interceptor.js';
export * from './http/dtos/paginated-response.dto.js';
export * from './http/dtos/pagination-query.dto.js';
export * from './http/logging/app.logger.js';
export * from './http/guards/max-body-size.guard.js';
export * from './http/decorators/client-info.decorator.js';
export * from './http/decorators/current-user.decorator.js';

// Config — settings read from the environment
export * from './config/app.config.js';

// Utils — stateless pure functions
export * from './utils/snowflake.util.js';
export * from './utils/hash.util.js';
export * from './utils/time.util.js';
export * from './utils/string.util.js';
export * from './utils/correlation-id.util.js';
export * from './utils/ttl.util.js';

// Infrastructure — external systems; lines are added by `create-my-stack add <infra>`
// @infra:barrel
