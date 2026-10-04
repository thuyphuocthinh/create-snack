"use strict";

const { default: mongoose, Schema, model, Types } = require("mongoose");
const COLLECTION_NAME = "Carts";
const DOCUMENT_NAME = "Cart";

const cartSchema = new mongoose.Schema(
  {
    cart_products: {
      type: Array,
      required: true,
      default: [],
      /*
        [
            {
                product_id,
                shop_id,
                quantity,
                price,
                name
            }
        ]
     */
    },
    cart_state: {
      type: String,
      required: true,
      enum: ["ACTIVE", "COMPLETED", "FAILED", "PENDING"],
      default: "ACTIVE",
    },
    cart_count_product: {
      type: Number,
      default: 0,
    },
    // cart cua user nao
    cart_user_id: {
      type: Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, cartSchema);
