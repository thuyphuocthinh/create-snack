"use strict";

const { findById } = require("../services/apiKey.service");

const HEADERS = {
  API_KEY: "x-api-key",
  AUTHORIZATION: "authorization",
};

const checkApiKey = async (req, res, next) => {
  try {
    const key = req.headers[HEADERS.API_KEY]?.toString();
    if (!key) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }
    // check objKey
    const objKey = await findById(key);
    if (!objKey) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }
    req.objKey = objKey;
    return next();
  } catch (error) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }
};

const checkPermissions = (permission) => {
  return (req, res, next) => {
    if (!req.objKey.permissions) {
      return res.status(403).json({
        message: "Permissions denied",
      });
    }
    const validPermission = req.objKey.permissions.includes(permission);
    if (!validPermission) {
      return res.status(403).json({
        message: "Permissions denied",
      });
    }
    return next();
  };
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  checkApiKey,
  checkPermissions,
  asyncHandler
};
