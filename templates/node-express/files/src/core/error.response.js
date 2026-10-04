"use strict";
const myloggerLog = require("../logger/mylogger.log.js");
const logger = require("../logger/winston.log.js");
const reasonPhrases = require("../utils/reasonPhrases.js");
const statusCodes = require("../utils/statusCodes.js");

class ErrorResponse extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;

    // TODO: log error use winston
    // logger.error(`[${this.status}] - ${this.message}`);
    myloggerLog.error(`[${this.status}] - ${this.message}`, {
      context: "/path",
      requestId: "ID_REQUEST",
      message: this.message,
      status: this.status,
      metadata: {},
    });
  }
}

class ConflictRequestError extends ErrorResponse {
  constructor(
    message = reasonPhrases.CONFLICT,
    statusCode = statusCodes.CONFLICT
  ) {
    super(message, statusCode);
  }
}

class BadRequestError extends ErrorResponse {
  constructor(
    message = reasonPhrases.BAD_REQUEST,
    statusCode = statusCodes.BAD_REQUEST
  ) {
    super(message, statusCode);
  }
}

class AuthFailureError extends ErrorResponse {
  constructor(
    message = reasonPhrases.UNAUTHORIZED,
    statusCode = statusCodes.UNAUTHORIZED
  ) {
    super(message, statusCode);
  }
}

class NotFoundError extends ErrorResponse {
  constructor(
    message = reasonPhrases.NOT_FOUND,
    statusCode = statusCodes.NOT_FOUND
  ) {
    super(message, statusCode);
  }
}

class ForbiddenError extends ErrorResponse {
  constructor(
    message = reasonPhrases.FORBIDDEN,
    statusCode = statusCodes.FORBIDDEN
  ) {
    super(message, statusCode);
  }
}

class RedisConnectionError extends ErrorResponse {
  constructor(
    message = reasonPhrases.INTERNAL_SERVER_ERROR,
    statusCode = statusCodes.INTERNAL_SERVER_ERROR
  ) {
    super(message, statusCode);
  }
}

module.exports = {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError,
};
