"use strict";
const express = require("express");
const { asyncHandler } = require("../../auth/checkAuth");
const uploadController = require("../../controllers/upload.controller");
const { uploadToDisk, uploadToMemory } = require("../../config/config.multer");
// const { authentication } = require("../../auth/authUtils");
const router = express.Router();

// cloudinary
router.post("/fromUrl", asyncHandler(uploadController.uploadImgFromUrl));
router.post(
  "/fromLocal",
  uploadToDisk.single("file"),
  asyncHandler(uploadController.uploadImgFromLocal)
);
router.post(
  "/multiple/fromLocal",
  uploadToDisk.array("files", 3),
  asyncHandler(uploadController.uploadImagesFromLocal)
);
// aws-s3
router.post(
  "/fromLocal/aws-s3-service-upload",
  uploadToMemory.single("file"),
  asyncHandler(uploadController.uploadImgFromLocalS3)
);

module.exports = router;
