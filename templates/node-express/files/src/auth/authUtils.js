"use strict";

const jwt = require("jsonwebtoken");
const asyncHandler = require("../helpers/asyncHandler");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const { findByUserId } = require("../services/keyToken.service");

const HEADERS = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
  REFRESH_TOKEN: "x-rtoken-id",
};

const createTokenPair = async (payload, privateKey, publicKey) => {
  try {
    const accessToken = await jwt.sign(payload, publicKey, {
      expiresIn: "2 days",
    });

    const refreshToken = await jwt.sign(payload, privateKey, {
      expiresIn: "7 days",
    });

    jwt.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.error("Verify error", err);
      } else {
        console.log("Decode verify:: ", decode);
      }
    });

    return { accessToken, refreshToken };
  } catch (error) {}
};

// authentication before logout
const authentication = asyncHandler(async (req, res, next) => {
  /**
   * 1 - Check userId missing ?
   * 2 - Get access token
   * 3 - Verify token
   * 4 - Check user in db
   * 5 - Check keyStore with this userId
   */
  const userId = req.headers[HEADERS.CLIENT_ID];
  if (!userId) {
    throw new AuthFailureError("Invalid Request");
  }
  const keyStore = await findByUserId({ userId });

  if (!keyStore) {
    throw new NotFoundError("Not Found");
  }
  const accessToken = req.headers[HEADERS.AUTHORIZATION];
  if (!accessToken) {
    throw new AuthFailureError("Invalid Request");
  }
  try {
    const decodeUser = jwt.verify(accessToken, keyStore.publicKey);
    if (userId !== decodeUser.userId) {
      throw new NotFoundError("Not Found");
    }
    req.keyStore = keyStore;
    req.user = decodeUser;
    console.log(">>> req.user: ", req.user);
    return next();
  } catch (error) {
    throw new Error(error.message);
  }
});

const authenticationV2 = asyncHandler(async (req, res, next) => {
  /**
   * 1 - Check userId missing ?
   * 2 - Get access token
   * 3 - Verify token
   * 4 - Check user in db
   * 5 - Check keyStore with this userId
   */
  const userId = req.headers[HEADERS.CLIENT_ID];
  if (!userId) {
    throw new AuthFailureError("Invalid Request");
  }
  const keyStore = await findByUserId({ userId });
  if (!keyStore) {
    throw new NotFoundError("Not Found");
  }

  const refreshToken = req.headers[HEADERS.REFRESH_TOKEN];
  if (refreshToken) {
    try {
      const decodeUser = jwt.verify(refreshToken, keyStore.privateKey);
      if (userId !== decodeUser.userId) {
        throw new AuthFailureError("Invalid userId");
      }
      req.keyStore = keyStore;
      req.user = decodeUser;
      req.refreshToken = refreshToken;
      return next();
    } catch (error) {
      throw new Error(error.message);
    }
  }
});

const verifyJWT = async (token, keySecret) => {
  return await jwt.verify(token, keySecret);
};

module.exports = {
  createTokenPair,
  authentication,
  verifyJWT,
  authenticationV2,
};
