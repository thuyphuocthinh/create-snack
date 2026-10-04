"use strict";

const { mongoose } = require("mongoose");

const DOCUMENT_NAME = "Resource";
const COLLECTION_NAME = "Resources";

const resourceSchema = new mongoose.Schema(
  {
    // resource name => path => example: /dong-ho/4asfs
    resource_name: {
      type: String,
      required: true,
    },
    resource_slug: {
      type: String,
      required: true,
    },
    resource_description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

const Resource = mongoose.model(DOCUMENT_NAME, resourceSchema);

module.exports = Resource;
