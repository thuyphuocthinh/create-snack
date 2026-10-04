const amqp = require("amqplib");
const message = "New product is created";

const runProducer = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();
    const queueName = "test-topic";

    await channel.assertQueue(queueName, {
      durable: true,
    });

    await channel.sendToQueue(queueName, Buffer.from(message));
    console.log(`message_sent:::${message}`);

    setTimeout(() => {
      connection.close();
      console.log("Connection closed");
    }, 500);
  } catch (error) {
    console.log("Error rabbitmq: ", error);
  }
};

runProducer().catch((err) => console.log(err));
