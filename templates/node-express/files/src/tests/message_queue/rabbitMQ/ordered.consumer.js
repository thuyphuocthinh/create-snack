"use strict";

const amqp = require("amqplib");

const consumeOrderedMessages = async () => {
  const connection = await amqp.connect("amqp://localhost:5672");
  const channel = await connection.createChannel();
  const queueName = "ordered_queue";

  await channel.assertQueue(queueName, {
    durable: true
  });

  // Set prefetch to 1 to ensure only one message is processed at a time until it is acknowledged
  channel.prefetch(1);

  channel.consume(queueName, (message) => {
    const msg = message.content.toString();
    setTimeout(() => {
      console.log("Processed: ", msg);
      channel.ack(message);
    }, Math.random() * 1000);
  });
};

consumeOrderedMessages().catch((err) => console.log(err));
