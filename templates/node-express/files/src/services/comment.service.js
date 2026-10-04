"use strict";

const { NotFoundError } = require("../core/error.response");
const commentModel = require("../models/comment.model");
const { getProductById } = require("../models/repository/product.repo");
const { convertToObjectId } = require("../utils");

/*
    + add comment [User, Shop]
    + get a list of comments [User, Shop]
    + delete a comment [User, Shop, Admin]
*/
class CommentService {
  static async createComment({
    productId,
    userId,
    content,
    parentCommentId = null,
  }) {
    const comment = new commentModel({
      comment_productId: productId,
      comment_userId: userId,
      comment_content: content,
      comment_parentId: parentCommentId,
    });

    let rightValue;
    if (parentCommentId) {
      // reply comment
      const parentComment = await commentModel.findById(parentCommentId);
      if (!parentComment) {
        throw new NotFoundError("Parent comment not found");
      }
      rightValue = parentComment.comment_right;

      // updateMany comments
      await Promise.all([
        commentModel.updateMany(
          {
            comment_productId: convertToObjectId(productId),
            comment_right: { $gte: rightValue },
          },
          {
            $inc: {
              comment_right: 2,
            },
          }
        ),
        commentModel.updateMany(
          {
            comment_productId: convertToObjectId(productId),
            comment_left: { $gt: rightValue },
          },
          {
            $inc: {
              comment_left: 2,
            },
          }
        ),
      ]);
    } else {
      // insert a new comment
      const maxRightValue = await commentModel.findOne(
        {
          comment_productId: convertToObjectId(productId),
        },
        "comment_right",
        { sort: { comment_right: -1 } }
      );
      if (maxRightValue) {
        rightValue = maxRightValue.comment_right + 1;
      } else {
        rightValue = 1;
      }
    }

    // insert comment
    comment.comment_left = rightValue;
    comment.comment_right = rightValue + 1;

    await comment.save();
    return comment;
  }

  static async getCommentsByParentId({
    productId,
    parentCommentId = null,
    limit = 50,
    offset = 0,
  }) {
    let comments;
    if (parentCommentId) {
      const parent = await commentModel.findById(parentCommentId);
      if (!parent) {
        throw new NotFoundError("Not found comment for product");
      }
      comments = await commentModel
        .find({
          comment_parentId: convertToObjectId(parentCommentId),
          comment_productId: convertToObjectId(productId),
          comment_left: { $gt: parent.comment_left },
          comment_right: { $lt: parent.comment_right },
        })
        .select({
          comment_left: 1,
          comment_right: 1,
          comment_content: 1,
          comment_userId: 1,
          comment_parentId: 1,
        })
        .skip(offset)
        .limit(limit)
        .sort({ createdAt: 1 });
    } else {
      comments = await commentModel
        .find({
          comment_parentId: parentCommentId,
          comment_productId: convertToObjectId(productId),
        })
        .select({
          comment_left: 1,
          comment_right: 1,
          comment_content: 1,
          comment_userId: 1,
          comment_parentId: 1,
        })
        .skip(offset)
        .limit(limit)
        .sort({ createdAt: 1 });
    }
    return comments;
  }

  static async deleteComment({ commentId, productId }) {
    // check product exists in the db
    const foundProduct = await getProductById({ productId });
    if (!foundProduct) {
      throw new NotFoundError("Product not found");
    }
    // 1. Xac dinh left va right cua commentId
    const comment = await commentModel.findById(commentId);
    if (!comment) {
      throw new NotFoundError("Comment not found");
    }
    const left = comment.comment_left;
    const right = comment.comment_right;
    // 2. Tinh width = right most - left most + 1
    const width = right - left + 1;
    // 3. Xoa tat cac commentId con (bao gom ca chinh no)
    await commentModel.deleteMany({
      comment_productId: convertToObjectId(productId),
      comment_left: { $gte: left, $lte: right },
    });
    // 4. Cap nhat left, right cho cac node con lai trong cay
    // Cap nhat right_value cua cac node to tien cua node bi xoa
    // Cap nhat right, left cuar cac node nam ben phai cua cay node bi xoa
    await Promise.all([
      commentModel.updateMany(
        {
          comment_productId: convertToObjectId(productId),
          comment_right: { $gt: right },
        },
        {
          $inc: {
            comment_right: -width,
          },
        }
      ),
      commentModel.updateMany(
        {
          comment_productId: convertToObjectId(productId),
          comment_left: { $gt: right },
        },
        {
          $inc: {
            comment_left: -width,
          },
        }
      ),
    ]);
    return true;
  }
}

module.exports = CommentService;
