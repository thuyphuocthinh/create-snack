"use strict";

const { User } = require("../user.model");
const createUser = async ({
  user_id,
  user_name,
  user_email,
  user_password,
  user_role,
}) => {
  return await User.create({
    user_id,
    user_name,
    user_email,
    user_password,
    user_role,
  });
};

module.exports = { createUser };
