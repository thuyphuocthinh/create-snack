"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
const { findByEmail } = require("./shop.service");
const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  static handleRefreshToken = async (refreshToken) => {
    // xem refreshToken gui len da het han hay chua
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(
      refreshToken
    );

    if (foundToken) {
      // decode ra xem may la thang nao?
      const { userId, email } = await verifyJWT(
        refreshToken,
        foundToken.privateKey
      );

      if (userId && email) {
        await KeyTokenService.deleteKeyByUserId(userId);
        throw new ForbiddenError("Something wrong happened!! Please relogin");
      }
    }

    // neu refreshToken chua het han, kiem tra xem refreshToken co phai do he thong tao hay khong
    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
    if (!holderToken) {
      throw new AuthFailureError("Shop not registerred");
    }

    // verify token
    const { userId, email } = await verifyJWT(
      refreshToken,
      holderToken.privateKey
    );

    // check userId, email
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new AuthFailureError("Shop not registerred");
    }

    // neu thoa man hop le
    // 1. create cap token moi
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await createTokenPair(
        {
          userId,
          email,
        },
        holderToken.privateKey,
        holderToken.publicKey
      );
    // 2. dua refreshToken vua gui vao danh sach het han
    await holderToken.updateOne({
      $set: {
        refreshToken: newRefreshToken,
      },
      $addToSet: {
        refreshTokenUsed: refreshToken,
      },
    });
    return {
      user: { userId, email },
      tokens: {
        refreshToken: newRefreshToken,
        accessToken: newAccessToken,
      },
    };
  };

  static handleRefreshTokenV2 = async ({ refreshToken, user, keyStore }) => {
    const { userId, email } = user;

    if (keyStore.refreshTokenUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyByUserId(userId);
      throw new ForbiddenError("Something wrong happened!! Please relogin");
    }

    if (keyStore.refreshToken !== refreshToken) {
      throw new AuthFailureError("Shop not registered");
    }

    // check userId, email
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new AuthFailureError("Shop not registerred");
    }

    // neu thoa man hop le
    // 1. create cap token moi
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await createTokenPair(
        {
          userId,
          email,
        },
        keyStore.privateKey,
        keyStore.publicKey
      );
    // 2. dua refreshToken vua gui vao danh sach het han
    await keyStore.updateOne({
      $set: {
        refreshToken: newRefreshToken,
      },
      $addToSet: {
        refreshTokenUsed: refreshToken,
      },
    });
    return {
      user: { userId, email },
      tokens: {
        refreshToken: newRefreshToken,
        accessToken: newAccessToken,
      },
    };
  };

  static signUp = async ({ name, email, password }) => {
    try {
      // step 1: check su ton tai cua email
      const holderShop = await shopModel.findOne({ email }).lean();
      if (holderShop) {
        throw new BadRequestError("Error: Shop already registered");
      }

      const hassPassword = await bcrypt.hash(password, 10);

      const newShop = await shopModel.create({
        name,
        email,
        password: hassPassword,
        roles: [RoleShop.SHOP],
      });

      if (newShop) {
        // create a pair of public/private key
        // rsa => unsymetric cryptopancy algo
        // const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
        //   modulusLength: 4096,
        //   publicKeyEncoding: {
        //     type: "pkcs1",
        //     format: "pem",
        //   },
        //   privateKeyEncoding: {
        //     type: "pkcs1",
        //     format: "pem",
        //   },
        // });

        const privateKey = crypto.randomBytes(64).toString("hex");
        const publicKey = crypto.randomBytes(64).toString("hex");

        const tokens = await createTokenPair(
          {
            userId: newShop._id,
            email,
          },
          privateKey,
          publicKey
        );

        const keyStore = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
          privateKey,
          refreshToken: tokens.refreshToken,
        });

        if (!keyStore) {
          throw new BadRequestError("Error: Public key string error");
        }

        return {
          shop: getInfoData({
            fields: ["_id", "name", "email"],
            object: newShop,
          }),
          tokens,
        };
      }

      return {
        code: 200,
        metadata: null,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  };

  static login = async ({ email, password, refreshToken = null }) => {
    try {
      const foundShop = await findByEmail({ email });
      if (!foundShop) {
        throw new BadRequestError("Shop not registered");
      }
      const match = bcrypt.compare(password, foundShop.password);
      if (!match) {
        throw new AuthFailureError("Invalid credentials");
      }

      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");

      const tokens = await createTokenPair(
        {
          userId: foundShop._id,
          email,
        },
        privateKey,
        publicKey
      );

      await KeyTokenService.createKeyToken({
        refreshToken: tokens.refreshToken,
        privateKey,
        publicKey,
        userId: foundShop._id,
      });

      return {
        shop: getInfoData({
          fields: ["_id", "name", "email"],
          object: foundShop,
        }),
        tokens,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  };

  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyTokenById(keyStore._id);
    return delKey;
  };
}

module.exports = AccessService;
