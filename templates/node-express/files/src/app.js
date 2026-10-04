// 106k + 10k
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const { v4: uuidv4 } = require("uuid");
const logger = require("./logger/mylogger.log.js");
require("dotenv").config();

const app = express();

// init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// init logger - info of request
app.use((req, res, next) => {
  const requestId = req.headers["x-request-id"] || uuidv4();
  req.requestId = requestId;
  logger.info(`Input params :: ${req.method}`, [
    req.path,
    { requestId: req.requestId },
    req.method === "POST" ? req.body : req.query,
  ]);
  next();
});

// init db
require("./database/init.mongodb.level1.js");

// test redis
app.use("/redis", () => {
  const productTest = require("./tests/product.test.js");
  require("./tests/inventory.test.js");
  setTimeout(() => {
    productTest.purchaseProduct("product_id_01", 10);
  }, 1000);
});

// init router
app.use("/", require("./routes/index.route.js"));

// handle error
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  const resMessage = `${statusCode} - ${Date.now()} - Response - ${JSON.stringify(
    error
  )}`;
  // logger of response
  logger.error(`[${statusCode}] - ${error.message}`, [
    req.path,
    { requestId: req.requestId },
    { message: resMessage },
  ]);
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message: error.message || "Internal Server Error",
  });
});

module.exports = app;
// in this file, we have logger for request information and response of error
