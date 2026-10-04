"use strict";

const { SKU } = require("../models/sku.model");
const { randomSpuId } = require("../utils");

class SKUService {
  static createNewSku = async ({ spu_id, sku_list }) => {
    try {
      const convertSkuList = sku_list.map((sku) => ({
        ...sku,
        spu_id,
        sku_id: `${spu_id}_${randomSpuId()}`,
      }));

      const newSkuList = await SKU.insertMany(convertSkuList);

      return newSkuList;
    } catch (error) {
      throw new Error(error);
    }
  };

  static getDetailSku = async ({ sku_id, spu_id }) => {
    try {
      // read cache
      // cache miss
      const foundSku = await SKU.findOne({ sku_id, spu_id }).lean().exec();
      if (foundSku) {
        // set cache here
      }
      return foundSku;
    } catch (error) {
      throw new Error(error);
    }
  };

  static getListSkuBySpuId = async ({ spu_id }) => {
    try {
      // read cache
      // cache miss
      const foundSkuList = await SKU.find({ spu_id }).lean().exec();
      if (foundSkuList) {
        // set cache here
      }
      return foundSkuList;
    } catch (error) {
      throw new Error(error);
    }
  };
}

module.exports = SKUService;
