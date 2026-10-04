"use strict";

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { countConnect } = require("../helpers/check.connect");
dotenv.config();

class Database {
  constructor() {
    this.connect();
  }

  async connect(type = "mongodb") {
    try {
      if (1 === 1) {
        mongoose.set("debug", true);
        mongoose.set("debug", { color: true });
      }
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB connected success: ${conn.connection.host}`);
      countConnect();
    } catch (error) {
      console.log("Error connect to mongo db");
    }
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

const instanceMongodb = Database.getInstance();
module.exports = instanceMongodb;
