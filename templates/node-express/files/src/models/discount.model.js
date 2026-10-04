"use strict";

const { default: mongoose, Schema, model, Types } = require("mongoose");
const COLLECTION_NAME = "Discounts";
const DOCUMENT_NAME = "Discount";

const discountSchema = new mongoose.Schema(
  {
    discount_name: {
      type: String,
      required: true,
    },
    discount_description: {
      type: String,
      required: true,
    },
    discount_type: {
      type: String,
      default: "FIXED_AMOUNT",
      required: true,
      // percentage
      // fixed_amount
    },
    discount_value: {
      type: Number,
      required: true,
      // ~ discount_type
    },
    discount_code: {
      type: String,
      required: true,
      unique: true,
    },
    discount_start_date: {
      type: Date,
      required: true,
    },
    discount_end_date: {
      type: Date,
      required: true,
    },
    discount_max_uses: {
      type: Number,
      required: true,
      // so luong ma discount nay co the duoc ap dung
    },
    discount_used_count: {
      type: Number,
      required: true,
      // so luong discount da su dung
    },
    discount_max_uses_per_user: {
      type: Number,
      required: true,
      default: 1,
      // Moi user duoc su dung discount nay toi da bao nhieu lan
    },
    discount_users_used: {
      // users nao da su dung discount nay
      type: Array,
      default: [],
    },
    discount_min_order_value: {
      type: Number,
      required: true,
    },
    discount_shop_id: {
      type: Types.ObjectId,
      ref: "Shop",
    },
    discount_is_active: {
      type: Boolean,
      default: true,
    },
    discount_applied_for: {
      type: String,
      required: true,
      enum: ["ALL", "SPECIFIC"],
    },
    discount_product_ids: {
      // cac san pham duoc ap dung ma discount nay
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, discountSchema);
