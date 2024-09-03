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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const SocketService_1 = __importDefault(require("./services/SocketService"));
const http_1 = __importDefault(require("http"));
const kafka_1 = require("./services/kafka");
const route_1 = __importDefault(require("./services/route"));
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        (0, kafka_1.createConsumer)();
        const socketService = new SocketService_1.default();
        const app = (0, express_1.default)();
        app.use(express_1.default.json());
        app.use((0, cors_1.default)({
            origin: "*",
        }));
        app.use("/api", route_1.default);
        const httpServer = http_1.default.createServer(app);
        socketService.io.attach(httpServer);
        httpServer.listen(8000, "0.0.0.0", () => {
            console.log("Server running on port 8000");
        });
        socketService.initListeners();
    });
}
init();
