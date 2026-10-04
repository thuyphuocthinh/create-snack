"use strict";

const _ = require("lodash");
const { Types } = require("mongoose");

const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};

// [a, b] => {a : 1, b: 1}
const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 1]));
};

const unSelectData = (unSelect = []) => {
  return Object.fromEntries(unSelect.map((el) => [el, 0]));
};

const removeBadValue = (object) => {
  Object.keys(object).forEach((key) => {
    if (object[key] == null || object[key] == undefined) {
      delete object[key];
    }
  });
  return object;
};

const randomSpuId = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

/*
  const a = {
    c: {
      d: 1,
      e: 2
    }
  }

  => a = {
      c.d = 1,
      c.e = 2;
    }
*/

const updateNestedObjectParser = (object) => {
  const final = {};
  Object.keys(object).forEach((key) => {
    if (
      typeof object[key] === "object" &&
      !Array.isArray(object[key]) &&
      object[key] !== null &&
      object[key] !== undefined
    ) {
      const response = updateNestedObjectParser(object[key]);
      Object.keys(response).forEach((k) => {
        final[`${key}.${k}`] = response[k];
      });
    } else {
      final[key] = object[key];
    }
  });
  return final;
};

const convertToObjectId = (id) => {
  return new Types.ObjectId(id);
};

module.exports = {
  getInfoData,
  getSelectData,
  unSelectData,
  removeBadValue,
  updateNestedObjectParser,
  convertToObjectId,
  randomSpuId,
};
