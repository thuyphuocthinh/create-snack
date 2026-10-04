"use strict";

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected success: ${conn.connection.host}`);
  } catch (error) {
    console.log("Error connect to mongo db");
  }
};

module.exports = connectDB;