"use strict";

const { SuccessResponse } = require("../core/success.response");
const CommentService = require("../services/comment.service");

class CommentController {
  async createComment(req, res, next) {
    new SuccessResponse({
      message: "Success",
      metadata: await CommentService.createComment(req.body),
    }).send(res);
  }

  async getCommentsByParentId(req, res, next) {
    new SuccessResponse({
      message: "Success",
      metadata: await CommentService.getCommentsByParentId(req.body),
    }).send(res);
  }

  async deleteComments(req, res, next) {
    new SuccessResponse({
      message: "Success",
      metadata: await CommentService.deleteComment(req.body),
    }).send(res);
  }
}

module.exports = new CommentController();
