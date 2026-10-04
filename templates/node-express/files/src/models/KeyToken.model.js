"use strict";

const { default: mongoose, Types, model } = require("mongoose");
const COLLECTION_NAME = "KeyTokens";
const DOCUMENT_NAME = "KeyToken";

const keyTokenSchema = new mongoose.Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    publicKey: {
      type: String,
      required: true,
    },
    privateKey: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    refreshTokenUsed: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, keyTokenSchema);
