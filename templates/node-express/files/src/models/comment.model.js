"use strict";

const { default: mongoose, Schema, model, Types } = require("mongoose");
const COLLECTION_NAME = "Comments";
const DOCUMENT_NAME = "Comment";

const cartSchema = new mongoose.Schema(
  {
    comment_productId: {
      type: Types.ObjectId,
      ref: "Product",
    },
    comment_userId: {
      type: Types.ObjectId,
    },
    comment_content: {
      type: String,
      default: "comment text",
    },
    comment_left: {
      type: Number,
      default: 0,
    },
    comment_right: {
      type: Number,
      default: 0,
    },
    comment_parentId: {
      type: Types.ObjectId,
      ref: DOCUMENT_NAME,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, cartSchema);
