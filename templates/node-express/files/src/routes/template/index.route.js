"use strict";
const express = require("express");
const { asyncHandler } = require("../../auth/checkAuth");
const { authentication } = require("../../auth/authUtils");
const router = express.Router();
const templateController = require("../../controllers/template.controller");
router.use(authentication);

router.post("/create", asyncHandler(templateController.createTemplate));

module.exports = router;
