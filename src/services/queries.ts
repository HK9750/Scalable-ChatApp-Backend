import prisma from "./prisma";
import { Request, Response } from "express";

export const getMessages = async (req: Request, res: Response) => {
  try {
    const messages = await prisma.message.findMany();
    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
