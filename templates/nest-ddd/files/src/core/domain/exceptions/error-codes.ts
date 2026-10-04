import { HttpStatus } from '@nestjs/common';

export interface ErrorCode {
  code: string;
  message: string;
  status: HttpStatus;
}

export const CoreErrorCodes = {
  SYSTEM_ERROR: {
    code: 'SYS-001',
    message: 'Internal server error',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  VALIDATION_ERROR: {
    code: 'VAL-001',
    message: 'Validation failed',
    status: HttpStatus.BAD_REQUEST,
  },
  RESOURCE_BUSY: {
    code: 'SYS-002',
    message: 'Another request is changing this right now, please try again',
    status: HttpStatus.CONFLICT,
  },
};

// @infra:error-codes
// @plop:error-codes
