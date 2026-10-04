"use strict";

const { SPU } = require("../models/spu.model");

const selectStruct = {
  spu_id: 1,
  spu_name: 1,
  spu_slug: 1,
  spu_description: 1,
};

export const findSpuById = async ({ spu_id, select = selectStruct }) => {
  return await SPU.findOne({ spu_id: spu_id }).select(select).lean().exec();
};

module.exports = {
  findSpuById,
};
