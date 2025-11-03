const amqp = require("amqplib");
require("dotenv").config();

let connection = null;
let channel = null;

const RABBIT_URL = process.env.RABBIT_URL || process.env.RABIT_URL;

const connectToRabbitMQ = async () => {
  if (connection && channel) return channel;

  try {
    connection = await amqp.connect(RABBIT_URL);
    channel = await connection.createChannel();

    connection.on("close", () => {
      console.error("RabbitMQ connection closed. Reconnecting...");
      connection = null;
      channel = null;
      setTimeout(connectToRabbitMQ, 5000); // reconnect after 5 sec
    });

    connection.on("error", (err) => {
      console.error("RabbitMQ connection error:", err);
    });

    console.log("✅ Connected to RabbitMQ");
    return channel;
  } catch (error) {
    console.error("❌ Error connecting to RabbitMQ:", error.message);
    setTimeout(connectToRabbitMQ, 5000); // retry
  }
};

const publishToQueue = async (queueName, data = {}) => {
  try {
    if (!channel) await connectToRabbitMQ();

    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), {
      persistent: true,
    });
    console.log(`📤 Message sent to queue: ${queueName}`);
  } catch (error) {
    console.error("❌ Error publishing to queue:", error.message);
  }
};

const SubscribeToQueue = async (queueName, callback) => {
  try {
    if (!channel) await connectToRabbitMQ();

    await channel.assertQueue(queueName, { durable: true });
    channel.consume(
      queueName,
      async (msg) => {
        if (msg) {
          try {
            const data = JSON.parse(msg.content.toString());
            await callback(data);
            channel.ack(msg);
          } catch (err) {
            console.error("❌ Error handling message:", err.message);
            channel.nack(msg, false, false); // discard bad message
          }
        }
      },
      { noAck: false }
    );

    console.log(`👂 Subscribed to queue: ${queueName}`);
  } catch (error) {
    console.error("❌ Error subscribing to queue:", error.message);
  }
};

module.exports = {
  connectToRabbitMQ,
  publishToQueue,
  SubscribeToQueue,
};
