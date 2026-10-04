"use strict";
const express = require("express");
const { asyncHandler } = require("../../auth/checkAuth");
const { authentication } = require("../../auth/authUtils");
const commentController = require("../../controllers/comment.controller");
const router = express.Router();

router.use(authentication);
router.post("/add-new", asyncHandler(commentController.createComment));
router.post("/delete", asyncHandler(commentController.deleteComments));
router.post(
  "/get-list-by-parent-id",
  asyncHandler(commentController.getCommentsByParentId)
);

module.exports = router;
