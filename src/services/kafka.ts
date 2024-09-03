import { Kafka, Producer, Partitioners } from "kafkajs";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import path from "path";
import prisma from "./prisma";
dotenv.config();

const kafka = new Kafka({
  brokers: [process.env.KAFKA_BROKER as string],
  ssl: {
    ca: [readFileSync(path.resolve("./ca.pem"), "utf-8")],
  },
  sasl: {
    username: process.env.KAFKA_USERNAME as string,
    password: process.env.KAFKA_PASSWORD as string,
    mechanism: "plain",
  },
});

let producer: Producer | null = null;

async function createProducer() {
  if (producer !== null) {
    return producer;
  }
  const _producer = kafka.producer({
    createPartitioner: Partitioners.DefaultPartitioner,
  });
  await _producer.connect();
  producer = _producer;
  return producer;
}

export async function createConsumer() {
  const consumer = kafka.consumer({
    groupId: "chat-consumer",
  });
  await consumer.connect();
  await consumer.subscribe({ topic: "chat", fromBeginning: true });

  await consumer.run({
    autoCommit: true,
    eachMessage: async ({ pause, message }) => {
      try {
        if (!message.value) return;
        console.log({
          value: message.value?.toString(),
        });
        await prisma.message.create({
          data: {
            text: message.value?.toString(),
          },
        });
      } catch (error: any) {
        console.log("Something went wrong in consumer");
        pause();
        setTimeout(() => {
          consumer.resume([{ topic: "chat" }]);
        }, 5000);
      }
    },
  });
}

export async function createMessage(message: string) {
  const producer = await createProducer();
  await producer.send({
    topic: "chat",
    messages: [
      {
        key: `Message-${Date.now()}`,
        value: message,
      },
    ],
  });
}

export default Kafka;
