"use strict";

const multer = require("multer");

const uploadToMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const uploadToDisk = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./src/temp/");
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = {
  uploadToMemory,
  uploadToDisk,
};
