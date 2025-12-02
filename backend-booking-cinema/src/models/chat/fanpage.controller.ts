import { Request, Response } from "express";

export const fanpageBroadcast = (req: Request, res: Response):Promise<void> => {
    const io = req.app.locals.io;

    console.log("📩 Nhận JSON từ N8N:", req.body);

    io.emit("fanpageMessage", req.body); // gửi real-time lên frontend
    res.json({ status: "sent" });
    return Promise.resolve();
};
export const fanpageSendMessageFromWeb = (req: Request, res: Response):Promise<void> => {
  const io = req.app.locals.io;

  const { psid, message } = req.body;

  if (!psid || !message) {
    res.status(400).json({ error: "psid & message are required" });
    return Promise.resolve();
  }

  console.log("📤 Admin gửi tin đến user:", req.body);

  // Gửi real-time cho React (để hiển thị tin nhắn admin)
  io.emit("adminSendMessage", req.body);

   res.json({ status: "sent_to_n8n" });
   return Promise.resolve();
};
