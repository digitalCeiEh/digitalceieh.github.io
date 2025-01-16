import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, type VerifyClientCallbackAsync } from "ws";
import cors from "cors";

// Map to store WebSocket connections
const clients = new Map();

export function registerRoutes(app: Express): Server {
  // Enable CORS for all routes
  app.use(cors());

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
      console.log("Received webhook response from n8n:");
      console.log("Headers:", req.headers);
      console.log("Body:", JSON.stringify(req.body, null, 2));

      // Extract the message content from various possible n8n response formats
      let messageContent;
      if (typeof req.body === 'string') {
        try {
          const parsedBody = JSON.parse(req.body);
          messageContent = parsedBody.text || parsedBody.message || parsedBody.content;
        } catch {
          messageContent = req.body;
        }
      } else {
        messageContent = req.body.text || req.body.message || req.body.content;
      }

      if (!messageContent) {
        console.error("No message content found in webhook response");
        return res.status(400).json({ error: "No message content found" });
      }

      // Format the response for the chat
      const response = {
        content: messageContent,
        timestamp: new Date().toISOString(),
        isUser: false
      };

      console.log("Formatted chat response:", response);

      // Broadcast the message to all connected WebSocket clients
      let clientsNotified = 0;
      clients.forEach((client, id) => {
        if (client.readyState === 1) { // 1 = WebSocket.OPEN
          try {
            client.send(JSON.stringify(response));
            clientsNotified++;
            console.log(`Message sent to client ${id}`);
          } catch (error) {
            console.error(`Error sending to client ${id}:`, error);
          }
        }
      });

      console.log(`Message broadcasted to ${clientsNotified} clients`);
      return res.status(200).json({ success: true, clientsNotified });
    } catch (error) {
      console.error("Error processing webhook response:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  // Set up WebSocket server
  const wss = new WebSocketServer({ 
    server: httpServer,
    verifyClient: ((info, cb) => {
      // Ignore Vite HMR WebSocket connections
      const protocol = info.req.headers['sec-websocket-protocol'];
      if (protocol === 'vite-hmr') {
        return cb(false);
      }
      cb(true);
    }) as VerifyClientCallbackAsync
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