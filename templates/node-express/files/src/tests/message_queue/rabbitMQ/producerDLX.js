const amqp = require("amqplib");

const runProducer = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();

    const notificationExchange = "notificationExchange";
    const notificationQueue = "notificationQueueProcess";
    const notificationExchangeDLX = "notificationExchangeDLX";
    const notificationRoutingKeyDLX = "notificationRoutingKeyDLX";

    // 1. create exchange
    await channel.assertExchange(notificationExchange, "direct", {
      durable: false,
    });

    // 2. create queue
    const queueResult = await channel.assertQueue(notificationQueue, {
      exclusive: false,
      deadLetterExchange: notificationExchangeDLX,
      deadLetterRoutingKey: notificationRoutingKeyDLX,
    });

    // 3. binding exchange
    await channel.bindQueue(queueResult.queue, notificationExchange);

    // 4. Send message
    const msg = "A new product was created";
    await channel.sendToQueue(queueResult.queue, Buffer.from(msg), {
      expiration: "10000",
    });
    console.log(`A message was sent::${msg}`);

    setTimeout(() => {
      connection.close();
      console.log("Connection closed");
    }, 1000);
  } catch (error) {
    console.log("Error rabbitmq: ", error);
  }
};

runProducer().catch((err) => console.log(err));
