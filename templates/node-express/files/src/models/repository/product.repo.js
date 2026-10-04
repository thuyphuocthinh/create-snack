"use strict";

const { Types } = require("mongoose");
const { product } = require("../product.model.js");
const {
  getSelectData,
  unSelectData,
  convertToObjectId,
} = require("../../utils/index.js");

const findAllDraftProducts = async ({ query, limit, skip }) => {
  return await queryListProducts({ query, limit, skip });
};

const findAllPublishedProducts = async ({ query, limit, skip }) => {
  return await queryListProducts({ query, limit, skip });
};

const publishProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });
  if (!foundShop) return null;
  foundShop.isDraft = false;
  foundShop.isPublished = true;
  const { modifiedCount } = await foundShop.updateOne(foundShop);
  return modifiedCount;
};

const queryListProducts = async ({ query, limit, skip }) => {
  return await product
    .find(query)
    .populate("product_shop", "name email")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

const unpublishProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });
  if (!foundShop) return null;
  foundShop.isDraft = true;
  foundShop.isPublished = false;
  const { modifiedCount } = await foundShop.updateOne(foundShop);
  return modifiedCount;
};

const searchProductsByUser = async ({ keySearch }) => {
  const regexSearch = new RegExp(keySearch);
  const results = await product
    .find(
      {
        $text: { $search: regexSearch },
        isPublished: true,
      },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .lean();
  return results;
};

const findAllProducts = async ({
  limit = 50,
  sort,
  page = 1,
  filter,
  select,
}) => {
  const skip = (page - 1) * limit;
  // page 0 - skip 0
  // page 1 - skip 50
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const products = await product
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();
  return products;
};

const findDetailProduct = async ({ product_id, unSelect }) => {
  return await product
    .findById(product_id)
    .select(unSelectData(unSelect))
    .lean();
};

const updateProductById = async ({
  product_id,
  bodyUpdate,
  model,
  isNew = true,
}) => {
  return await model.findByIdAndUpdate(product_id, bodyUpdate, {
    new: isNew,
  });
};

const getProductById = async ({ productId }) => {
  return await product
    .findOne({
      _id: convertToObjectId(productId),
      isPublished: true,
    })
    .lean();
};

const checkProductServer = async (products) => {
  return await Promise.all(
    products.map(async (product) => {
      const foundProduct = await getProductById({
        productId: product.productId,
      });
      if (foundProduct) {
        return {
          price: foundProduct.product_price,
          quantity: product.quantity,
          productId: product.productId,
        };
      }
    })
  );
};

module.exports = {
  findAllDraftProducts,
  publishProductByShop,
  findAllPublishedProducts,
  unpublishProductByShop,
  searchProductsByUser,
  findAllProducts,
  findDetailProduct,
  updateProductById,
  getProductById,
  checkProductServer
};
