"use strict";
const express = require("express");
const accessController = require("../../controllers/access.controller");
const { asyncHandler } = require("../../auth/checkAuth");
const { authenticationV2, authentication } = require("../../auth/authUtils");
const router = express.Router();

router.post("/shop/signup", asyncHandler(accessController.signUp));
router.post("/shop/login", asyncHandler(accessController.login));

router.post(
  "/shop/logout",
  authentication,
  asyncHandler(accessController.logout)
);
router.post(
  "/shop/refresh-token",
  authenticationV2,
  asyncHandler(accessController.refreshToken)
);
module.exports = router;
