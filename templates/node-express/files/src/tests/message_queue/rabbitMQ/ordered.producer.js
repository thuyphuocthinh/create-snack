"use strict";

const amqp = require("amqplib");

const produceOrderedMessages = async () => {
  const connection = await amqp.connect("amqp://localhost:5672");
  const channel = await connection.createChannel();
  const queueName = "ordered_queue";

  await channel.assertQueue(queueName, {
    durable: true,
  });

  for (let i = 0; i < 10; i++) {
    await channel.sendToQueue(
      queueName,
      Buffer.from(`Ordered Message:::${i}`),
      {
        persistent: true,
      }
    );
    console.log(`message_ordered_sent:::${i}`);
  }

  setTimeout(() => {
    connection.close();
    console.log("Connection closed");
  }, 1000);
};

produceOrderedMessages().catch((err) => console.log(err));
