"use strict";
const express = require("express");
const productController = require("../../controllers/product.controller");
const { asyncHandler } = require("../../auth/checkAuth");
const { authentication } = require("../../auth/authUtils");
const router = express.Router();

router.get(
  "/search/:keySearch",
  asyncHandler(productController.searchProductsByUser)
);
router.get("/all", asyncHandler(productController.findAllProducts));
router.get("/detail/:id", asyncHandler(productController.findDetailProduct));
router.get("/sku", asyncHandler(productController.getDetailSku));
router.get(
  "/sku/listBySpuId",
  asyncHandler(productController.getListSkuBySpuId)
);

// => /sku?sku_id=123&spu_id=123 => for example

// authentication
router.use(authentication);
// authentication

router.get("/spu", asyncHandler(productController.getDetailSpu));
router.post("/spu/create", asyncHandler(productController.createNewSpu));
router.post("/create", asyncHandler(productController.createNewProduct));
router.post("/publish/:id", asyncHandler(productController.publishProduct));
router.post("/unpublish/:id", asyncHandler(productController.unpublishProduct));
router.get("/drafts/all", asyncHandler(productController.getAllDraftProducts));
router.get(
  "/published/all",
  asyncHandler(productController.getAllPulishedProducts)
);
router.patch("/update/:id", asyncHandler(productController.updateProductById));

module.exports = router;
