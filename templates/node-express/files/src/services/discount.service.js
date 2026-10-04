/**
 * 1. Generate discount code [Admin | Shop]
 * 2. Get all discount codes [User | Shop]
 * 3. Get all products by discount code [User]
 * 4. Get discount amount [User]
 * 5. Delete discount code [Admin | Shop]
 * 6. Cancel discount code [User]
 */

"use strict";

const { Types } = require("mongoose");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const discountModel = require("../models/discount.model");
const {
  convertToObjectId,
  updateNestedObjectParser,
  removeBadValue,
} = require("../utils");
const { findAllProducts } = require("../models/repository/product.repo");
const {
  findAllDiscountCodeUnselect,
  updateDiscountByCode,
  checkDiscountExists,
} = require("../models/repository/discount.repo");

class DiscountService {
  static async createDiscountCode(payload) {
    const {
      code,
      start_date,
      end_date,
      is_active,
      shop_id,
      applied_for,
      min_order_value,
      product_ids = [],
      name,
      description,
      type,
      value,
      max_uses,
      used_count,
      max_uses_per_user,
    } = payload;
    // Kiem tra
    console.log(">>> payload: ", payload);

    if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
      throw new BadRequestError("Discount code has expired");
    }
    if (new Date(start_date) >= new Date(end_date)) {
      throw new BadRequestError("Start_date must be before end_date");
    }
    // Tao discount
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shop_id: convertToObjectId(shop_id),
      })
      .lean();
    if (foundDiscount && foundDiscount.discount_is_active) {
      throw new BadRequestError("Discount code already exists");
    }
    const newDiscount = await discountModel.create({
      discount_name: name,
      discount_code: code,
      discount_description: description,
      discount_type: type,
      discount_value: value,
      discount_min_order_value: min_order_value,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_is_active: is_active,
      discount_applied_for: applied_for,
      discount_max_uses_per_user: max_uses_per_user,
      discount_max_uses: max_uses,
      discount_used_count: used_count,
      discount_product_ids: applied_for === "ALL" ? [] : product_ids,
      discount_shop_id: shop_id,
    });
    return newDiscount;
  }

  static async updateDiscountCode({ code, bodyUpdate }) {
    let body = updateNestedObjectParser(bodyUpdate);
    body = removeBadValue(body);
    return await updateDiscountByCode({
      code,
      body,
    });
  }

  static async getAllDiscountCodeByShop({ limit, page, shop_id }) {
    return findAllDiscountCodeUnselect({
      filter: {
        discount_shop_id: convertToObjectId(shop_id),
        discount_is_active: true,
      },
      limit: limit,
      page: +page,
      model: discountModel,
      unSelect: ["__v"],
    });
  }

  static async getProductsByDiscount({ code, shop_id, user_id, limit, page }) {
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shop_id: convertToObjectId(shop_id),
      })
      .lean();

    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundError("Discount does not exist or has expired");
    }
    // applied_for === "ALL" or "SPECIFIC"
    const { discount_applied_for, discount_product_ids } = foundDiscount;
    let products;
    if (discount_applied_for === "ALL") {
      // get all products
      products = await findAllProducts({
        filter: {
          product_shop: convertToObjectId(shop_id),
          isPublished: true,
        },
        limit,
        sort: "ctime",
        page,
        select: ["product_name", "product_price", "product_thumb"],
      });
    } else if (discount_applied_for === "SPECIFIC") {
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          product_shop: convertToObjectId(shop_id),
          isPublished: true,
        },
        limit,
        sort: "ctime",
        page,
        select: ["product_name", "product_price", "product_thumb"],
      });
    }
    return products;
  }

  /*
    products = [
      {
        productId,
        shopId,
        quantity,
        name,
        price
      }
    ]
  */
  static async getDiscountAmount({ code, userId, shopId, products }) {
    // ham nay dung de tinh so tien giam sau khi ap dung discount cho danh sach san pham
    const foundDisount = await checkDiscountExists({
      model: discountModel,
      filter: {
        discount_code: code,
        discount_shop_id: convertToObjectId(shopId),
      },
    });
    if (!foundDisount) {
      throw new NotFoundError("Discount does not exist");
    }

    const {
      discount_is_active,
      discount_max_uses,
      discount_used_count,
      discount_end_date,
      discount_start_date,
      discount_min_order_value,
      discount_max_uses_per_user,
      discount_users_used,
      discount_type,
      discount_value,
    } = foundDisount;
    if (!discount_is_active) {
      throw new NotFoundError("Discount expired");
    }
    if (!discount_max_uses) {
      throw new NotFoundError("Discount is out");
    }
    if (discount_used_count > discount_max_uses) {
      throw new NotFoundError("Discount is out");
    }
    if (
      new Date() < new Date(discount_start_date) ||
      new Date() > new Date(discount_end_date)
    ) {
      throw new NotFoundError("Discount expired");
    }

    // Neu tong gia tri that don hang < tong don hang toi thieu
    let total_oder = 0;
    if (discount_min_order_value > 0) {
      total_oder = products.reduce((total, product) => {
        return total + product.quantity * product.price;
      }, 0);
      if (total_oder < discount_min_order_value) {
        throw new NotFoundError(
          `Discount requires a min order value of ${discount_min_order_value}`
        );
      }
    }

    // neu user da su dung ma discount, kiem tra so lan da su dung
    if (discount_max_uses_per_user > 0) {
      const userUsed = discount_users_used.find((id) => id === userId);
      if (userUsed) {
        const userUsedCount = discount_users_used.reduce((total, item) => {
          return item === userId ? total + 1 : total;
        }, 0);
        if (userUsedCount >= discount_max_uses_per_user) {
          throw new BadRequestError("User overused discount");
        }
      }
    }

    // kiem tra type cua discount de tinh so tien giam
    const discount_amount =
      discount_type === "FIXED_AMOUNT"
        ? discount_value
        : total_oder * (discount_value / 100);

    return {
      total_oder,
      discount_amount,
      total_price: total_oder - discount_amount,
    };
  }

  static async deleteDiscount({ code, shopId }) {
    // xóa discount => thực tế phải kiểm tra xem discount này có đơn hàng nào đang sử dụng không
    // phải đảm bảo không còn đơn hàng nào sử dụng thì mới xóa
    // xóa => đưa vào một database mới thay vì thêm trường isDeleted (tốn index)
    const deleted = await discountModel.findOneAndDelete({
      discount_code: code,
      discount_shop_id: convertToObjectId(shopId),
    });
    return deleted;
  }

  static async cancelDiscount({ code, shopId, userId }) {
    const foundDiscount = await checkDiscountExists({
      model: discountModel,
      filter: {
        discount_code: code,
        discount_shop_id: convertToObjectId(shopId),
      },
    });

    if (!foundDiscount) {
      throw new NotFoundError("Discount does not exist");
    }

    const { discount_is_active } = foundDiscount;
    if (!discount_is_active) {
      throw new BadRequestError("Discount expired");
    }

    const result = await discountModel.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: userId,
      },
      $inc: {
        discount_used_count: -1,
      },
    });

    return result;
  }
}

module.exports = DiscountService;
