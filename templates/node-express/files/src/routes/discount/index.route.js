"use strict";
const express = require("express");
const { asyncHandler } = require("../../auth/checkAuth");
const { authentication } = require("../../auth/authUtils");
const discountController = require("../../controllers/discount.controller");
const router = express.Router();
router.post(
  "/get-discount-amount",
  asyncHandler(discountController.getDiscountAmount)
);
router.get(
  "/get-products-by-discount/:code/:shopId",
  asyncHandler(discountController.getProductsByDiscount)
);

router.use(authentication);
router.post("/create", asyncHandler(discountController.createDiscount));
router.post("/delete", asyncHandler(discountController.deleteDiscount));
router.patch("/cancel", asyncHandler(discountController.cancelDiscount));
router.get(
  "/get-all-discounts-by-shop",
  asyncHandler(discountController.getAllDiscountCodeByShop)
);
router.patch("/update", asyncHandler(discountController.updateDiscount));

module.exports = router;
