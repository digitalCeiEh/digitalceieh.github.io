import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";

// Map to store WebSocket connections
const clients = new Map();

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

  // Endpoint to receive n8n responses
  app.post("/api/webhook/response", async (req, res) => {
    try {
      console.log("Received webhook response:", req.body);

      const response = {
        content: req.body.text || req.body.message || "No message content",
        timestamp: new Date().toISOString(),
        isUser: false
      };

      // Broadcast the message to all connected WebSocket clients
      clients.forEach(client => {
        if (client.readyState === 1) { // 1 = WebSocket.OPEN
          client.send(JSON.stringify(response));
        }
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error processing webhook response:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  // Set up WebSocket server
  const wss = new WebSocketServer({ 
    server: httpServer,
    verifyClient: (info) => {
      // Ignore Vite HMR WebSocket connections
      const protocol = info.req.headers['sec-websocket-protocol'];
      return protocol !== 'vite-hmr';
    }
  });

  wss.on("connection", (ws) => {
    const id = Date.now();
    clients.set(id, ws);
    console.log(`New WebSocket connection established (${id})`);

    ws.on("close", () => {
      clients.delete(id);
      console.log(`WebSocket connection closed (${id})`);
    });
  });

  return httpServer;
}