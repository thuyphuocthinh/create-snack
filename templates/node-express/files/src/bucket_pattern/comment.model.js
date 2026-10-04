const { Schema, model } = require("mongoose");

const bucketSchema = new Schema(
  {
    blogId: { type: String, defaul: "" },
    count: { type: Number, required: true },
    comments: {
      type: Array,
      default: [
        {
          commentId: { type: Number, required: true },
          email: { type: String, default: "" },
          body: { type: String, default: "" },
          name: { type: String, default: "" },
        },
      ],
    },
  },
  {
    collection: "buckets",
    timestamps: true,
  }
);

module.exports = {
  bucketModel: model("buckets", bucketSchema),
};
