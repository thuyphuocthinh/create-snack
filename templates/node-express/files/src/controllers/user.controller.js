"use strict";

const EmailService = require("../services/email.service");
const { SuccessResponse } = require("../core/success.response");
const { User } = require("../models/user.model");
const { BadRequestError } = require("../core/error.response");

class UserController {
  // new User
  async newUser(req, res, next) {
    const { email } = req.body;
    const user = await User.findOne({ email }).lean().exec();
    if (user) {
      throw new BadRequestError("Email already registered");
    }
    new SuccessResponse({
      message: "User created successfully",
      metadata: await EmailService.sendEmail({ email }),
    }).send(res);
  }
  // check user token via email
  async checkRegisterEmailToken(req, res, next) {
    const { email, token } = req.query;

    if (!email || !token) {
      throw new BadRequestError("Invalid email or token");
    }

    new SuccessResponse({
      message: "Verify email successfully",
      metadata: await UserService.checkRegisterEmailToken({ email, token }),
    }).send(res);
  }
}

module.exports = new UserController();
