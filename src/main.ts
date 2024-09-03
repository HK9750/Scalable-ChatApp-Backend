import express from "express";
import cors from "cors";
import SocketService from "./services/SocketService";
import http from "http";
import { createConsumer } from "./services/kafka";
import QueryRoutes from "./services/route";

async function init() {
  createConsumer();

  const socketService = new SocketService();

  const app = express();

  app.use(express.json());
  app.use(
    cors({
      origin: "*",
    })
  );
  app.use("/api", QueryRoutes);

  const httpServer = http.createServer(app);

  socketService.io.attach(httpServer);

  httpServer.listen(8000, "0.0.0.0", () => {
    console.log("Server running on port 8000");
  });

  socketService.initListeners();
}

init();
