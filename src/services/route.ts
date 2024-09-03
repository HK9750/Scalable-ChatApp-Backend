import express from "express";
import { getMessages } from "./queries";

const router = express.Router();

// Route to get all messages
router.get("/messages", getMessages);

export default router;
