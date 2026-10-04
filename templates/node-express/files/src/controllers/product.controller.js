"use strict";

const { SuccessResponse } = require("../core/success.response");
const ProductService = require("../services/product.service.js");
const SPUService = require("../services/spu.service");
const SKUService = require("../services/sku.service");
const { BadRequestError } = require("../core/error.response");
class ProductController {
  /** SPU, SKU */
  /*
    {
      spu_name: "string",
      spu_description: "string",
      spu_images: ["string"],
      spu_category: "string",
      spu_price: 1000,
      spu_shop: "string",
      spu_category: [number],
      spu_attributes: [
        {
          "attribute_id": "string",
          "attribute_values": ["string"]
        }
      ],
      spu_variations: [
        {
          "images": ["string"],
          "name": "string",
          "options": ["string"]
        },
        {
          "images": ["string"],
          "name": "string",
          "options": ["string"]
        }
      ],
      sku_list: [
        {
          "sku_id": "string",
          "sku_name": "string",
          "sku_price": 1000,
          "sku_tier_index": [number, number],
          "sku_shop": "string",
        }
      ]
    }
  */
  createNewSpu = async (req, res, next) => {
    new SuccessResponse({
      message: "Created a new spu successfully",
      metadata: await SPUService.createNewSpu(req.body),
    }).send(res);
  };

  getDetailSpu = async (req, res, next) => {
    const { spu_id } = req.query;
    if (!spu_id) {
      throw BadRequestError("Missing query params");
    }
    new SuccessResponse({
      message: "Get detail spu successfully",
      metadata: await SPUService.getDetailSpu({ spu_id }),
    }).send(res);
  };

  getListSkuBySpuId = async (req, res, next) => {
    const { spu_id } = req.query;
    if (!spu_id) {
      throw BadRequestError("Missing query params");
    }
    new SuccessResponse({
      message: "Get list sku by spu id successfully",
      metadata: await SKUService.getListSkuBySpuId({ spu_id }),
    }).send(res);
  };

  getDetailSku = async (req, res, next) => {
    const { sku_id, spu_id } = req.query;
    if (!sku_id || !spu_id) {
      throw BadRequestError("Missing query params");
    }
    new SuccessResponse({
      message: "Get detail sku successfully",
      metadata: await SKUService.getDetailSku({ sku_id, spu_id }),
    }).send(res);
  };

  /** END SPU, SKU */

  createNewProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Created a new product successfully",
      metadata: await ProductService.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getAllDraftProducts = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await ProductService.findAllDraftProducts({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getAllPulishedProducts = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await ProductService.findAllPublishedProducts({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  publishProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await ProductService.publishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };

  unpublishProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await ProductService.unpublishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };

  searchProductsByUser = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await ProductService.searchProducts({
        keySearch: req.params.keySearch,
      }),
    }).send(res);
  };

  findAllProducts = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await ProductService.findAllProducts(req.query),
    }).send(res);
  };

  findDetailProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await ProductService.findDetailProduct({
        product_id: req.params.id,
      }),
    }).send(res);
  };

  updateProductById = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await ProductService.updateProduct({
        product_type: req.body.product_type,
        product_id: req.params.id,
        bodyUpdate: req.body.bodyUpdate,
      }),
    }).send(res);
  };
}

module.exports = new ProductController();
