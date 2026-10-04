const amqp = require("amqplib");

const runConsumer = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();
    const queueName = "test-topic";

    await channel.assertQueue(queueName, {
      durable: true,
    });

    channel.consume(
      queueName,
      (message) => {
        console.log(`message_received:::${message.content.toString()}`);
      },
      {
        // avoid dupliacte messages if client already received the message
        noAck: true,
      }
    );
  } catch (error) {
    console.log("Error rabbitmq: ", error);
  }
};

runConsumer().catch((err) => console.log(err));
