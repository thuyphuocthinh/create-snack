const AccessControl = require("accesscontrol");
// grant list fetched from DB (to be converted to a valid grants object, internally)
// let grantList = [
//   {
//     role: "admin",
//     resource: "profile",
//     action: "readAny",
//     attributes: "*, !views",
//   },
//   { role: "shop", resource: "profile", action: "readOwn", attributes: "*" },
// ];
module.exports = new AccessControl();
