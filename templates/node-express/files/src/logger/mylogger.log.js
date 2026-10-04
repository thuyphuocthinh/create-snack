const winston = require("winston");
require("winston-daily-rotate-file");
const { v4: uuidv4 } = require("uuid");
// level: error, warn, info, verbose, debug

class MyLogger {
  constructor() {
    const formatPrint = winston.format.printf(
      ({ level, message, timestamp, context, requestId, metadata }) => {
        return `[${timestamp}] - [${level}] - [${context}] - [${requestId}] - [${JSON.stringify(
          metadata
        )}] - ${message}`;
      }
    );

    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss",
        }),
        formatPrint
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.DailyRotateFile({
          filename: "logs/application-%DATE%.info.log",
          dirname: "./src/logs",
          datePattern: "YYYY-MM-DD",
          zippedArchive: true, // true: compress the file after maxSize before deleting (backup)
          maxSize: "20m", // 20mb => create new file if over 20mb
          maxFiles: "14d", // all logs in the last 14 days will be compressed and deleted
          format: winston.format.combine(
            winston.format.timestamp({
              format: "YYYY-MM-DD HH:mm:ss",
            }),
            formatPrint
          ),
          level: "info",
        }),
        new winston.transports.DailyRotateFile({
          filename: "logs/application-%DATE%.error.log",
          dirname: "./src/logs",
          datePattern: "YYYY-MM-DD",
          zippedArchive: true, // true: compress the file after maxSize before deleting (backup)
          maxSize: "20m", // 20mb => create new file if over 20mb
          maxFiles: "14d", // all logs in the last 14 days will be compressed and deleted
          format: winston.format.combine(
            winston.format.timestamp({
              format: "YYYY-MM-DD HH:mm:ss",
            }),
            formatPrint
          ),
          level: "error",
        }),
      ],
    });
  }

  commonParams(params) {
    let context, req, metadata;
    if (!Array.isArray(params)) {
      context = params.context;
      req = params.req;
      metadata = params.metadata;
    } else {
      [context, req, metadata] = params;
    }
    const requestId = req?.id || req?.headers["x-request-id"] || uuidv4();
    return { context, requestId, metadata };
  }
  // log, error, debug, warn override this.logger => by level
  log(message, params) {
    const paramsLog = this.commonParams(params);
    const logObject = Object.assign(
      {
        message,
      },
      paramsLog
    );

    this.logger.info(logObject);
  }

  error(message, params) {
    const paramsLog = this.commonParams(params);
    const logObject = Object.assign(
      {
        message,
      },
      paramsLog
    );
    this.logger.error(logObject);
  }

  debug(message, params) {
    const paramsLog = this.commonParams(params);
    const logObject = Object.assign(
      {
        message,
      },
      paramsLog
    );
    this.logger.debug(logObject);
  }

  warn(message, params) {
    const paramsLog = this.commonParams(params);
    const logObject = Object.assign(
      {
        message,
      },
      paramsLog
    );
    this.logger.warn(logObject);
  }
}

module.exports = new MyLogger();
// traceID: x-request-id
/*
  1. Level => info, error, debug, warn
    1.1 error: serious problems => hot fix
    1.2 warn: potential problems => fix later (not urgent)
    1.3 info: normal but important information for improving performance
    1.4 debug: detailed information for developers
  2. Context
  3. RequestId => x-request-id
  4. Metadata => result (response)
*/