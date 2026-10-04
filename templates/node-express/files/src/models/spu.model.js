"use strict";

const { default: mongoose, Schema, model } = require("mongoose");
const COLLECTION_NAME = "SPUs";
const DOCUMENT_NAME = "SPU";

const spuSchema = new mongoose.Schema(
  {
    spu_id: {
      type: String,
      required: true,
      unique: true,
    },
    spu_name: {
      type: String,
      required: true,
    },
    spu_thumb: {
      type: String,
      required: true,
    },
    spu_description: {
      type: String,
      required: true,
    },
    spu_slug: {
      type: String,
      slug: "spu_name",
    },
    spu_price: {
      type: Number,
      required: true,
    },
    spu_quantity: {
      type: Number,
      required: true,
    },
    spu_category: {
      type: Array,
      default: [],
    },
    spu_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
    spu_attributes: {
      type: Schema.Types.Mixed,
      required: true,
    },
    spu_ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    spu_variations: {
      type: Array,
      default: [],
    },
    /**
     * variation: [
     *    {
     *        images: [],
     *        name: "color",
     *        options: ["red", "blue", "green"]
     *    },
     *    {
     *        name: "size",
     *        options: ["S", "M", "L", "XL"]
     *        images: [],
     *    }
     * ]
     */
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
  SPU: model(DOCUMENT_NAME, spuSchema),
};
