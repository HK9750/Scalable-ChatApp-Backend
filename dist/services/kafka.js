"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConsumer = createConsumer;
exports.createMessage = createMessage;
const kafkajs_1 = require("kafkajs");
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const prisma_1 = __importDefault(require("./prisma"));
dotenv_1.default.config();
const kafka = new kafkajs_1.Kafka({
    brokers: [process.env.KAFKA_BROKER],
    ssl: {
        ca: [(0, fs_1.readFileSync)(path_1.default.resolve("./ca.pem"), "utf-8")],
    },
    sasl: {
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD,
        mechanism: "plain",
    },
});
let producer = null;
function createProducer() {
    return __awaiter(this, void 0, void 0, function* () {
        if (producer !== null) {
            return producer;
        }
        const _producer = kafka.producer({
            createPartitioner: kafkajs_1.Partitioners.DefaultPartitioner,
        });
        yield _producer.connect();
        producer = _producer;
        return producer;
    });
}
function createConsumer() {
    return __awaiter(this, void 0, void 0, function* () {
        const consumer = kafka.consumer({
            groupId: "chat-consumer",
        });
        yield consumer.connect();
        yield consumer.subscribe({ topic: "chat", fromBeginning: true });
        yield consumer.run({
            autoCommit: true,
            eachMessage: (_a) => __awaiter(this, [_a], void 0, function* ({ pause, message }) {
                var _b, _c;
                try {
                    if (!message.value)
                        return;
                    console.log({
                        value: (_b = message.value) === null || _b === void 0 ? void 0 : _b.toString(),
                    });
                    yield prisma_1.default.message.create({
                        data: {
                            text: (_c = message.value) === null || _c === void 0 ? void 0 : _c.toString(),
                        },
                    });
                }
                catch (error) {
                    console.log("Something went wrong in consumer");
                    pause();
                    setTimeout(() => {
                        consumer.resume([{ topic: "chat" }]);
                    }, 5000);
                }
            }),
        });
    });
}
function createMessage(message) {
    return __awaiter(this, void 0, void 0, function* () {
        const producer = yield createProducer();
        yield producer.send({
            topic: "chat",
            messages: [
                {
                    key: `Message-${Date.now()}`,
                    value: message,
                },
            ],
        });
    });
}
exports.default = kafkajs_1.Kafka;
