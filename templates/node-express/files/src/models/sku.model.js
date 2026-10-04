"use strict";

const { default: mongoose, Schema, model } = require("mongoose");
const COLLECTION_NAME = "SKUs";
const DOCUMENT_NAME = "SKU";

const skuSchema = new mongoose.Schema(
  {
    sku_id: {
      type: String,
      required: true,
      unique: true,
    },
    // la gi?
    /*
        color = [red, blue, green] = [0, 1, 2]
        size = [S, M, L, XL] = [0, 1, 2, 3]
        => red + S = 0 + 0 = 0 [0, 0]
        => blue + M = 1 + 1 = 2 [1, 1]
        => green + L = 2 + 2 = 4
    */
    sku_tier_index: {
      type: Array,
      default: [],
    },
    sku_default: {
      type: Boolean,
      default: false,
    },
    sku_slug: {
      type: String,
      required: true,
    },
    sku_sort: {
      type: Number,
      default: 0,
    },
    sku_stock: {
      type: Number,
      default: 0,
    },
    spu_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "SPU",
    },
    sku_name: {
      type: String,
      required: true,
    },
    sku_price: {
      type: String,
      required: true,
    },
    isDraft: {
      type: Boolean,
      default: true,
      index: true,
      select: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
      select: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = {
  SKU: model(DOCUMENT_NAME, skuSchema),
};
