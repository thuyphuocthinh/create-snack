"use strict";

const { BadRequestError } = require("../core/error.response");
const {
  product,
  clothing,
  electronic,
  furniture,
} = require("../models/product.model");
const { insertInventory } = require("../models/repository/inventory.repo");
const {
  findAllDraftProducts,
  publishProductByShop,
  findAllPublishedProducts,
  unpublishProductByShop,
  searchProductsByUser,
  findAllProducts,
  findDetailProduct,
  updateProductById,
} = require("../models/repository/product.repo");
const { removeBadValue, updateNestedObjectParser } = require("../utils");
const NotificationService = require("./notification.service");
const TYPES = {
  Electronics: "Electronics",
  Clothing: "Clothing",
  Furniture: "Furniture",
};
// Define Factory class to create product
class ProductFactory {
  static productRegistry = {}; // key : class

  static registerProductType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef;
  }

  static async createProduct(type, payload) {
    const productType = ProductFactory.productRegistry[type];
    console.log(">>> productType:::", productType);
    if (!productType)
      throw new BadRequestError(`Invalid Product Type::${type}`);
    return new productType(payload).createProduct();
  }

  static async findAllDraftProducts({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true };
    return await findAllDraftProducts({ query, limit, skip });
  }

  static async publishProductByShop({ product_shop, product_id }) {
    return await publishProductByShop({ product_shop, product_id });
  }

  static async findAllPublishedProducts({
    product_shop,
    limit = 50,
    skip = 0,
  }) {
    const query = { product_shop, isPublished: true };
    return await findAllPublishedProducts({ query, limit, skip });
  }

  static async unpublishProductByShop({ product_shop, product_id }) {
    return await unpublishProductByShop({ product_shop, product_id });
  }

  static async searchProducts({ keySearch }) {
    return await searchProductsByUser({ keySearch });
  }

  static async findAllProducts({
    limit = 50,
    sort = "ctime",
    page = 1,
    filter = { isPublished: true },
  }) {
    return await findAllProducts({
      limit,
      sort,
      page,
      filter,
      select: ["product_name", "product_thumb", "product_price"],
    });
  }

  static async findDetailProduct({ product_id }) {
    return await findDetailProduct({ product_id, unSelect: ["__v"] });
  }

  static async updateProduct({ product_type, product_id, bodyUpdate }) {
    const productType = ProductFactory.productRegistry[product_type];
    if (!productType) {
      throw new BadRequestError(`Invalid Product Type::${productType}`);
    }
    console.log(">>> productType:::", productType);
    return new productType(bodyUpdate).updateProduct({
      product_id,
      bodyUpdate,
    });
  }
}

// Define base Product class
class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_quantity,
    product_type,
    product_shop,
    product_attributes,
  }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_quantity = product_quantity;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
  }

  async createProduct(product_id) {
    const newProduct = await product.create({ ...this, _id: product_id });
    if (newProduct) {
      await insertInventory({
        product_id: newProduct._id,
        shop_id: newProduct.product_shop,
        stock: newProduct.product_quantity,
        location: "Danang, Vietnam",
      });
      // noti new product is created here
      // push noti to noti system
      NotificationService.pushNotiToSystem({
        type: "SHOP-001",
        senderId: this.product_attributes,
        receiverId: 1,
        options: {
          product_name: this.product_name,
          shop_name: this.product_shop,
        },
      })
        .then((res) => console.log(res))
        .catch((err) => console.log(err));
      return newProduct;
    }
  }

  async updateProduct({ product_id, bodyUpdate }) {
    return await updateProductById({ product_id, bodyUpdate, model: product });
  }
}

// Define Clothing
class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newClothing) {
      throw new BadRequestError("Create new Clothing error");
    }
    const newProduct = await super.createProduct(newClothing._id);
    if (!newProduct) {
      throw new BadRequestError("Create new Product error");
    }
    return newProduct;
  }

  async updateProduct({ product_id, bodyUpdate }) {
    // 1. Remove undefined, null attributes
    let payload = updateNestedObjectParser(bodyUpdate);
    payload = removeBadValue(payload);
    // 2. Check xem update o cho nao
    if (bodyUpdate.product_attributes) {
      // update child
      await updateProductById({ product_id, payload, model: clothing });
    }
    // update parent
    const updateProduct = await super.updateProduct({ product_id, payload });
    return updateProduct;
  }
}

// Define Electronic
class Electronics extends Product {
  async createProduct() {
    const newElectronics = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newElectronics) {
      throw new BadRequestError("Create new Electronics error");
    }
    const newProduct = await super.createProduct(newElectronics._id);
    if (!newProduct) {
      throw new BadRequestError("Create new Product error");
    }
    return newProduct;
  }
}

// Define Furniture
class Furniture extends Product {
  async createProduct() {
    const newFurniture = await furniture.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newFurniture) {
      throw new BadRequestError("Create new Furniture error");
    }
    const newProduct = await super.createProduct(newFurniture._id);
    if (!newProduct) {
      throw new BadRequestError("Create new Product error");
    }
    return newProduct;
  }
}

// Regiter productType
ProductFactory.registerProductType(TYPES.Clothing, Clothing);
ProductFactory.registerProductType(TYPES.Electronics, Electronics);
ProductFactory.registerProductType(TYPES.Furniture, Furniture);

module.exports = ProductFactory;
