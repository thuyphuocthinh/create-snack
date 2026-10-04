"use strict";
const reasonPhrases = require("../utils/reasonPhrases.js");
const statusCodes = require("../utils/statusCodes.js");

class SuccessResponse {
  constructor({
    message,
    statusCode = statusCodes.OK,
    reasonPhrase = reasonPhrases.OK,
    metadata = {},
  }) {
    this.message = message ? message : reasonPhrase;
    this.statusCode = statusCode;
    this.reasonPhrase = reasonPhrase;
    this.metadata = metadata;
  }

  send(res, headers = {}) {
    return res.status(this.statusCode).json(this);
  }
}

class OK extends SuccessResponse {
  constructor({ message, metadata = {} }) {
    super({ message, metadata });
  }
}

class CREATED extends SuccessResponse {
  constructor({
    message,
    statusCode = statusCodes.CREATED,
    reasonPhrase = reasonPhrases.CREATED,
    metadata = {},
  }) {
    super({ message, reasonPhrase, statusCode, metadata });
  }
}

module.exports = {
  OK,
  CREATED,
  SuccessResponse
};
