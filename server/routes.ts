import type { Express } from "express";
import { createServer, type Server } from "http";

export function registerRoutes(app: Express): Server {
  // Message webhook endpoint
  app.post("/api/messages", async (req, res) => {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Here you would typically forward the message to another webhook
      // For now, we'll just echo it back
      const response = {
        message: message,
        timestamp: new Date().toISOString()
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error("Error processing message:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}