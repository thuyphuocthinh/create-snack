"use strict";

const mongoose = require("mongoose");

const documentName = "otp";
const collectionName = "otps";

const otpSchema = new mongoose.Schema(
  {
    otp_email: { type: String, required: true },
    otp_token: { type: String, required: true },
    otp_status: {
      type: String,
      enum: ["pending", "active", "blocked"],
      default: "pending",
    },
    expiredAt: {
      type: Date,
      required: true,
      default: Date.now(),
      expires: 60,
      // expires in 60 seconds => mongodb will delete the document after 60 seconds automatically
      // this is a built-in feature of mongodb
    },
  },
  {
    timestamps: true,
    collection: collectionName,
  }
);

export const Otp = mongoose.model(documentName, otpSchema);
