/**
 * 1 - Add product to cart [User]
 * 2 - Reduce / Increase product quantity [User]
 * 3 - Get list products from cart [User]
 * 4 - Delete cart [User]
 * 5 - Delete cart item [User]
 */

const { NotFoundError } = require("../core/error.response");
const cartModel = require("../models/cart.model");
const {
  createUserCart,
  updateCartItemQuantity,
  removeItemFromCart,
} = require("../models/repository/cart.repo");
const { getProductById } = require("../models/repository/product.repo");
const { convertToObjectId } = require("../utils");

class CartService {
  static async addProductToCart({ userId, product = {} }) {
    // check cart ton tai hay khong
    const userCart = await cartModel.findOne({
      cart_user_id: convertToObjectId(userId),
    });
    if (!userCart) {
      // tao gio hang moi neu gio hang chua ton tai
      return await createUserCart({
        userId,
        product,
      });
    }
    // neu gio hang ton tai nhung chua co san pham thi them san pham
    if (!userCart.cart_products.length) {
      userCart.cart_products = [product];
      return await userCart.save();
    }
    // neu gio hang ton tai va ton tai san pham => cap nhat so luong
    return await updateCartItemQuantity({
      userId,
      product,
    });
  }

  /*
    shop_order_ids:[
      {
        shop_id,
        item_products: [
          {
            quantity,
            price,
            shop_id,
            old_quantity,
            product_id
          }
        ],
        version
      }
    ]
  */
  // update quantity of each product
  static async updateCart({ userId, shop_order_ids }) {
    const { product_id, quantity, old_quantity } =
      shop_order_ids[0]?.item_products[0];
    // check product exists
    const foundProduct = await getProductById({ productId: product_id });
    if (!foundProduct) {
      throw new NotFoundError("Product does not exist");
    }
    if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shop_id) {
      throw new NotFoundError("Product does not belong to the shop");
    }
    if (quantity === 0) {
      // remove item from cart
      return await removeItemFromCart({
        user_id: userId,
        product_id,
      });
    }
    return await updateCartItemQuantity({
      userId,
      product: {
        product_id,
        quantity: quantity - old_quantity,
      },
    });
  }

  static async getListProductsFromCart({ userId }) {
    return await cartModel.findOne({
      cart_user_id: convertToObjectId(userId),
    });
  }

  static async removeItemFromCart({ user_id, product_id }) {
    return await removeItemFromCart({
      user_id,
      product_id,
    });
  }

  static async removeAllProductsFromCart({ cartId, userId }) {
    const query = {
      cart_user_id: convertToObjectId(userId),
    };
    const updateSet = {
      $set: {
        cart_products: [],
      },
    };
    return await cartModel.findOneAndUpdate(query, updateSet);
  }
}

module.exports = CartService;
