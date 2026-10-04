const { convertToObjectId } = require("../../utils");
const cartModel = require("../cart.model");

const createUserCart = async ({ userId, product }) => {
  const query = {
    cart_user_id: userId,
    cart_state: "ACTIVE",
  };
  const updateOrInsert = {
    $addToSet: {
      cart_products: product,
    },
  };
  const options = {
    upsert: true,
    new: true,
  };
  return await cartModel.findOneAndUpdate(query, updateOrInsert, options);
};

const updateCartItemQuantity = async ({ userId, product }) => {
  const { product_id, quantity } = product;
  const query = {
    cart_user_id: userId,
    cart_products: {
      $elemMatch: { productId: product_id }, // Match an object in cart_products with the specific product_id
    },
    cart_state: "ACTIVE",
  };
  const updateSet = {
    $inc: {
      "cart_products.$.quantity": quantity,
    },
  };
  const options = {
    new: true,
    upsert: true,
  };
  return await cartModel.findOneAndUpdate(query, updateSet, options);
};

const removeItemFromCart = async ({ user_id, product_id }) => {
  const query = {
    cart_user_id: user_id,
    "cart_products.product_id": product_id,
    cart_state: "ACTIVE",
  };
  const updateSet = {
    $pull: {
      cart_products: { product_id },
    },
  };
  const deleted = await cartModel.updateOne(query, updateSet);
  return deleted;
};

const findCartById = async (cartId) => {
  return cartModel
    .findOne({
      _id: convertToObjectId(cartId),
      cart_state: "ACTIVE",
    })
    .lean();
};

module.exports = {
  createUserCart,
  updateCartItemQuantity,
  removeItemFromCart,
  findCartById,
};
