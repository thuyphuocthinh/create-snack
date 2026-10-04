const { SuccessResponse } = require("../core/success.response");
const DiscountService = require("../services/discount.service");

class DiscountController {
  createDiscount = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await DiscountService.createDiscountCode({
        ...req.body,
        shop_id: req.user.userId,
      }),
    }).send(res);
  };

  updateDiscount = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await DiscountService.updateDiscountCode(req.body),
    }).send(res);
  };

  getAllDiscountCodeByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await DiscountService.getAllDiscountCodeByShop({
        limit: req.query.limit || 50,
        page: req.query.page || 1,
        shop_id: req.user.userId,
      }),
    }).send(res);
  };

  getProductsByDiscount = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await DiscountService.getProductsByDiscount({
        limit: req.query.limit,
        page: req.query.page,
        shop_id: req.params.shopId,
        code: req.params.code,
        user_id: "",
      }),
    }).send(res);
  };

  getDiscountAmount = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await DiscountService.getDiscountAmount(req.body),
    }).send(res);
  };

  deleteDiscount = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await DiscountService.deleteDiscount(req.body),
    }).send(res);
  };

  cancelDiscount = async (req, res, next) => {
    new SuccessResponse({
      message: "Success",
      metadata: await DiscountService.cancelDiscount(req.body),
    });
  };
}

module.exports = new DiscountController();
