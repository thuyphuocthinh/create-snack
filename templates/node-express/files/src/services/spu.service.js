"use strict";

const { SPU } = require("../models/spu.model");
const {
  NotFoundError,
  ConflictRequestError,
} = require("../core/error.response");
const { findShopById } = require("../models/repository/shop.repo");
const { findSpuById } = require("../models/repository/spu.repo");
const { randomSpuId } = require("../utils");
const SKUService = require("./sku.service");
const _ = require("lodash");
class SPUService {
  static createNewSpu = async ({
    spu_name,
    spu_slug,
    spu_description,
    spu_images,
    spu_category,
    spu_price,
    spu_shop,
    spu_attributes,
    spu_ratingsAverage,
    spu_variations,
    spu_quantity,
    sku_list = [],
  }) => {
    try {
      // check if shop exists
      const foundShop = await findShopById({ shop_id: spu_shop });
      if (!foundShop) {
        throw NotFoundError("Shop not found");
      }
      // check if spu_id is already exists
      const foundSpu = await findSpuById({ spu_id });
      if (foundSpu) {
        throw ConflictRequestError("Spu already exists");
      }

      // create new spu
      const newSpu = await SPU.create({
        spu_id: randomSpuId(),
        spu_name,
        spu_slug,
        spu_description,
        spu_images,
        spu_category,
        spu_price,
        spu_shop,
        spu_attributes,
        spu_ratingsAverage,
        spu_variations,
        spu_quantity,
      });

      // if sku_list is not empty, create skus list
      if (newSpu && sku_list.length > 0) {
        // 3. create skus list
        await SKUService.createNewSku({
          spu_id: newSpu.spu_id,
          sku_list,
        });
      }

      // 4. sync data via elasticsearch (search service)

      // return newSpu
      return newSpu;
    } catch (error) {
      throw new Error(error);
    }
  };

  static getDetailSpu = async ({ spu_id }) => {
    const foundSpu = await findSpuById({ spu_id, isPublished: true });
    if (!foundSpu) {
      throw NotFoundError("Spu not found");
    }
    const foundSkuList = await SKUService.getListSkuBySpuId({ spu_id });
    return {
      spu_info: _.omit(foundSpu, ["__v", "updatedAt"]),
      sku_list: foundSkuList.map((sku) =>
        _.omit(sku, ["__v", "updatedAt", "createdAt", "isDeleted"])
      ),
    };
  };
}

module.exports = SPUService;
