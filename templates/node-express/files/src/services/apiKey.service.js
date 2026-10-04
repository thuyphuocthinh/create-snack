const apiKeyModel = require("../models/apiKey.model");

const findById = async (key) => {
  // const newKey = await apiKeyModel.create({
  //   key: "abcdefabcdefabcdefabcdef",
  //   permissions: ["0000"],
  // });
  // console.log(newKey);
  const objKey = await apiKeyModel.findOne({ key, status: true }).lean();
  return objKey;
};

module.exports = {
  findById,
};
