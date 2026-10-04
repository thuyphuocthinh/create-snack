const redisPubSubService = require("../services/redisPubSub.service");

class ProductServiceTest {
  purchaseProduct(productId, quantity) {
    const order = {
      productId,
      quantity,
    };
    redisPubSubService.publish("purchase", JSON.stringify(order));
    console.log("Publishing purchase event for:", order);
  }
}

module.exports = new ProductServiceTest();