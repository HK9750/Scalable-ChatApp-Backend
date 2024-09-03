import { Server } from "socket.io";
import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const pub = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT as string),
  username: process.env.REDIS_USER,
  password: process.env.AIVEN_PASSWORD,
  maxRetriesPerRequest: 100,
});

const sub = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT as string),
  username: process.env.REDIS_USER,
  password: process.env.AIVEN_PASSWORD,
  maxRetriesPerRequest: 100,
});

class SocketService {
  private _io: Server;

  constructor() {
    console.log("Initializing SocketService");
    this._io = new Server({
      cors: {
        origin: "*",
        allowedHeaders: ["*"],
      },
    });
    sub.subscribe("chat");
  }

  public get io() {
    return this._io;
  }

  public initListeners() {
    const io = this._io;
    console.log("Initializing listeners");

    io.on("connection", (socket) => {
      console.log("New connection established from socket_id: ", socket.id);

      socket.on("event:message", async (message) => {
        console.log("Message received from client: ", message);
        io.emit("event:message", message);

        await pub.publish("chat", message);
      });
    });

    sub.on("message", (channel, message) => {
      if (channel === "chat") {
        console.log("Message received from Redis: ", message);
        io.emit("message", message);
      }
    });
  }
}

export default SocketService;
