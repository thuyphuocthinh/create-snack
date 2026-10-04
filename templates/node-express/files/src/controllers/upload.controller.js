"use strict";

const { BadRequestError } = require("../core/error.response");
const { SuccessResponse } = require("../core/success.response");
const UploadAwsService = require("../services/upload.s3.service");
const UploadService = require("../services/upload.service");

class UploadController {
  async uploadImgFromUrl(req, res, next) {
    new SuccessResponse({
      message: "Success",
      metadata: await UploadService.uploadImageFromUrl(req.body),
    }).send(res);
  }

  async uploadImgFromLocal(req, res, next) {
    const { file } = req;
    if (!file) {
      throw new BadRequestError("Error uploading image from local");
    }
    new SuccessResponse({
      message: "Success",
      metadata: await UploadService.uploadImageFromLocal({
        path: file.path,
      }),
    }).send(res);
  }

  async uploadImagesFromLocal(req, res, next) {
    const { files } = req;
    if (!files) {
      throw new BadRequestError("Error uploading image from local");
    }
    new SuccessResponse({
      message: "Success",
      metadata: await UploadService.uploadImagesFromLocal({
        files,
      }),
    }).send(res);
  }

  async uploadImgFromLocalS3(req, res, next) {
    const { file } = req;
    if (!file) {
      throw new BadRequestError("Error uploading image from local");
    }
    new SuccessResponse({
      message: "Success",
      metadata: await UploadAwsService.uploadImageFromLocalS3({
        file,
      }),
    }).send(res);
  }
}

module.exports = new UploadController();
