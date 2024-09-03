import SocketService from "./services/SocketService";
import http from "http";

async function init() {
  const socketService = new SocketService();

  const httpServer = http.createServer();

  socketService.io.attach(httpServer);

  httpServer.listen(8000, "0.0.0.0", () => {
    console.log("Server running on port 8000");
  });

  socketService.initListeners();
}

init();
