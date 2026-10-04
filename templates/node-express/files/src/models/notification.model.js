"use strict";

const { default: mongoose, Schema, model, Types } = require("mongoose");
const COLLECTION_NAME = "Notifications";
const DOCUMENT_NAME = "Notification";

/**
 * ORDER-001: SUCCESS
 * ORDER-002: FAILED
 * ORDER-003: DELIVERED
 * PROMOTION-001: NEW PROMOTION
 * SHOP-001: NEW PRODUCT
 */

const notificationSchema = new mongoose.Schema(
  {
    noti_type: {
      type: String,
      enum: [
        "ORDER-001",
        "ORDER-002",
        "ORDER-003",
        "PROMOTION-001",
        "SHOP-001",
      ],
      required: true,
    },
    noti_senderId: {
      type: Types.ObjectId,
      required: true,
      ref: "Shop",
    },
    noti_receiverId: {
      type: Number,
      required: true,
    },
    noti_content: {
      type: String,
      default: "",
    },
    noti_options: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, notificationSchema);
