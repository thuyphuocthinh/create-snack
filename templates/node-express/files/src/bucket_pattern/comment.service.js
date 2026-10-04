const { bucketModel } = require("./comment.model");

const insertBucket = async ({ blogId, commentId, name, body, email }) => {
  try {
    const _blogId = new RegExp(`^${blogId}_`);
    return await bucketModel.findOneAndUpdate(
      {
        blogId: _blogId,
        count: { $lt: 10 },
      },
      {
        $push: {
          comments: {
            email,
            body,
            name,
            commentId,
          },
        },
        $inc: { count: 1 },

        $setOnInsert: {
          blogId: `${blogId}_${new Date().getTime()}`,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );
  } catch (error) {}
};

const listPaging = async ({ blogId, page, limit = 1 }) => {
  try {
    const _blogId = new RegExp(`^${blogId}_`);
    return await bucketModel
      .find({
        blogId: _blogId,
      })
      .sort({ _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit);
  } catch (error) {}
};

module.exports = {
  insertBucket,
  listPaging,
};
