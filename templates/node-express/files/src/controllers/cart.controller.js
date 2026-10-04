"use strict";

const { SuccessResponse } = require("../core/success.response");
const CartService = require("../services/cart.service");

class CartController {
  async addToCart(req, res, next) {
    new SuccessResponse({
      message: "Success",
      metadata: await CartService.addProductToCart(req.body),
    }).send(res);
  }

  async updateCart(req, res, next) {
    new SuccessResponse({
      message: "Success",
      metadata: await CartService.updateCart(req.body),
    }).send(res);
  }

  async getListProductsFromCart(req, res, next) {
    new SuccessResponse({
      message: "Success",
      metadata: await CartService.getListProductsFromCart({
        userId: req.params.id,
      }),
    }).send(res);
  }

  async removeItemFromCart(req, res, next) {
    new SuccessResponse({
      message: "Success",
      metadata: await CartService.removeItemFromCart(req.body),
    }).send(res);
  }
}

module.exports = new CartController();
