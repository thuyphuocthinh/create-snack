"use strict";

const {
  s3,
  PutObjectCommand,
  GetObjectCommand,
} = require("../config/config.aws-s3");
const { BadRequestError } = require("../core/error.response");
// const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { getSignedUrl } = require("@aws-sdk/cloudfront-signer");
const cloudfrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN;

class UploadAwsService {
  static async uploadImageFromLocalS3({ file }) {
    try {
      if (!file) {
        throw new BadRequestError("No file provided");
      }
      const imageName = `${Date.now()}-${file.originalname}`;
      // put to s3 first
      const commandForPut = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: imageName,
        Body: file.buffer,
        ContentType: "image/jpeg",
      });
      const result = await s3.send(commandForPut);

      // s3
      // using getSignedUrl to publish the url to the community
      // const commandForRead = new GetObjectCommand({
      //   Bucket: process.env.AWS_BUCKET_NAME,
      //   Key: imageName,
      // });

      // cloudfront signer
      const signedUrl = await getSignedUrl({
        url: `${cloudfrontDomain}/${imageName}`,
        dateLessThan: new Date(Date.now() + 1000 * 60),
        keyPairId: process.env.AWS_CLOUDFRONT_PUBLIC_KEY_ID,
        privateKey: process.env.AWS_CLOUDFRONT_PRIVATE_KEY,
      });

      return {
        url: signedUrl,
        result,
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestError(error.message);
    }
  }
}

module.exports = UploadAwsService;
