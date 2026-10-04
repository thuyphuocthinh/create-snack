"use strict";

const { convertToObjectId } = require("../../utils");
const inventoryModel = require("../inventory.model");

const insertInventory = async ({
  product_id,
  shop_id,
  stock,
  location = "Unknown",
}) => {
  return await inventoryModel.create({
    inventory_product_id: product_id,
    inventory_shop_id: shop_id,
    inventory_location: location,
    inventory_stock: stock,
  });
};

const reservationInventory = async ({ productId, quantity, cartId }) => {
  const query = {
    inventory_product_id: convertToObjectId(productId),
    inventory_stock: {
      $gte: quantity,
    },
  };
  const updateSet = {
    $inc: {
      inventory_stock: -quantity,
    },
    $push: {
      inventory_reservations: {
        cartId,
        quantity,
        createdAt: new Date(),
      },
    },
  };
  return await inventoryModel.updateOne(query, updateSet);
};

module.exports = {
  insertInventory,
  reservationInventory,
};
