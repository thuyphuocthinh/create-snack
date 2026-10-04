"use strict";

const { default: mongoose, Schema, model } = require("mongoose");
const COLLECTION_NAME = "Inventories";
const DOCUMENT_NAME = "Inventory";

const inventorySchema = new mongoose.Schema(
  {
    inventory_product_id: {
      type: Schema.ObjectId,
      ref: "Product",
    },
    inventory_location: {
      type: String,
      default: "Unknown",
    },
    inventory_stock: {
      type: Number,
      required: true,
    },
    inventory_shop_id: {
      type: Schema.ObjectId,
      ref: "Shop",
    },
    // inventory_reservations => luu lai thong tin cac gio hang da them san pham
    inventory_reservations: {
      type: Array,
      default: [],
    },
    /**
     * cartId,
     * stock,
     * createdAt
     */
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, inventorySchema);
