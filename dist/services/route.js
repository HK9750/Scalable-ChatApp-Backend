"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const queries_1 = require("./queries");
const router = express_1.default.Router();
// Route to get all messages
router.get("/messages", queries_1.getMessages);
exports.default = router;
