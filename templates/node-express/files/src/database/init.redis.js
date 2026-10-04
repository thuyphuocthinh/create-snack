"use strict";

const redis = require("redis");
const { RedisConnectionError } = require("../core/error.response");
// redisClient is used to connect to the redis server
// redis server is used to store the data in key-value pairs
// redis server is located in the same machine as the application
/** level 1: connect to redis server */
// const redisClient = redis.createClient({
//   host: process.env.REDIS_HOST,
//   port: process.env.REDIS_PORT,
//   password: process.env.REDIS_PASSWORD,
//   username: process.env.REDIS_USERNAME,
// });

// redisClient.ping((err, res) => {
//   if (err) {
//     console.log("err:::error connecting to redis", err);
//   } else {
//     console.log("res:::connected to redis", res);
//   }
// });

// redisClient.on("error", (err) => {
//   console.log("err:::error connecting to redis", err);
// });

// module.exports = redisClient;

/** level 2: connect to redis server using redis-cli */
// a connection is a client - an instance to a pool of connections
// we can have multiple connections to the same redis server (pool of connections)
let client = {};
const REDIS_CONNECT_TIMEOUT = 10000;
const REDIS_CONNECT_MESSAGE = {
  code: -99,
  message: {
    vn: "Redis bị lỗi rồi",
    en: "Redis is error",
  },
};
let statusConnectRedis = {
  CONNECT: "connect",
  END: "end",
  RECONNECT: "reconnect",
  DISCONNECT: "disconnect",
  ERROR: "error",
};
let connectionTimeoutNumber;

const handleEventConnectRedis = ({ connectionRedis }) => {
  if (!connectionRedis) return;
  connectionRedis.on(statusConnectRedis.CONNECT, () => {
    console.log("res:::connected to redis");
  });
  connectionRedis.on(statusConnectRedis.END, () => {
    console.log("res:::end connection to redis");
    handleTimeoutConnectRedis(connectionRedis);
  });
  connectionRedis.on(statusConnectRedis.RECONNECT, () => {
    console.log("res:::reconnect to redis");
    clearTimeout(connectionTimeoutNumber);
  });
  connectionRedis.on(statusConnectRedis.DISCONNECT, () => {
    console.log("res:::disconnect to redis");
  });
  connectionRedis.on(statusConnectRedis.ERROR, (err) => {
    console.log("res:::error connecting to redis", err);
    // retry connect to redis
    handleTimeoutConnectRedis(connectionRedis);
  });
};

const handleTimeoutConnectRedis = (connectionRedis) => {
  if (!connectionRedis) return;
  connectionTimeoutNumber = connectionRedis.setTimeout(
    REDIS_CONNECT_TIMEOUT,
    () => {
      throw new RedisConnectionError({
        message: REDIS_CONNECT_MESSAGE.message.vn,
        statusCode: REDIS_CONNECT_MESSAGE.code,
      });
    }
  );
};

const initRedis = () => {
  const instanceRedis = redis.createClient();
  client.instanceConnect = instanceRedis;
  handleEventConnectRedis(instanceRedis);
  handleTimeoutConnectRedis(instanceRedis);
};

const getRedis = () => client;

const closeRedis = () => {
  if (!client.instanceConnect) return;
  client.instanceConnect.quit();
  client.instanceConnect = null;
};

module.exports = {
  initRedis,
  getRedis,
  closeRedis,
};

/**
    To connect to redis server, we need to supply the following information:
    - host: the host of the redis server
    - port: the port of the redis server
    - password: the password of the redis server
    - username: the username of the redis server
    because redis server is a database like mysql, postgresql, etc.
    we need to supply the host, port, password, username to connect to the redis server
    redis server could be local or remote
    if redis server is local, we can use the default host and port
    if redis server is remote, we need to supply the host, port, password, username
*/
