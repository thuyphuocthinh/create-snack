"use strict";

const express = require("express");
const userController = require("../../controllers/user.controller");
const { asyncHandler } = require("../../auth/checkAuth");
const router = express.Router();

router.post("/new", asyncHandler(userController.newUser));
router.post(
  "/verify-email",
  asyncHandler(userController.checkRegisterEmailToken)
);
module.exports = router;
