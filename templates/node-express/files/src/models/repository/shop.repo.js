"use strict";

const { Shop } = require("../models/shop.model");

const selectStruct = {
  email: 1,
  name: 1,
  status: 1,
  roles: 1,
};

export const findShopById = async ({ shop_id, select = selectStruct }) => {
  return await Shop.findOne({ shop_id: shop_id }).select(select).lean().exec();
};

module.exports = {
  findShopById,
};
