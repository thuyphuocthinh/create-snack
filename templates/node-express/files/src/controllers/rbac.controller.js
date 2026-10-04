"use strict";

const { CREATED, SuccessResponse } = require("../core/success.response");
const {
  createRole,
  createResource,
  resourceList,
  roleList,
} = require("../services/rbac.service");

class AccessController {
  createNewRole = async (req, res, next) => {
    new CREATED({
      message: "Successfully created new role",
      metadata: await createRole(req.body),
    }).send(res);
  };

  createNewResource = async (req, res, next) => {
    new CREATED({
      message: "Successfully created new resource",
      metadata: await createResource(req.body),
    }).send(res);
  };

  getResourceList = async (req, res, next) => {
    new SuccessResponse({
      message: "Successfully fetched resource list",
      metadata: await resourceList(req.body),
    }).send(res);
  };

  getRoleList = async (req, res, next) => {
    new SuccessResponse({
      message: "Successfully fetched role list",
      metadata: await roleList(req.body),
    }).send(res);
  };
}

module.exports = new AccessController();