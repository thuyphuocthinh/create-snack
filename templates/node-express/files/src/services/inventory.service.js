"use strict";

const { NotFoundError } = require("../core/error.response");
const inventoryModel = require("../models/inventory.model");
const { getProductById } = require("../models/repository/product.repo");

class InventoryService {
  static async addStockToInventory({
    stock,
    productId,
    shopId,
    location = "14 Doan Uan, Danang city",
  }) {
    const product = await getProductById({ productId });
    if (!product) {
      throw new NotFoundError("Product does not exist");
    }
    const query = {
      inventory_shop_id: shopId,
      inventory_product_id: productId,
    };
    const updateSet = {
      $inc: {
        inventory_stock: +stock,
      },
      $set: {
        inventory_location: location,
      },
    };
    const options = { upsert: true, new: true };
    return await inventoryModel.findOneAndUpdate(query, updateSet, options);
  }
}

module.exports = InventoryService;
