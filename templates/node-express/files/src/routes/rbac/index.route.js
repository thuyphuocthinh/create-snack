"use strict";
const express = require("express");
const { asyncHandler } = require("../../auth/checkAuth");
const { authentication } = require("../../auth/authUtils");
const rbacController = require("../../controllers/rbac.controller");
const router = express.Router();

router.use(authentication);

router.post("/create-new-role", asyncHandler(rbacController.createNewRole));
router.post(
  "/create-new-resource",
  asyncHandler(rbacController.createNewResource)
);
router.get("/get-resource-list", asyncHandler(rbacController.getResourceList));
router.get("/get-role-list", asyncHandler(rbacController.getRoleList));

module.exports = router;


// rbac => role based access control
