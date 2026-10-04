"use strict";

const EmailService = require("../services/email.service");
const { SuccessResponse } = require("../core/success.response");

class EmailController {
  static async sendEmail(req, res, next) {
    const { email } = req.body;
    new SuccessResponse({
      message: "Email sent successfully",
      metadata: await EmailService.sendEmail({ email }),
    }).send(res);
  }
}

module.exports = EmailController;
