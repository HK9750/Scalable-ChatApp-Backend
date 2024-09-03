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
const socket_io_1 = require("socket.io");
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pub = new ioredis_1.default({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    username: process.env.REDIS_USER,
    password: process.env.AIVEN_PASSWORD,
    maxRetriesPerRequest: 100,
});
const sub = new ioredis_1.default({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    username: process.env.REDIS_USER,
    password: process.env.AIVEN_PASSWORD,
    maxRetriesPerRequest: 100,
});
class SocketService {
    constructor() {
        console.log("Initializing SocketService");
        this._io = new socket_io_1.Server({
            cors: {
                origin: "*",
                allowedHeaders: ["*"],
            },
        });
        sub.subscribe("chat");
    }
    get io() {
        return this._io;
    }
    initListeners() {
        const io = this._io;
        console.log("Initializing listeners");
        io.on("connection", (socket) => {
            console.log("New connection established from socket_id: ", socket.id);
            socket.on("event:message", (message) => __awaiter(this, void 0, void 0, function* () {
                console.log("Message received from client: ", message);
                io.emit("event:message", message);
                yield pub.publish("chat", message);
            }));
        });
        sub.on("message", (channel, message) => {
            if (channel === "chat") {
                console.log("Message received from Redis: ", message);
                io.emit("message", message);
            }
        });
    }
}
exports.default = SocketService;
