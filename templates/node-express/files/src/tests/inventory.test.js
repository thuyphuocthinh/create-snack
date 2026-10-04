// inventory.test.js
const redisPubSubService = require("../services/redisPubSub.service");

class InventoryServiceTest {
  constructor() {
    // Subscribe to Redis channel
    redisPubSubService.subscribe("purchase", function (channel, message) {
      console.log("Received message:", message);
      // Assuming InventoryServiceTest.updateInventory is static
      InventoryServiceTest.updateInventory(JSON.parse(message));
    });
  }

  static updateInventory({ productId, quantity }) {
    console.log(
      `Updating inventory for product ${productId} with quantity ${quantity}`
    );
  }
}

module.exports = new InventoryServiceTest();
