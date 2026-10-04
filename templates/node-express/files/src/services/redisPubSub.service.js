const redis = require("redis");

class RedisPubSubService {
  constructor() {
    this.subscriber = redis.createClient();
    this.publisher = redis.createClient();
  }

  async connectClients() {
    try {
      if (!this.publisher.isOpen) {
        console.log(">>> connect publisher");
        await this.publisher.connect();
      }
      if (!this.subscriber.isOpen) {
        console.log(">>> connect subscriber");
        await this.subscriber.connect();
      }
    } catch (error) {
      console.log("Error connecting to Redis:", error);
      throw error;
    }
  }

  async publish(channel, message) {
    await this.connectClients(); // Ensure the clients are connected
    return new Promise((resolve, reject) => {
      this.publisher.publish(channel, message, (err, reply) => {
        if (err) {
          console.log("Error in publish:", err);
          reject(err);
        } else {
          resolve(reply);
        }
      });
    });
  }

  async subscribe(channel, callback) {
    await this.connectClients(); // Ensure the clients are connected
    console.log(`Subscribing to channel: ${channel}`);

    try {
      // Subscribe to the channel
      await this.subscriber.subscribe(channel, (message) => {
        console.log(`Message received on channel ${channel}: ${message}`);
        if (typeof callback === "function") {
          callback(channel, message);
        } else {
          console.error("Provided callback is not a function.");
        }
      });

      console.log(`Successfully subscribed to channel: ${channel}`);
    } catch (err) {
      console.error("Error subscribing to channel:", err);
    }
  }

  // Add a method for cleanup/disconnection if needed
  async disconnect() {
    try {
      await this.publisher.quit();
      await this.subscriber.quit();
      console.log("Redis clients disconnected.");
    } catch (error) {
      console.log("Error disconnecting Redis clients:", error);
    }
  }
}

module.exports = new RedisPubSubService();
