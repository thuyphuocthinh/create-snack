"use strict";

const redis = require("redis");
const { promisify } = require("util");
const { reservationInventory } = require("../models/repository/inventory.repo");
const redisClient = redis.createClient();

redisClient.ping((err, res) => {
  if (err) {
    console.log("err:::error connecting to redis", err);
  } else {
    console.log("res:::connected to redis", res);
  }
});

const pexpire = promisify(redisClient.pExpire).bind(redisClient);
const setnxAsync = promisify(redisClient.setNX).bind(redisClient);

const acquireLock = async (productId, quantity, cartId) => {
  const key = `lock_v2024_${productId}`;
  const retryTimes = 10;
  const expireTime = 3000; // 3 seconds thoi gian tam lock
  for (let index = 0; index < retryTimes.length; index++) {
    // tao mot key, thang nao giu key nay duoc vao thanh toan
    const result = await setnxAsync(key, expireTime);
    console.log("result:::", result);
    if (result === 1) {
      // dang co nguoi nam giu key
      // thao tac voi inventory
      const isReserved = await reservationInventory({
        productId,
        cartId,
        quantity,
      });
      // neu reserve trong kho hang thanh cong => giai phong key de nguoi khac co the su dung
      if (isReserved.modifiedCount > 0) {
        await pexpire(key, expireTime);
        return key;
      }
      return null;
    } else {
      // chua co ai co key
      // thu ket noi lay key 10 lan
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
};

const releaseLock = async (keyLock) => {
  const delAsyncKey = promisify(redisClient.del).bind(redisClient);
  return await delAsyncKey(keyLock);
};

module.exports = {
  acquireLock,
  releaseLock,
};
