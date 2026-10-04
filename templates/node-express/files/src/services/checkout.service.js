"use strict";

const { NotFoundError, BadRequestError } = require("../core/error.response");
const orderModel = require("../models/order.model");
const { findCartById } = require("../models/repository/cart.repo");
const { checkProductServer } = require("../models/repository/product.repo");
const { removeAllProductsFromCart } = require("./cart.service");
const { getDiscountAmount } = require("./discount.service");
const { acquireLock, releaseLock } = require("./redis.service");

class CheckoutService {
  /*
    {
        cartId,
        userId,
        shop_order_ids: [
            {
                shopId,
                shop_discount: [],
                item_products: [
                    {
                        price,
                        quantity,
                        productId
                    }
                ]
            },
            {
                shopId,
                shop_discount: [
                    {
                        shopId,
                        discountId,
                        discountCode
                    }
                ],
                item_products: [
                    {
                        price,
                        quantity,
                        productId
                    }
                ]
            }
        ]
    }
  */
  static async checkoutReview({ cartId, userId, shop_order_ids }) {
    // Check cartId ton tai hay khong
    const foundCart = await findCartById(cartId);
    if (!foundCart) {
      throw new NotFoundError("Cart does not exist");
    }

    // tinh toan checkout_order
    const checkout_order = {
      total_price: 0,
      total_discount: 0,
      fee_ship: 0,
      total_paid: 0,
    };

    const shop_order_ids_new = [];

    // Tinh tong tien total_price
    // Moi item trong shop_order_ids chua cac san pham cua cung 1 shop
    for (let i = 0; i < shop_order_ids.length; i++) {
      const {
        shopId,
        shop_discounts = [],
        item_products = [],
      } = shop_order_ids[i];
      // check tung san pham trong order cua tung shop co ton tai hay khong
      const checkProduct = await checkProductServer(item_products);
      checkProduct.forEach((product) => {
        if (!product) throw new BadRequestError("Order Wrong");
      });
      // tinh tong tien don hang ban dau cua tung shop
      const checkoutPrice = checkProduct.reduce((total, product) => {
        return total + product.quantity * product.price;
      }, 0);
      checkout_order.total_price += checkoutPrice;
      const itemCheckout = {
        shopId,
        shop_discounts,
        priceBeforeDiscount: checkoutPrice,
        priceApplyDiscount: checkoutPrice,
        item_products: checkProduct,
      };
      // check su hop le cua shop_discounts
      if (shop_discounts.length > 0) {
        for (const discount of shop_discounts) {
          const { discount_amount } = await getDiscountAmount({
            code: discount.code,
            userId,
            shopId,
            products: checkProduct,
          });
          if (discount_amount > 0) {
            checkout_order.total_discount += discount_amount;
            itemCheckout.priceApplyDiscount = checkoutPrice - discount_amount;
          }
        }
      }

      // tong thanh toan cuoi cung cua tung shop
      checkout_order.total_paid += itemCheckout.priceApplyDiscount;
      shop_order_ids_new.push(itemCheckout);
    }

    // tong thanh toan cuoi cung (tong tien - tong discount + tong fee ship)
    checkout_order.total_paid += checkout_order.fee_ship;
    return {
      shop_order_ids,
      shop_order_ids_new,
      checkout_order,
    };
  }

  // ~ place_order
  static async placeOrderByUser({
    shop_order_ids,
    cartId,
    userId,
    user_address = {},
    user_payment = {},
  }) {
    // review again
    const { shop_order_ids_new, checkout_order } = await this.checkoutReview({
      cartId,
      userId,
      shop_order_ids,
    });
    // check lai mot lan nua xem san pham co vuot ton kho hay khong
    // get new array products (dung flatMap)
    const products = shop_order_ids_new.flatMap((order) => order.item_products);
    const acquireProducts = [];
    for (const product of products) {
      const { productId, quantity } = product;
      // su dung optimistic, pessimitic => kiem tra ton kho qua ban
      const keyLock = await acquireLock(productId, quantity, cartId);
      acquireProducts.push(keyLock ? true : false);
      if (keyLock) {
        await releaseLock(keyLock);
      }
    }

    // check if co mot san pham het hang trong kho
    if (acquireProducts.includes(false)) {
      throw new BadRequestError(
        "Mot so san pham da duoc cap nhat, vui long quay lai gio hang"
      );
    }

    // Neu thanh cong het => tao mot new order
    const newOrder = new orderModel({
      order_user_id: userId,
      order_checkout: checkout_order,
      order_products: shop_order_ids_new,
      order_payment: {},
      order_shipping: {
        city: "Danang",
        country: "Vietnam",
        state: "Danang",
        street: "14 Doan Uan",
      },
    });
    await newOrder.save();

    // Neu tao order thanh cong => remove product trong cart
    await removeAllProductsFromCart({ cartId, userId });

    return newOrder;
  }

  // User lay many order da dat
  static async getOrdersByUser({}) {}

  // User lay one order da dat
  static async getOrderByUser({}) {}

  // User cancel order
  static async cancelOrderByUser({}) {}

  // Cap nhat order
  // Luu y: Cap nhat status van chuyen la do he thong + 3rd-party chu khong phai do shop
  static async updateOrderByShop({}) {}
}

module.exports = CheckoutService;


/*
  Luồng đi từ lúc user click vào xem chi tiết giỏ hàng
  1. Xem chi tiết giỏ hàng => lúc này user có thể update quantity, xóa product...
  2. Chuyển qua trang checkout
  - Khi user chuyển qua trang checkout, FE + BE không cho phép cập nhật danh sách sản phẩm nữa
  - User có quyền điền thông tin vận chuyển, chọn hình thức thanh toán, chọn các voucher discount nếu có
  - BE sẽ kiểm tra thông tin giỏ hàng lại một lần nữa
  + BE kiểm tra sản phẩm có thật sự tồn tại không, giá đúng không, số lượng còn không
  + BE tính toán trả ra giá trị đơn hàng, giá trị chưa và đã có discount, tổng discount, phí ship
  3. Tiến hành đặt hàng
  - BE sẽ check lại thông tin sản phẩm đơn hàng một lần nữa
  + Sử dụng khóa lạc quan để chặn không cho user khác đặt khi user này đang đặt hàng
  + Sử dụng khóa lạc quan kiểm tra xem sản phẩm thật sự còn hàng trong kho không, chỉ cho phép đặt hàng nếu tất cả sản phẩm còn hàng, nếu một trong
  các sản phẩm hết hàng => yêu cầu user quay lại trang giỏ hàng để cập nhật
  + Sử dụng khóa lạc quan => kiểm tra cập nhật tức thời của sản phẩm
  - BE thêm reserve sản phẩm trong kho hàng
  - BE tính toán lại giá cả lần nữa
  => Nếu tất cả thành công
  - BE tạo order
  - BE xóa sản phẩm trong giỏ hàng
  4. Order còn có các chức năng
  - Cập nhật status (do hệ thống cập nhật trạng thái vận chuyển, còn trạng thái đang xử lí ... có thể do shop tự làm hoặc tự động do hệ thống)
  - Hủy đơn hàng
  - User có thể xem thông tin chi tiết đơn hàng
  ....
*/