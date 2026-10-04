"use strict";

const cloudinary = require("../config/config.cloudinary");

class UploadService {
  static async uploadImageFromUrl({ url }) {
    try {
      // Implement logic to upload image from URL
      const urlImage = url;
      // Return the uploaded file's path
      const folderName = "products/upload";
      const fileName = "product_image.jpg";
      const result = await cloudinary.uploader.upload(urlImage, {
        folder: folderName,
        public_id: fileName,
        use_filename: true,
        overwrite: true,
      });
      return {
        url: result.secure_url,
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestError(error.message);
    }
  }

  static async uploadImageFromLocal({ path, folderName = "products/upload" }) {
    try {
      // Return the uploaded file's path
      console.log("running upload");
      const fileName = "product_image";
      const result = await cloudinary.uploader.upload(path, {
        folder: folderName,
        public_id: fileName,
        use_filename: true,
        overwrite: true,
      });
      return {
        url: result.secure_url,
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestError(error.message);
    }
  }

  static async uploadImagesFromLocal({
    files,
    folderName = "products/upload",
  }) {
    try {
      // Return the uploaded file's path
      if (!files.length) return;
      const uploaded_urls = [];
      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: folderName,
          use_filename: true,
          overwrite: true,
        });
        uploaded_urls.push(result.secure_url);
      }
      return {
        uploaded_urls,
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestError(error.message);
    }
  }
}

module.exports = UploadService;
