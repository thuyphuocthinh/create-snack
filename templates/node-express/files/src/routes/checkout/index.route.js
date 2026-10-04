"use strict";
const express = require("express");
const { asyncHandler } = require("../../auth/checkAuth");
const { authentication } = require("../../auth/authUtils");
const checkoutController = require("../../controllers/checkout.controller");
const router = express.Router();

router.use(authentication);
router.post("/review", asyncHandler(checkoutController.checkoutReview));
module.exports = router;
