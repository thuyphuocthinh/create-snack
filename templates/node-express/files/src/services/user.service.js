"use strict";

const { BadRequestError } = require("../core/error.response");
const { OtpService } = require("../services/otp.service");
const { User } = require("../models/user.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { createTokenPair } = require("../utils/jwt");
const { getInfoData } = require("../utils/data");
const { createUser } = require("../models/repository/user.repo");
const Role = require("../models/role.model");

class UserService {
  static async findUserByEmail({ email = null }) {
    const user = await User.findOne({ email }).lean().exec();
    return user;
  }

  static async checkRegisterEmailToken({ email = null, token = null }) {
    const otp = await OtpService.checkOtp({ email, token });
    if (!otp) {
      throw new BadRequestError("Invalid token");
    }
    const { otp_email: email } = otp;
    const user = await UserService.findUserByEmail({ email });
    if (user) {
      throw new BadRequestError("Email already registered");
    }

    const hassPassword = await bcrypt.hash(email, 10);
    const role = await Role.findOne({ role_name: "user" });
    const newUser = await createUser({
      user_id: 1,
      user_name: email,
      user_email: email,
      user_password: hassPassword,
      user_role: role._id,
    });

    if (newUser) {
      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");
      const tokens = await createTokenPair(
        {
          userId: newUser._id,
          email,
        },
        privateKey,
        publicKey
      );

      const keyStore = await KeyTokenService.createKeyToken({
        userId: newUser._id,
        publicKey,
        privateKey,
        refreshToken: tokens.refreshToken,
      });

      if (!keyStore) {
        throw new BadRequestError("Error: Public key string error");
      }

      return {
        user: getInfoData({
          fields: ["_id", "name", "email"],
          object: newUser,
        }),
        tokens,
      };
    }

    return {
      message: "Verify email successfully",
    };
  }

  static async newUser({ email = null, captcha = null }) {
    // check if email is already registered
    const user = await User.findOne({ email }).lean().exec();
    if (user) {
      throw new BadRequestError("Email already registered");
    }

    // check if captcha is valid
    // send otp to emai
    return {
      message: "Send otp to email successfully",
    };
  }
}

module.exports = UserService();
