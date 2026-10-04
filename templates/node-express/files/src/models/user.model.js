"use strict";

const { mongoose } = require("mongoose");

const DOCUMENT_NAME = "User";
const COLLECTION_NAME = "Users";

const userSchema = new mongoose.Schema(
  {
    user_id: {
      type: Number, // unique id
      required: true,
      unique: true,
    },
    // slug is for search and virtual id for showing in url
    user_slug: {
      type: String,
      required: true,
      unique: true,
    },
    user_name: {
      type: String,
      required: true,
    },
    user_email: {
      type: String,
      required: true,
    },
    user_password: {
      type: String,
      required: true,
    },
    user_temporary_password: {
      type: String,
      expires: 2 * 60 * 60, // 2 hours
    },
    // Admin Shop User
    user_role: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Role",
    },
    user_avatar: {
      type: String,
      default: "",
    },
    user_sex: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male",
    },
    user_phone: {
      type: String,
      default: "",
    },
    user_salf: {
      type: String,
      default: "",
    },
    user_status: {
      type: String,
      enum: ["active", "inactive", "pending", "blocked"],
      default: "pending",
    },
    user_date_of_birth: {
      type: Date,
      default: null,
    },
    user_address: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

const User = mongoose.model(DOCUMENT_NAME, userSchema);

module.exports = User;
