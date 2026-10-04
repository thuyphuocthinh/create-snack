"use strict";

const { default: mongoose, Schema, model, Types } = require("mongoose");
const COLLECTION_NAME = "Orders";
const DOCUMENT_NAME = "Order";

const orderSchema = new mongoose.Schema(
  {
    order_user_id: {
      type: Types.ObjectId,
      required: true,
    },
    order_checkout: {
      type: Object,
      default: {},
      /*
        order_checkout = {
            total_price,
            total_apply_discount,
            total_discount,
            fee_ship
        }
      */
    },
    order_shipping: {
      type: Object,
      default: {},
      /*
        order_shipping = {
            street,
            city,
            state,
            country
        }
      */
    },
    order_payment: {
      type: Object,
      default: {},
    },
    order_products: {
      type: Array,
      required: true,
    },
    order_tracking_number: {
      type: String,
      default: "#DH0129112024", // example
    },
    order_status: {
      type: String,
      enum: [
        "PENDING",
        "PROCESSING",
        "CONFIRMED",
        "SHIPPING",
        "DELIVERED",
        "CANCEL",
      ],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, orderSchema);
