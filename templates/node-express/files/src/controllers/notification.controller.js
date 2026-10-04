"use strict";

const { SuccessResponse } = require("../core/success.response");
const NotificationService = require("../services/notification.service");

class NotificationController {
  async getListNotiByUser(req, res, next) {
    new SuccessResponse({
      message: "Success",
      metadata: await NotificationService.listNotiByUser(req.body),
    }).send(res);
  }
}

module.exports = new NotificationController();
