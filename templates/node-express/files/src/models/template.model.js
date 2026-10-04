"use strict";

const mongoose = require("mongoose");

const documentName = "template";
const collectionName = "templates";

const templateSchema = new mongoose.Schema(
  {
    template_id: { type: Number, required: true },
    template_name: { type: String, required: true },
    template_html: { type: String, required: true },
    template_status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
    collection: collectionName,
  }
);

export const Template = mongoose.model(documentName, templateSchema);
