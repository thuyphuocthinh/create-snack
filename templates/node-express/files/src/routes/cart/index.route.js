"use strict";
const express = require("express");
const { asyncHandler } = require("../../auth/checkAuth");
const { authentication } = require("../../auth/authUtils");
const cartController = require("../../controllers/cart.controller");
const router = express.Router();

router.use(authentication);
router.get(
  "/get-list-products/:id",
  asyncHandler(cartController.getListProductsFromCart)
);
router.post("/add-to-cart", asyncHandler(cartController.addToCart));
router.patch("/update-quantity", asyncHandler(cartController.updateCart));
router.post(
  "/remove-item-from-cart",
  asyncHandler(cartController.removeItemFromCart)
);

module.exports = router;
