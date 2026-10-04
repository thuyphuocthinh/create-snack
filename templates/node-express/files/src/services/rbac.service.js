"use strict";

const { BadRequestError } = require("../core/error.response");
const Resource = require("../models/resource.model");
const Role = require("../models/role.model");

/**
 *
 * @param {string} resource_name
 * @param {string} resource_slug
 * @param {string} resource_description
 * @returns
 */

const createResource = async ({
  resource_name = "profile",
  resource_slug = "p000001",
  resource_description = "profile description",
}) => {
  try {
    // 1. Check if resource already exists
    const foundResource = await Resource.findOne({ resource_slug });
    if (foundResource) {
      throw new BadRequestError("Resource already exists");
    }
    // 2. If not, create new resource
    const newResource = await Resource.create({
      resource_name,
      resource_slug,
      resource_description,
    });
    // 3. Return new resource
    return newResource;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const resourceList = async ({
  userId = 0,
  limit = 30,
  offset = 0,
  search = "",
}) => {
  try {
    // 1. get list resource
    const resources = await Resource.aggregate([
      {
        $project: {
          _id: 0,
          resource_name: "$resource_name",
          resource_slug: "$resource_slug",
          resource_description: "$resource_description",
          resourceId: "$_id",
          createdAt: 1,
        },
      },
    ]);
    // 3. Return list resource
    return resources;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const createRole = async ({
  role_name = "admin",
  role_slug = "r000001",
  role_description = "admin description",
  role_grants = [],
}) => {
  try {
    // 1. Check if role already exists
    const foundRole = await Role.findOne({ role_slug });
    if (foundRole) {
      throw new BadRequestError("Role already exists");
    }
    // 2. If not, create new role
    const newRole = await Role.create({
      role_name,
      role_slug,
      role_description,
      role_grants,
    });
    // 3. Return new role
    return newRole;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const roleList = async ({
  userId = 0,
  limit = 30,
  offset = 0,
  search = "",
}) => {
  try {
    // list roles
    const roles = await Role.aggregate(
      {
        $unwind: "$role_grants",
      },
      {
        $lookup: {
          from: "resources",
          localField: "role_grants.resource_id",
          foreignField: "_id",
          as: "resource",
        },
      },
      {
        $unwind: "$resource",
      },
      {
        $project: {
          role: "$role_name",
          resource: "$resource.resource_name",
          actions: "$role_grants.actions",
          attributes: "$role_grants.attributes",
        },
      },
      {
        $unwind: "$actions",
      },
      {
        $project: {
          _id: 0,
          role: 1,
          resource: 1,
          actions: "$actions",
          attributes: 1,
        },
      }
    );

    return roles;
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

module.exports = { createResource, resourceList, createRole, roleList };
